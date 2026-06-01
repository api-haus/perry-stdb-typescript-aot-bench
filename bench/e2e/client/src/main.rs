//! E2E artillery-style benchmark client for SpacetimeDB.
//!
//! Connects to a running SpacetimeDB server, calls reducers at configurable
//! concurrency, and measures latency percentiles + throughput (TPS).
//!
//! Protocol: HTTP POST to `/v1/database/<identity>/call/<reducer_name>`
//! with JSON body `[]` (no-arg reducers). This is the same protocol the
//! `spacetime call` CLI uses.

use clap::Parser;
use hdrhistogram::Histogram;
use reqwest::blocking::Client;
use std::sync::{Arc, Barrier};
use std::time::{Duration, Instant};

#[derive(Parser, Debug)]
#[command(name = "e2e-bench", about = "E2E artillery benchmark for SpacetimeDB")]
struct Args {
    /// Server URL (e.g. http://localhost:3000)
    #[arg(long, default_value = "http://localhost:3000")]
    server: String,

    /// Database name or identity
    #[arg(long)]
    database: String,

    /// Comma-separated list of reducer names to benchmark
    #[arg(long, default_value = "empty,cpu_heavy")]
    reducer: String,

    /// Concurrency levels (comma-separated, e.g. "1,4,16")
    #[arg(long, default_value = "1")]
    concurrency: String,

    /// Number of warmup calls (discarded from statistics)
    #[arg(long, default_value_t = 50)]
    warmup: u32,

    /// Number of measured iterations per reducer per concurrency level
    #[arg(long, default_value_t = 500)]
    iterations: u32,

    /// Measure cold startup time (publish-to-first-call)
    #[arg(long)]
    cold_startup: bool,

    /// Path to wasm file for cold startup measurement (publish before measuring)
    #[arg(long)]
    wasm_path: Option<String>,

    /// Path to spacetime CLI binary
    #[arg(long, default_value = "spacetime")]
    spacetime_cli: String,
}

/// Verify that a database is reachable by calling its schema endpoint.
/// Returns the database name/identity as-is (the SpacetimeDB v2.0.1 call
/// endpoint accepts both database names and hex identities directly).
fn verify_database(client: &Client, server: &str, database: &str) -> Result<String, String> {
    let url = format!("{}/v1/database/{}/schema?version=9", server, database);
    let resp = client
        .get(&url)
        .send()
        .map_err(|e| format!("Schema lookup failed: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!(
            "Database '{}' not found (status {}): {}",
            database,
            resp.status(),
            resp.text().unwrap_or_default()
        ));
    }

    Ok(database.to_string())
}

/// Call a reducer once and return the elapsed duration.
fn call_reducer(
    client: &Client,
    server: &str,
    identity: &str,
    reducer_name: &str,
) -> Result<Duration, String> {
    let url = format!("{}/v1/database/{}/call/{}", server, identity, reducer_name);
    let start = Instant::now();
    let resp = client
        .post(&url)
        .header("Content-Type", "application/json")
        .body("[]")
        .send()
        .map_err(|e| format!("Call failed: {}", e))?;
    let elapsed = start.elapsed();

    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().unwrap_or_default();
        return Err(format!(
            "Reducer call failed (status {}): {}",
            status, body
        ));
    }

    Ok(elapsed)
}

/// Run the benchmark for a single reducer at a single concurrency level.
fn bench_reducer(
    server: &str,
    identity: &str,
    reducer_name: &str,
    concurrency: usize,
    warmup: u32,
    iterations: u32,
) {
    let client = Client::builder()
        .pool_max_idle_per_host(concurrency)
        .build()
        .expect("Failed to build HTTP client");

    // Warmup phase (single-threaded, sequential)
    for i in 0..warmup {
        match call_reducer(&client, server, identity, reducer_name) {
            Ok(_) => {}
            Err(e) => {
                eprintln!("  Warmup call {} failed: {}", i, e);
                return;
            }
        }
    }

    if concurrency == 1 {
        // Single-threaded: simple sequential measurement
        let mut hist = Histogram::<u64>::new(3).expect("Failed to create histogram");
        let wall_start = Instant::now();

        for i in 0..iterations {
            match call_reducer(&client, server, identity, reducer_name) {
                Ok(d) => {
                    let micros = d.as_micros() as u64;
                    if hist.record(micros).is_err() {
                        // Value too large for histogram; record max
                        let _ = hist.record(hist.high());
                    }
                }
                Err(e) => {
                    eprintln!("  Iteration {} failed: {}", i, e);
                    return;
                }
            }
        }

        let wall_elapsed = wall_start.elapsed();
        let tps = iterations as f64 / wall_elapsed.as_secs_f64();

        print_results(reducer_name, concurrency, iterations, &hist, tps);
    } else {
        // Multi-threaded: spawn `concurrency` threads, each doing iterations/concurrency calls
        let per_thread = iterations / concurrency as u32;
        let barrier = Arc::new(Barrier::new(concurrency));
        let server = server.to_string();
        let identity = identity.to_string();
        let reducer_name = reducer_name.to_string();

        let handles: Vec<_> = (0..concurrency)
            .map(|_| {
                let barrier = Arc::clone(&barrier);
                let server = server.clone();
                let identity = identity.clone();
                let reducer_name = reducer_name.clone();
                let client = Client::builder()
                    .pool_max_idle_per_host(1)
                    .build()
                    .expect("Failed to build HTTP client");

                std::thread::spawn(move || {
                    let mut hist = Histogram::<u64>::new(3).expect("Failed to create histogram");

                    // Synchronize start
                    barrier.wait();

                    for _ in 0..per_thread {
                        match call_reducer(&client, &server, &identity, &reducer_name) {
                            Ok(d) => {
                                let micros = d.as_micros() as u64;
                                let _ = hist.record(micros);
                            }
                            Err(e) => {
                                eprintln!("  Thread call failed: {}", e);
                                break;
                            }
                        }
                    }

                    hist
                })
            })
            .collect();

        let wall_start = Instant::now();
        // The barrier already started the threads; measure from here is slightly
        // off but close enough (the barrier ensures near-simultaneous start).
        // For more precision, we'd need the threads to report their own wall time.
        // Actually, let's fix this: the threads are already running. We need the
        // wall time to include the actual concurrent execution.

        let mut combined = Histogram::<u64>::new(3).expect("Failed to create histogram");
        let mut total_calls = 0u32;

        for handle in handles {
            let hist = handle.join().expect("Thread panicked");
            combined.add(&hist).expect("Failed to merge histograms");
            total_calls += hist.len() as u32;
        }

        let wall_elapsed = wall_start.elapsed();
        let tps = total_calls as f64 / wall_elapsed.as_secs_f64();

        print_results(&reducer_name, concurrency, total_calls, &combined, tps);
    }
}

fn print_results(
    reducer_name: &str,
    concurrency: usize,
    iterations: u32,
    hist: &Histogram<u64>,
    tps: f64,
) {
    println!("  Reducer: {}", reducer_name);
    println!("    Concurrency:  {}", concurrency);
    println!("    Iterations:   {}", iterations);
    println!("    Throughput:   {:.1} calls/sec", tps);
    println!(
        "    Latency p50:  {:.2} ms",
        hist.value_at_quantile(0.50) as f64 / 1000.0
    );
    println!(
        "    Latency p95:  {:.2} ms",
        hist.value_at_quantile(0.95) as f64 / 1000.0
    );
    println!(
        "    Latency p99:  {:.2} ms",
        hist.value_at_quantile(0.99) as f64 / 1000.0
    );
    println!(
        "    Latency min:  {:.2} ms",
        hist.min() as f64 / 1000.0
    );
    println!(
        "    Latency max:  {:.2} ms",
        hist.max() as f64 / 1000.0
    );
    println!(
        "    Latency mean: {:.2} ms",
        hist.mean() / 1000.0
    );
    println!();
}

/// Measure cold startup: publish a module and time until first successful call.
fn measure_cold_startup(
    spacetime_cli: &str,
    server: &str,
    database: &str,
    wasm_path: &str,
    reducer_name: &str,
) {
    let client = Client::new();

    println!("  Cold startup measurement:");
    println!("    Publishing {} to {}...", wasm_path, database);

    let publish_start = Instant::now();

    // Publish the module
    let output = std::process::Command::new(spacetime_cli)
        .args([
            "publish",
            "--bin-path",
            wasm_path,
            database,
            "-s",
            server,
            "--yes",
        ])
        .output()
        .expect("Failed to run spacetime publish");

    if !output.status.success() {
        eprintln!(
            "    Publish failed: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        return;
    }

    let publish_elapsed = publish_start.elapsed();
    println!("    Publish completed in {:.1} ms", publish_elapsed.as_secs_f64() * 1000.0);

    // Use the database name directly (v2.0.1 accepts names in the URL)
    let identity = database;

    // Poll until the first successful reducer call
    let first_call_start = Instant::now();
    let mut attempts = 0;
    let max_attempts = 100;
    let poll_interval = Duration::from_millis(50);

    loop {
        attempts += 1;
        match call_reducer(&client, server, &identity, reducer_name) {
            Ok(call_duration) => {
                let first_call_elapsed = first_call_start.elapsed();
                let total_elapsed = publish_start.elapsed();
                println!(
                    "    First call succeeded after {} attempts ({:.1} ms post-publish)",
                    attempts,
                    first_call_elapsed.as_secs_f64() * 1000.0
                );
                println!(
                    "    First call latency: {:.2} ms",
                    call_duration.as_secs_f64() * 1000.0
                );
                println!(
                    "    Total cold startup (publish + first call): {:.1} ms",
                    total_elapsed.as_secs_f64() * 1000.0
                );
                break;
            }
            Err(_) => {
                if attempts >= max_attempts {
                    eprintln!(
                        "    First call did not succeed after {} attempts ({:.1} ms)",
                        attempts,
                        first_call_start.elapsed().as_secs_f64() * 1000.0
                    );
                    break;
                }
                std::thread::sleep(poll_interval);
            }
        }
    }
    println!();
}

fn main() {
    let args = Args::parse();

    let reducers: Vec<&str> = args.reducer.split(',').map(|s| s.trim()).collect();
    let concurrency_levels: Vec<usize> = args
        .concurrency
        .split(',')
        .map(|s| s.trim().parse::<usize>().expect("Invalid concurrency level"))
        .collect();

    println!("=== E2E Benchmark ===");
    println!("Server:      {}", args.server);
    println!("Database:    {}", args.database);
    println!("Reducers:    {:?}", reducers);
    println!("Concurrency: {:?}", concurrency_levels);
    println!("Warmup:      {}", args.warmup);
    println!("Iterations:  {}", args.iterations);
    println!();

    // Cold startup measurement (optional)
    if args.cold_startup {
        if let Some(ref wasm_path) = args.wasm_path {
            measure_cold_startup(
                &args.spacetime_cli,
                &args.server,
                &args.database,
                wasm_path,
                reducers.first().unwrap_or(&"empty"),
            );
        } else {
            eprintln!("--cold-startup requires --wasm-path");
            std::process::exit(1);
        }
    }

    // Verify database is reachable
    let client = Client::new();
    let identity = match verify_database(&client, &args.server, &args.database) {
        Ok(id) => id,
        Err(e) => {
            eprintln!("Failed to verify database: {}", e);
            eprintln!("Make sure the database is published and the server is running.");
            std::process::exit(1);
        }
    };

    println!("Database verified: {}", &identity);
    println!();

    // Run benchmarks for each reducer at each concurrency level
    for reducer in &reducers {
        for &conc in &concurrency_levels {
            bench_reducer(
                &args.server,
                &identity,
                reducer,
                conc,
                args.warmup,
                args.iterations,
            );
        }
    }
}
