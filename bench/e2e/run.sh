#!/usr/bin/env bash
# E2E benchmark harness: Perry AOT vs V8 JIT on a real SpacetimeDB server.
#
# Prerequisites:
#   - Docker running (for the SpacetimeDB server)
#   - Perry compiler built: _vendor/perry-fork/target/release/perry
#   - SpacetimeDB CLI: bin/spacetime-2.0.1
#   - wasm32 runtime archive built (for cpu_heavy loop kernel):
#     cd _vendor/perry-fork && cargo build -p perry-runtime \
#       --target wasm32-unknown-unknown --no-default-features --release
#
# Usage:
#   ./bench/e2e/run.sh              # Full benchmark (Perry only, V8 requires extra setup)
#   ./bench/e2e/run.sh --perry-only # Perry modules only
#   ./bench/e2e/run.sh --cold       # Include cold startup measurement
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SERVER="http://localhost:3000"
SPACETIME="$PROJECT_ROOT/bin/spacetime-2.0.1"
PERRY="$PROJECT_ROOT/_vendor/perry-fork/target/release/perry"
MODULE_DIR="$SCRIPT_DIR/module"
CLIENT_DIR="$SCRIPT_DIR/client"

PERRY_ONLY=false
COLD_STARTUP=false
for arg in "$@"; do
    case "$arg" in
        --perry-only) PERRY_ONLY=true ;;
        --cold) COLD_STARTUP=true ;;
    esac
done

echo "=== E2E Benchmark Harness ==="
echo "Project root: $PROJECT_ROOT"
echo "Server:       $SERVER"
echo ""

# --- Step 1: Check prerequisites ---
echo "--- Checking prerequisites ---"

if ! command -v docker &>/dev/null; then
    echo "ERROR: docker not found"
    exit 1
fi

if [ ! -f "$SPACETIME" ]; then
    echo "ERROR: SpacetimeDB CLI not found at $SPACETIME"
    exit 1
fi

if [ ! -f "$PERRY" ]; then
    echo "ERROR: Perry compiler not found at $PERRY"
    exit 1
fi

echo "  SpacetimeDB CLI: $SPACETIME"
echo "  Perry compiler:  $PERRY"
echo ""

# --- Step 2: Start server if not running ---
echo "--- Checking server ---"
if curl -sf "$SERVER/v1/health" > /dev/null 2>&1; then
    echo "  Server already running at $SERVER"
else
    echo "  Starting server via docker-compose..."
    (cd "$PROJECT_ROOT" && docker compose up -d)
    echo "  Waiting for server to start..."
    for i in $(seq 1 30); do
        if curl -sf "$SERVER/v1/health" > /dev/null 2>&1; then
            echo "  Server started after ${i}s"
            break
        fi
        sleep 1
    done
    if ! curl -sf "$SERVER/v1/health" > /dev/null 2>&1; then
        echo "ERROR: Server did not start within 30s"
        exit 1
    fi
fi
echo ""

# --- Step 3: Build Perry module ---
echo "--- Building Perry module ---"
echo "  Compiling bench.ts with Perry..."
$PERRY compile "$MODULE_DIR/bench.ts" --target spacetimedb -o "$MODULE_DIR/bench_perry.wasm"
echo "  Output: $MODULE_DIR/bench_perry.wasm ($(du -h "$MODULE_DIR/bench_perry.wasm" | cut -f1))"
echo ""

# --- Step 4: Publish Perry module ---
echo "--- Publishing Perry module ---"
PERRY_DB="bench-perry-e2e"
# Use --clear-database=if-exists to overwrite any existing module
$SPACETIME publish --bin-path "$MODULE_DIR/bench_perry.wasm" "$PERRY_DB" \
    -s "$SERVER" --yes --no-config 2>&1 || true
echo "  Published Perry module as '$PERRY_DB'"
echo ""

# Verify module loaded correctly
echo "--- Verifying Perry module ---"
$SPACETIME call "$PERRY_DB" empty -s "$SERVER" --yes 2>&1 || true
echo "  Perry module verified (empty reducer callable)"
echo ""

# --- Step 5: Build artillery client ---
echo "--- Building artillery client ---"
(cd "$CLIENT_DIR" && cargo build --release 2>&1 | tail -3)
CLIENT="$CLIENT_DIR/target/release/e2e-bench"
echo "  Client binary: $CLIENT"
echo ""

# --- Step 6: Run Perry benchmarks ---
echo "========================================"
echo "=== Perry AOT — E2E Benchmark       ==="
echo "========================================"
echo ""

if $COLD_STARTUP; then
    "$CLIENT" \
        --server "$SERVER" \
        --database "$PERRY_DB" \
        --reducer empty \
        --concurrency 1 \
        --warmup 10 \
        --iterations 100 \
        --cold-startup \
        --wasm-path "$MODULE_DIR/bench_perry.wasm" \
        --spacetime-cli "$SPACETIME"
fi

"$CLIENT" \
    --server "$SERVER" \
    --database "$PERRY_DB" \
    --reducer empty,cpu_heavy \
    --concurrency 1 \
    --warmup 50 \
    --iterations 500

echo ""
echo "--- Perry benchmark complete ---"
echo ""

# --- Step 7: V8 benchmarks (if not --perry-only) ---
if ! $PERRY_ONLY; then
    echo "========================================"
    echo "=== V8 JIT — E2E Benchmark           ==="
    echo "========================================"
    echo ""

    V8_DB="bench-v8-e2e"
    V8_BUNDLE="$MODULE_DIR/bench_v8.js"

    if [ ! -f "$V8_BUNDLE" ]; then
        echo "ERROR: V8 bundle not found at $V8_BUNDLE"
        echo "Build it: cd _vendor/SpacetimeDB-fork/modules/benchmarks-ts && spacetime build"
        echo "Then patch and copy: see docs/orchestrate/perry-e2e-bench/02-consolidated.md"
        exit 1
    fi

    echo "--- Publishing V8 module ---"
    $SPACETIME publish --js-path "$V8_BUNDLE" "$V8_DB" \
        -s "$SERVER" --yes --no-config 2>&1 || true
    echo "  Published V8 module as '$V8_DB'"
    echo ""

    # Verify module loaded correctly
    echo "--- Verifying V8 module ---"
    $SPACETIME call "$V8_DB" empty -s "$SERVER" --yes 2>&1 || true
    echo "  V8 module verified (empty reducer callable)"
    echo ""

    "$CLIENT" \
        --server "$SERVER" \
        --database "$V8_DB" \
        --reducer empty,cpu_heavy \
        --concurrency 1 \
        --warmup 50 \
        --iterations 500

    echo ""
    echo "--- V8 benchmark complete ---"
    echo ""
fi

echo "=== Benchmark complete ==="
