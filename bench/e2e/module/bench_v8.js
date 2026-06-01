import * as _syscalls2_0 from "spacetime:sys@2.0";
import { moduleHooks } from "spacetime:sys@2.0";
var _syscalls2_1 = {};  // stub: sys@2.1 (datastore_clear) not available on v2.0.1 server

//#region ../../node_modules/.pnpm/headers-polyfill@4.0.3/node_modules/headers-polyfill/lib/index.mjs
var __create$1 = Object.create;
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames$1 = Object.getOwnPropertyNames;
var __getProtoOf$1 = Object.getPrototypeOf;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __commonJS$1 = (cb, mod) => function __require() {
	return mod || (0, cb[__getOwnPropNames$1(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps$1 = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames$1(from)) if (!__hasOwnProp$1.call(to, key) && key !== except) __defProp$1(to, key, {
			get: () => from[key],
			enumerable: !(desc = __getOwnPropDesc$1(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM$1 = (mod, isNodeMode, target) => (target = mod != null ? __create$1(__getProtoOf$1(mod)) : {}, __copyProps$1(isNodeMode || !mod || !mod.__esModule ? __defProp$1(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var import_set_cookie_parser = __toESM$1(__commonJS$1({ "node_modules/set-cookie-parser/lib/set-cookie.js"(exports, module) {
	"use strict";
	var defaultParseOptions = {
		decodeValues: true,
		map: false,
		silent: false
	};
	function isNonEmptyString(str) {
		return typeof str === "string" && !!str.trim();
	}
	function parseString(setCookieValue, options) {
		var parts = setCookieValue.split(";").filter(isNonEmptyString);
		var parsed = parseNameValuePair(parts.shift());
		var name = parsed.name;
		var value = parsed.value;
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		try {
			value = options.decodeValues ? decodeURIComponent(value) : value;
		} catch (e) {
			console.error("set-cookie-parser encountered an error while decoding a cookie with value '" + value + "'. Set options.decodeValues to false to disable this feature.", e);
		}
		var cookie = {
			name,
			value
		};
		parts.forEach(function(part) {
			var sides = part.split("=");
			var key = sides.shift().trimLeft().toLowerCase();
			var value2 = sides.join("=");
			if (key === "expires") cookie.expires = new Date(value2);
			else if (key === "max-age") cookie.maxAge = parseInt(value2, 10);
			else if (key === "secure") cookie.secure = true;
			else if (key === "httponly") cookie.httpOnly = true;
			else if (key === "samesite") cookie.sameSite = value2;
			else cookie[key] = value2;
		});
		return cookie;
	}
	function parseNameValuePair(nameValuePairStr) {
		var name = "";
		var value = "";
		var nameValueArr = nameValuePairStr.split("=");
		if (nameValueArr.length > 1) {
			name = nameValueArr.shift();
			value = nameValueArr.join("=");
		} else value = nameValuePairStr;
		return {
			name,
			value
		};
	}
	function parse(input, options) {
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		if (!input) if (!options.map) return [];
		else return {};
		if (input.headers) if (typeof input.headers.getSetCookie === "function") input = input.headers.getSetCookie();
		else if (input.headers["set-cookie"]) input = input.headers["set-cookie"];
		else {
			var sch = input.headers[Object.keys(input.headers).find(function(key) {
				return key.toLowerCase() === "set-cookie";
			})];
			if (!sch && input.headers.cookie && !options.silent) console.warn("Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning.");
			input = sch;
		}
		if (!Array.isArray(input)) input = [input];
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		if (!options.map) return input.filter(isNonEmptyString).map(function(str) {
			return parseString(str, options);
		});
		else return input.filter(isNonEmptyString).reduce(function(cookies2, str) {
			var cookie = parseString(str, options);
			cookies2[cookie.name] = cookie;
			return cookies2;
		}, {});
	}
	function splitCookiesString2(cookiesString) {
		if (Array.isArray(cookiesString)) return cookiesString;
		if (typeof cookiesString !== "string") return [];
		var cookiesStrings = [];
		var pos = 0;
		var start;
		var ch;
		var lastComma;
		var nextStart;
		var cookiesSeparatorFound;
		function skipWhitespace() {
			while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
			return pos < cookiesString.length;
		}
		function notSpecialChar() {
			ch = cookiesString.charAt(pos);
			return ch !== "=" && ch !== ";" && ch !== ",";
		}
		while (pos < cookiesString.length) {
			start = pos;
			cookiesSeparatorFound = false;
			while (skipWhitespace()) {
				ch = cookiesString.charAt(pos);
				if (ch === ",") {
					lastComma = pos;
					pos += 1;
					skipWhitespace();
					nextStart = pos;
					while (pos < cookiesString.length && notSpecialChar()) pos += 1;
					if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
						cookiesSeparatorFound = true;
						pos = nextStart;
						cookiesStrings.push(cookiesString.substring(start, lastComma));
						start = pos;
					} else pos = lastComma + 1;
				} else pos += 1;
			}
			if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
		}
		return cookiesStrings;
	}
	module.exports = parse;
	module.exports.parse = parse;
	module.exports.parseString = parseString;
	module.exports.splitCookiesString = splitCookiesString2;
} })());
var HEADERS_INVALID_CHARACTERS = /[^a-z0-9\-#$%&'*+.^_`|~]/i;
function normalizeHeaderName(name) {
	if (HEADERS_INVALID_CHARACTERS.test(name) || name.trim() === "") throw new TypeError("Invalid character in header field name");
	return name.trim().toLowerCase();
}
var charCodesToRemove = [
	String.fromCharCode(10),
	String.fromCharCode(13),
	String.fromCharCode(9),
	String.fromCharCode(32)
];
var HEADER_VALUE_REMOVE_REGEXP = new RegExp(`(^[${charCodesToRemove.join("")}]|$[${charCodesToRemove.join("")}])`, "g");
function normalizeHeaderValue(value) {
	return value.replace(HEADER_VALUE_REMOVE_REGEXP, "");
}
function isValidHeaderName(value) {
	if (typeof value !== "string") return false;
	if (value.length === 0) return false;
	for (let i = 0; i < value.length; i++) {
		const character = value.charCodeAt(i);
		if (character > 127 || !isToken(character)) return false;
	}
	return true;
}
function isToken(value) {
	return ![
		127,
		32,
		"(",
		")",
		"<",
		">",
		"@",
		",",
		";",
		":",
		"\\",
		"\"",
		"/",
		"[",
		"]",
		"?",
		"=",
		"{",
		"}"
	].includes(value);
}
function isValidHeaderValue(value) {
	if (typeof value !== "string") return false;
	if (value.trim() !== value) return false;
	for (let i = 0; i < value.length; i++) {
		const character = value.charCodeAt(i);
		if (character === 0 || character === 10 || character === 13) return false;
	}
	return true;
}
var NORMALIZED_HEADERS = Symbol("normalizedHeaders");
var RAW_HEADER_NAMES = Symbol("rawHeaderNames");
var HEADER_VALUE_DELIMITER = ", ";
var _a, _b, _c;
var Headers = class _Headers {
	constructor(init) {
		this[_a] = {};
		this[_b] = /* @__PURE__ */ new Map();
		this[_c] = "Headers";
		if (["Headers", "HeadersPolyfill"].includes(init?.constructor.name) || init instanceof _Headers || typeof globalThis.Headers !== "undefined" && init instanceof globalThis.Headers) init.forEach((value, name) => {
			this.append(name, value);
		}, this);
		else if (Array.isArray(init)) init.forEach(([name, value]) => {
			this.append(name, Array.isArray(value) ? value.join(HEADER_VALUE_DELIMITER) : value);
		});
		else if (init) Object.getOwnPropertyNames(init).forEach((name) => {
			const value = init[name];
			this.append(name, Array.isArray(value) ? value.join(HEADER_VALUE_DELIMITER) : value);
		});
	}
	[(_a = NORMALIZED_HEADERS, _b = RAW_HEADER_NAMES, _c = Symbol.toStringTag, Symbol.iterator)]() {
		return this.entries();
	}
	*keys() {
		for (const [name] of this.entries()) yield name;
	}
	*values() {
		for (const [, value] of this.entries()) yield value;
	}
	*entries() {
		let sortedKeys = Object.keys(this[NORMALIZED_HEADERS]).sort((a, b) => a.localeCompare(b));
		for (const name of sortedKeys) if (name === "set-cookie") for (const value of this.getSetCookie()) yield [name, value];
		else yield [name, this.get(name)];
	}
	/**
	* Returns a boolean stating whether a `Headers` object contains a certain header.
	*/
	has(name) {
		if (!isValidHeaderName(name)) throw new TypeError(`Invalid header name "${name}"`);
		return this[NORMALIZED_HEADERS].hasOwnProperty(normalizeHeaderName(name));
	}
	/**
	* Returns a `ByteString` sequence of all the values of a header with a given name.
	*/
	get(name) {
		if (!isValidHeaderName(name)) throw TypeError(`Invalid header name "${name}"`);
		return this[NORMALIZED_HEADERS][normalizeHeaderName(name)] ?? null;
	}
	/**
	* Sets a new value for an existing header inside a `Headers` object, or adds the header if it does not already exist.
	*/
	set(name, value) {
		if (!isValidHeaderName(name) || !isValidHeaderValue(value)) return;
		const normalizedName = normalizeHeaderName(name);
		const normalizedValue = normalizeHeaderValue(value);
		this[NORMALIZED_HEADERS][normalizedName] = normalizeHeaderValue(normalizedValue);
		this[RAW_HEADER_NAMES].set(normalizedName, name);
	}
	/**
	* Appends a new value onto an existing header inside a `Headers` object, or adds the header if it does not already exist.
	*/
	append(name, value) {
		if (!isValidHeaderName(name) || !isValidHeaderValue(value)) return;
		const normalizedName = normalizeHeaderName(name);
		const normalizedValue = normalizeHeaderValue(value);
		let resolvedValue = this.has(normalizedName) ? `${this.get(normalizedName)}, ${normalizedValue}` : normalizedValue;
		this.set(name, resolvedValue);
	}
	/**
	* Deletes a header from the `Headers` object.
	*/
	delete(name) {
		if (!isValidHeaderName(name)) return;
		if (!this.has(name)) return;
		const normalizedName = normalizeHeaderName(name);
		delete this[NORMALIZED_HEADERS][normalizedName];
		this[RAW_HEADER_NAMES].delete(normalizedName);
	}
	/**
	* Traverses the `Headers` object,
	* calling the given callback for each header.
	*/
	forEach(callback, thisArg) {
		for (const [name, value] of this.entries()) callback.call(thisArg, value, name, this);
	}
	/**
	* Returns an array containing the values
	* of all Set-Cookie headers associated
	* with a response
	*/
	getSetCookie() {
		const setCookieHeader = this.get("set-cookie");
		if (setCookieHeader === null) return [];
		if (setCookieHeader === "") return [""];
		return (0, import_set_cookie_parser.splitCookiesString)(setCookieHeader);
	}
};
function headersToList(headers) {
	const headersList = [];
	headers.forEach((value, name) => {
		const resolvedValue = value.includes(",") ? value.split(",").map((value2) => value2.trim()) : value;
		headersList.push([name, resolvedValue]);
	});
	return headersList;
}

//#endregion
//#region ../../crates/bindings-typescript/dist/server/index.mjs
typeof globalThis !== "undefined" && (globalThis.global = globalThis.global || globalThis, globalThis.window = globalThis.window || globalThis);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
	return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: () => from[key],
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(__defProp(target, "default", {
	value: mod,
	enumerable: true
}), mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var require_base64_js = __commonJS({ "../../node_modules/.pnpm/base64-js@1.5.1/node_modules/base64-js/index.js"(exports) {
	exports.byteLength = byteLength;
	exports.toByteArray = toByteArray;
	exports.fromByteArray = fromByteArray2;
	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
	var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	for (i = 0, len = code.length; i < len; ++i) {
		lookup[i] = code[i];
		revLookup[code.charCodeAt(i)] = i;
	}
	var i;
	var len;
	revLookup["-".charCodeAt(0)] = 62;
	revLookup["_".charCodeAt(0)] = 63;
	function getLens(b64) {
		var len2 = b64.length;
		if (len2 % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
		var validLen = b64.indexOf("=");
		if (validLen === -1) validLen = len2;
		var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
		return [validLen, placeHoldersLen];
	}
	function byteLength(b64) {
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function _byteLength(b64, validLen, placeHoldersLen) {
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function toByteArray(b64) {
		var tmp;
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
		var curByte = 0;
		var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
		var i2;
		for (i2 = 0; i2 < len2; i2 += 4) {
			tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
			arr[curByte++] = tmp >> 16 & 255;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 2) {
			tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 1) {
			tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		return arr;
	}
	function tripletToBase64(num) {
		return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
	}
	function encodeChunk(uint8, start, end) {
		var tmp;
		var output = [];
		for (var i2 = start; i2 < end; i2 += 3) {
			tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
			output.push(tripletToBase64(tmp));
		}
		return output.join("");
	}
	function fromByteArray2(uint8) {
		var tmp;
		var len2 = uint8.length;
		var extraBytes = len2 % 3;
		var parts = [];
		var maxChunkLength = 16383;
		for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
		if (extraBytes === 1) {
			tmp = uint8[len2 - 1];
			parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
		} else if (extraBytes === 2) {
			tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
			parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
		}
		return parts.join("");
	}
} });
var require_codes = __commonJS({ "../../node_modules/.pnpm/statuses@2.0.2/node_modules/statuses/codes.json"(exports, module) {
	module.exports = {
		"100": "Continue",
		"101": "Switching Protocols",
		"102": "Processing",
		"103": "Early Hints",
		"200": "OK",
		"201": "Created",
		"202": "Accepted",
		"203": "Non-Authoritative Information",
		"204": "No Content",
		"205": "Reset Content",
		"206": "Partial Content",
		"207": "Multi-Status",
		"208": "Already Reported",
		"226": "IM Used",
		"300": "Multiple Choices",
		"301": "Moved Permanently",
		"302": "Found",
		"303": "See Other",
		"304": "Not Modified",
		"305": "Use Proxy",
		"307": "Temporary Redirect",
		"308": "Permanent Redirect",
		"400": "Bad Request",
		"401": "Unauthorized",
		"402": "Payment Required",
		"403": "Forbidden",
		"404": "Not Found",
		"405": "Method Not Allowed",
		"406": "Not Acceptable",
		"407": "Proxy Authentication Required",
		"408": "Request Timeout",
		"409": "Conflict",
		"410": "Gone",
		"411": "Length Required",
		"412": "Precondition Failed",
		"413": "Payload Too Large",
		"414": "URI Too Long",
		"415": "Unsupported Media Type",
		"416": "Range Not Satisfiable",
		"417": "Expectation Failed",
		"418": "I'm a Teapot",
		"421": "Misdirected Request",
		"422": "Unprocessable Entity",
		"423": "Locked",
		"424": "Failed Dependency",
		"425": "Too Early",
		"426": "Upgrade Required",
		"428": "Precondition Required",
		"429": "Too Many Requests",
		"431": "Request Header Fields Too Large",
		"451": "Unavailable For Legal Reasons",
		"500": "Internal Server Error",
		"501": "Not Implemented",
		"502": "Bad Gateway",
		"503": "Service Unavailable",
		"504": "Gateway Timeout",
		"505": "HTTP Version Not Supported",
		"506": "Variant Also Negotiates",
		"507": "Insufficient Storage",
		"508": "Loop Detected",
		"509": "Bandwidth Limit Exceeded",
		"510": "Not Extended",
		"511": "Network Authentication Required"
	};
} });
var require_statuses = __commonJS({ "../../node_modules/.pnpm/statuses@2.0.2/node_modules/statuses/index.js"(exports, module) {
	var codes = require_codes();
	module.exports = status2;
	status2.message = codes;
	status2.code = createMessageToStatusCodeMap(codes);
	status2.codes = createStatusCodeList(codes);
	status2.redirect = {
		300: true,
		301: true,
		302: true,
		303: true,
		305: true,
		307: true,
		308: true
	};
	status2.empty = {
		204: true,
		205: true,
		304: true
	};
	status2.retry = {
		502: true,
		503: true,
		504: true
	};
	function createMessageToStatusCodeMap(codes2) {
		var map = {};
		Object.keys(codes2).forEach(function forEachCode(code) {
			var message = codes2[code];
			var status3 = Number(code);
			map[message.toLowerCase()] = status3;
		});
		return map;
	}
	function createStatusCodeList(codes2) {
		return Object.keys(codes2).map(function mapCode(code) {
			return Number(code);
		});
	}
	function getStatusCode(message) {
		var msg = message.toLowerCase();
		if (!Object.prototype.hasOwnProperty.call(status2.code, msg)) throw new Error("invalid status message: \"" + message + "\"");
		return status2.code[msg];
	}
	function getStatusMessage(code) {
		if (!Object.prototype.hasOwnProperty.call(status2.message, code)) throw new Error("invalid status code: " + code);
		return status2.message[code];
	}
	function status2(code) {
		if (typeof code === "number") return getStatusMessage(code);
		if (typeof code !== "string") throw new TypeError("code must be a number or string");
		var n = parseInt(code, 10);
		if (!isNaN(n)) return getStatusMessage(n);
		return getStatusCode(code);
	}
} });
var util_stub_exports = {};
__export(util_stub_exports, { inspect: () => inspect });
var inspect;
var init_util_stub = __esm({ "src/util-stub.ts"() {
	inspect = {};
} });
var require_util_inspect = __commonJS({ "../../node_modules/.pnpm/object-inspect@1.13.4/node_modules/object-inspect/util.inspect.js"(exports, module) {
	module.exports = (init_util_stub(), __toCommonJS(util_stub_exports)).inspect;
} });
var require_object_inspect = __commonJS({ "../../node_modules/.pnpm/object-inspect@1.13.4/node_modules/object-inspect/index.js"(exports, module) {
	var hasMap = typeof Map === "function" && Map.prototype;
	var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
	var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
	var mapForEach = hasMap && Map.prototype.forEach;
	var hasSet = typeof Set === "function" && Set.prototype;
	var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
	var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
	var setForEach = hasSet && Set.prototype.forEach;
	var weakMapHas = typeof WeakMap === "function" && WeakMap.prototype ? WeakMap.prototype.has : null;
	var weakSetHas = typeof WeakSet === "function" && WeakSet.prototype ? WeakSet.prototype.has : null;
	var weakRefDeref = typeof WeakRef === "function" && WeakRef.prototype ? WeakRef.prototype.deref : null;
	var booleanValueOf = Boolean.prototype.valueOf;
	var objectToString = Object.prototype.toString;
	var functionToString = Function.prototype.toString;
	var $match = String.prototype.match;
	var $slice = String.prototype.slice;
	var $replace = String.prototype.replace;
	var $toUpperCase = String.prototype.toUpperCase;
	var $toLowerCase = String.prototype.toLowerCase;
	var $test = RegExp.prototype.test;
	var $concat = Array.prototype.concat;
	var $join = Array.prototype.join;
	var $arrSlice = Array.prototype.slice;
	var $floor = Math.floor;
	var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
	var gOPS = Object.getOwnPropertySymbols;
	var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
	var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
	var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
		return O.__proto__;
	} : null);
	function addNumericSeparator(num, str) {
		if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) return str;
		var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
		if (typeof num === "number") {
			var int = num < 0 ? -$floor(-num) : $floor(num);
			if (int !== num) {
				var intStr = String(int);
				var dec = $slice.call(str, intStr.length + 1);
				return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
			}
		}
		return $replace.call(str, sepRegex, "$&_");
	}
	var utilInspect = require_util_inspect();
	var inspectCustom = utilInspect.custom;
	var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
	var quotes = {
		__proto__: null,
		"double": "\"",
		single: "'"
	};
	var quoteREs = {
		__proto__: null,
		"double": /(["\\])/g,
		single: /(['\\])/g
	};
	module.exports = function inspect_(obj, options, depth, seen) {
		var opts = options || {};
		if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) throw new TypeError("option \"quoteStyle\" must be \"single\" or \"double\"");
		if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) throw new TypeError("option \"maxStringLength\", if provided, must be a positive integer, Infinity, or `null`");
		var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
		if (typeof customInspect !== "boolean" && customInspect !== "symbol") throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
		if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) throw new TypeError("option \"indent\" must be \"\\t\", an integer > 0, or `null`");
		if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") throw new TypeError("option \"numericSeparator\", if provided, must be `true` or `false`");
		var numericSeparator = opts.numericSeparator;
		if (typeof obj === "undefined") return "undefined";
		if (obj === null) return "null";
		if (typeof obj === "boolean") return obj ? "true" : "false";
		if (typeof obj === "string") return inspectString(obj, opts);
		if (typeof obj === "number") {
			if (obj === 0) return Infinity / obj > 0 ? "0" : "-0";
			var str = String(obj);
			return numericSeparator ? addNumericSeparator(obj, str) : str;
		}
		if (typeof obj === "bigint") {
			var bigIntStr = String(obj) + "n";
			return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
		}
		var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
		if (typeof depth === "undefined") depth = 0;
		if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") return isArray(obj) ? "[Array]" : "[Object]";
		var indent = getIndent(opts, depth);
		if (typeof seen === "undefined") seen = [];
		else if (indexOf(seen, obj) >= 0) return "[Circular]";
		function inspect3(value, from, noIndent) {
			if (from) {
				seen = $arrSlice.call(seen);
				seen.push(from);
			}
			if (noIndent) {
				var newOpts = { depth: opts.depth };
				if (has(opts, "quoteStyle")) newOpts.quoteStyle = opts.quoteStyle;
				return inspect_(value, newOpts, depth + 1, seen);
			}
			return inspect_(value, opts, depth + 1, seen);
		}
		if (typeof obj === "function" && !isRegExp(obj)) {
			var name = nameOf(obj);
			var keys = arrObjKeys(obj, inspect3);
			return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
		}
		if (isSymbol(obj)) {
			var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
			return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
		}
		if (isElement(obj)) {
			var s = "<" + $toLowerCase.call(String(obj.nodeName));
			var attrs = obj.attributes || [];
			for (var i = 0; i < attrs.length; i++) s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
			s += ">";
			if (obj.childNodes && obj.childNodes.length) s += "...";
			s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
			return s;
		}
		if (isArray(obj)) {
			if (obj.length === 0) return "[]";
			var xs = arrObjKeys(obj, inspect3);
			if (indent && !singleLineValues(xs)) return "[" + indentedJoin(xs, indent) + "]";
			return "[ " + $join.call(xs, ", ") + " ]";
		}
		if (isError(obj)) {
			var parts = arrObjKeys(obj, inspect3);
			if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect3(obj.cause), parts), ", ") + " }";
			if (parts.length === 0) return "[" + String(obj) + "]";
			return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
		}
		if (typeof obj === "object" && customInspect) {
			if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) return utilInspect(obj, { depth: maxDepth - depth });
			else if (customInspect !== "symbol" && typeof obj.inspect === "function") return obj.inspect();
		}
		if (isMap(obj)) {
			var mapParts = [];
			if (mapForEach) mapForEach.call(obj, function(value, key) {
				mapParts.push(inspect3(key, obj, true) + " => " + inspect3(value, obj));
			});
			return collectionOf("Map", mapSize.call(obj), mapParts, indent);
		}
		if (isSet(obj)) {
			var setParts = [];
			if (setForEach) setForEach.call(obj, function(value) {
				setParts.push(inspect3(value, obj));
			});
			return collectionOf("Set", setSize.call(obj), setParts, indent);
		}
		if (isWeakMap(obj)) return weakCollectionOf("WeakMap");
		if (isWeakSet(obj)) return weakCollectionOf("WeakSet");
		if (isWeakRef(obj)) return weakCollectionOf("WeakRef");
		if (isNumber(obj)) return markBoxed(inspect3(Number(obj)));
		if (isBigInt(obj)) return markBoxed(inspect3(bigIntValueOf.call(obj)));
		if (isBoolean(obj)) return markBoxed(booleanValueOf.call(obj));
		if (isString(obj)) return markBoxed(inspect3(String(obj)));
		if (typeof window !== "undefined" && obj === window) return "{ [object Window] }";
		if (typeof globalThis !== "undefined" && obj === globalThis || typeof global !== "undefined" && obj === global) return "{ [object globalThis] }";
		if (!isDate(obj) && !isRegExp(obj)) {
			var ys = arrObjKeys(obj, inspect3);
			var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
			var protoTag = obj instanceof Object ? "" : "null prototype";
			var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
			var tag = (isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "") + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
			if (ys.length === 0) return tag + "{}";
			if (indent) return tag + "{" + indentedJoin(ys, indent) + "}";
			return tag + "{ " + $join.call(ys, ", ") + " }";
		}
		return String(obj);
	};
	function wrapQuotes(s, defaultStyle, opts) {
		var quoteChar = quotes[opts.quoteStyle || defaultStyle];
		return quoteChar + s + quoteChar;
	}
	function quote(s) {
		return $replace.call(String(s), /"/g, "&quot;");
	}
	function canTrustToString(obj) {
		return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
	}
	function isArray(obj) {
		return toStr(obj) === "[object Array]" && canTrustToString(obj);
	}
	function isDate(obj) {
		return toStr(obj) === "[object Date]" && canTrustToString(obj);
	}
	function isRegExp(obj) {
		return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
	}
	function isError(obj) {
		return toStr(obj) === "[object Error]" && canTrustToString(obj);
	}
	function isString(obj) {
		return toStr(obj) === "[object String]" && canTrustToString(obj);
	}
	function isNumber(obj) {
		return toStr(obj) === "[object Number]" && canTrustToString(obj);
	}
	function isBoolean(obj) {
		return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
	}
	function isSymbol(obj) {
		if (hasShammedSymbols) return obj && typeof obj === "object" && obj instanceof Symbol;
		if (typeof obj === "symbol") return true;
		if (!obj || typeof obj !== "object" || !symToString) return false;
		try {
			symToString.call(obj);
			return true;
		} catch (e) {}
		return false;
	}
	function isBigInt(obj) {
		if (!obj || typeof obj !== "object" || !bigIntValueOf) return false;
		try {
			bigIntValueOf.call(obj);
			return true;
		} catch (e) {}
		return false;
	}
	var hasOwn2 = Object.prototype.hasOwnProperty || function(key) {
		return key in this;
	};
	function has(obj, key) {
		return hasOwn2.call(obj, key);
	}
	function toStr(obj) {
		return objectToString.call(obj);
	}
	function nameOf(f) {
		if (f.name) return f.name;
		var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
		if (m) return m[1];
		return null;
	}
	function indexOf(xs, x) {
		if (xs.indexOf) return xs.indexOf(x);
		for (var i = 0, l = xs.length; i < l; i++) if (xs[i] === x) return i;
		return -1;
	}
	function isMap(x) {
		if (!mapSize || !x || typeof x !== "object") return false;
		try {
			mapSize.call(x);
			try {
				setSize.call(x);
			} catch (s) {
				return true;
			}
			return x instanceof Map;
		} catch (e) {}
		return false;
	}
	function isWeakMap(x) {
		if (!weakMapHas || !x || typeof x !== "object") return false;
		try {
			weakMapHas.call(x, weakMapHas);
			try {
				weakSetHas.call(x, weakSetHas);
			} catch (s) {
				return true;
			}
			return x instanceof WeakMap;
		} catch (e) {}
		return false;
	}
	function isWeakRef(x) {
		if (!weakRefDeref || !x || typeof x !== "object") return false;
		try {
			weakRefDeref.call(x);
			return true;
		} catch (e) {}
		return false;
	}
	function isSet(x) {
		if (!setSize || !x || typeof x !== "object") return false;
		try {
			setSize.call(x);
			try {
				mapSize.call(x);
			} catch (m) {
				return true;
			}
			return x instanceof Set;
		} catch (e) {}
		return false;
	}
	function isWeakSet(x) {
		if (!weakSetHas || !x || typeof x !== "object") return false;
		try {
			weakSetHas.call(x, weakSetHas);
			try {
				weakMapHas.call(x, weakMapHas);
			} catch (s) {
				return true;
			}
			return x instanceof WeakSet;
		} catch (e) {}
		return false;
	}
	function isElement(x) {
		if (!x || typeof x !== "object") return false;
		if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) return true;
		return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
	}
	function inspectString(str, opts) {
		if (str.length > opts.maxStringLength) {
			var remaining = str.length - opts.maxStringLength;
			var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
			return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
		}
		var quoteRE = quoteREs[opts.quoteStyle || "single"];
		quoteRE.lastIndex = 0;
		return wrapQuotes($replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte), "single", opts);
	}
	function lowbyte(c) {
		var n = c.charCodeAt(0);
		var x = {
			8: "b",
			9: "t",
			10: "n",
			12: "f",
			13: "r"
		}[n];
		if (x) return "\\" + x;
		return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
	}
	function markBoxed(str) {
		return "Object(" + str + ")";
	}
	function weakCollectionOf(type) {
		return type + " { ? }";
	}
	function collectionOf(type, size, entries, indent) {
		var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
		return type + " (" + size + ") {" + joinedEntries + "}";
	}
	function singleLineValues(xs) {
		for (var i = 0; i < xs.length; i++) if (indexOf(xs[i], "\n") >= 0) return false;
		return true;
	}
	function getIndent(opts, depth) {
		var baseIndent;
		if (opts.indent === "	") baseIndent = "	";
		else if (typeof opts.indent === "number" && opts.indent > 0) baseIndent = $join.call(Array(opts.indent + 1), " ");
		else return null;
		return {
			base: baseIndent,
			prev: $join.call(Array(depth + 1), baseIndent)
		};
	}
	function indentedJoin(xs, indent) {
		if (xs.length === 0) return "";
		var lineJoiner = "\n" + indent.prev + indent.base;
		return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
	}
	function arrObjKeys(obj, inspect3) {
		var isArr = isArray(obj);
		var xs = [];
		if (isArr) {
			xs.length = obj.length;
			for (var i = 0; i < obj.length; i++) xs[i] = has(obj, i) ? inspect3(obj[i], obj) : "";
		}
		var syms = typeof gOPS === "function" ? gOPS(obj) : [];
		var symMap;
		if (hasShammedSymbols) {
			symMap = {};
			for (var k = 0; k < syms.length; k++) symMap["$" + syms[k]] = syms[k];
		}
		for (var key in obj) {
			if (!has(obj, key)) continue;
			if (isArr && String(Number(key)) === key && key < obj.length) continue;
			if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) continue;
			else if ($test.call(/[^\w$]/, key)) xs.push(inspect3(key, obj) + ": " + inspect3(obj[key], obj));
			else xs.push(key + ": " + inspect3(obj[key], obj));
		}
		if (typeof gOPS === "function") {
			for (var j = 0; j < syms.length; j++) if (isEnumerable.call(obj, syms[j])) xs.push("[" + inspect3(syms[j]) + "]: " + inspect3(obj[syms[j]], obj));
		}
		return xs;
	}
} });
var TimeDuration = class _TimeDuration {
	__time_duration_micros__;
	static MICROS_PER_MILLIS = 1000n;
	/**
	* Get the algebraic type representation of the {@link TimeDuration} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__time_duration_micros__",
			algebraicType: AlgebraicType.I64
		}] });
	}
	static isTimeDuration(algebraicType) {
		if (algebraicType.tag !== "Product") return false;
		const elements = algebraicType.value.elements;
		if (elements.length !== 1) return false;
		const microsElement = elements[0];
		return microsElement.name === "__time_duration_micros__" && microsElement.algebraicType.tag === "I64";
	}
	get micros() {
		return this.__time_duration_micros__;
	}
	get millis() {
		return Number(this.micros / _TimeDuration.MICROS_PER_MILLIS);
	}
	constructor(micros) {
		this.__time_duration_micros__ = micros;
	}
	static fromMillis(millis) {
		return new _TimeDuration(BigInt(millis) * _TimeDuration.MICROS_PER_MILLIS);
	}
	/** This outputs the same string format that we use in the host and in Rust modules */
	toString() {
		const micros = this.micros;
		const sign = micros < 0 ? "-" : "+";
		const pos = micros < 0 ? -micros : micros;
		const secs = pos / 1000000n;
		const micros_remaining = pos % 1000000n;
		return `${sign}${secs}.${String(micros_remaining).padStart(6, "0")}`;
	}
};
var Timestamp = class _Timestamp {
	__timestamp_micros_since_unix_epoch__;
	static MICROS_PER_MILLIS = 1000n;
	get microsSinceUnixEpoch() {
		return this.__timestamp_micros_since_unix_epoch__;
	}
	constructor(micros) {
		this.__timestamp_micros_since_unix_epoch__ = micros;
	}
	/**
	* Get the algebraic type representation of the {@link Timestamp} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__timestamp_micros_since_unix_epoch__",
			algebraicType: AlgebraicType.I64
		}] });
	}
	static isTimestamp(algebraicType) {
		if (algebraicType.tag !== "Product") return false;
		const elements = algebraicType.value.elements;
		if (elements.length !== 1) return false;
		const microsElement = elements[0];
		return microsElement.name === "__timestamp_micros_since_unix_epoch__" && microsElement.algebraicType.tag === "I64";
	}
	/**
	* The Unix epoch, the midnight at the beginning of January 1, 1970, UTC.
	*/
	static UNIX_EPOCH = new _Timestamp(0n);
	/**
	* Get a `Timestamp` representing the execution environment's belief of the current moment in time.
	*/
	static now() {
		return _Timestamp.fromDate(/* @__PURE__ */ new Date());
	}
	/** Convert to milliseconds since Unix epoch. */
	toMillis() {
		return this.microsSinceUnixEpoch / 1000n;
	}
	/**
	* Get a `Timestamp` representing the same point in time as `date`.
	*/
	static fromDate(date) {
		const millis = date.getTime();
		return new _Timestamp(BigInt(millis) * _Timestamp.MICROS_PER_MILLIS);
	}
	/**
	* Get a `Date` representing approximately the same point in time as `this`.
	*
	* This method truncates to millisecond precision,
	* and throws `RangeError` if the `Timestamp` is outside the range representable as a `Date`.
	*/
	toDate() {
		const millis = this.__timestamp_micros_since_unix_epoch__ / _Timestamp.MICROS_PER_MILLIS;
		if (millis > BigInt(Number.MAX_SAFE_INTEGER) || millis < BigInt(Number.MIN_SAFE_INTEGER)) throw new RangeError("Timestamp is outside of the representable range of JS's Date");
		return new Date(Number(millis));
	}
	/**
	* Get an ISO 8601 / RFC 3339 formatted string representation of this timestamp with microsecond precision.
	*
	* This method preserves the full microsecond precision of the timestamp,
	* and throws `RangeError` if the `Timestamp` is outside the range representable in ISO format.
	*
	* @returns ISO 8601 formatted string with microsecond precision (e.g., '2025-02-17T10:30:45.123456Z')
	*/
	toISOString() {
		const micros = this.__timestamp_micros_since_unix_epoch__;
		const millis = micros / _Timestamp.MICROS_PER_MILLIS;
		if (millis > BigInt(Number.MAX_SAFE_INTEGER) || millis < BigInt(Number.MIN_SAFE_INTEGER)) throw new RangeError("Timestamp is outside of the representable range for ISO string formatting");
		const isoBase = new Date(Number(millis)).toISOString();
		const microsRemainder = Math.abs(Number(micros % 1000000n));
		const fractionalPart = String(microsRemainder).padStart(6, "0");
		return isoBase.replace(/\.\d{3}Z$/, `.${fractionalPart}Z`);
	}
	since(other) {
		return new TimeDuration(this.__timestamp_micros_since_unix_epoch__ - other.__timestamp_micros_since_unix_epoch__);
	}
};
var Uuid = class _Uuid {
	__uuid__;
	/**
	* The nil UUID (all zeros).
	*
	* @example
	* ```ts
	* const uuid = Uuid.NIL;
	* console.assert(
	*   uuid.toString() === "00000000-0000-0000-0000-000000000000"
	* );
	* ```
	*/
	static NIL = new _Uuid(0n);
	static MAX_UUID_BIGINT = 340282366920938463463374607431768211455n;
	/**
	* The max UUID (all ones).
	*
	* @example
	* ```ts
	* const uuid = Uuid.MAX;
	* console.assert(
	*   uuid.toString() === "ffffffff-ffff-ffff-ffff-ffffffffffff"
	* );
	* ```
	*/
	static MAX = new _Uuid(_Uuid.MAX_UUID_BIGINT);
	/**
	* Create a UUID from a raw 128-bit value.
	*
	* @param u - Unsigned 128-bit integer
	* @throws {Error} If the value is outside the valid UUID range
	*/
	constructor(u) {
		if (u < 0n || u > _Uuid.MAX_UUID_BIGINT) throw new Error("Invalid UUID: must be between 0 and `MAX_UUID_BIGINT`");
		this.__uuid__ = u;
	}
	/**
	* Create a UUID `v4` from explicit random bytes.
	*
	* This method assumes the bytes are already sufficiently random.
	* It only sets the appropriate bits for the UUID version and variant.
	*
	* @param bytes - Exactly 16 random bytes
	* @returns A UUID `v4`
	* @throws {Error} If `bytes.length !== 16`
	*
	* @example
	* ```ts
	* const randomBytes = new Uint8Array(16);
	* const uuid = Uuid.fromRandomBytesV4(randomBytes);
	*
	* console.assert(
	*   uuid.toString() === "00000000-0000-4000-8000-000000000000"
	* );
	* ```
	*/
	static fromRandomBytesV4(bytes) {
		if (bytes.length !== 16) throw new Error("UUID v4 requires 16 bytes");
		const arr = new Uint8Array(bytes);
		arr[6] = arr[6] & 15 | 64;
		arr[8] = arr[8] & 63 | 128;
		return new _Uuid(_Uuid.bytesToBigInt(arr));
	}
	/**
	* Generate a UUID `v7` using a monotonic counter from `0` to `2^31 - 1`,
	* a timestamp, and 4 random bytes.
	*
	* The counter wraps around on overflow.
	*
	* The UUID `v7` is structured as follows:
	*
	* ```ascii
	* ┌───────────────────────────────────────────────┬───────────────────┐
	* | B0  | B1  | B2  | B3  | B4  | B5              |         B6        |
	* ├───────────────────────────────────────────────┼───────────────────┤
	* |                 unix_ts_ms                    |      version 7    |
	* └───────────────────────────────────────────────┴───────────────────┘
	* ┌──────────────┬─────────┬──────────────────┬───────────────────────┐
	* | B7           | B8      | B9  | B10 | B11  | B12 | B13 | B14 | B15 |
	* ├──────────────┼─────────┼──────────────────┼───────────────────────┤
	* | counter_high | variant |    counter_low   |        random         |
	* └──────────────┴─────────┴──────────────────┴───────────────────────┘
	* ```
	*
	* @param counter - Mutable monotonic counter (31-bit)
	* @param now - Timestamp since the Unix epoch
	* @param randomBytes - Exactly 4 random bytes
	* @returns A UUID `v7`
	*
	* @throws {Error} If the `counter` is negative
	* @throws {Error} If the `timestamp` is before the Unix epoch
	* @throws {Error} If `randomBytes.length !== 4`
	*
	* @example
	* ```ts
	* const now = Timestamp.fromMillis(1_686_000_000_000n);
	* const counter = { value: 1 };
	* const randomBytes = new Uint8Array(4);
	*
	* const uuid = Uuid.fromCounterV7(counter, now, randomBytes);
	*
	* console.assert(
	*   uuid.toString() === "0000647e-5180-7000-8000-000200000000"
	* );
	* ```
	*/
	static fromCounterV7(counter, now, randomBytes) {
		if (randomBytes.length !== 4) throw new Error("`fromCounterV7` requires `randomBytes.length == 4`");
		if (counter.value < 0) throw new Error("`fromCounterV7` uuid `counter` must be non-negative");
		if (now.__timestamp_micros_since_unix_epoch__ < 0) throw new Error("`fromCounterV7` `timestamp` before unix epoch");
		const counterVal = counter.value;
		counter.value = counterVal + 1 & 2147483647;
		const tsMs = now.toMillis() & 281474976710655n;
		const bytes = new Uint8Array(16);
		bytes[0] = Number(tsMs >> 40n & 255n);
		bytes[1] = Number(tsMs >> 32n & 255n);
		bytes[2] = Number(tsMs >> 24n & 255n);
		bytes[3] = Number(tsMs >> 16n & 255n);
		bytes[4] = Number(tsMs >> 8n & 255n);
		bytes[5] = Number(tsMs & 255n);
		bytes[7] = counterVal >>> 23 & 255;
		bytes[9] = counterVal >>> 15 & 255;
		bytes[10] = counterVal >>> 7 & 255;
		bytes[11] = (counterVal & 127) << 1 & 255;
		bytes[12] |= randomBytes[0] & 127;
		bytes[13] = randomBytes[1];
		bytes[14] = randomBytes[2];
		bytes[15] = randomBytes[3];
		bytes[6] = bytes[6] & 15 | 112;
		bytes[8] = bytes[8] & 63 | 128;
		return new _Uuid(_Uuid.bytesToBigInt(bytes));
	}
	/**
	* Parse a UUID from a string representation.
	*
	* @param s - UUID string
	* @returns Parsed UUID
	* @throws {Error} If the string is not a valid UUID
	*
	* @example
	* ```ts
	* const s = "01888d6e-5c00-7000-8000-000000000000";
	* const uuid = Uuid.parse(s);
	*
	* console.assert(uuid.toString() === s);
	* ```
	*/
	static parse(s) {
		const hex = s.replace(/-/g, "");
		if (hex.length !== 32) throw new Error("Invalid hex UUID");
		let v = 0n;
		for (let i = 0; i < 32; i += 2) v = v << 8n | BigInt(parseInt(hex.slice(i, i + 2), 16));
		return new _Uuid(v);
	}
	/** Convert to string (hyphenated form). */
	toString() {
		const hex = [..._Uuid.bigIntToBytes(this.__uuid__)].map((b) => b.toString(16).padStart(2, "0")).join("");
		return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
	}
	/** Convert to bigint (u128). */
	asBigInt() {
		return this.__uuid__;
	}
	/** Return a `Uint8Array` of 16 bytes. */
	toBytes() {
		return _Uuid.bigIntToBytes(this.__uuid__);
	}
	static bytesToBigInt(bytes) {
		let result = 0n;
		for (const b of bytes) result = result << 8n | BigInt(b);
		return result;
	}
	static bigIntToBytes(value) {
		const bytes = new Uint8Array(16);
		for (let i = 15; i >= 0; i--) {
			bytes[i] = Number(value & 255n);
			value >>= 8n;
		}
		return bytes;
	}
	/**
	* Returns the version of this UUID.
	*
	* This represents the algorithm used to generate the value.
	*
	* @returns A `UuidVersion`
	* @throws {Error} If the version field is not recognized
	*/
	getVersion() {
		const version = this.toBytes()[6] >> 4 & 15;
		switch (version) {
			case 4: return "V4";
			case 7: return "V7";
			default:
				if (this == _Uuid.NIL) return "Nil";
				if (this == _Uuid.MAX) return "Max";
				throw new Error(`Unsupported UUID version: ${version}`);
		}
	}
	/**
	* Extract the monotonic counter from a UUIDv7.
	*
	* Intended for testing and diagnostics.
	* Behavior is undefined if called on a non-V7 UUID.
	*
	* @returns 31-bit counter value
	*/
	getCounter() {
		const bytes = this.toBytes();
		const high = bytes[7];
		const mid1 = bytes[9];
		const mid2 = bytes[10];
		const low = bytes[11] >>> 1;
		return high << 23 | mid1 << 15 | mid2 << 7 | low | 0;
	}
	compareTo(other) {
		if (this.__uuid__ < other.__uuid__) return -1;
		if (this.__uuid__ > other.__uuid__) return 1;
		return 0;
	}
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__uuid__",
			algebraicType: AlgebraicType.U128
		}] });
	}
};
var BinaryReader = class {
	/**
	* The DataView used to read values from the binary data.
	*
	* Note: The DataView's `byteOffset` is relative to the beginning of the
	* underlying ArrayBuffer, not the start of the provided Uint8Array input.
	* This `BinaryReader`'s `#offset` field is used to track the current read position
	* relative to the start of the provided Uint8Array input.
	*/
	view;
	/**
	* Represents the offset (in bytes) relative to the start of the DataView
	* and provided Uint8Array input.
	*
	* Note: This is *not* the absolute byte offset within the underlying ArrayBuffer.
	*/
	offset = 0;
	constructor(input) {
		this.view = input instanceof DataView ? input : new DataView(input.buffer, input.byteOffset, input.byteLength);
		this.offset = 0;
	}
	reset(input) {
		this.view = input instanceof DataView ? input : new DataView(input.buffer, input.byteOffset, input.byteLength);
		this.offset = 0;
	}
	get remaining() {
		return this.view.byteLength - this.offset;
	}
	/** Ensure we have at least `n` bytes left to read */
	#ensure(n) {
		if (this.offset + n > this.view.byteLength) throw new RangeError(`Tried to read ${n} byte(s) at relative offset ${this.offset}, but only ${this.remaining} byte(s) remain`);
	}
	readUInt8Array() {
		const length = this.readU32();
		this.#ensure(length);
		return this.readBytes(length);
	}
	readBool() {
		const value = this.view.getUint8(this.offset);
		this.offset += 1;
		return value !== 0;
	}
	readByte() {
		const value = this.view.getUint8(this.offset);
		this.offset += 1;
		return value;
	}
	readBytes(length) {
		const array = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, length);
		this.offset += length;
		return array;
	}
	readI8() {
		const value = this.view.getInt8(this.offset);
		this.offset += 1;
		return value;
	}
	readU8() {
		return this.readByte();
	}
	readI16() {
		const value = this.view.getInt16(this.offset, true);
		this.offset += 2;
		return value;
	}
	readU16() {
		const value = this.view.getUint16(this.offset, true);
		this.offset += 2;
		return value;
	}
	readI32() {
		const value = this.view.getInt32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readU32() {
		const value = this.view.getUint32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readI64() {
		const value = this.view.getBigInt64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readU64() {
		const value = this.view.getBigUint64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readU128() {
		const lowerPart = this.view.getBigUint64(this.offset, true);
		const upperPart = this.view.getBigUint64(this.offset + 8, true);
		this.offset += 16;
		return (upperPart << BigInt(64)) + lowerPart;
	}
	readI128() {
		const lowerPart = this.view.getBigUint64(this.offset, true);
		const upperPart = this.view.getBigInt64(this.offset + 8, true);
		this.offset += 16;
		return (upperPart << BigInt(64)) + lowerPart;
	}
	readU256() {
		const p0 = this.view.getBigUint64(this.offset, true);
		const p1 = this.view.getBigUint64(this.offset + 8, true);
		const p2 = this.view.getBigUint64(this.offset + 16, true);
		const p3 = this.view.getBigUint64(this.offset + 24, true);
		this.offset += 32;
		return (p3 << BigInt(192)) + (p2 << BigInt(128)) + (p1 << BigInt(64)) + p0;
	}
	readI256() {
		const p0 = this.view.getBigUint64(this.offset, true);
		const p1 = this.view.getBigUint64(this.offset + 8, true);
		const p2 = this.view.getBigUint64(this.offset + 16, true);
		const p3 = this.view.getBigInt64(this.offset + 24, true);
		this.offset += 32;
		return (p3 << BigInt(192)) + (p2 << BigInt(128)) + (p1 << BigInt(64)) + p0;
	}
	readF32() {
		const value = this.view.getFloat32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readF64() {
		const value = this.view.getFloat64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readString() {
		const uint8Array = this.readUInt8Array();
		return new TextDecoder("utf-8").decode(uint8Array);
	}
};
var import_base64_js = __toESM(require_base64_js());
var ArrayBufferPrototypeTransfer = ArrayBuffer.prototype.transfer ?? function(newByteLength) {
	if (newByteLength === void 0) return this.slice();
	else if (newByteLength <= this.byteLength) return this.slice(0, newByteLength);
	else {
		const copy = new Uint8Array(newByteLength);
		copy.set(new Uint8Array(this));
		return copy.buffer;
	}
};
var ResizableBuffer = class {
	buffer;
	view;
	constructor(init) {
		this.buffer = typeof init === "number" ? new ArrayBuffer(init) : init;
		this.view = new DataView(this.buffer);
	}
	get capacity() {
		return this.buffer.byteLength;
	}
	grow(newSize) {
		if (newSize <= this.buffer.byteLength) return;
		this.buffer = ArrayBufferPrototypeTransfer.call(this.buffer, newSize);
		this.view = new DataView(this.buffer);
	}
};
var BinaryWriter = class {
	buffer;
	offset = 0;
	constructor(init) {
		this.buffer = typeof init === "number" ? new ResizableBuffer(init) : init;
	}
	clear() {
		this.offset = 0;
	}
	reset(buffer) {
		this.buffer = buffer;
		this.offset = 0;
	}
	expandBuffer(additionalCapacity) {
		const minCapacity = this.offset + additionalCapacity + 1;
		if (minCapacity <= this.buffer.capacity) return;
		let newCapacity = this.buffer.capacity * 2;
		if (newCapacity < minCapacity) newCapacity = minCapacity;
		this.buffer.grow(newCapacity);
	}
	toBase64() {
		return (0, import_base64_js.fromByteArray)(this.getBuffer());
	}
	getBuffer() {
		return new Uint8Array(this.buffer.buffer, 0, this.offset);
	}
	get view() {
		return this.buffer.view;
	}
	writeUInt8Array(value) {
		const length = value.length;
		this.expandBuffer(4 + length);
		this.writeU32(length);
		new Uint8Array(this.buffer.buffer, this.offset).set(value);
		this.offset += length;
	}
	writeBool(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value ? 1 : 0);
		this.offset += 1;
	}
	writeByte(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value);
		this.offset += 1;
	}
	writeBytes(value) {
		this.expandBuffer(value.length);
		new Uint8Array(this.buffer.buffer, this.offset, value.length).set(value);
		this.offset += value.length;
	}
	writeI8(value) {
		this.expandBuffer(1);
		this.view.setInt8(this.offset, value);
		this.offset += 1;
	}
	writeU8(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value);
		this.offset += 1;
	}
	writeI16(value) {
		this.expandBuffer(2);
		this.view.setInt16(this.offset, value, true);
		this.offset += 2;
	}
	writeU16(value) {
		this.expandBuffer(2);
		this.view.setUint16(this.offset, value, true);
		this.offset += 2;
	}
	writeI32(value) {
		this.expandBuffer(4);
		this.view.setInt32(this.offset, value, true);
		this.offset += 4;
	}
	writeU32(value) {
		this.expandBuffer(4);
		this.view.setUint32(this.offset, value, true);
		this.offset += 4;
	}
	writeI64(value) {
		this.expandBuffer(8);
		this.view.setBigInt64(this.offset, value, true);
		this.offset += 8;
	}
	writeU64(value) {
		this.expandBuffer(8);
		this.view.setBigUint64(this.offset, value, true);
		this.offset += 8;
	}
	writeU128(value) {
		this.expandBuffer(16);
		const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
		const upperPart = value >> BigInt(64);
		this.view.setBigUint64(this.offset, lowerPart, true);
		this.view.setBigUint64(this.offset + 8, upperPart, true);
		this.offset += 16;
	}
	writeI128(value) {
		this.expandBuffer(16);
		const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
		const upperPart = value >> BigInt(64);
		this.view.setBigInt64(this.offset, lowerPart, true);
		this.view.setBigInt64(this.offset + 8, upperPart, true);
		this.offset += 16;
	}
	writeU256(value) {
		this.expandBuffer(32);
		const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
		const p0 = value & low_64_mask;
		const p1 = value >> BigInt(64) & low_64_mask;
		const p2 = value >> BigInt(128) & low_64_mask;
		const p3 = value >> BigInt(192);
		this.view.setBigUint64(this.offset + 0, p0, true);
		this.view.setBigUint64(this.offset + 8, p1, true);
		this.view.setBigUint64(this.offset + 16, p2, true);
		this.view.setBigUint64(this.offset + 24, p3, true);
		this.offset += 32;
	}
	writeI256(value) {
		this.expandBuffer(32);
		const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
		const p0 = value & low_64_mask;
		const p1 = value >> BigInt(64) & low_64_mask;
		const p2 = value >> BigInt(128) & low_64_mask;
		const p3 = value >> BigInt(192);
		this.view.setBigUint64(this.offset + 0, p0, true);
		this.view.setBigUint64(this.offset + 8, p1, true);
		this.view.setBigUint64(this.offset + 16, p2, true);
		this.view.setBigInt64(this.offset + 24, p3, true);
		this.offset += 32;
	}
	writeF32(value) {
		this.expandBuffer(4);
		this.view.setFloat32(this.offset, value, true);
		this.offset += 4;
	}
	writeF64(value) {
		this.expandBuffer(8);
		this.view.setFloat64(this.offset, value, true);
		this.offset += 8;
	}
	writeString(value) {
		const encodedString = new TextEncoder().encode(value);
		this.writeUInt8Array(encodedString);
	}
};
function uint8ArrayToHexString(array) {
	return Array.prototype.map.call(array.reverse(), (x) => ("00" + x.toString(16)).slice(-2)).join("");
}
function uint8ArrayToU128(array) {
	if (array.length != 16) throw new Error(`Uint8Array is not 16 bytes long: ${array}`);
	return new BinaryReader(array).readU128();
}
function uint8ArrayToU256(array) {
	if (array.length != 32) throw new Error(`Uint8Array is not 32 bytes long: [${array}]`);
	return new BinaryReader(array).readU256();
}
function hexStringToUint8Array(str) {
	if (str.startsWith("0x")) str = str.slice(2);
	const matches = str.match(/.{1,2}/g) || [];
	return Uint8Array.from(matches.map((byte) => parseInt(byte, 16))).reverse();
}
function hexStringToU128(str) {
	return uint8ArrayToU128(hexStringToUint8Array(str));
}
function hexStringToU256(str) {
	return uint8ArrayToU256(hexStringToUint8Array(str));
}
function u128ToUint8Array(data) {
	const writer = new BinaryWriter(16);
	writer.writeU128(data);
	return writer.getBuffer();
}
function u128ToHexString(data) {
	return uint8ArrayToHexString(u128ToUint8Array(data));
}
function u256ToUint8Array(data) {
	const writer = new BinaryWriter(32);
	writer.writeU256(data);
	return writer.getBuffer();
}
function u256ToHexString(data) {
	return uint8ArrayToHexString(u256ToUint8Array(data));
}
function toPascalCase(s) {
	const str = toCamelCase(s);
	return str.charAt(0).toUpperCase() + str.slice(1);
}
function toCamelCase(s) {
	const str = s.replace(/[-_]+/g, "_").replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
	return str.charAt(0).toLowerCase() + str.slice(1);
}
function bsatnBaseSize(typespace, ty) {
	const assumedArrayLength = 4;
	while (ty.tag === "Ref") ty = typespace.types[ty.value];
	if (ty.tag === "Product") {
		let sum = 0;
		for (const { algebraicType: elem } of ty.value.elements) sum += bsatnBaseSize(typespace, elem);
		return sum;
	} else if (ty.tag === "Sum") {
		let min = Infinity;
		for (const { algebraicType: vari } of ty.value.variants) {
			const vSize = bsatnBaseSize(typespace, vari);
			if (vSize < min) min = vSize;
		}
		if (min === Infinity) min = 0;
		return 4 + min;
	} else if (ty.tag == "Array") return 4 + assumedArrayLength * bsatnBaseSize(typespace, ty.value);
	return {
		String: 4 + assumedArrayLength,
		Sum: 1,
		Bool: 1,
		I8: 1,
		U8: 1,
		I16: 2,
		U16: 2,
		I32: 4,
		U32: 4,
		F32: 4,
		I64: 8,
		U64: 8,
		F64: 8,
		I128: 16,
		U128: 16,
		I256: 32,
		U256: 32
	}[ty.tag];
}
var hasOwn = Object.hasOwn;
var ConnectionId = class _ConnectionId {
	__connection_id__;
	/**
	* Creates a new `ConnectionId`.
	*/
	constructor(data) {
		this.__connection_id__ = data;
	}
	/**
	* Get the algebraic type representation of the {@link ConnectionId} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__connection_id__",
			algebraicType: AlgebraicType.U128
		}] });
	}
	isZero() {
		return this.__connection_id__ === BigInt(0);
	}
	static nullIfZero(addr) {
		if (addr.isZero()) return null;
		else return addr;
	}
	static random() {
		function randomU8() {
			return Math.floor(Math.random() * 255);
		}
		let result = BigInt(0);
		for (let i = 0; i < 16; i++) result = result << BigInt(8) | BigInt(randomU8());
		return new _ConnectionId(result);
	}
	/**
	* Compare two connection IDs for equality.
	*/
	isEqual(other) {
		return this.__connection_id__ == other.__connection_id__;
	}
	/**
	* Check if two connection IDs are equal.
	*/
	equals(other) {
		return this.isEqual(other);
	}
	/**
	* Print the connection ID as a hexadecimal string.
	*/
	toHexString() {
		return u128ToHexString(this.__connection_id__);
	}
	/**
	* Convert the connection ID to a Uint8Array.
	*/
	toUint8Array() {
		return u128ToUint8Array(this.__connection_id__);
	}
	/**
	* Parse a connection ID from a hexadecimal string.
	*/
	static fromString(str) {
		return new _ConnectionId(hexStringToU128(str));
	}
	static fromStringOrNull(str) {
		const addr = _ConnectionId.fromString(str);
		if (addr.isZero()) return null;
		else return addr;
	}
};
var Identity = class _Identity {
	__identity__;
	/**
	* Creates a new `Identity`.
	*
	* `data` can be a hexadecimal string or a `bigint`.
	*/
	constructor(data) {
		this.__identity__ = typeof data === "string" ? hexStringToU256(data) : data;
	}
	/**
	* Get the algebraic type representation of the {@link Identity} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__identity__",
			algebraicType: AlgebraicType.U256
		}] });
	}
	/**
	* Check if two identities are equal.
	*/
	isEqual(other) {
		return this.toHexString() === other.toHexString();
	}
	/**
	* Check if two identities are equal.
	*/
	equals(other) {
		return this.isEqual(other);
	}
	/**
	* Print the identity as a hexadecimal string.
	*/
	toHexString() {
		return u256ToHexString(this.__identity__);
	}
	/**
	* Convert the address to a Uint8Array.
	*/
	toUint8Array() {
		return u256ToUint8Array(this.__identity__);
	}
	/**
	* Parse an Identity from a hexadecimal string.
	*/
	static fromString(str) {
		return new _Identity(str);
	}
	/**
	* Zero identity (0x0000000000000000000000000000000000000000000000000000000000000000)
	*/
	static zero() {
		return new _Identity(0n);
	}
	toString() {
		return this.toHexString();
	}
};
var SERIALIZERS = /* @__PURE__ */ new Map();
var DESERIALIZERS = /* @__PURE__ */ new Map();
var AlgebraicType = {
	Ref: (value) => ({
		tag: "Ref",
		value
	}),
	Sum: (value) => ({
		tag: "Sum",
		value
	}),
	Product: (value) => ({
		tag: "Product",
		value
	}),
	Array: (value) => ({
		tag: "Array",
		value
	}),
	String: { tag: "String" },
	Bool: { tag: "Bool" },
	I8: { tag: "I8" },
	U8: { tag: "U8" },
	I16: { tag: "I16" },
	U16: { tag: "U16" },
	I32: { tag: "I32" },
	U32: { tag: "U32" },
	I64: { tag: "I64" },
	U64: { tag: "U64" },
	I128: { tag: "I128" },
	U128: { tag: "U128" },
	I256: { tag: "I256" },
	U256: { tag: "U256" },
	F32: { tag: "F32" },
	F64: { tag: "F64" },
	makeSerializer(ty, typespace) {
		if (ty.tag === "Ref") {
			if (!typespace) throw new Error("cannot serialize refs without a typespace");
			while (ty.tag === "Ref") ty = typespace.types[ty.value];
		}
		switch (ty.tag) {
			case "Product": return ProductType.makeSerializer(ty.value, typespace);
			case "Sum": return SumType.makeSerializer(ty.value, typespace);
			case "Array": if (ty.value.tag === "U8") return serializeUint8Array;
			else {
				const serialize = AlgebraicType.makeSerializer(ty.value, typespace);
				return (writer, value) => {
					writer.writeU32(value.length);
					for (const elem of value) serialize(writer, elem);
				};
			}
			default: return primitiveSerializers[ty.tag];
		}
	},
	serializeValue(writer, ty, value, typespace) {
		AlgebraicType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		if (ty.tag === "Ref") {
			if (!typespace) throw new Error("cannot deserialize refs without a typespace");
			while (ty.tag === "Ref") ty = typespace.types[ty.value];
		}
		switch (ty.tag) {
			case "Product": return ProductType.makeDeserializer(ty.value, typespace);
			case "Sum": return SumType.makeDeserializer(ty.value, typespace);
			case "Array": if (ty.value.tag === "U8") return deserializeUint8Array;
			else {
				const deserialize = AlgebraicType.makeDeserializer(ty.value, typespace);
				return (reader) => {
					const length = reader.readU32();
					const result = Array(length);
					for (let i = 0; i < length; i++) result[i] = deserialize(reader);
					return result;
				};
			}
			default: return primitiveDeserializers[ty.tag];
		}
	},
	deserializeValue(reader, ty, typespace) {
		return AlgebraicType.makeDeserializer(ty, typespace)(reader);
	},
	intoMapKey: function(ty, value) {
		switch (ty.tag) {
			case "U8":
			case "U16":
			case "U32":
			case "U64":
			case "U128":
			case "U256":
			case "I8":
			case "I16":
			case "I32":
			case "I64":
			case "I128":
			case "I256":
			case "F32":
			case "F64":
			case "String":
			case "Bool": return value;
			case "Product": return ProductType.intoMapKey(ty.value, value);
			default: {
				const writer = new BinaryWriter(10);
				AlgebraicType.serializeValue(writer, ty, value);
				return writer.toBase64();
			}
		}
	}
};
function bindCall(f) {
	return Function.prototype.call.bind(f);
}
var primitiveSerializers = {
	Bool: bindCall(BinaryWriter.prototype.writeBool),
	I8: bindCall(BinaryWriter.prototype.writeI8),
	U8: bindCall(BinaryWriter.prototype.writeU8),
	I16: bindCall(BinaryWriter.prototype.writeI16),
	U16: bindCall(BinaryWriter.prototype.writeU16),
	I32: bindCall(BinaryWriter.prototype.writeI32),
	U32: bindCall(BinaryWriter.prototype.writeU32),
	I64: bindCall(BinaryWriter.prototype.writeI64),
	U64: bindCall(BinaryWriter.prototype.writeU64),
	I128: bindCall(BinaryWriter.prototype.writeI128),
	U128: bindCall(BinaryWriter.prototype.writeU128),
	I256: bindCall(BinaryWriter.prototype.writeI256),
	U256: bindCall(BinaryWriter.prototype.writeU256),
	F32: bindCall(BinaryWriter.prototype.writeF32),
	F64: bindCall(BinaryWriter.prototype.writeF64),
	String: bindCall(BinaryWriter.prototype.writeString)
};
Object.freeze(primitiveSerializers);
var serializeUint8Array = bindCall(BinaryWriter.prototype.writeUInt8Array);
var primitiveDeserializers = {
	Bool: bindCall(BinaryReader.prototype.readBool),
	I8: bindCall(BinaryReader.prototype.readI8),
	U8: bindCall(BinaryReader.prototype.readU8),
	I16: bindCall(BinaryReader.prototype.readI16),
	U16: bindCall(BinaryReader.prototype.readU16),
	I32: bindCall(BinaryReader.prototype.readI32),
	U32: bindCall(BinaryReader.prototype.readU32),
	I64: bindCall(BinaryReader.prototype.readI64),
	U64: bindCall(BinaryReader.prototype.readU64),
	I128: bindCall(BinaryReader.prototype.readI128),
	U128: bindCall(BinaryReader.prototype.readU128),
	I256: bindCall(BinaryReader.prototype.readI256),
	U256: bindCall(BinaryReader.prototype.readU256),
	F32: bindCall(BinaryReader.prototype.readF32),
	F64: bindCall(BinaryReader.prototype.readF64),
	String: bindCall(BinaryReader.prototype.readString)
};
Object.freeze(primitiveDeserializers);
var deserializeUint8Array = bindCall(BinaryReader.prototype.readUInt8Array);
var primitiveSizes = {
	Bool: 1,
	I8: 1,
	U8: 1,
	I16: 2,
	U16: 2,
	I32: 4,
	U32: 4,
	I64: 8,
	U64: 8,
	I128: 16,
	U128: 16,
	I256: 32,
	U256: 32,
	F32: 4,
	F64: 8
};
var fixedSizePrimitives = new Set(Object.keys(primitiveSizes));
var isFixedSizeProduct = (ty) => ty.elements.every(({ algebraicType }) => fixedSizePrimitives.has(algebraicType.tag));
var productSize = (ty) => ty.elements.reduce((acc, { algebraicType }) => acc + primitiveSizes[algebraicType.tag], 0);
var primitiveJSName = {
	Bool: "Uint8",
	I8: "Int8",
	U8: "Uint8",
	I16: "Int16",
	U16: "Uint16",
	I32: "Int32",
	U32: "Uint32",
	I64: "BigInt64",
	U64: "BigUint64",
	F32: "Float32",
	F64: "Float64"
};
var specialProductDeserializers = {
	__time_duration_micros__: (reader) => new TimeDuration(reader.readI64()),
	__timestamp_micros_since_unix_epoch__: (reader) => new Timestamp(reader.readI64()),
	__identity__: (reader) => new Identity(reader.readU256()),
	__connection_id__: (reader) => new ConnectionId(reader.readU128()),
	__uuid__: (reader) => new Uuid(reader.readU128())
};
Object.freeze(specialProductDeserializers);
var unitDeserializer = () => ({});
var getElementInitializer = (element) => {
	let init;
	switch (element.algebraicType.tag) {
		case "String":
			init = "''";
			break;
		case "Bool":
			init = "false";
			break;
		case "I8":
		case "U8":
		case "I16":
		case "U16":
		case "I32":
		case "U32":
			init = "0";
			break;
		case "I64":
		case "U64":
		case "I128":
		case "U128":
		case "I256":
		case "U256":
			init = "0n";
			break;
		case "F32":
		case "F64":
			init = "0.0";
			break;
		default: init = "undefined";
	}
	return `${element.name}: ${init}`;
};
var ProductType = {
	makeSerializer(ty, typespace) {
		let serializer = SERIALIZERS.get(ty);
		if (serializer != null) return serializer;
		if (isFixedSizeProduct(ty)) {
			const body2 = `"use strict";
writer.expandBuffer(${productSize(ty)});
const view = writer.view;
${ty.elements.map(({ name, algebraicType: { tag } }) => tag in primitiveJSName ? `view.set${primitiveJSName[tag]}(writer.offset, value.${name}, ${primitiveSizes[tag] > 1 ? "true" : ""});
writer.offset += ${primitiveSizes[tag]};` : `writer.write${tag}(value.${name});`).join("\n")}`;
			serializer = Function("writer", "value", body2);
			SERIALIZERS.set(ty, serializer);
			return serializer;
		}
		const serializers = {};
		const body = "\"use strict\";\n" + ty.elements.map((element) => `this.${element.name}(writer, value.${element.name});`).join("\n");
		serializer = Function("writer", "value", body).bind(serializers);
		SERIALIZERS.set(ty, serializer);
		for (const { name, algebraicType } of ty.elements) serializers[name] = AlgebraicType.makeSerializer(algebraicType, typespace);
		Object.freeze(serializers);
		return serializer;
	},
	serializeValue(writer, ty, value, typespace) {
		ProductType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		switch (ty.elements.length) {
			case 0: return unitDeserializer;
			case 1: {
				const fieldName = ty.elements[0].name;
				if (hasOwn(specialProductDeserializers, fieldName)) return specialProductDeserializers[fieldName];
			}
		}
		let deserializer = DESERIALIZERS.get(ty);
		if (deserializer != null) return deserializer;
		if (isFixedSizeProduct(ty)) {
			const body = `"use strict";
const result = { ${ty.elements.map(getElementInitializer).join(", ")} };
const view = reader.view;
${ty.elements.map(({ name, algebraicType: { tag } }) => tag in primitiveJSName ? tag === "Bool" ? `result.${name} = view.getUint8(reader.offset) !== 0;
reader.offset += 1;` : `result.${name} = view.get${primitiveJSName[tag]}(reader.offset, ${primitiveSizes[tag] > 1 ? "true" : ""});
reader.offset += ${primitiveSizes[tag]};` : `result.${name} = reader.read${tag}();`).join("\n")}
return result;`;
			deserializer = Function("reader", body);
			DESERIALIZERS.set(ty, deserializer);
			return deserializer;
		}
		const deserializers = {};
		deserializer = Function("reader", `"use strict";
const result = { ${ty.elements.map(getElementInitializer).join(", ")} };
${ty.elements.map(({ name }) => `result.${name} = this.${name}(reader);`).join("\n")}
return result;`).bind(deserializers);
		DESERIALIZERS.set(ty, deserializer);
		for (const { name, algebraicType } of ty.elements) deserializers[name] = AlgebraicType.makeDeserializer(algebraicType, typespace);
		Object.freeze(deserializers);
		return deserializer;
	},
	deserializeValue(reader, ty, typespace) {
		return ProductType.makeDeserializer(ty, typespace)(reader);
	},
	intoMapKey(ty, value) {
		if (ty.elements.length === 1) {
			const fieldName = ty.elements[0].name;
			if (hasOwn(specialProductDeserializers, fieldName)) return value[fieldName];
		}
		const writer = new BinaryWriter(10);
		AlgebraicType.serializeValue(writer, AlgebraicType.Product(ty), value);
		return writer.toBase64();
	}
};
var SumType = {
	makeSerializer(ty, typespace) {
		if (ty.variants.length == 2 && ty.variants[0].name === "some" && ty.variants[1].name === "none") {
			const serialize = AlgebraicType.makeSerializer(ty.variants[0].algebraicType, typespace);
			return (writer, value) => {
				if (value !== null && value !== void 0) {
					writer.writeByte(0);
					serialize(writer, value);
				} else writer.writeByte(1);
			};
		} else if (ty.variants.length == 2 && ty.variants[0].name === "ok" && ty.variants[1].name === "err") {
			const serializeOk = AlgebraicType.makeSerializer(ty.variants[0].algebraicType, typespace);
			const serializeErr = AlgebraicType.makeSerializer(ty.variants[0].algebraicType, typespace);
			return (writer, value) => {
				if ("ok" in value) {
					writer.writeU8(0);
					serializeOk(writer, value.ok);
				} else if ("err" in value) {
					writer.writeU8(1);
					serializeErr(writer, value.err);
				} else throw new TypeError("could not serialize result: object had neither a `ok` nor an `err` field");
			};
		} else {
			let serializer = SERIALIZERS.get(ty);
			if (serializer != null) return serializer;
			const serializers = {};
			const body = `switch (value.tag) {
${ty.variants.map(({ name }, i) => `  case ${JSON.stringify(name)}:
    writer.writeByte(${i});
    return this.${name}(writer, value.value);`).join("\n")}
  default:
    throw new TypeError(
      \`Could not serialize sum type; unknown tag \${value.tag}\`
    )
}
`;
			serializer = Function("writer", "value", body).bind(serializers);
			SERIALIZERS.set(ty, serializer);
			for (const { name, algebraicType } of ty.variants) serializers[name] = AlgebraicType.makeSerializer(algebraicType, typespace);
			Object.freeze(serializers);
			return serializer;
		}
	},
	serializeValue(writer, ty, value, typespace) {
		SumType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		if (ty.variants.length == 2 && ty.variants[0].name === "some" && ty.variants[1].name === "none") {
			const deserialize = AlgebraicType.makeDeserializer(ty.variants[0].algebraicType, typespace);
			return (reader) => {
				const tag = reader.readU8();
				if (tag === 0) return deserialize(reader);
				else if (tag === 1) return;
				else throw `Can't deserialize an option type, couldn't find ${tag} tag`;
			};
		} else if (ty.variants.length == 2 && ty.variants[0].name === "ok" && ty.variants[1].name === "err") {
			const deserializeOk = AlgebraicType.makeDeserializer(ty.variants[0].algebraicType, typespace);
			const deserializeErr = AlgebraicType.makeDeserializer(ty.variants[1].algebraicType, typespace);
			return (reader) => {
				const tag = reader.readByte();
				if (tag === 0) return { ok: deserializeOk(reader) };
				else if (tag === 1) return { err: deserializeErr(reader) };
				else throw `Can't deserialize a result type, couldn't find ${tag} tag`;
			};
		} else {
			let deserializer = DESERIALIZERS.get(ty);
			if (deserializer != null) return deserializer;
			const deserializers = {};
			deserializer = Function("reader", `switch (reader.readU8()) {
${ty.variants.map(({ name }, i) => `case ${i}: return { tag: ${JSON.stringify(name)}, value: this.${name}(reader) };`).join("\n")} }`).bind(deserializers);
			DESERIALIZERS.set(ty, deserializer);
			for (const { name, algebraicType } of ty.variants) deserializers[name] = AlgebraicType.makeDeserializer(algebraicType, typespace);
			Object.freeze(deserializers);
			return deserializer;
		}
	},
	deserializeValue(reader, ty, typespace) {
		return SumType.makeDeserializer(ty, typespace)(reader);
	}
};
var Option = { getAlgebraicType(innerType) {
	return AlgebraicType.Sum({ variants: [{
		name: "some",
		algebraicType: innerType
	}, {
		name: "none",
		algebraicType: AlgebraicType.Product({ elements: [] })
	}] });
} };
var Result = { getAlgebraicType(okType, errType) {
	return AlgebraicType.Sum({ variants: [{
		name: "ok",
		algebraicType: okType
	}, {
		name: "err",
		algebraicType: errType
	}] });
} };
var ScheduleAt = {
	interval(value) {
		return Interval(value);
	},
	time(value) {
		return Time(value);
	},
	getAlgebraicType() {
		return AlgebraicType.Sum({ variants: [{
			name: "Interval",
			algebraicType: TimeDuration.getAlgebraicType()
		}, {
			name: "Time",
			algebraicType: Timestamp.getAlgebraicType()
		}] });
	},
	isScheduleAt(algebraicType) {
		if (algebraicType.tag !== "Sum") return false;
		const variants = algebraicType.value.variants;
		if (variants.length !== 2) return false;
		const intervalVariant = variants.find((v) => v.name === "Interval");
		const timeVariant = variants.find((v) => v.name === "Time");
		if (!intervalVariant || !timeVariant) return false;
		return TimeDuration.isTimeDuration(intervalVariant.algebraicType) && Timestamp.isTimestamp(timeVariant.algebraicType);
	}
};
var Interval = (micros) => ({
	tag: "Interval",
	value: new TimeDuration(micros)
});
var Time = (microsSinceUnixEpoch) => ({
	tag: "Time",
	value: new Timestamp(microsSinceUnixEpoch)
});
var schedule_at_default = ScheduleAt;
function set(x, t2) {
	return {
		...x,
		...t2
	};
}
var TypeBuilder = class {
	/**
	* The TypeScript phantom type. This is not stored at runtime,
	* but is visible to the compiler
	*/
	type;
	/**
	* The SpacetimeDB algebraic type (run‑time value). In addition to storing
	* the runtime representation of the `AlgebraicType`, it also captures
	* the TypeScript type information of the `AlgebraicType`. That is to say
	* the value is not merely an `AlgebraicType`, but is constructed to be
	* the corresponding concrete `AlgebraicType` for the TypeScript type `Type`.
	*
	* e.g. `string` corresponds to `AlgebraicType.String`
	*/
	algebraicType;
	constructor(algebraicType) {
		this.algebraicType = algebraicType;
	}
	optional() {
		return new OptionBuilder(this);
	}
	serialize(writer, value) {
		(this.serialize = AlgebraicType.makeSerializer(this.algebraicType))(writer, value);
	}
	deserialize(reader) {
		return (this.deserialize = AlgebraicType.makeDeserializer(this.algebraicType))(reader);
	}
};
var U8Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U8);
	}
	index(algorithm = "btree") {
		return new U8ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U8ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U8ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U16Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U16);
	}
	index(algorithm = "btree") {
		return new U16ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U16ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U16ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U32);
	}
	index(algorithm = "btree") {
		return new U32ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U64);
	}
	index(algorithm = "btree") {
		return new U64ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U128Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U128);
	}
	index(algorithm = "btree") {
		return new U128ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U128ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U128ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U256Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U256);
	}
	index(algorithm = "btree") {
		return new U256ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U256ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U256ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I8Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I8);
	}
	index(algorithm = "btree") {
		return new I8ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I8ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I8ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I16Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I16);
	}
	index(algorithm = "btree") {
		return new I16ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I16ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I16ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I32);
	}
	index(algorithm = "btree") {
		return new I32ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I64);
	}
	index(algorithm = "btree") {
		return new I64ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I128Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I128);
	}
	index(algorithm = "btree") {
		return new I128ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I128ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I128ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I256Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I256);
	}
	index(algorithm = "btree") {
		return new I256ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I256ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I256ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var F32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.F32);
	}
	default(value) {
		return new F32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new F32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var F64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.F64);
	}
	default(value) {
		return new F64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new F64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var BoolBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.Bool);
	}
	index(algorithm = "btree") {
		return new BoolColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new BoolColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new BoolColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new BoolColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new BoolColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var StringBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.String);
	}
	index(algorithm = "btree") {
		return new StringColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new StringColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new StringColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new StringColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new StringColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ArrayBuilder = class extends TypeBuilder {
	element;
	constructor(element) {
		super(AlgebraicType.Array(element.algebraicType));
		this.element = element;
	}
	default(value) {
		return new ArrayColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ArrayColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ByteArrayBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.Array(AlgebraicType.U8));
	}
	default(value) {
		return new ByteArrayColumnBuilder(set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ByteArrayColumnBuilder(set(defaultMetadata, { name }));
	}
};
var OptionBuilder = class extends TypeBuilder {
	value;
	constructor(value) {
		super(Option.getAlgebraicType(value.algebraicType));
		this.value = value;
	}
	default(value) {
		return new OptionColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new OptionColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ProductBuilder = class extends TypeBuilder {
	typeName;
	elements;
	constructor(elements, name) {
		function elementsArrayFromElementsObj(obj) {
			return Object.keys(obj).map((key) => ({
				name: key,
				get algebraicType() {
					return obj[key].algebraicType;
				}
			}));
		}
		super(AlgebraicType.Product({ elements: elementsArrayFromElementsObj(elements) }));
		this.typeName = name;
		this.elements = elements;
	}
	default(value) {
		return new ProductColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ProductColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ResultBuilder = class extends TypeBuilder {
	ok;
	err;
	constructor(ok, err) {
		super(Result.getAlgebraicType(ok.algebraicType, err.algebraicType));
		this.ok = ok;
		this.err = err;
	}
	default(value) {
		return new ResultColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
};
var UnitBuilder = class extends TypeBuilder {
	constructor() {
		super({
			tag: "Product",
			value: { elements: [] }
		});
	}
};
var RowBuilder = class extends TypeBuilder {
	row;
	typeName;
	constructor(row, name) {
		const mappedRow = Object.fromEntries(Object.entries(row).map(([colName, builder]) => [colName, builder instanceof ColumnBuilder ? builder : new ColumnBuilder(builder, {})]));
		const elements = Object.keys(mappedRow).map((name2) => ({
			name: name2,
			get algebraicType() {
				return mappedRow[name2].typeBuilder.algebraicType;
			}
		}));
		super(AlgebraicType.Product({ elements }));
		this.row = mappedRow;
		this.typeName = name;
	}
};
var SumBuilderImpl = class extends TypeBuilder {
	variants;
	typeName;
	constructor(variants, name) {
		function variantsArrayFromVariantsObj(variants2) {
			return Object.keys(variants2).map((key) => ({
				name: key,
				get algebraicType() {
					return variants2[key].algebraicType;
				}
			}));
		}
		super(AlgebraicType.Sum({ variants: variantsArrayFromVariantsObj(variants) }));
		this.variants = variants;
		this.typeName = name;
		for (const key of Object.keys(variants)) {
			const desc = Object.getOwnPropertyDescriptor(variants, key);
			const isAccessor = !!desc && (typeof desc.get === "function" || typeof desc.set === "function");
			let isUnit2 = false;
			if (!isAccessor) isUnit2 = variants[key] instanceof UnitBuilder;
			if (isUnit2) {
				const constant = this.create(key);
				Object.defineProperty(this, key, {
					value: constant,
					writable: false,
					enumerable: true,
					configurable: false
				});
			} else {
				const fn = ((value) => this.create(key, value));
				Object.defineProperty(this, key, {
					value: fn,
					writable: false,
					enumerable: true,
					configurable: false
				});
			}
		}
	}
	create(tag, value) {
		return value === void 0 ? { tag } : {
			tag,
			value
		};
	}
	default(value) {
		return new SumColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new SumColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var SumBuilder = SumBuilderImpl;
var SimpleSumBuilderImpl = class extends SumBuilderImpl {
	index(algorithm = "btree") {
		return new SimpleSumColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	primaryKey() {
		return new SimpleSumColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
};
var ScheduleAtBuilder = class extends TypeBuilder {
	constructor() {
		super(schedule_at_default.getAlgebraicType());
	}
	default(value) {
		return new ScheduleAtColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ScheduleAtColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var IdentityBuilder = class extends TypeBuilder {
	constructor() {
		super(Identity.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ConnectionIdBuilder = class extends TypeBuilder {
	constructor() {
		super(ConnectionId.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var TimestampBuilder = class extends TypeBuilder {
	constructor() {
		super(Timestamp.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var TimeDurationBuilder = class extends TypeBuilder {
	constructor() {
		super(TimeDuration.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var UuidBuilder = class extends TypeBuilder {
	constructor() {
		super(Uuid.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new UuidColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new UuidColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new UuidColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var defaultMetadata = {};
var ColumnBuilder = class {
	typeBuilder;
	columnMetadata;
	constructor(typeBuilder, metadata) {
		this.typeBuilder = typeBuilder;
		this.columnMetadata = metadata;
	}
	serialize(writer, value) {
		this.typeBuilder.serialize(writer, value);
	}
	deserialize(reader) {
		return this.typeBuilder.deserialize(reader);
	}
};
var U8ColumnBuilder = class _U8ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U16ColumnBuilder = class _U16ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U32ColumnBuilder = class _U32ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U64ColumnBuilder = class _U64ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U128ColumnBuilder = class _U128ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U256ColumnBuilder = class _U256ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I8ColumnBuilder = class _I8ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I16ColumnBuilder = class _I16ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I32ColumnBuilder = class _I32ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I64ColumnBuilder = class _I64ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I128ColumnBuilder = class _I128ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I256ColumnBuilder = class _I256ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var F32ColumnBuilder = class _F32ColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _F32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _F32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var F64ColumnBuilder = class _F64ColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _F64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _F64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var BoolColumnBuilder = class _BoolColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var StringColumnBuilder = class _StringColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ArrayColumnBuilder = class _ArrayColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ArrayColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ArrayColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ByteArrayColumnBuilder = class _ByteArrayColumnBuilder extends ColumnBuilder {
	constructor(metadata) {
		super(new TypeBuilder(AlgebraicType.Array(AlgebraicType.U8)), metadata);
	}
	default(value) {
		return new _ByteArrayColumnBuilder(set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ByteArrayColumnBuilder(set(this.columnMetadata, { name }));
	}
};
var OptionColumnBuilder = class _OptionColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _OptionColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _OptionColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ResultColumnBuilder = class _ResultColumnBuilder extends ColumnBuilder {
	constructor(typeBuilder, metadata) {
		super(typeBuilder, metadata);
	}
	default(value) {
		return new _ResultColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
};
var ProductColumnBuilder = class _ProductColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ProductColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ProductColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var SumColumnBuilder = class _SumColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _SumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _SumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var SimpleSumColumnBuilder = class _SimpleSumColumnBuilder extends SumColumnBuilder {
	index(algorithm = "btree") {
		return new _SimpleSumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	primaryKey() {
		return new _SimpleSumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
};
var ScheduleAtColumnBuilder = class _ScheduleAtColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ScheduleAtColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ScheduleAtColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var IdentityColumnBuilder = class _IdentityColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ConnectionIdColumnBuilder = class _ConnectionIdColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var TimestampColumnBuilder = class _TimestampColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var TimeDurationColumnBuilder = class _TimeDurationColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var UuidColumnBuilder = class _UuidColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var RefBuilder = class extends TypeBuilder {
	ref;
	/** The phantom type of the pointee of this ref. */
	__spacetimeType;
	constructor(ref) {
		super(AlgebraicType.Ref(ref));
		this.ref = ref;
	}
};
var enumImpl = ((nameOrObj, maybeObj) => {
	let obj = nameOrObj;
	let name = void 0;
	if (typeof nameOrObj === "string") {
		if (!maybeObj) throw new TypeError("When providing a name, you must also provide the variants object or array.");
		obj = maybeObj;
		name = nameOrObj;
	}
	if (Array.isArray(obj)) {
		const simpleVariantsObj = {};
		for (const variant of obj) simpleVariantsObj[variant] = new UnitBuilder();
		return new SimpleSumBuilderImpl(simpleVariantsObj, name);
	}
	return new SumBuilder(obj, name);
});
var t = {
	bool: () => new BoolBuilder(),
	string: () => new StringBuilder(),
	number: () => new F64Builder(),
	i8: () => new I8Builder(),
	u8: () => new U8Builder(),
	i16: () => new I16Builder(),
	u16: () => new U16Builder(),
	i32: () => new I32Builder(),
	u32: () => new U32Builder(),
	i64: () => new I64Builder(),
	u64: () => new U64Builder(),
	i128: () => new I128Builder(),
	u128: () => new U128Builder(),
	i256: () => new I256Builder(),
	u256: () => new U256Builder(),
	f32: () => new F32Builder(),
	f64: () => new F64Builder(),
	object: ((nameOrObj, maybeObj) => {
		if (typeof nameOrObj === "string") {
			if (!maybeObj) throw new TypeError("When providing a name, you must also provide the object.");
			return new ProductBuilder(maybeObj, nameOrObj);
		}
		return new ProductBuilder(nameOrObj, void 0);
	}),
	row: ((nameOrObj, maybeObj) => {
		const [obj, name] = typeof nameOrObj === "string" ? [maybeObj, nameOrObj] : [nameOrObj, void 0];
		return new RowBuilder(obj, name);
	}),
	array(e) {
		return new ArrayBuilder(e);
	},
	enum: enumImpl,
	unit() {
		return new UnitBuilder();
	},
	lazy(thunk) {
		let cached = null;
		const get = () => cached ??= thunk();
		return new Proxy({}, {
			get(_t, prop, recv) {
				const target = get();
				const val = Reflect.get(target, prop, recv);
				return typeof val === "function" ? val.bind(target) : val;
			},
			set(_t, prop, value, recv) {
				return Reflect.set(get(), prop, value, recv);
			},
			has(_t, prop) {
				return prop in get();
			},
			ownKeys() {
				return Reflect.ownKeys(get());
			},
			getOwnPropertyDescriptor(_t, prop) {
				return Object.getOwnPropertyDescriptor(get(), prop);
			},
			getPrototypeOf() {
				return Object.getPrototypeOf(get());
			}
		});
	},
	scheduleAt: () => {
		return new ScheduleAtBuilder();
	},
	option(value) {
		return new OptionBuilder(value);
	},
	result(ok, err) {
		return new ResultBuilder(ok, err);
	},
	identity: () => {
		return new IdentityBuilder();
	},
	connectionId: () => {
		return new ConnectionIdBuilder();
	},
	timestamp: () => {
		return new TimestampBuilder();
	},
	timeDuration: () => {
		return new TimeDurationBuilder();
	},
	uuid: () => {
		return new UuidBuilder();
	},
	byteArray: () => {
		return new ByteArrayBuilder();
	}
};
var AlgebraicType2 = t.enum("AlgebraicType", {
	Ref: t.u32(),
	get Sum() {
		return SumType2;
	},
	get Product() {
		return ProductType2;
	},
	get Array() {
		return AlgebraicType2;
	},
	String: t.unit(),
	Bool: t.unit(),
	I8: t.unit(),
	U8: t.unit(),
	I16: t.unit(),
	U16: t.unit(),
	I32: t.unit(),
	U32: t.unit(),
	I64: t.unit(),
	U64: t.unit(),
	I128: t.unit(),
	U128: t.unit(),
	I256: t.unit(),
	U256: t.unit(),
	F32: t.unit(),
	F64: t.unit()
});
var CaseConversionPolicy = t.enum("CaseConversionPolicy", {
	None: t.unit(),
	SnakeCase: t.unit()
});
var ExplicitNameEntry = t.enum("ExplicitNameEntry", {
	get Table() {
		return NameMapping;
	},
	get Function() {
		return NameMapping;
	},
	get Index() {
		return NameMapping;
	}
});
var ExplicitNames = t.object("ExplicitNames", { get entries() {
	return t.array(ExplicitNameEntry);
} });
var FunctionVisibility = t.enum("FunctionVisibility", {
	Private: t.unit(),
	ClientCallable: t.unit()
});
var HttpHeaderPair = t.object("HttpHeaderPair", {
	name: t.string(),
	value: t.byteArray()
});
var HttpHeaders = t.object("HttpHeaders", { get entries() {
	return t.array(HttpHeaderPair);
} });
var HttpMethod = t.enum("HttpMethod", {
	Get: t.unit(),
	Head: t.unit(),
	Post: t.unit(),
	Put: t.unit(),
	Delete: t.unit(),
	Connect: t.unit(),
	Options: t.unit(),
	Trace: t.unit(),
	Patch: t.unit(),
	Extension: t.string()
});
var HttpRequest = t.object("HttpRequest", {
	get method() {
		return HttpMethod;
	},
	get headers() {
		return HttpHeaders;
	},
	timeout: t.option(t.timeDuration()),
	uri: t.string(),
	get version() {
		return HttpVersion;
	}
});
var HttpResponse = t.object("HttpResponse", {
	get headers() {
		return HttpHeaders;
	},
	get version() {
		return HttpVersion;
	},
	code: t.u16()
});
var HttpVersion = t.enum("HttpVersion", {
	Http09: t.unit(),
	Http10: t.unit(),
	Http11: t.unit(),
	Http2: t.unit(),
	Http3: t.unit()
});
var IndexType = t.enum("IndexType", {
	BTree: t.unit(),
	Hash: t.unit()
});
var Lifecycle = t.enum("Lifecycle", {
	Init: t.unit(),
	OnConnect: t.unit(),
	OnDisconnect: t.unit()
});
var MethodOrAny = t.enum("MethodOrAny", {
	Any: t.unit(),
	get Method() {
		return HttpMethod;
	}
});
var MiscModuleExport = t.enum("MiscModuleExport", { get TypeAlias() {
	return TypeAlias;
} });
var NameMapping = t.object("NameMapping", {
	sourceName: t.string(),
	canonicalName: t.string()
});
var ProductType2 = t.object("ProductType", { get elements() {
	return t.array(ProductTypeElement);
} });
var ProductTypeElement = t.object("ProductTypeElement", {
	name: t.option(t.string()),
	get algebraicType() {
		return AlgebraicType2;
	}
});
var RawColumnDefV8 = t.object("RawColumnDefV8", {
	colName: t.string(),
	get colType() {
		return AlgebraicType2;
	}
});
var RawColumnDefaultValueV10 = t.object("RawColumnDefaultValueV10", {
	colId: t.u16(),
	value: t.byteArray()
});
var RawColumnDefaultValueV9 = t.object("RawColumnDefaultValueV9", {
	table: t.string(),
	colId: t.u16(),
	value: t.byteArray()
});
var RawConstraintDataV9 = t.enum("RawConstraintDataV9", { get Unique() {
	return RawUniqueConstraintDataV9;
} });
var RawConstraintDefV10 = t.object("RawConstraintDefV10", {
	sourceName: t.option(t.string()),
	get data() {
		return RawConstraintDataV9;
	}
});
var RawConstraintDefV8 = t.object("RawConstraintDefV8", {
	constraintName: t.string(),
	constraints: t.u8(),
	columns: t.array(t.u16())
});
var RawConstraintDefV9 = t.object("RawConstraintDefV9", {
	name: t.option(t.string()),
	get data() {
		return RawConstraintDataV9;
	}
});
var RawHttpHandlerDefV10 = t.object("RawHttpHandlerDefV10", { sourceName: t.string() });
var RawHttpRouteDefV10 = t.object("RawHttpRouteDefV10", {
	handlerFunction: t.string(),
	get method() {
		return MethodOrAny;
	},
	path: t.string()
});
var RawIndexAlgorithm = t.enum("RawIndexAlgorithm", {
	BTree: t.array(t.u16()),
	Hash: t.array(t.u16()),
	Direct: t.u16()
});
var RawIndexDefV10 = t.object("RawIndexDefV10", {
	sourceName: t.option(t.string()),
	accessorName: t.option(t.string()),
	get algorithm() {
		return RawIndexAlgorithm;
	}
});
var RawIndexDefV8 = t.object("RawIndexDefV8", {
	indexName: t.string(),
	isUnique: t.bool(),
	get indexType() {
		return IndexType;
	},
	columns: t.array(t.u16())
});
var RawIndexDefV9 = t.object("RawIndexDefV9", {
	name: t.option(t.string()),
	accessorName: t.option(t.string()),
	get algorithm() {
		return RawIndexAlgorithm;
	}
});
var RawLifeCycleReducerDefV10 = t.object("RawLifeCycleReducerDefV10", {
	get lifecycleSpec() {
		return Lifecycle;
	},
	functionName: t.string()
});
var RawMiscModuleExportV9 = t.enum("RawMiscModuleExportV9", {
	get ColumnDefaultValue() {
		return RawColumnDefaultValueV9;
	},
	get Procedure() {
		return RawProcedureDefV9;
	},
	get View() {
		return RawViewDefV9;
	}
});
var RawModuleDef = t.enum("RawModuleDef", {
	get V8BackCompat() {
		return RawModuleDefV8;
	},
	get V9() {
		return RawModuleDefV9;
	},
	get V10() {
		return RawModuleDefV10;
	}
});
var RawModuleDefV10 = t.object("RawModuleDefV10", { get sections() {
	return t.array(RawModuleDefV10Section);
} });
var RawModuleDefV10Section = t.enum("RawModuleDefV10Section", {
	get Typespace() {
		return Typespace;
	},
	get Types() {
		return t.array(RawTypeDefV10);
	},
	get Tables() {
		return t.array(RawTableDefV10);
	},
	get Reducers() {
		return t.array(RawReducerDefV10);
	},
	get Procedures() {
		return t.array(RawProcedureDefV10);
	},
	get Views() {
		return t.array(RawViewDefV10);
	},
	get Schedules() {
		return t.array(RawScheduleDefV10);
	},
	get LifeCycleReducers() {
		return t.array(RawLifeCycleReducerDefV10);
	},
	get RowLevelSecurity() {
		return t.array(RawRowLevelSecurityDefV9);
	},
	get CaseConversionPolicy() {
		return CaseConversionPolicy;
	},
	get ExplicitNames() {
		return ExplicitNames;
	},
	get HttpHandlers() {
		return t.array(RawHttpHandlerDefV10);
	},
	get HttpRoutes() {
		return t.array(RawHttpRouteDefV10);
	}
});
var RawModuleDefV8 = t.object("RawModuleDefV8", {
	get typespace() {
		return Typespace;
	},
	get tables() {
		return t.array(TableDesc);
	},
	get reducers() {
		return t.array(ReducerDef);
	},
	get miscExports() {
		return t.array(MiscModuleExport);
	}
});
var RawModuleDefV9 = t.object("RawModuleDefV9", {
	get typespace() {
		return Typespace;
	},
	get tables() {
		return t.array(RawTableDefV9);
	},
	get reducers() {
		return t.array(RawReducerDefV9);
	},
	get types() {
		return t.array(RawTypeDefV9);
	},
	get miscExports() {
		return t.array(RawMiscModuleExportV9);
	},
	get rowLevelSecurity() {
		return t.array(RawRowLevelSecurityDefV9);
	}
});
var RawProcedureDefV10 = t.object("RawProcedureDefV10", {
	sourceName: t.string(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	},
	get visibility() {
		return FunctionVisibility;
	}
});
var RawProcedureDefV9 = t.object("RawProcedureDefV9", {
	name: t.string(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var RawReducerDefV10 = t.object("RawReducerDefV10", {
	sourceName: t.string(),
	get params() {
		return ProductType2;
	},
	get visibility() {
		return FunctionVisibility;
	},
	get okReturnType() {
		return AlgebraicType2;
	},
	get errReturnType() {
		return AlgebraicType2;
	}
});
var RawReducerDefV9 = t.object("RawReducerDefV9", {
	name: t.string(),
	get params() {
		return ProductType2;
	},
	get lifecycle() {
		return t.option(Lifecycle);
	}
});
var RawRowLevelSecurityDefV9 = t.object("RawRowLevelSecurityDefV9", { sql: t.string() });
var RawScheduleDefV10 = t.object("RawScheduleDefV10", {
	sourceName: t.option(t.string()),
	tableName: t.string(),
	scheduleAtCol: t.u16(),
	functionName: t.string()
});
var RawScheduleDefV9 = t.object("RawScheduleDefV9", {
	name: t.option(t.string()),
	reducerName: t.string(),
	scheduledAtColumn: t.u16()
});
var RawScopedTypeNameV10 = t.object("RawScopedTypeNameV10", {
	scope: t.array(t.string()),
	sourceName: t.string()
});
var RawScopedTypeNameV9 = t.object("RawScopedTypeNameV9", {
	scope: t.array(t.string()),
	name: t.string()
});
var RawSequenceDefV10 = t.object("RawSequenceDefV10", {
	sourceName: t.option(t.string()),
	column: t.u16(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	increment: t.i128()
});
var RawSequenceDefV8 = t.object("RawSequenceDefV8", {
	sequenceName: t.string(),
	colPos: t.u16(),
	increment: t.i128(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	allocated: t.i128()
});
var RawSequenceDefV9 = t.object("RawSequenceDefV9", {
	name: t.option(t.string()),
	column: t.u16(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	increment: t.i128()
});
var RawTableDefV10 = t.object("RawTableDefV10", {
	sourceName: t.string(),
	productTypeRef: t.u32(),
	primaryKey: t.array(t.u16()),
	get indexes() {
		return t.array(RawIndexDefV10);
	},
	get constraints() {
		return t.array(RawConstraintDefV10);
	},
	get sequences() {
		return t.array(RawSequenceDefV10);
	},
	get tableType() {
		return TableType;
	},
	get tableAccess() {
		return TableAccess;
	},
	get defaultValues() {
		return t.array(RawColumnDefaultValueV10);
	},
	isEvent: t.bool()
});
var RawTableDefV8 = t.object("RawTableDefV8", {
	tableName: t.string(),
	get columns() {
		return t.array(RawColumnDefV8);
	},
	get indexes() {
		return t.array(RawIndexDefV8);
	},
	get constraints() {
		return t.array(RawConstraintDefV8);
	},
	get sequences() {
		return t.array(RawSequenceDefV8);
	},
	tableType: t.string(),
	tableAccess: t.string(),
	scheduled: t.option(t.string())
});
var RawTableDefV9 = t.object("RawTableDefV9", {
	name: t.string(),
	productTypeRef: t.u32(),
	primaryKey: t.array(t.u16()),
	get indexes() {
		return t.array(RawIndexDefV9);
	},
	get constraints() {
		return t.array(RawConstraintDefV9);
	},
	get sequences() {
		return t.array(RawSequenceDefV9);
	},
	get schedule() {
		return t.option(RawScheduleDefV9);
	},
	get tableType() {
		return TableType;
	},
	get tableAccess() {
		return TableAccess;
	}
});
var RawTypeDefV10 = t.object("RawTypeDefV10", {
	get sourceName() {
		return RawScopedTypeNameV10;
	},
	ty: t.u32(),
	customOrdering: t.bool()
});
var RawTypeDefV9 = t.object("RawTypeDefV9", {
	get name() {
		return RawScopedTypeNameV9;
	},
	ty: t.u32(),
	customOrdering: t.bool()
});
var RawUniqueConstraintDataV9 = t.object("RawUniqueConstraintDataV9", { columns: t.array(t.u16()) });
var RawViewDefV10 = t.object("RawViewDefV10", {
	sourceName: t.string(),
	index: t.u32(),
	isPublic: t.bool(),
	isAnonymous: t.bool(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var RawViewDefV9 = t.object("RawViewDefV9", {
	name: t.string(),
	index: t.u32(),
	isPublic: t.bool(),
	isAnonymous: t.bool(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var ReducerDef = t.object("ReducerDef", {
	name: t.string(),
	get args() {
		return t.array(ProductTypeElement);
	}
});
var SumType2 = t.object("SumType", { get variants() {
	return t.array(SumTypeVariant);
} });
var SumTypeVariant = t.object("SumTypeVariant", {
	name: t.option(t.string()),
	get algebraicType() {
		return AlgebraicType2;
	}
});
var TableAccess = t.enum("TableAccess", {
	Public: t.unit(),
	Private: t.unit()
});
var TableDesc = t.object("TableDesc", {
	get schema() {
		return RawTableDefV8;
	},
	data: t.u32()
});
var TableType = t.enum("TableType", {
	System: t.unit(),
	User: t.unit()
});
var TypeAlias = t.object("TypeAlias", {
	name: t.string(),
	ty: t.u32()
});
var Typespace = t.object("Typespace", { get types() {
	return t.array(AlgebraicType2);
} });
var ViewResultHeader = t.enum("ViewResultHeader", {
	RowData: t.unit(),
	RawSql: t.string()
});
function tableToSchema(accName, schema2, tableDef) {
	const getColName = (i) => schema2.rowType.algebraicType.value.elements[i].name;
	const resolvedIndexes = tableDef.indexes.map((idx) => {
		const accessorName = idx.accessorName;
		if (typeof accessorName !== "string" || accessorName.length === 0) throw new TypeError(`Index '${idx.sourceName ?? "<unknown>"}' on table '${tableDef.sourceName}' is missing accessor name`);
		const columnIds = idx.algorithm.tag === "Direct" ? [idx.algorithm.value] : idx.algorithm.value;
		return {
			name: accessorName,
			unique: tableDef.constraints.some((c) => c.data.tag === "Unique" && c.data.value.columns.every((col) => columnIds.includes(col))),
			algorithm: {
				BTree: "btree",
				Hash: "hash",
				Direct: "direct"
			}[idx.algorithm.tag],
			columns: columnIds.map(getColName)
		};
	});
	return {
		sourceName: schema2.tableName || accName,
		accessorName: accName,
		columns: schema2.rowType.row,
		rowType: schema2.rowSpacetimeType,
		indexes: schema2.idxs,
		constraints: tableDef.constraints.map((c) => ({
			name: c.sourceName,
			constraint: "unique",
			columns: c.data.value.columns.map(getColName)
		})),
		resolvedIndexes,
		tableDef,
		...tableDef.isEvent ? { isEvent: true } : {}
	};
}
var ModuleContext = class {
	#compoundTypes = /* @__PURE__ */ new Map();
	/**
	* The global module definition that gets populated by calls to `reducer()` and lifecycle hooks.
	*/
	#moduleDef = {
		typespace: { types: [] },
		tables: [],
		reducers: [],
		types: [],
		rowLevelSecurity: [],
		schedules: [],
		procedures: [],
		views: [],
		lifeCycleReducers: [],
		httpHandlers: [],
		httpRoutes: [],
		caseConversionPolicy: { tag: "SnakeCase" },
		explicitNames: { entries: [] }
	};
	get moduleDef() {
		return this.#moduleDef;
	}
	rawModuleDefV10() {
		const sections = [];
		const push = (s) => {
			if (s) sections.push(s);
		};
		const module = this.#moduleDef;
		push(module.typespace && {
			tag: "Typespace",
			value: module.typespace
		});
		push(module.types && {
			tag: "Types",
			value: module.types
		});
		push(module.tables && {
			tag: "Tables",
			value: module.tables
		});
		push(module.reducers && {
			tag: "Reducers",
			value: module.reducers
		});
		push(module.procedures && {
			tag: "Procedures",
			value: module.procedures
		});
		push(module.views && {
			tag: "Views",
			value: module.views
		});
		push(module.schedules && {
			tag: "Schedules",
			value: module.schedules
		});
		push(module.lifeCycleReducers && {
			tag: "LifeCycleReducers",
			value: module.lifeCycleReducers
		});
		// PATCHED: removed HttpHandlers/HttpRoutes sections (tag 0xb/0xc)
		// not supported by v2.0.1 server
		// push(module.httpHandlers && { tag: "HttpHandlers", value: module.httpHandlers });
		// push(module.httpRoutes && { tag: "HttpRoutes", value: module.httpRoutes });
		push(module.rowLevelSecurity && {
			tag: "RowLevelSecurity",
			value: module.rowLevelSecurity
		});
		push(module.explicitNames && {
			tag: "ExplicitNames",
			value: module.explicitNames
		});
		push(module.caseConversionPolicy && {
			tag: "CaseConversionPolicy",
			value: module.caseConversionPolicy
		});
		return { sections };
	}
	/**
	* Set the case conversion policy for this module.
	* Called by the settings mechanism.
	*/
	setCaseConversionPolicy(policy) {
		this.#moduleDef.caseConversionPolicy = policy;
	}
	get typespace() {
		return this.#moduleDef.typespace;
	}
	/**
	* Resolves the actual type of a TypeBuilder by following its references until it reaches a non-ref type.
	* @param typespace The typespace to resolve types against.
	* @param typeBuilder The TypeBuilder to resolve.
	* @returns The resolved algebraic type.
	*/
	resolveType(typeBuilder) {
		let ty = typeBuilder.algebraicType;
		while (ty.tag === "Ref") ty = this.typespace.types[ty.value];
		return ty;
	}
	/**
	* Adds a type to the module definition's typespace as a `Ref` if it is a named compound type (Product or Sum).
	* Otherwise, returns the type as is.
	* @param name
	* @param ty
	* @returns
	*/
	registerTypesRecursively(typeBuilder) {
		if (typeBuilder instanceof ProductBuilder && !isUnit(typeBuilder) || typeBuilder instanceof SumBuilder || typeBuilder instanceof RowBuilder) return this.#registerCompoundTypeRecursively(typeBuilder);
		else if (typeBuilder instanceof OptionBuilder) return new OptionBuilder(this.registerTypesRecursively(typeBuilder.value));
		else if (typeBuilder instanceof ResultBuilder) return new ResultBuilder(this.registerTypesRecursively(typeBuilder.ok), this.registerTypesRecursively(typeBuilder.err));
		else if (typeBuilder instanceof ArrayBuilder) return new ArrayBuilder(this.registerTypesRecursively(typeBuilder.element));
		else return typeBuilder;
	}
	#registerCompoundTypeRecursively(typeBuilder) {
		const ty = typeBuilder.algebraicType;
		const name = typeBuilder.typeName;
		if (name === void 0) throw new Error(`Missing type name for ${typeBuilder.constructor.name ?? "TypeBuilder"} ${JSON.stringify(typeBuilder)}`);
		let r = this.#compoundTypes.get(ty);
		if (r != null) return r;
		const newTy = typeBuilder instanceof RowBuilder || typeBuilder instanceof ProductBuilder ? {
			tag: "Product",
			value: { elements: [] }
		} : {
			tag: "Sum",
			value: { variants: [] }
		};
		r = new RefBuilder(this.#moduleDef.typespace.types.length);
		this.#moduleDef.typespace.types.push(newTy);
		this.#compoundTypes.set(ty, r);
		if (typeBuilder instanceof RowBuilder) for (const [name2, elem] of Object.entries(typeBuilder.row)) newTy.value.elements.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(elem.typeBuilder).algebraicType
		});
		else if (typeBuilder instanceof ProductBuilder) for (const [name2, elem] of Object.entries(typeBuilder.elements)) newTy.value.elements.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(elem).algebraicType
		});
		else if (typeBuilder instanceof SumBuilder) for (const [name2, variant] of Object.entries(typeBuilder.variants)) newTy.value.variants.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(variant).algebraicType
		});
		this.#moduleDef.types.push({
			sourceName: splitName(name),
			ty: r.ref,
			customOrdering: true
		});
		return r;
	}
};
function isUnit(typeBuilder) {
	return typeBuilder.typeName == null && typeBuilder.algebraicType.value.elements.length === 0;
}
function splitName(name) {
	const scope = name.split(".");
	return {
		sourceName: scope.pop(),
		scope
	};
}
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder("utf-8");
function deserializeMethod(method) {
	switch (method.tag) {
		case "Get": return "GET";
		case "Head": return "HEAD";
		case "Post": return "POST";
		case "Put": return "PUT";
		case "Delete": return "DELETE";
		case "Connect": return "CONNECT";
		case "Options": return "OPTIONS";
		case "Trace": return "TRACE";
		case "Patch": return "PATCH";
		case "Extension": return method.value;
	}
}
var methods = /* @__PURE__ */ new Map([
	["GET", { tag: "Get" }],
	["HEAD", { tag: "Head" }],
	["POST", { tag: "Post" }],
	["PUT", { tag: "Put" }],
	["DELETE", { tag: "Delete" }],
	["CONNECT", { tag: "Connect" }],
	["OPTIONS", { tag: "Options" }],
	["TRACE", { tag: "Trace" }],
	["PATCH", { tag: "Patch" }]
]);
function serializeMethod(method) {
	return methods.get(method?.toUpperCase() ?? "GET") ?? {
		tag: "Extension",
		value: method
	};
}
function serializeHeaders(headers) {
	return { entries: headersToList(headers).flatMap(([k, v]) => Array.isArray(v) ? v.map((v2) => [k, v2]) : [[k, v]]).map(([name, value]) => ({
		name,
		value: textEncoder.encode(value)
	})) };
}
function deserializeHeaders(headers) {
	return new Headers(headers.entries.map(({ name, value }) => [name, textDecoder.decode(value)]));
}
var makeResponse = Symbol("makeResponse");
var SyncResponse = class _SyncResponse {
	#body;
	#inner;
	constructor(body, init) {
		if (body == null) this.#body = null;
		else if (typeof body === "string") this.#body = body;
		else this.#body = new Uint8Array(body).buffer;
		this.#inner = {
			headers: new Headers(init?.headers),
			status: init?.status ?? 200,
			statusText: init?.statusText ?? "",
			type: "default",
			url: null,
			aborted: false,
			version: init?.version ?? { tag: "Http11" }
		};
	}
	static [makeResponse](body, inner) {
		const me = new _SyncResponse(body);
		me.#inner = inner;
		return me;
	}
	get headers() {
		return this.#inner.headers;
	}
	get status() {
		return this.#inner.status;
	}
	get statusText() {
		return this.#inner.statusText;
	}
	get ok() {
		return 200 <= this.#inner.status && this.#inner.status <= 299;
	}
	get url() {
		return this.#inner.url ?? "";
	}
	get type() {
		return this.#inner.type;
	}
	get version() {
		return this.#inner.version;
	}
	arrayBuffer() {
		return this.bytes().buffer;
	}
	bytes() {
		if (this.#body == null) return new Uint8Array();
		else if (typeof this.#body === "string") return textEncoder.encode(this.#body);
		else return new Uint8Array(this.#body);
	}
	json() {
		return JSON.parse(this.text());
	}
	text() {
		if (this.#body == null) return "";
		else if (typeof this.#body === "string") return this.#body;
		else return textDecoder.decode(this.#body);
	}
};
var httpHandlerFn = Symbol("SpacetimeDB.httpHandlerFn");
var makeRequest = Symbol("makeRequest");
function coerceRequestBody(body) {
	if (body == null) return null;
	if (typeof body === "string") return body;
	return new Uint8Array(body);
}
function requestBodyToBytes(body) {
	if (body == null) return new Uint8Array();
	if (typeof body === "string") return textEncoder.encode(body);
	return body;
}
function requestBodyToText(body) {
	if (body == null) return "";
	if (typeof body === "string") return body;
	return textDecoder.decode(body);
}
var Request = class _Request {
	#body;
	#inner;
	constructor(url, init = {}) {
		this.#body = coerceRequestBody(init.body);
		this.#inner = {
			headers: new Headers(init.headers),
			method: init.method ?? "GET",
			uri: "" + url,
			version: init.version ?? { tag: "Http11" }
		};
	}
	static [makeRequest](body, inner) {
		const me = new _Request(inner.uri);
		me.#body = coerceRequestBody(body);
		me.#inner = inner;
		return me;
	}
	get headers() {
		return this.#inner.headers;
	}
	get method() {
		return this.#inner.method;
	}
	get uri() {
		return this.#inner.uri;
	}
	get url() {
		return this.#inner.uri;
	}
	get version() {
		return this.#inner.version;
	}
	arrayBuffer() {
		return this.bytes().buffer;
	}
	bytes() {
		return requestBodyToBytes(this.#body);
	}
	json() {
		return JSON.parse(this.text());
	}
	text() {
		return requestBodyToText(this.#body);
	}
};
var exportedHttpHandlerObjects = /* @__PURE__ */ new WeakSet();
function makeHttpHandlerExport(ctx, opts, fn) {
	const handlerExport = {
		[httpHandlerFn]: fn,
		[exportContext]: ctx,
		[registerExport](ctx2, exportName) {
			if (exportedHttpHandlerObjects.has(handlerExport)) throw new TypeError(`HTTP handler '${exportName}' was exported more than once`);
			exportedHttpHandlerObjects.add(handlerExport);
			registerHttpHandler(ctx2, exportName, fn, opts);
			ctx2.httpHandlerExports.set(handlerExport, exportName);
		}
	};
	return handlerExport;
}
function makeHttpRouterExport(ctx, router) {
	return {
		[exportContext]: ctx,
		[registerExport](ctx2) {
			ctx2.pendingHttpRoutes.push(...router.intoRoutes());
		}
	};
}
function registerHttpHandler(ctx, exportName, fn, opts) {
	ctx.defineHttpHandler(exportName);
	ctx.moduleDef.httpHandlers.push({ sourceName: exportName });
	if (opts?.name != null) ctx.moduleDef.explicitNames.entries.push({
		tag: "Function",
		value: {
			sourceName: exportName,
			canonicalName: opts.name
		}
	});
	if (!fn.name) Object.defineProperty(fn, "name", {
		value: exportName,
		writable: false
	});
	ctx.httpHandlers.push(fn);
}
var import_statuses = __toESM(require_statuses());
var Range = class {
	#from;
	#to;
	constructor(from, to) {
		this.#from = from ?? { tag: "unbounded" };
		this.#to = to ?? { tag: "unbounded" };
	}
	get from() {
		return this.#from;
	}
	get to() {
		return this.#to;
	}
};
function table(opts, row, ..._) {
	const { name, public: isPublic = false, indexes: userIndexes = [], scheduled, event: isEvent = false } = opts;
	const colIds = /* @__PURE__ */ new Map();
	const colNameList = [];
	if (!(row instanceof RowBuilder)) row = new RowBuilder(row);
	row.algebraicType.value.elements.forEach((elem, i) => {
		colIds.set(elem.name, i);
		colNameList.push(elem.name);
	});
	const pk = [];
	const indexes = [];
	const constraints = [];
	const sequences = [];
	let scheduleAtCol;
	const defaultValues = [];
	for (const [name2, builder] of Object.entries(row.row)) {
		const meta = builder.columnMetadata;
		if (meta.isPrimaryKey) pk.push(colIds.get(name2));
		const isUnique = meta.isUnique || meta.isPrimaryKey;
		if (meta.indexType || isUnique) {
			const algo = meta.indexType ?? "btree";
			const id = colIds.get(name2);
			let algorithm;
			switch (algo) {
				case "btree":
					algorithm = RawIndexAlgorithm.BTree([id]);
					break;
				case "hash":
					algorithm = RawIndexAlgorithm.Hash([id]);
					break;
				case "direct":
					algorithm = RawIndexAlgorithm.Direct(id);
					break;
			}
			indexes.push({
				sourceName: void 0,
				accessorName: name2,
				algorithm
			});
		}
		if (isUnique) constraints.push({
			sourceName: void 0,
			data: {
				tag: "Unique",
				value: { columns: [colIds.get(name2)] }
			}
		});
		if (meta.isAutoIncrement) sequences.push({
			sourceName: void 0,
			start: void 0,
			minValue: void 0,
			maxValue: void 0,
			column: colIds.get(name2),
			increment: 1n
		});
		if (Object.prototype.hasOwnProperty.call(meta, "defaultValue")) {
			const writer = new BinaryWriter(16);
			builder.serialize(writer, meta.defaultValue);
			defaultValues.push({
				colId: colIds.get(name2),
				value: writer.getBuffer()
			});
		}
		if (scheduled) {
			const algebraicType = builder.typeBuilder.algebraicType;
			if (schedule_at_default.isScheduleAt(algebraicType)) scheduleAtCol = colIds.get(name2);
		}
	}
	for (const indexOpts of userIndexes ?? []) {
		const accessor = indexOpts.accessor;
		if (typeof accessor !== "string" || accessor.length === 0) {
			const tableLabel = name ?? "<unnamed>";
			const indexLabel = indexOpts.name ?? "<unnamed>";
			throw new TypeError(`Index '${indexLabel}' on table '${tableLabel}' must define a non-empty 'accessor'`);
		}
		let algorithm;
		switch (indexOpts.algorithm) {
			case "btree":
				algorithm = {
					tag: "BTree",
					value: indexOpts.columns.map((c) => colIds.get(c))
				};
				break;
			case "hash":
				algorithm = {
					tag: "Hash",
					value: indexOpts.columns.map((c) => colIds.get(c))
				};
				break;
			case "direct":
				algorithm = {
					tag: "Direct",
					value: colIds.get(indexOpts.column)
				};
				break;
		}
		indexes.push({
			sourceName: void 0,
			accessorName: accessor,
			algorithm,
			canonicalName: indexOpts.name
		});
	}
	for (const constraintOpts of opts.constraints ?? []) if (constraintOpts.constraint === "unique") {
		const data = {
			tag: "Unique",
			value: { columns: constraintOpts.columns.map((c) => colIds.get(c)) }
		};
		constraints.push({
			sourceName: constraintOpts.name,
			data
		});
		continue;
	}
	const productType = row.algebraicType.value;
	return {
		rowType: row,
		tableName: name,
		rowSpacetimeType: productType,
		tableDef: (ctx, accName) => {
			const tableName = name ?? accName;
			if (row.typeName === void 0) row.typeName = toPascalCase(tableName);
			for (const index of indexes) {
				const sourceName = index.sourceName = `${accName}_${(index.algorithm.tag === "Direct" ? [index.algorithm.value] : index.algorithm.value).map((i) => colNameList[i]).join("_")}_idx_${index.algorithm.tag.toLowerCase()}`;
				const { canonicalName } = index;
				if (canonicalName !== void 0) ctx.moduleDef.explicitNames.entries.push(ExplicitNameEntry.Index({
					sourceName,
					canonicalName
				}));
			}
			return {
				sourceName: accName,
				productTypeRef: ctx.registerTypesRecursively(row).ref,
				primaryKey: pk,
				indexes,
				constraints,
				sequences,
				tableType: { tag: "User" },
				tableAccess: { tag: isPublic ? "Public" : "Private" },
				defaultValues,
				isEvent
			};
		},
		idxs: userIndexes,
		constraints,
		schedule: scheduled && scheduleAtCol !== void 0 ? {
			scheduleAtCol,
			reducer: scheduled
		} : void 0
	};
}
var QueryBrand = Symbol("QueryBrand");
var isRowTypedQuery = (val) => !!val && typeof val === "object" && QueryBrand in val;
function toSql(q) {
	return q.toSql();
}
var SemijoinImpl = class _SemijoinImpl {
	constructor(sourceQuery, filterQuery, joinCondition) {
		this.sourceQuery = sourceQuery;
		this.filterQuery = filterQuery;
		this.joinCondition = joinCondition;
		if (sourceQuery.table.sourceName === filterQuery.table.sourceName) throw new Error("Cannot semijoin a table to itself");
	}
	[QueryBrand] = true;
	type = "semijoin";
	build() {
		return this;
	}
	where(predicate) {
		return new _SemijoinImpl(this.sourceQuery.where(predicate), this.filterQuery, this.joinCondition);
	}
	toSql() {
		const left = this.filterQuery;
		const right = this.sourceQuery;
		const leftTable = quoteIdentifier(left.table.sourceName);
		const rightTable = quoteIdentifier(right.table.sourceName);
		let sql = `SELECT ${rightTable}.* FROM ${leftTable} JOIN ${rightTable} ON ${booleanExprToSql(this.joinCondition)}`;
		const clauses = [];
		if (left.whereClause) clauses.push(booleanExprToSql(left.whereClause));
		if (right.whereClause) clauses.push(booleanExprToSql(right.whereClause));
		if (clauses.length > 0) {
			const whereSql = clauses.length === 1 ? clauses[0] : clauses.map(wrapInParens).join(" AND ");
			sql += ` WHERE ${whereSql}`;
		}
		return sql;
	}
};
var FromBuilder = class _FromBuilder {
	constructor(table2, whereClause) {
		this.table = table2;
		this.whereClause = whereClause;
	}
	[QueryBrand] = true;
	where(predicate) {
		const newCondition = normalizePredicateExpr(predicate(this.table.cols));
		const nextWhere = this.whereClause ? this.whereClause.and(newCondition) : newCondition;
		return new _FromBuilder(this.table, nextWhere);
	}
	rightSemijoin(right, on) {
		const sourceQuery = new _FromBuilder(right);
		const joinCondition = on(this.table.indexedCols, right.indexedCols);
		return new SemijoinImpl(sourceQuery, this, joinCondition);
	}
	leftSemijoin(right, on) {
		const filterQuery = new _FromBuilder(right);
		const joinCondition = on(this.table.indexedCols, right.indexedCols);
		return new SemijoinImpl(this, filterQuery, joinCondition);
	}
	toSql() {
		return renderSelectSqlWithJoins(this.table, this.whereClause);
	}
	build() {
		return this;
	}
};
var TableRefImpl = class {
	[QueryBrand] = true;
	type = "table";
	sourceName;
	accessorName;
	cols;
	indexedCols;
	tableDef;
	get columns() {
		return this.tableDef.columns;
	}
	get indexes() {
		return this.tableDef.indexes;
	}
	get rowType() {
		return this.tableDef.rowType;
	}
	get constraints() {
		return this.tableDef.constraints;
	}
	constructor(tableDef) {
		this.sourceName = tableDef.sourceName;
		this.accessorName = tableDef.accessorName;
		this.cols = createRowExpr(tableDef);
		this.indexedCols = this.cols;
		this.tableDef = tableDef;
		Object.freeze(this);
	}
	asFrom() {
		return new FromBuilder(this);
	}
	rightSemijoin(other, on) {
		return this.asFrom().rightSemijoin(other, on);
	}
	leftSemijoin(other, on) {
		return this.asFrom().leftSemijoin(other, on);
	}
	build() {
		return this.asFrom().build();
	}
	toSql() {
		return this.asFrom().toSql();
	}
	where(predicate) {
		return this.asFrom().where(predicate);
	}
};
function createTableRefFromDef(tableDef) {
	return new TableRefImpl(tableDef);
}
function makeQueryBuilder(schema2) {
	const qb = /* @__PURE__ */ Object.create(null);
	for (const table2 of Object.values(schema2.tables)) {
		const ref = createTableRefFromDef(table2);
		qb[table2.accessorName] = ref;
	}
	return Object.freeze(qb);
}
function createRowExpr(tableDef) {
	const row = {};
	for (const columnName of Object.keys(tableDef.columns)) {
		const columnBuilder = tableDef.columns[columnName];
		const column = new ColumnExpression(tableDef.sourceName, columnName, columnBuilder.typeBuilder.algebraicType, columnBuilder.columnMetadata.name);
		row[columnName] = Object.freeze(column);
	}
	return Object.freeze(row);
}
function renderSelectSqlWithJoins(table2, where, extraClauses = []) {
	const sql = `SELECT * FROM ${quoteIdentifier(table2.sourceName)}`;
	const clauses = [];
	if (where) clauses.push(booleanExprToSql(where));
	clauses.push(...extraClauses);
	if (clauses.length === 0) return sql;
	return `${sql} WHERE ${clauses.length === 1 ? clauses[0] : clauses.map(wrapInParens).join(" AND ")}`;
}
var ColumnExpression = class {
	type = "column";
	column;
	columnName;
	table;
	tsValueType;
	spacetimeType;
	constructor(table2, column, spacetimeType, columnName) {
		this.table = table2;
		this.column = column;
		this.columnName = columnName || column;
		this.spacetimeType = spacetimeType;
	}
	eq(x) {
		return new BooleanExpr({
			type: "eq",
			left: this,
			right: normalizeValue(x)
		});
	}
	ne(x) {
		return new BooleanExpr({
			type: "ne",
			left: this,
			right: normalizeValue(x)
		});
	}
	lt(x) {
		return new BooleanExpr({
			type: "lt",
			left: this,
			right: normalizeValue(x)
		});
	}
	lte(x) {
		return new BooleanExpr({
			type: "lte",
			left: this,
			right: normalizeValue(x)
		});
	}
	gt(x) {
		return new BooleanExpr({
			type: "gt",
			left: this,
			right: normalizeValue(x)
		});
	}
	gte(x) {
		return new BooleanExpr({
			type: "gte",
			left: this,
			right: normalizeValue(x)
		});
	}
};
function literal(value) {
	return {
		type: "literal",
		value
	};
}
function normalizeValue(val) {
	if (val.type === "literal") return val;
	if (typeof val === "object" && val != null && "type" in val && val.type === "column") return val;
	return literal(val);
}
function normalizePredicateExpr(value) {
	if (value instanceof BooleanExpr) return value;
	if (typeof value === "boolean") return new BooleanExpr({
		type: "eq",
		left: literal(value),
		right: literal(true)
	});
	return new BooleanExpr({
		type: "eq",
		left: value,
		right: literal(true)
	});
}
var BooleanExpr = class _BooleanExpr {
	constructor(data) {
		this.data = data;
	}
	and(other) {
		return new _BooleanExpr({
			type: "and",
			clauses: [this.data, other.data]
		});
	}
	or(other) {
		return new _BooleanExpr({
			type: "or",
			clauses: [this.data, other.data]
		});
	}
	not() {
		return new _BooleanExpr({
			type: "not",
			clause: this.data
		});
	}
};
function booleanExprToSql(expr, tableAlias) {
	const data = expr instanceof BooleanExpr ? expr.data : expr;
	switch (data.type) {
		case "eq": return `${valueExprToSql(data.left)} = ${valueExprToSql(data.right)}`;
		case "ne": return `${valueExprToSql(data.left)} <> ${valueExprToSql(data.right)}`;
		case "gt": return `${valueExprToSql(data.left)} > ${valueExprToSql(data.right)}`;
		case "gte": return `${valueExprToSql(data.left)} >= ${valueExprToSql(data.right)}`;
		case "lt": return `${valueExprToSql(data.left)} < ${valueExprToSql(data.right)}`;
		case "lte": return `${valueExprToSql(data.left)} <= ${valueExprToSql(data.right)}`;
		case "and": return data.clauses.map((c) => booleanExprToSql(c)).map(wrapInParens).join(" AND ");
		case "or": return data.clauses.map((c) => booleanExprToSql(c)).map(wrapInParens).join(" OR ");
		case "not": return `NOT ${wrapInParens(booleanExprToSql(data.clause))}`;
	}
}
function wrapInParens(sql) {
	return `(${sql})`;
}
function valueExprToSql(expr, tableAlias) {
	if (isLiteralExpr(expr)) return literalValueToSql(expr.value);
	const table2 = expr.table;
	return `${quoteIdentifier(table2)}.${quoteIdentifier(expr.columnName)}`;
}
function literalValueToSql(value) {
	if (value === null || value === void 0) return "NULL";
	if (value instanceof Identity || value instanceof ConnectionId) return `0x${value.toHexString()}`;
	if (value instanceof Timestamp) return `'${value.toISOString()}'`;
	switch (typeof value) {
		case "number":
		case "bigint": return String(value);
		case "boolean": return value ? "TRUE" : "FALSE";
		case "string": return `'${value.replace(/'/g, "''")}'`;
		default: return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
	}
}
function quoteIdentifier(name) {
	return `"${name.replace(/"/g, "\"\"")}"`;
}
function isLiteralExpr(expr) {
	return expr.type === "literal";
}
function makeViewExport(ctx, opts, params, ret, fn) {
	const viewExport = fn.bind();
	viewExport[exportContext] = ctx;
	viewExport[registerExport] = (ctx2, exportName) => {
		registerView(ctx2, opts, exportName, false, params, ret, fn);
	};
	return viewExport;
}
function makeAnonViewExport(ctx, opts, params, ret, fn) {
	const viewExport = fn.bind();
	viewExport[exportContext] = ctx;
	viewExport[registerExport] = (ctx2, exportName) => {
		registerView(ctx2, opts, exportName, true, params, ret, fn);
	};
	return viewExport;
}
function registerView(ctx, opts, exportName, anon, params, ret, fn) {
	ctx.defineFunction(exportName);
	const paramsBuilder = new RowBuilder(params, toPascalCase(exportName));
	let returnType = ctx.registerTypesRecursively(ret).algebraicType;
	const { typespace } = ctx;
	const { value: paramType } = ctx.resolveType(ctx.registerTypesRecursively(paramsBuilder));
	ctx.moduleDef.views.push({
		sourceName: exportName,
		index: (anon ? ctx.anonViews : ctx.views).length,
		isPublic: opts.public,
		isAnonymous: anon,
		params: paramType,
		returnType
	});
	if (opts.name != null) ctx.moduleDef.explicitNames.entries.push({
		tag: "Function",
		value: {
			sourceName: exportName,
			canonicalName: opts.name
		}
	});
	if (returnType.tag == "Sum") {
		const originalFn = fn;
		fn = ((ctx2, args) => {
			const ret2 = originalFn(ctx2, args);
			return ret2 == null ? [] : [ret2];
		});
		returnType = AlgebraicType.Array(returnType.value.variants[0].algebraicType);
	}
	(anon ? ctx.anonViews : ctx.views).push({
		fn,
		deserializeParams: ProductType.makeDeserializer(paramType, typespace),
		serializeReturn: AlgebraicType.makeSerializer(returnType, typespace),
		returnTypeBaseSize: bsatnBaseSize(typespace, returnType)
	});
}
var SenderError = class extends Error {
	constructor(message) {
		super(message);
	}
	get name() {
		return "SenderError";
	}
};
var SpacetimeHostError = class extends Error {
	constructor(message) {
		super(message);
	}
	get name() {
		return "SpacetimeHostError";
	}
};
var errorData = {
	HostCallFailure: 1,
	NotInTransaction: 2,
	BsatnDecodeError: 3,
	NoSuchTable: 4,
	NoSuchIndex: 5,
	NoSuchIter: 6,
	NoSuchConsoleTimer: 7,
	NoSuchBytes: 8,
	NoSpace: 9,
	BufferTooSmall: 11,
	UniqueAlreadyExists: 12,
	ScheduleAtDelayTooLong: 13,
	IndexNotUnique: 14,
	NoSuchRow: 15,
	AutoIncOverflow: 16,
	WouldBlockTransaction: 17,
	TransactionNotAnonymous: 18,
	TransactionIsReadOnly: 19,
	TransactionIsMut: 20,
	HttpError: 21
};
function mapEntries(x, f) {
	return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, f(k, v)]));
}
var errnoToClass = /* @__PURE__ */ new Map();
var errors = Object.freeze(mapEntries(errorData, (name, code) => {
	const cls = Object.defineProperty(class extends SpacetimeHostError {
		get name() {
			return name;
		}
	}, "name", {
		value: name,
		writable: false
	});
	errnoToClass.set(code, cls);
	return cls;
}));
function getErrorConstructor(code) {
	return errnoToClass.get(code) ?? SpacetimeHostError;
}
var SBigInt = typeof BigInt !== "undefined" ? BigInt : void 0;
var One = typeof BigInt !== "undefined" ? BigInt(1) : void 0;
var ThirtyTwo = typeof BigInt !== "undefined" ? BigInt(32) : void 0;
var NumValues = typeof BigInt !== "undefined" ? BigInt(4294967296) : void 0;
function unsafeUniformBigIntDistribution(from, to, rng) {
	var diff = to - from + One;
	var FinalNumValues = NumValues;
	var NumIterations = 1;
	while (FinalNumValues < diff) {
		FinalNumValues <<= ThirtyTwo;
		++NumIterations;
	}
	var value = generateNext(NumIterations, rng);
	if (value < diff) return value + from;
	if (value + diff < FinalNumValues) return value % diff + from;
	var MaxAcceptedRandom = FinalNumValues - FinalNumValues % diff;
	while (value >= MaxAcceptedRandom) value = generateNext(NumIterations, rng);
	return value % diff + from;
}
function generateNext(NumIterations, rng) {
	var value = SBigInt(rng.unsafeNext() + 2147483648);
	for (var num = 1; num < NumIterations; ++num) {
		var out = rng.unsafeNext();
		value = (value << ThirtyTwo) + SBigInt(out + 2147483648);
	}
	return value;
}
function unsafeUniformIntDistributionInternal(rangeSize, rng) {
	var MaxAllowed = rangeSize > 2 ? ~~(4294967296 / rangeSize) * rangeSize : 4294967296;
	var deltaV = rng.unsafeNext() + 2147483648;
	while (deltaV >= MaxAllowed) deltaV = rng.unsafeNext() + 2147483648;
	return deltaV % rangeSize;
}
function fromNumberToArrayInt64(out, n) {
	if (n < 0) {
		var posN = -n;
		out.sign = -1;
		out.data[0] = ~~(posN / 4294967296);
		out.data[1] = posN >>> 0;
	} else {
		out.sign = 1;
		out.data[0] = ~~(n / 4294967296);
		out.data[1] = n >>> 0;
	}
	return out;
}
function substractArrayInt64(out, arrayIntA, arrayIntB) {
	var lowA = arrayIntA.data[1];
	var highA = arrayIntA.data[0];
	var signA = arrayIntA.sign;
	var lowB = arrayIntB.data[1];
	var highB = arrayIntB.data[0];
	var signB = arrayIntB.sign;
	out.sign = 1;
	if (signA === 1 && signB === -1) {
		var low_1 = lowA + lowB;
		var high = highA + highB + (low_1 > 4294967295 ? 1 : 0);
		out.data[0] = high >>> 0;
		out.data[1] = low_1 >>> 0;
		return out;
	}
	var lowFirst = lowA;
	var highFirst = highA;
	var lowSecond = lowB;
	var highSecond = highB;
	if (signA === -1) {
		lowFirst = lowB;
		highFirst = highB;
		lowSecond = lowA;
		highSecond = highA;
	}
	var reminderLow = 0;
	var low = lowFirst - lowSecond;
	if (low < 0) {
		reminderLow = 1;
		low = low >>> 0;
	}
	out.data[0] = highFirst - highSecond - reminderLow;
	out.data[1] = low;
	return out;
}
function unsafeUniformArrayIntDistributionInternal(out, rangeSize, rng) {
	var rangeLength = rangeSize.length;
	while (true) {
		for (var index = 0; index !== rangeLength; ++index) out[index] = unsafeUniformIntDistributionInternal(index === 0 ? rangeSize[0] + 1 : 4294967296, rng);
		for (var index = 0; index !== rangeLength; ++index) {
			var current = out[index];
			var currentInRange = rangeSize[index];
			if (current < currentInRange) return out;
			else if (current > currentInRange) break;
		}
	}
}
var safeNumberMaxSafeInteger = Number.MAX_SAFE_INTEGER;
var sharedA = {
	sign: 1,
	data: [0, 0]
};
var sharedB = {
	sign: 1,
	data: [0, 0]
};
var sharedC = {
	sign: 1,
	data: [0, 0]
};
var sharedData = [0, 0];
function uniformLargeIntInternal(from, to, rangeSize, rng) {
	var rangeSizeArrayIntValue = rangeSize <= safeNumberMaxSafeInteger ? fromNumberToArrayInt64(sharedC, rangeSize) : substractArrayInt64(sharedC, fromNumberToArrayInt64(sharedA, to), fromNumberToArrayInt64(sharedB, from));
	if (rangeSizeArrayIntValue.data[1] === 4294967295) {
		rangeSizeArrayIntValue.data[0] += 1;
		rangeSizeArrayIntValue.data[1] = 0;
	} else rangeSizeArrayIntValue.data[1] += 1;
	unsafeUniformArrayIntDistributionInternal(sharedData, rangeSizeArrayIntValue.data, rng);
	return sharedData[0] * 4294967296 + sharedData[1] + from;
}
function unsafeUniformIntDistribution(from, to, rng) {
	var rangeSize = to - from;
	if (rangeSize <= 4294967295) return unsafeUniformIntDistributionInternal(rangeSize + 1, rng) + from;
	return uniformLargeIntInternal(from, to, rangeSize, rng);
}
var XoroShiro128Plus = (function() {
	function XoroShiro128Plus2(s01, s00, s11, s10) {
		this.s01 = s01;
		this.s00 = s00;
		this.s11 = s11;
		this.s10 = s10;
	}
	XoroShiro128Plus2.prototype.clone = function() {
		return new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
	};
	XoroShiro128Plus2.prototype.next = function() {
		var nextRng = new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
		return [nextRng.unsafeNext(), nextRng];
	};
	XoroShiro128Plus2.prototype.unsafeNext = function() {
		var out = this.s00 + this.s10 | 0;
		var a0 = this.s10 ^ this.s00;
		var a1 = this.s11 ^ this.s01;
		var s00 = this.s00;
		var s01 = this.s01;
		this.s00 = s00 << 24 ^ s01 >>> 8 ^ a0 ^ a0 << 16;
		this.s01 = s01 << 24 ^ s00 >>> 8 ^ a1 ^ (a1 << 16 | a0 >>> 16);
		this.s10 = a1 << 5 ^ a0 >>> 27;
		this.s11 = a0 << 5 ^ a1 >>> 27;
		return out;
	};
	XoroShiro128Plus2.prototype.jump = function() {
		var nextRng = new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
		nextRng.unsafeJump();
		return nextRng;
	};
	XoroShiro128Plus2.prototype.unsafeJump = function() {
		var ns01 = 0;
		var ns00 = 0;
		var ns11 = 0;
		var ns10 = 0;
		var jump = [
			3639956645,
			3750757012,
			1261568508,
			386426335
		];
		for (var i = 0; i !== 4; ++i) for (var mask = 1; mask; mask <<= 1) {
			if (jump[i] & mask) {
				ns01 ^= this.s01;
				ns00 ^= this.s00;
				ns11 ^= this.s11;
				ns10 ^= this.s10;
			}
			this.unsafeNext();
		}
		this.s01 = ns01;
		this.s00 = ns00;
		this.s11 = ns11;
		this.s10 = ns10;
	};
	XoroShiro128Plus2.prototype.getState = function() {
		return [
			this.s01,
			this.s00,
			this.s11,
			this.s10
		];
	};
	return XoroShiro128Plus2;
})();
function fromState(state) {
	if (!(state.length === 4)) throw new Error("The state must have been produced by a xoroshiro128plus RandomGenerator");
	return new XoroShiro128Plus(state[0], state[1], state[2], state[3]);
}
var xoroshiro128plus = Object.assign(function(seed) {
	return new XoroShiro128Plus(-1, ~seed, seed | 0, 0);
}, { fromState });
var { asUintN } = BigInt;
function pcg32(state) {
	state = asUintN(64, state * 6364136223846793005n + 11634580027462260723n);
	const xorshifted = Number(asUintN(32, (state >> 18n ^ state) >> 27n));
	const rot = Number(asUintN(32, state >> 59n));
	return xorshifted >> rot | xorshifted << 32 - rot;
}
function generateFloat64(rng) {
	const g1 = unsafeUniformIntDistribution(0, (1 << 26) - 1, rng);
	const g2 = unsafeUniformIntDistribution(0, (1 << 27) - 1, rng);
	return (g1 * Math.pow(2, 27) + g2) * Math.pow(2, -53);
}
function makeRandom(seed) {
	const rng = xoroshiro128plus(pcg32(seed.microsSinceUnixEpoch));
	const random = () => generateFloat64(rng);
	random.fill = (array) => {
		const elem = array.at(0);
		if (typeof elem === "bigint") {
			const upper = (1n << BigInt(array.BYTES_PER_ELEMENT * 8)) - 1n;
			for (let i = 0; i < array.length; i++) array[i] = unsafeUniformBigIntDistribution(0n, upper, rng);
		} else if (typeof elem === "number") {
			const upper = (1 << array.BYTES_PER_ELEMENT * 8) - 1;
			for (let i = 0; i < array.length; i++) array[i] = unsafeUniformIntDistribution(0, upper, rng);
		}
		return array;
	};
	random.uint32 = () => rng.unsafeNext();
	random.integerInRange = (min, max) => unsafeUniformIntDistribution(min, max, rng);
	random.bigintInRange = (min, max) => unsafeUniformBigIntDistribution(min, max, rng);
	return random;
}
var { freeze } = Object;
var sys = {
	..._syscalls2_0,
	..._syscalls2_1
};
function requestFromWire(request, body) {
	return Request[makeRequest](body, {
		headers: deserializeHeaders(request.headers),
		method: deserializeMethod(request.method),
		uri: request.uri,
		version: request.version
	});
}
function responseIntoWire(response) {
	return [{
		headers: serializeHeaders(response.headers),
		version: response.version,
		code: response.status
	}, response.bytes()];
}
function parseJsonObject(json) {
	let value;
	try {
		value = JSON.parse(json);
	} catch {
		throw new Error("Invalid JSON: failed to parse string");
	}
	if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected a JSON object at the top level");
	return value;
}
var JwtClaimsImpl = class {
	/**
	* Creates a new JwtClaims instance.
	* @param rawPayload The JWT payload as a raw JSON string.
	* @param identity The identity for this JWT. We are only taking this because we don't have a blake3 implementation (which we need to compute it).
	*/
	constructor(rawPayload, identity) {
		this.rawPayload = rawPayload;
		this.fullPayload = parseJsonObject(rawPayload);
		this._identity = identity;
	}
	fullPayload;
	_identity;
	get identity() {
		return this._identity;
	}
	get subject() {
		return this.fullPayload["sub"];
	}
	get issuer() {
		return this.fullPayload["iss"];
	}
	get audience() {
		const aud = this.fullPayload["aud"];
		if (aud == null) return [];
		return typeof aud === "string" ? [aud] : aud;
	}
};
var AuthCtxImpl = class _AuthCtxImpl {
	isInternal;
	_jwtSource;
	_initializedJWT = false;
	_jwtClaims;
	_senderIdentity;
	constructor(opts) {
		this.isInternal = opts.isInternal;
		this._jwtSource = opts.jwtSource;
		this._senderIdentity = opts.senderIdentity;
	}
	_initializeJWT() {
		if (this._initializedJWT) return;
		this._initializedJWT = true;
		const token = this._jwtSource();
		if (!token) this._jwtClaims = null;
		else this._jwtClaims = new JwtClaimsImpl(token, this._senderIdentity);
		Object.freeze(this);
	}
	/** Lazily compute whether a JWT exists and is parseable. */
	get hasJWT() {
		this._initializeJWT();
		return this._jwtClaims !== null;
	}
	/** Lazily parse the JwtClaims only when accessed. */
	get jwt() {
		this._initializeJWT();
		return this._jwtClaims;
	}
	/** Create a context representing internal (non-user) requests. */
	static internal() {
		return new _AuthCtxImpl({
			isInternal: true,
			jwtSource: () => null,
			senderIdentity: Identity.zero()
		});
	}
	/** If there is a connection id, look up the JWT payload from the system tables. */
	static fromSystemTables(connectionId, sender) {
		if (connectionId === null) return new _AuthCtxImpl({
			isInternal: false,
			jwtSource: () => null,
			senderIdentity: sender
		});
		return new _AuthCtxImpl({
			isInternal: false,
			jwtSource: () => {
				const payloadBuf = sys.get_jwt_payload(connectionId.__connection_id__);
				if (payloadBuf.length === 0) return null;
				return new TextDecoder().decode(payloadBuf);
			},
			senderIdentity: sender
		});
	}
};
var ReducerCtxImpl = class ReducerCtx {
	#identity;
	#senderAuth;
	#uuidCounter;
	#random;
	sender;
	timestamp;
	connectionId;
	db;
	constructor(sender, timestamp, connectionId, dbView) {
		Object.seal(this);
		this.sender = sender;
		this.timestamp = timestamp;
		this.connectionId = connectionId;
		this.db = dbView;
	}
	/** Reset the `ReducerCtx` to be used for a new transaction */
	static reset(me, sender, timestamp, connectionId) {
		me.sender = sender;
		me.timestamp = timestamp;
		me.connectionId = connectionId;
		me.#uuidCounter = void 0;
		me.#senderAuth = void 0;
	}
	get databaseIdentity() {
		return this.#identity ??= new Identity(sys.identity());
	}
	get identity() {
		return this.databaseIdentity;
	}
	get senderAuth() {
		return this.#senderAuth ??= AuthCtxImpl.fromSystemTables(this.connectionId, this.sender);
	}
	get random() {
		return this.#random ??= makeRandom(this.timestamp);
	}
	/**
	* Create a new random {@link Uuid} `v4` using this `ReducerCtx`'s RNG.
	*/
	newUuidV4() {
		const bytes = this.random.fill(new Uint8Array(16));
		return Uuid.fromRandomBytesV4(bytes);
	}
	/**
	* Create a new sortable {@link Uuid} `v7` using this `ReducerCtx`'s RNG, counter,
	* and timestamp.
	*/
	newUuidV7() {
		const bytes = this.random.fill(new Uint8Array(4));
		const counter = this.#uuidCounter ??= { value: 0 };
		return Uuid.fromCounterV7(counter, this.timestamp, bytes);
	}
};
var callUserFunction = function __spacetimedb_end_short_backtrace(fn, ...args) {
	return fn(...args);
};
function runWithTx(makeCtx, body) {
	const run = () => {
		const timestamp = sys.procedure_start_mut_tx();
		try {
			return body(makeCtx(new Timestamp(timestamp)));
		} catch (e) {
			sys.procedure_abort_mut_tx();
			throw e;
		}
	};
	let res = run();
	try {
		sys.procedure_commit_mut_tx();
		return res;
	} catch {}
	console.warn("committing anonymous transaction failed");
	res = run();
	try {
		sys.procedure_commit_mut_tx();
		return res;
	} catch (e) {
		throw new Error("transaction retry failed again", { cause: e });
	}
}
var makeHooks = (schema2) => new ModuleHooksImpl(schema2);
var ModuleHooksImpl = class {
	#schema;
	#dbView_;
	#reducerArgsDeserializers;
	/** Cache the `ReducerCtx` object to avoid allocating anew for ever reducer call. */
	#reducerCtx_;
	constructor(schema2) {
		this.#schema = schema2;
		this.#reducerArgsDeserializers = schema2.moduleDef.reducers.map(({ params }) => ProductType.makeDeserializer(params, schema2.typespace));
	}
	get #dbView() {
		return this.#dbView_ ??= freeze(Object.fromEntries(Object.values(this.#schema.schemaType.tables).map((table2) => [table2.accessorName, makeTableView(this.#schema.typespace, table2.tableDef)])));
	}
	get #reducerCtx() {
		return this.#reducerCtx_ ??= new ReducerCtxImpl(Identity.zero(), Timestamp.UNIX_EPOCH, null, this.#dbView);
	}
	__describe_module__() {
		const writer = new BinaryWriter(128);
		RawModuleDef.serialize(writer, RawModuleDef.V10(this.#schema.rawModuleDefV10()));
		return writer.getBuffer();
	}
	__get_error_constructor__(code) {
		return getErrorConstructor(code);
	}
	get __sender_error_class__() {
		return SenderError;
	}
	__call_reducer__(reducerId, sender, connId, timestamp, argsBuf) {
		const moduleCtx = this.#schema;
		const deserializeArgs = this.#reducerArgsDeserializers[reducerId];
		BINARY_READER.reset(argsBuf);
		const args = deserializeArgs(BINARY_READER);
		const senderIdentity = new Identity(sender);
		const ctx = this.#reducerCtx;
		ReducerCtxImpl.reset(ctx, senderIdentity, new Timestamp(timestamp), ConnectionId.nullIfZero(new ConnectionId(connId)));
		callUserFunction(moduleCtx.reducers[reducerId], ctx, args);
	}
	__call_view__(id, sender, argsBuf) {
		const moduleCtx = this.#schema;
		const { fn, deserializeParams, serializeReturn, returnTypeBaseSize } = moduleCtx.views[id];
		const ret = callUserFunction(fn, freeze({
			sender: new Identity(sender),
			db: this.#dbView,
			from: makeQueryBuilder(moduleCtx.schemaType)
		}), deserializeParams(new BinaryReader(argsBuf)));
		const retBuf = new BinaryWriter(returnTypeBaseSize);
		if (isRowTypedQuery(ret)) {
			const query = toSql(ret);
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RawSql(query));
		} else {
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RowData);
			serializeReturn(retBuf, ret);
		}
		return { data: retBuf.getBuffer() };
	}
	__call_view_anon__(id, argsBuf) {
		const moduleCtx = this.#schema;
		const { fn, deserializeParams, serializeReturn, returnTypeBaseSize } = moduleCtx.anonViews[id];
		const ret = callUserFunction(fn, freeze({
			db: this.#dbView,
			from: makeQueryBuilder(moduleCtx.schemaType)
		}), deserializeParams(new BinaryReader(argsBuf)));
		const retBuf = new BinaryWriter(returnTypeBaseSize);
		if (isRowTypedQuery(ret)) {
			const query = toSql(ret);
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RawSql(query));
		} else {
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RowData);
			serializeReturn(retBuf, ret);
		}
		return { data: retBuf.getBuffer() };
	}
	__call_procedure__(id, sender, connection_id, timestamp, args) {
		return callProcedure(this.#schema, id, new Identity(sender), ConnectionId.nullIfZero(new ConnectionId(connection_id)), new Timestamp(timestamp), args, () => this.#dbView);
	}
	__call_http_handler__(id, timestamp, request, body) {
		const moduleCtx = this.#schema;
		const handler = moduleCtx.httpHandlers[id];
		const [responseMetadata, responseBody] = responseIntoWire(callUserFunction(handler, new HandlerContextImpl(new Timestamp(timestamp), () => this.#dbView), requestFromWire(HttpRequest.deserialize(new BinaryReader(request)), body)));
		const responseBuf = new BinaryWriter(bsatnBaseSize(moduleCtx.typespace, HttpResponse.algebraicType));
		HttpResponse.serialize(responseBuf, responseMetadata);
		return [responseBuf.getBuffer(), responseBody];
	}
};
var BINARY_WRITER = new BinaryWriter(0);
var BINARY_READER = new BinaryReader(new Uint8Array());
var HandlerContextImpl = class {
	constructor(timestamp, dbView) {
		this.timestamp = timestamp;
		this.#dbView = dbView;
	}
	#identity;
	#uuidCounter;
	#random;
	#dbView;
	http = httpClient;
	get identity() {
		return this.#identity ??= new Identity(sys.identity());
	}
	get random() {
		return this.#random ??= makeRandom(this.timestamp);
	}
	withTx(body) {
		return runWithTx((timestamp) => new ReducerCtxImpl(Identity.zero(), timestamp, null, this.#dbView()), body);
	}
	newUuidV4() {
		const bytes = this.random.fill(new Uint8Array(16));
		return Uuid.fromRandomBytesV4(bytes);
	}
	newUuidV7() {
		const bytes = this.random.fill(new Uint8Array(4));
		const counter = this.#uuidCounter ??= { value: 0 };
		return Uuid.fromCounterV7(counter, this.timestamp, bytes);
	}
};
function makeTableView(typespace, table2) {
	const table_id = sys.table_id_from_name(table2.sourceName);
	const rowType = typespace.types[table2.productTypeRef];
	if (rowType.tag !== "Product") throw "impossible";
	const serializeRow = AlgebraicType.makeSerializer(rowType, typespace);
	const deserializeRow = AlgebraicType.makeDeserializer(rowType, typespace);
	const sequences = table2.sequences.map((seq) => {
		const col = rowType.value.elements[seq.column];
		const colType = col.algebraicType;
		let sequenceTrigger;
		switch (colType.tag) {
			case "U8":
			case "I8":
			case "U16":
			case "I16":
			case "U32":
			case "I32":
				sequenceTrigger = 0;
				break;
			case "U64":
			case "I64":
			case "U128":
			case "I128":
			case "U256":
			case "I256":
				sequenceTrigger = 0n;
				break;
			default: throw new TypeError("invalid sequence type");
		}
		return {
			colName: col.name,
			sequenceTrigger,
			deserialize: AlgebraicType.makeDeserializer(colType, typespace)
		};
	});
	const hasAutoIncrement = sequences.length > 0;
	const iter = () => tableIterator(sys.datastore_table_scan_bsatn(table_id), deserializeRow);
	const integrateGeneratedColumns = hasAutoIncrement ? (row, ret_buf) => {
		BINARY_READER.reset(ret_buf);
		for (const { colName, deserialize, sequenceTrigger } of sequences) if (row[colName] === sequenceTrigger) row[colName] = deserialize(BINARY_READER);
	} : null;
	const tableMethods = {
		count: () => sys.datastore_table_row_count(table_id),
		iter,
		[Symbol.iterator]: () => iter(),
		insert: (row) => {
			const buf = LEAF_BUF;
			BINARY_WRITER.reset(buf);
			serializeRow(BINARY_WRITER, row);
			sys.datastore_insert_bsatn(table_id, buf.buffer, BINARY_WRITER.offset);
			const ret = { ...row };
			integrateGeneratedColumns?.(ret, buf.view);
			return ret;
		},
		delete: (row) => {
			const buf = LEAF_BUF;
			BINARY_WRITER.reset(buf);
			BINARY_WRITER.writeU32(1);
			serializeRow(BINARY_WRITER, row);
			return sys.datastore_delete_all_by_eq_bsatn(table_id, buf.buffer, BINARY_WRITER.offset) > 0;
		},
		clear: () => sys.datastore_clear(table_id)
	};
	const tableView = Object.assign(/* @__PURE__ */ Object.create(null), tableMethods);
	for (const indexDef of table2.indexes) {
		const accessorName = indexDef.accessorName;
		const index_id = sys.index_id_from_name(indexDef.sourceName);
		let column_ids;
		let isHashIndex = false;
		switch (indexDef.algorithm.tag) {
			case "Hash":
				isHashIndex = true;
				column_ids = indexDef.algorithm.value;
				break;
			case "BTree":
				column_ids = indexDef.algorithm.value;
				break;
			case "Direct":
				column_ids = [indexDef.algorithm.value];
				break;
		}
		const numColumns = column_ids.length;
		const columnSet = new Set(column_ids);
		const isUnique = table2.constraints.filter((x) => x.data.tag === "Unique").some((x) => columnSet.isSubsetOf(new Set(x.data.value.columns)));
		const isPrimaryKey = isUnique && column_ids.length === table2.primaryKey.length && column_ids.every((id, i) => table2.primaryKey[i] === id);
		const indexSerializers = column_ids.map((id) => AlgebraicType.makeSerializer(rowType.value.elements[id].algebraicType, typespace));
		const serializePoint = (buffer, colVal) => {
			BINARY_WRITER.reset(buffer);
			for (let i = 0; i < numColumns; i++) indexSerializers[i](BINARY_WRITER, colVal[i]);
			return BINARY_WRITER.offset;
		};
		const serializeSingleElement = numColumns === 1 ? indexSerializers[0] : null;
		const serializeSinglePoint = serializeSingleElement && ((buffer, colVal) => {
			BINARY_WRITER.reset(buffer);
			serializeSingleElement(BINARY_WRITER, colVal);
			return BINARY_WRITER.offset;
		});
		let index;
		if (isUnique && serializeSinglePoint) {
			const base = {
				find: (colVal) => {
					const buf = LEAF_BUF;
					const point_len = serializeSinglePoint(buf, colVal);
					return tableIterateOne(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
				},
				delete: (colVal) => {
					const buf = LEAF_BUF;
					const point_len = serializeSinglePoint(buf, colVal);
					return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len) > 0;
				}
			};
			if (isPrimaryKey) base.update = (row) => {
				const buf = LEAF_BUF;
				BINARY_WRITER.reset(buf);
				serializeRow(BINARY_WRITER, row);
				sys.datastore_update_bsatn(table_id, index_id, buf.buffer, BINARY_WRITER.offset);
				integrateGeneratedColumns?.(row, buf.view);
				return row;
			};
			index = base;
		} else if (isUnique) {
			const base = {
				find: (colVal) => {
					if (colVal.length !== numColumns) throw new TypeError("wrong number of elements");
					const buf = LEAF_BUF;
					const point_len = serializePoint(buf, colVal);
					return tableIterateOne(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
				},
				delete: (colVal) => {
					if (colVal.length !== numColumns) throw new TypeError("wrong number of elements");
					const buf = LEAF_BUF;
					const point_len = serializePoint(buf, colVal);
					return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len) > 0;
				}
			};
			if (isPrimaryKey) base.update = (row) => {
				const buf = LEAF_BUF;
				BINARY_WRITER.reset(buf);
				serializeRow(BINARY_WRITER, row);
				sys.datastore_update_bsatn(table_id, index_id, buf.buffer, BINARY_WRITER.offset);
				integrateGeneratedColumns?.(row, buf.view);
				return row;
			};
			index = base;
		} else if (serializeSinglePoint) {
			const serializeSingleRange = !isHashIndex ? (buffer, range) => {
				BINARY_WRITER.reset(buffer);
				const writer = BINARY_WRITER;
				const writeBound = (bound) => {
					writer.writeU8({
						included: 0,
						excluded: 1,
						unbounded: 2
					}[bound.tag]);
					if (bound.tag !== "unbounded") serializeSingleElement(writer, bound.value);
				};
				writeBound(range.from);
				const rstartLen = writer.offset;
				writeBound(range.to);
				return [
					0,
					0,
					rstartLen,
					writer.offset - rstartLen
				];
			} : null;
			const rawIndex = {
				filter: (range) => {
					const buf = LEAF_BUF;
					if (serializeSingleRange && range instanceof Range) {
						const args = serializeSingleRange(buf, range);
						return tableIterator(sys.datastore_index_scan_range_bsatn(index_id, buf.buffer, ...args), deserializeRow);
					}
					const point_len = serializeSinglePoint(buf, range);
					return tableIterator(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
				},
				delete: (range) => {
					const buf = LEAF_BUF;
					if (serializeSingleRange && range instanceof Range) {
						const args = serializeSingleRange(buf, range);
						return sys.datastore_delete_by_index_scan_range_bsatn(index_id, buf.buffer, ...args);
					}
					const point_len = serializeSinglePoint(buf, range);
					return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len);
				}
			};
			if (isHashIndex) index = rawIndex;
			else index = rawIndex;
		} else if (isHashIndex) index = {
			filter: (range) => {
				const buf = LEAF_BUF;
				const point_len = serializePoint(buf, range);
				return tableIterator(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
			},
			delete: (range) => {
				const buf = LEAF_BUF;
				const point_len = serializePoint(buf, range);
				return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len);
			}
		};
		else {
			const serializeRange = (buffer, range) => {
				if (range.length > numColumns) throw new TypeError("too many elements");
				BINARY_WRITER.reset(buffer);
				const writer = BINARY_WRITER;
				const prefix_elems = range.length - 1;
				for (let i = 0; i < prefix_elems; i++) indexSerializers[i](writer, range[i]);
				const rstartOffset = writer.offset;
				const term = range[range.length - 1];
				const serializeTerm = indexSerializers[range.length - 1];
				if (term instanceof Range) {
					const writeBound = (bound) => {
						writer.writeU8({
							included: 0,
							excluded: 1,
							unbounded: 2
						}[bound.tag]);
						if (bound.tag !== "unbounded") serializeTerm(writer, bound.value);
					};
					writeBound(term.from);
					const rstartLen = writer.offset - rstartOffset;
					writeBound(term.to);
					return [
						rstartOffset,
						prefix_elems,
						rstartLen,
						writer.offset - rstartLen
					];
				} else {
					writer.writeU8(0);
					serializeTerm(writer, term);
					return [
						rstartOffset,
						prefix_elems,
						writer.offset,
						0
					];
				}
			};
			index = {
				filter: (range) => {
					if (range.length === numColumns) {
						const buf = LEAF_BUF;
						const point_len = serializePoint(buf, range);
						return tableIterator(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
					} else {
						const buf = LEAF_BUF;
						const args = serializeRange(buf, range);
						return tableIterator(sys.datastore_index_scan_range_bsatn(index_id, buf.buffer, ...args), deserializeRow);
					}
				},
				delete: (range) => {
					if (range.length === numColumns) {
						const buf = LEAF_BUF;
						const point_len = serializePoint(buf, range);
						return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len);
					} else {
						const buf = LEAF_BUF;
						const args = serializeRange(buf, range);
						return sys.datastore_delete_by_index_scan_range_bsatn(index_id, buf.buffer, ...args);
					}
				}
			};
		}
		if (Object.hasOwn(tableView, accessorName)) freeze(Object.assign(tableView[accessorName], index));
		else tableView[accessorName] = freeze(index);
	}
	return freeze(tableView);
}
function* tableIterator(id, deserialize) {
	using iter = new IteratorHandle(id);
	const iterBuf = takeBuf();
	try {
		let amt;
		while (amt = iter.advance(iterBuf)) {
			const reader = new BinaryReader(iterBuf.view);
			while (reader.offset < amt) yield deserialize(reader);
		}
	} finally {
		returnBuf(iterBuf);
	}
}
function tableIterateOne(id, deserialize) {
	const buf = LEAF_BUF;
	if (advanceIterRaw(id, buf) !== 0) {
		BINARY_READER.reset(buf.view);
		return deserialize(BINARY_READER);
	}
	return null;
}
function advanceIterRaw(id, buf) {
	while (true) try {
		return 0 | sys.row_iter_bsatn_advance(id, buf.buffer);
	} catch (e) {
		if (e && typeof e === "object" && hasOwn(e, "__buffer_too_small__")) {
			buf.grow(e.__buffer_too_small__);
			continue;
		}
		throw e;
	}
}
var DEFAULT_BUFFER_CAPACITY = 32 * 1024 * 2;
var ITER_BUFS = [new ResizableBuffer(DEFAULT_BUFFER_CAPACITY)];
var ITER_BUF_COUNT = 1;
function takeBuf() {
	return ITER_BUF_COUNT ? ITER_BUFS[--ITER_BUF_COUNT] : new ResizableBuffer(DEFAULT_BUFFER_CAPACITY);
}
function returnBuf(buf) {
	ITER_BUFS[ITER_BUF_COUNT++] = buf;
}
var LEAF_BUF = new ResizableBuffer(DEFAULT_BUFFER_CAPACITY);
var IteratorHandle = class _IteratorHandle {
	#id;
	static #finalizationRegistry = new FinalizationRegistry(sys.row_iter_bsatn_close);
	constructor(id) {
		this.#id = id;
		_IteratorHandle.#finalizationRegistry.register(this, id, this);
	}
	/** Unregister this object with the finalization registry and return the id */
	#detach() {
		const id = this.#id;
		this.#id = -1;
		_IteratorHandle.#finalizationRegistry.unregister(this);
		return id;
	}
	/** Call `row_iter_bsatn_advance`, returning 0 if this iterator has been exhausted. */
	advance(buf) {
		if (this.#id === -1) return 0;
		const ret = advanceIterRaw(this.#id, buf);
		if (ret <= 0) this.#detach();
		return ret < 0 ? -ret : ret;
	}
	[Symbol.dispose]() {
		if (this.#id >= 0) {
			const id = this.#detach();
			sys.row_iter_bsatn_close(id);
		}
	}
};
var { freeze: freeze2 } = Object;
var requestBaseSize = bsatnBaseSize({ types: [] }, HttpRequest.algebraicType);
function fetch(url, init = {}) {
	const method = serializeMethod(init.method);
	const headers = serializeHeaders(new Headers(init.headers));
	const uri = "" + url;
	const request = freeze2({
		method,
		headers,
		timeout: init.timeout,
		uri,
		version: { tag: "Http11" }
	});
	const requestBuf = new BinaryWriter(requestBaseSize);
	HttpRequest.serialize(requestBuf, request);
	const body = init.body == null ? new Uint8Array() : typeof init.body === "string" ? init.body : new Uint8Array(init.body);
	const [responseBuf, responseBody] = sys.procedure_http_request(requestBuf.getBuffer(), body);
	const response = HttpResponse.deserialize(new BinaryReader(responseBuf));
	return SyncResponse[makeResponse](responseBody, {
		type: "basic",
		url: uri,
		status: response.code,
		statusText: (0, import_statuses.default)(response.code),
		headers: deserializeHeaders(response.headers),
		aborted: false,
		version: response.version
	});
}
freeze2(fetch);
var httpClient = freeze2({ fetch });
function makeProcedureExport(ctx, opts, params, ret, fn) {
	const name = opts?.name;
	const procedureExport = (...args) => fn(...args);
	procedureExport[exportContext] = ctx;
	procedureExport[registerExport] = (ctx2, exportName) => {
		registerProcedure(ctx2, name ?? exportName, params, ret, fn);
		ctx2.functionExports.set(procedureExport, name ?? exportName);
	};
	return procedureExport;
}
var TransactionCtxImpl = class TransactionCtx extends ReducerCtxImpl {};
function registerProcedure(ctx, exportName, params, ret, fn, opts) {
	ctx.defineFunction(exportName);
	const paramsType = { elements: Object.entries(params).map(([n, c]) => ({
		name: n,
		algebraicType: ctx.registerTypesRecursively("typeBuilder" in c ? c.typeBuilder : c).algebraicType
	})) };
	const returnType = ctx.registerTypesRecursively(ret).algebraicType;
	ctx.moduleDef.procedures.push({
		sourceName: exportName,
		params: paramsType,
		returnType,
		visibility: FunctionVisibility.ClientCallable
	});
	const { typespace } = ctx;
	ctx.procedures.push({
		fn,
		deserializeArgs: ProductType.makeDeserializer(paramsType, typespace),
		serializeReturn: AlgebraicType.makeSerializer(returnType, typespace),
		returnTypeBaseSize: bsatnBaseSize(typespace, returnType)
	});
}
function callProcedure(moduleCtx, id, sender, connectionId, timestamp, argsBuf, dbView) {
	const { fn, deserializeArgs, serializeReturn, returnTypeBaseSize } = moduleCtx.procedures[id];
	const args = deserializeArgs(new BinaryReader(argsBuf));
	const ret = callUserFunction(fn, new ProcedureCtxImpl(sender, timestamp, connectionId, dbView), args);
	const retBuf = new BinaryWriter(returnTypeBaseSize);
	serializeReturn(retBuf, ret);
	return retBuf.getBuffer();
}
var ProcedureCtxImpl = class ProcedureCtx {
	constructor(sender, timestamp, connectionId, dbView) {
		this.sender = sender;
		this.timestamp = timestamp;
		this.connectionId = connectionId;
		this.#dbView = dbView;
	}
	#identity;
	#uuidCounter;
	#random;
	#dbView;
	get databaseIdentity() {
		return this.#identity ??= new Identity(sys.identity());
	}
	get identity() {
		return this.databaseIdentity;
	}
	get random() {
		return this.#random ??= makeRandom(this.timestamp);
	}
	get http() {
		return httpClient;
	}
	withTx(body) {
		return runWithTx((timestamp) => new TransactionCtxImpl(this.sender, timestamp, this.connectionId, this.#dbView()), body);
	}
	newUuidV4() {
		const bytes = this.random.fill(new Uint8Array(16));
		return Uuid.fromRandomBytesV4(bytes);
	}
	newUuidV7() {
		const bytes = this.random.fill(new Uint8Array(4));
		const counter = this.#uuidCounter ??= { value: 0 };
		return Uuid.fromCounterV7(counter, this.timestamp, bytes);
	}
};
function makeReducerExport(ctx, opts, params, fn, lifecycle) {
	const reducerExport = (...args) => fn(...args);
	reducerExport[exportContext] = ctx;
	reducerExport[registerExport] = (ctx2, exportName) => {
		registerReducer(ctx2, exportName, params, fn, opts, lifecycle);
		ctx2.functionExports.set(reducerExport, exportName);
	};
	return reducerExport;
}
function registerReducer(ctx, exportName, params, fn, opts, lifecycle) {
	ctx.defineFunction(exportName);
	if (!(params instanceof RowBuilder)) params = new RowBuilder(params);
	if (params.typeName === void 0) params.typeName = toPascalCase(exportName);
	const ref = ctx.registerTypesRecursively(params);
	const paramsType = ctx.resolveType(ref).value;
	const isLifecycle = lifecycle != null;
	ctx.moduleDef.reducers.push({
		sourceName: exportName,
		params: paramsType,
		visibility: FunctionVisibility.ClientCallable,
		okReturnType: AlgebraicType.Product({ elements: [] }),
		errReturnType: AlgebraicType.String
	});
	if (opts?.name != null) ctx.moduleDef.explicitNames.entries.push({
		tag: "Function",
		value: {
			sourceName: exportName,
			canonicalName: opts.name
		}
	});
	if (isLifecycle) ctx.moduleDef.lifeCycleReducers.push({
		lifecycleSpec: lifecycle,
		functionName: exportName
	});
	if (!fn.name) Object.defineProperty(fn, "name", {
		value: exportName,
		writable: false
	});
	ctx.reducers.push(fn);
}
var SchemaInner = class extends ModuleContext {
	schemaType;
	existingFunctions = /* @__PURE__ */ new Set();
	existingHttpHandlers = /* @__PURE__ */ new Set();
	reducers = [];
	procedures = [];
	views = [];
	anonViews = [];
	httpHandlers = [];
	/**
	* Maps ReducerExport objects to the name of the reducer.
	* Used for resolving the reducers of scheduled tables.
	*/
	functionExports = /* @__PURE__ */ new Map();
	httpHandlerExports = /* @__PURE__ */ new Map();
	pendingSchedules = [];
	pendingHttpRoutes = [];
	constructor(getSchemaType) {
		super();
		this.schemaType = getSchemaType(this);
	}
	defineFunction(name) {
		if (this.existingFunctions.has(name)) throw new TypeError(`There is already a reducer, procedure, or view with the name '${name}'`);
		this.existingFunctions.add(name);
	}
	defineHttpHandler(name) {
		if (this.existingHttpHandlers.has(name)) throw new TypeError(`There is already an HTTP handler with the name '${name}'`);
		this.existingHttpHandlers.add(name);
	}
	resolveSchedules() {
		for (const { reducer, scheduleAtCol, tableName } of this.pendingSchedules) {
			const functionName = this.functionExports.get(reducer());
			if (functionName === void 0) {
				const msg = `Table ${tableName} defines a schedule, but it seems like the associated function was not exported.`;
				throw new TypeError(msg);
			}
			this.moduleDef.schedules.push({
				sourceName: void 0,
				tableName,
				scheduleAtCol,
				functionName
			});
		}
	}
	resolveHttpRoutes() {
		for (const route of this.pendingHttpRoutes) {
			const handlerFunction = this.httpHandlerExports.get(route.handler);
			if (handlerFunction === void 0) throw new TypeError(`HTTP route for path '${route.path}' refers to a handler that was not exported.`);
			this.moduleDef.httpRoutes.push({
				handlerFunction,
				method: route.method,
				path: route.path
			});
		}
	}
};
var Schema = class {
	#ctx;
	constructor(ctx) {
		this.#ctx = ctx;
	}
	[moduleHooks](exports) {
		const registeredSchema = this.#ctx;
		for (const [name, moduleExport] of Object.entries(exports)) {
			if (name === "default") continue;
			if (!isModuleExport(moduleExport)) throw new TypeError("exporting something that is not a spacetime export");
			checkExportContext(moduleExport, registeredSchema);
			moduleExport[registerExport](registeredSchema, name);
		}
		registeredSchema.resolveSchedules();
		registeredSchema.resolveHttpRoutes();
		return makeHooks(registeredSchema);
	}
	get schemaType() {
		return this.#ctx.schemaType;
	}
	get moduleDef() {
		return this.#ctx.moduleDef;
	}
	get typespace() {
		return this.#ctx.typespace;
	}
	reducer(...args) {
		let opts, params = {}, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2: {
				let arg1;
				[arg1, fn] = args;
				if (typeof arg1.name === "string") opts = arg1;
				else params = arg1;
				break;
			}
			case 3:
				[opts, params, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, params, fn);
	}
	init(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.Init);
	}
	clientConnected(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.OnConnect);
	}
	clientDisconnected(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.OnDisconnect);
	}
	view(opts, ret, fn) {
		return makeViewExport(this.#ctx, opts, {}, ret, fn);
	}
	anonymousView(opts, ret, fn) {
		return makeAnonViewExport(this.#ctx, opts, {}, ret, fn);
	}
	procedure(...args) {
		let opts, params = {}, ret, fn;
		switch (args.length) {
			case 2:
				[ret, fn] = args;
				break;
			case 3: {
				let arg1;
				[arg1, ret, fn] = args;
				if (typeof arg1.name === "string") opts = arg1;
				else params = arg1;
				break;
			}
			case 4:
				[opts, params, ret, fn] = args;
				break;
		}
		return makeProcedureExport(this.#ctx, opts, params, ret, fn);
	}
	httpHandler(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeHttpHandlerExport(this.#ctx, opts, fn);
	}
	httpRouter(router) {
		return makeHttpRouterExport(this.#ctx, router);
	}
	/**
	* Bundle multiple reducers, procedures, etc into one value to export.
	* The name they will be exported with is their corresponding key in the `exports` argument.
	*/
	exportGroup(exports) {
		return {
			[exportContext]: this.#ctx,
			[registerExport](ctx, _exportName) {
				for (const [exportName, moduleExport] of Object.entries(exports)) {
					checkExportContext(moduleExport, ctx);
					moduleExport[registerExport](ctx, exportName);
				}
			}
		};
	}
	clientVisibilityFilter = { sql: (filter) => ({
		[exportContext]: this.#ctx,
		[registerExport](ctx, _exportName) {
			ctx.moduleDef.rowLevelSecurity.push({ sql: filter });
		}
	}) };
};
var registerExport = Symbol("SpacetimeDB.registerExport");
var exportContext = Symbol("SpacetimeDB.exportContext");
function isModuleExport(x) {
	return (typeof x === "function" || typeof x === "object") && x !== null && registerExport in x;
}
function checkExportContext(exp, schema2) {
	if (exp[exportContext] != null && exp[exportContext] !== schema2) throw new TypeError("multiple schemas are not supported");
}
function schema(tables, moduleSettings) {
	return new Schema(new SchemaInner((ctx2) => {
		if (moduleSettings?.CASE_CONVERSION_POLICY != null) ctx2.setCaseConversionPolicy(moduleSettings.CASE_CONVERSION_POLICY);
		const tableSchemas = {};
		for (const [accName, table2] of Object.entries(tables)) {
			const tableDef = table2.tableDef(ctx2, accName);
			tableSchemas[accName] = tableToSchema(accName, table2, tableDef);
			ctx2.moduleDef.tables.push(tableDef);
			if (table2.schedule) ctx2.pendingSchedules.push({
				...table2.schedule,
				tableName: tableDef.sourceName
			});
			if (table2.tableName) ctx2.moduleDef.explicitNames.entries.push({
				tag: "Table",
				value: {
					sourceName: accName,
					canonicalName: table2.tableName
				}
			});
		}
		return { tables: tableSchemas };
	}));
}
var import_object_inspect = __toESM(require_object_inspect());
var fmtLog = (...data) => data.map((x) => typeof x === "string" ? x : (0, import_object_inspect.default)(x)).join(" ");
var console_level_error = 0;
var console_level_warn = 1;
var console_level_info = 2;
var console_level_debug = 3;
var console_level_trace = 4;
var timerMap = /* @__PURE__ */ new Map();
var console2 = {
	__proto__: {},
	[Symbol.toStringTag]: "console",
	assert: (condition = false, ...data) => {
		if (!condition) sys.console_log(console_level_error, fmtLog(...data));
	},
	clear: () => {},
	debug: (...data) => {
		sys.console_log(console_level_debug, fmtLog(...data));
	},
	error: (...data) => {
		sys.console_log(console_level_error, fmtLog(...data));
	},
	info: (...data) => {
		sys.console_log(console_level_info, fmtLog(...data));
	},
	log: (...data) => {
		sys.console_log(console_level_info, fmtLog(...data));
	},
	table: (tabularData, _properties) => {
		sys.console_log(console_level_info, fmtLog(tabularData));
	},
	trace: (...data) => {
		sys.console_log(console_level_trace, fmtLog(...data));
	},
	warn: (...data) => {
		sys.console_log(console_level_warn, fmtLog(...data));
	},
	dir: (_item, _options) => {},
	dirxml: (..._data) => {},
	count: (_label = "default") => {},
	countReset: (_label = "default") => {},
	group: (..._data) => {},
	groupCollapsed: (..._data) => {},
	groupEnd: () => {},
	time: (label = "default") => {
		if (timerMap.has(label)) {
			sys.console_log(console_level_warn, `Timer '${label}' already exists.`);
			return;
		}
		timerMap.set(label, sys.console_timer_start(label));
	},
	timeLog: (label = "default", ...data) => {
		sys.console_log(console_level_info, fmtLog(label, ...data));
	},
	timeEnd: (label = "default") => {
		const spanId = timerMap.get(label);
		if (spanId === void 0) {
			sys.console_log(console_level_warn, `Timer '${label}' does not exist.`);
			return;
		}
		sys.console_timer_end(spanId);
		timerMap.delete(label);
	},
	timeStamp: () => {},
	profile: () => {},
	profileEnd: () => {}
};
globalThis.console = console2;

//#endregion
//#region src/schema.ts
const vector2 = t.object("Vector2", {
	x: t.f32(),
	y: t.f32()
});
const entityRow = t.row({
	id: t.u32().primaryKey().autoInc(),
	position: vector2,
	mass: t.u32()
});
const circleRow = t.row({
	entity_id: t.u32().primaryKey(),
	player_id: t.u32().index("btree"),
	direction: vector2,
	magnitude: t.f32(),
	last_split_time: t.timestamp()
});
const foodRow = t.row({ entity_id: t.u32().primaryKey() });
const entity = table({ name: "entity" }, entityRow);
const circle = table({ name: "circle" }, circleRow);
const food = table({ name: "food" }, foodRow);
const unique_0_u32_u64_str_tRow = t.row({
	id: t.u32().primaryKey(),
	age: t.u64(),
	name: t.string()
});
const no_index_u32_u64_str_tRow = t.row({
	id: t.u32(),
	age: t.u64(),
	name: t.string()
});
const btree_each_column_u32_u64_str_tRow = t.row({
	id: t.u32().index("btree"),
	age: t.u64().index("btree"),
	name: t.string().index("btree")
});
const unique_0_u32_u64_u64_tRow = t.row({
	id: t.u32().primaryKey(),
	x: t.u64(),
	y: t.u64()
});
const no_index_u32_u64_u64_tRow = t.row({
	id: t.u32(),
	x: t.u64(),
	y: t.u64()
});
const btree_each_column_u32_u64_u64_tRow = t.row({
	id: t.u32().index("btree"),
	x: t.u64().index("btree"),
	y: t.u64().index("btree")
});
const unique_0_u32_u64_str = table({}, unique_0_u32_u64_str_tRow);
const no_index_u32_u64_str = table({}, no_index_u32_u64_str_tRow);
const btree_each_column_u32_u64_str = table({}, btree_each_column_u32_u64_str_tRow);
const unique_0_u32_u64_u64 = table({}, unique_0_u32_u64_u64_tRow);
const no_index_u32_u64_u64 = table({}, no_index_u32_u64_u64_tRow);
const btree_each_column_u32_u64_u64 = table({}, btree_each_column_u32_u64_u64_tRow);
const velocityRow = t.row({
	entity_id: t.u32().primaryKey(),
	x: t.f32(),
	y: t.f32(),
	z: t.f32()
});
const positionRow = t.row({
	entity_id: t.u32().primaryKey(),
	x: t.f32(),
	y: t.f32(),
	z: t.f32(),
	vx: t.f32(),
	vy: t.f32(),
	vz: t.f32()
});
const agentAction = t.enum("AgentAction", {
	Inactive: t.unit(),
	Idle: t.unit(),
	Evading: t.unit(),
	Investigating: t.unit(),
	Retreating: t.unit(),
	Fighting: t.unit()
});
const gameEnemyAiAgentStateRow = t.row({
	entity_id: t.u64().primaryKey(),
	last_move_timestamps: t.array(t.u64()),
	next_action_timestamp: t.u64(),
	action: agentAction
});
const gameTargetableStateRow = t.row({
	entity_id: t.u64().primaryKey(),
	quad: t.i64()
});
const gameLiveTargetableStateRow = t.row({
	entity_id: t.u64().unique(),
	quad: t.i64().index("btree")
});
const gameMobileEntityState = t.row({
	entity_id: t.u64().primaryKey(),
	location_x: t.i32().index("btree"),
	location_y: t.i32(),
	timestamp: t.u64()
});
const gameEnemyStateRow = t.row({
	entity_id: t.u64().primaryKey(),
	herd_id: t.i32()
});
const smallHexTile = t.object("SmallHexTile", {
	x: t.i32(),
	z: t.i32(),
	dimension: t.u32()
});
const gameHerdCacheRow = t.row({
	id: t.i32().primaryKey(),
	dimension_id: t.u32(),
	current_population: t.i32(),
	location: smallHexTile,
	max_population: t.i32(),
	spawn_eagerness: t.f32(),
	roaming_distance: t.i32()
});
const velocity = table({ name: "velocity" }, velocityRow);
const position = table({ name: "position" }, positionRow);
const gameEnemyAiAgentState = table({ name: "game_enemy_ai_agent_state" }, gameEnemyAiAgentStateRow);
const gameTargetableState = table({ name: "game_targetable_state" }, gameTargetableStateRow);
const gameLiveTargetableState = table({ name: "game_live_targetable_state" }, gameLiveTargetableStateRow);
const gameEnemyState = table({ name: "game_enemy_state" }, gameEnemyStateRow);
const gameHerdCache = table({ name: "game_herd_cache" }, gameHerdCacheRow);
const spacetimedb = schema({
	circle,
	entity,
	food,
	unique_0_u32_u64_str,
	no_index_u32_u64_str,
	btree_each_column_u32_u64_str,
	unique_0_u32_u64_u64,
	no_index_u32_u64_u64,
	btree_each_column_u32_u64_u64,
	velocity,
	position,
	gameEnemyAiAgentState,
	gameTargetableState,
	gameLiveTargetableState,
	gameEnemyState,
	gameHerdCache,
	gameMobileEntityState: table({ name: "game_mobile_entity_state" }, gameMobileEntityState)
});

//#endregion
//#region src/load.ts
function newLoad(initialLoad) {
	return {
		initialLoad,
		smallTable: initialLoad,
		numPlayers: BigInt(initialLoad),
		bigTable: initialLoad * 50,
		biggestTable: initialLoad * 100
	};
}
function blackBox(_x) {}

//#endregion
//#region src/circles.ts
function newEntity(id, x, y, mass) {
	return {
		id,
		position: {
			x,
			y
		},
		mass
	};
}
function newCircle(entity_id, player_id, x, y, magnitude, last_split_time) {
	return {
		entity_id,
		player_id,
		direction: {
			x,
			y
		},
		magnitude,
		last_split_time
	};
}
function newFood(entity_id) {
	return { entity_id };
}
function massToRadius(mass) {
	return Math.sqrt(mass);
}
function isOverlapping(entity1, entity2) {
	const entity1Radius = massToRadius(entity1.mass);
	const entity2Radius = massToRadius(entity2.mass);
	return Math.sqrt((entity1.position.x - entity2.position.x) ** 2 + (entity1.position.y - entity2.position.y) ** 2) < Math.max(entity1Radius, entity2Radius);
}
const insertBulkEntity = spacetimedb.reducer({ name: "insert_bulk_entity" }, { count: t.u32() }, (ctx, { count }) => {
	for (let id = 0; id < count; id++) ctx.db.entity.insert(newEntity(0, id, id + 5, id * 5));
	console.info(`INSERT ENTITY: ${count}`);
});
const insertBulkCircle = spacetimedb.reducer({ name: "insert_bulk_circle" }, { count: t.u32() }, (ctx, { count }) => {
	for (let id = 0; id < count; id++) ctx.db.circle.insert(newCircle(id, id, id, id + 5, id * 5, ctx.timestamp));
	console.info(`INSERT CIRCLE: ${count}`);
});
const insertBulkFood = spacetimedb.reducer({ name: "insert_bulk_food" }, { count: t.u32() }, (ctx, { count }) => {
	for (let id = 1; id <= count; id++) ctx.db.food.insert(newFood(id));
	console.info(`INSERT FOOD: ${count}`);
});
const crossJoinAll = spacetimedb.reducer({ name: "cross_join_all" }, { expected: t.u32() }, (ctx, { expected }) => {
	let count = 0;
	for (const circle of ctx.db.circle.iter()) for (const entity of ctx.db.entity.iter()) for (const food of ctx.db.food.iter()) count += 1;
	console.info(`CROSS JOIN ALL: ${expected}, processed: ${count}`);
});
const crossJoinCircleFood = spacetimedb.reducer({ name: "cross_join_circle_food" }, { expected: t.u32() }, (ctx, { expected }) => {
	let count = 0;
	for (const circle of ctx.db.circle.iter()) {
		const entityId = ctx.db.entity.id;
		const circleEntity = entityId.find(circle.entity_id);
		if (circleEntity == null) continue;
		for (const food of ctx.db.food.iter()) {
			count += 1;
			const foodEntity = entityId.find(food.entity_id);
			if (foodEntity == null) {
				JSON.stringify(circleEntity);
				throw new Error(`Entity not found: ${food.entity_id}`);
			}
			/* @__PURE__ */ blackBox(isOverlapping(circleEntity, foodEntity));
		}
	}
	console.info(`CROSS JOIN CIRCLE FOOD: ${expected}, processed: ${count}`);
});
const initGameCircles = spacetimedb.reducer({ name: "init_game_circles" }, { initial_load: t.u32() }, (ctx, { initial_load }) => {
	const load = newLoad(initial_load);
	insertBulkFood(ctx, { count: load.initialLoad });
	insertBulkEntity(ctx, { count: load.initialLoad });
	insertBulkCircle(ctx, { count: load.smallTable });
});
const runGameCircles = spacetimedb.reducer({ name: "run_game_circles" }, { initial_load: t.u32() }, (ctx, { initial_load }) => {
	const load = newLoad(initial_load);
	crossJoinCircleFood(ctx, { expected: initial_load * load.smallTable });
	crossJoinAll(ctx, { expected: initial_load * initial_load * load.smallTable });
});

//#endregion
//#region src/ia_loop.ts
function newPosition(entity_id, x, y, z) {
	return {
		entity_id,
		x,
		y,
		z,
		vx: x + 10,
		vy: y + 20,
		vz: z + 30
	};
}
function newVelocity(entity_id, x, y, z) {
	return {
		entity_id,
		x,
		y,
		z
	};
}
function momentMilliseconds() {
	return 1n;
}
function calculateHash(t) {
	return t >> 16n ^ t;
}
const insertBulkPosition = spacetimedb.reducer({ name: "insert_bulk_position" }, { count: t.u32() }, (ctx, { count }) => {
	for (let id = 0; id < count; id++) ctx.db.position.insert(newPosition(id, id, id + 5, id * 5));
	console.log(`INSERT POSITION: ${count}`);
});
const insertBulkVelocity = spacetimedb.reducer({ name: "insert_bulk_velocity" }, { count: t.u32() }, (ctx, { count }) => {
	for (let id = 0; id < count; id++) ctx.db.velocity.insert(newVelocity(id, id, id + 5, id * 5));
	console.log(`INSERT VELOCITY: ${count}`);
});
const updatePositionAll = spacetimedb.reducer({ name: "update_position_all" }, { expected: t.u32() }, (ctx, { expected }) => {
	let count = 0;
	for (const position of ctx.db.position.iter()) {
		position.x += position.vx;
		position.y += position.vy;
		position.z += position.vz;
		ctx.db.position.entity_id.update(position);
		count += 1;
	}
	console.log(`UPDATE POSITION ALL: ${expected}, processed: ${count}`);
});
const updatePositionWithVelocity = spacetimedb.reducer({ name: "update_position_with_velocity" }, { expected: t.u32() }, (ctx, { expected }) => {
	let count = 0;
	for (const velocity of ctx.db.velocity.iter()) {
		const position = ctx.db.position.entity_id.find(velocity.entity_id);
		if (position == null) continue;
		position.x += velocity.x;
		position.y += velocity.y;
		position.z += velocity.z;
		ctx.db.position.entity_id.update(position);
		count += 1;
	}
	console.log(`UPDATE POSITION BY VELOCITY: ${expected}, processed: ${count}`);
});
const insertWorld = spacetimedb.reducer({ name: "insert_world" }, { players: t.u64() }, (ctx, { players }) => {
	for (let i = 0; i < players; i++) {
		const id = i;
		const id_n = BigInt(id);
		const nextActionTimestamp = (i & 2) == 2 ? momentMilliseconds() + 2000n : momentMilliseconds();
		ctx.db.gameEnemyAiAgentState.insert({
			entity_id: id_n,
			next_action_timestamp: nextActionTimestamp,
			last_move_timestamps: [
				id_n,
				0n,
				id_n * 2n
			],
			action: { tag: "Idle" }
		});
		ctx.db.gameLiveTargetableState.insert({
			entity_id: id_n,
			quad: id_n
		});
		ctx.db.gameTargetableState.insert({
			entity_id: id_n,
			quad: id_n
		});
		ctx.db.gameMobileEntityState.insert({
			entity_id: id_n,
			location_x: id,
			location_y: id,
			timestamp: nextActionTimestamp
		});
		ctx.db.gameEnemyState.insert({
			entity_id: id_n,
			herd_id: id
		});
		ctx.db.gameHerdCache.insert({
			id,
			dimension_id: id,
			max_population: id * 4,
			spawn_eagerness: id,
			roaming_distance: id,
			location: {
				x: id,
				z: id,
				dimension: id * 2
			},
			current_population: 0
		});
	}
	console.log(`INSERT WORLD PLAYERS: ${players}`);
});
function getTargetablesNearQuad(ctx, entityId, numPlayers) {
	const result = [];
	for (let id = entityId; id < numPlayers; id++) for (const liveTargetable of ctx.db.gameLiveTargetableState.quad.filter(id)) {
		const targetable = ctx.db.gameTargetableState.entity_id.find(liveTargetable.entity_id);
		if (targetable == null) throw new Error("Identity not found");
		result.push(targetable);
	}
	return result;
}
const MAX_MOVE_TIMESTAMPS = 20;
function moveAgent(ctx, agent, agentCoord, currentTimeMs) {
	const entityId = agent.entity_id;
	const enemy = ctx.db.gameEnemyState.entity_id.find(entityId);
	if (enemy == null) throw new Error("GameEnemyState Entity ID not found");
	ctx.db.gameEnemyState.entity_id.update(enemy);
	agent.next_action_timestamp = currentTimeMs + 2000n;
	agent.last_move_timestamps.push(currentTimeMs);
	if (agent.last_move_timestamps.length > MAX_MOVE_TIMESTAMPS) agent.last_move_timestamps.splice(0, 1);
	const targetable = ctx.db.gameTargetableState.entity_id.find(entityId);
	if (targetable == null) throw new Error("GameTargetableState Entity ID not found");
	const newHash = calculateHash(targetable.quad);
	targetable.quad = newHash;
	ctx.db.gameTargetableState.entity_id.update(targetable);
	if (ctx.db.gameLiveTargetableState.entity_id.find(entityId) != null) {
		ctx.db.gameLiveTargetableState.entity_id.delete(entityId);
		ctx.db.gameLiveTargetableState.insert({
			entity_id: entityId,
			quad: newHash
		});
	}
	const mobileEntityRes = ctx.db.gameMobileEntityState.entity_id.find(entityId);
	if (mobileEntityRes == null) throw new Error("GameMobileEntityState Entity ID not found");
	const mobileEntity = {
		entity_id: entityId,
		location_x: mobileEntityRes.location_x + 1,
		location_y: mobileEntityRes.location_y + 1,
		timestamp: agent.next_action_timestamp
	};
	ctx.db.gameEnemyAiAgentState.entity_id.update(agent);
	ctx.db.gameMobileEntityState.entity_id.update(mobileEntity);
}
function agentLoop(ctx, agent, agentTargetable, surroundingAgents, currentTimeMs) {
	const entityId = agent.entity_id;
	if (ctx.db.gameMobileEntityState.entity_id.find(entityId) == null) throw new Error("GameMobileEntityState Entity ID not found");
	const agentEntity = ctx.db.gameEnemyState.entity_id.find(entityId);
	if (agentEntity == null) throw new Error("GameEnemyState Entity ID not found");
	const agentHerd = ctx.db.gameHerdCache.id.find(agentEntity.herd_id);
	if (agentHerd == null) throw new Error("GameHerdCache Entity ID not found");
	const agentHerdCoordinates = agentHerd.location;
	moveAgent(ctx, agent, agentHerdCoordinates, currentTimeMs);
}
const gameLoopEnemyIa = spacetimedb.reducer({ name: "game_loop_enemy_ia" }, { players: t.u64() }, (ctx, { players }) => {
	let count = 0;
	const currentTimeMs = momentMilliseconds();
	for (const agent of ctx.db.gameEnemyAiAgentState.iter()) {
		const agentTargetable = ctx.db.gameTargetableState.entity_id.find(agent.entity_id);
		if (agentTargetable == null) throw new Error("No TargetableState for AgentState entity");
		const surroundingAgents = getTargetablesNearQuad(ctx, agentTargetable.entity_id, players);
		agent.action = { tag: "Fighting" };
		agentLoop(ctx, agent, agentTargetable, surroundingAgents, currentTimeMs);
		count += 1;
	}
	console.log(`ENEMY IA LOOP PLAYERS: ${players}, processed: ${count}`);
});
const initGameIaLoop = spacetimedb.reducer({ name: "init_game_ia_loop" }, { initial_load: t.u32() }, (ctx, { initial_load }) => {
	const load = newLoad(initial_load);
	insertBulkPosition(ctx, { count: load.biggestTable });
	insertBulkVelocity(ctx, { count: load.bigTable });
	updatePositionAll(ctx, { expected: load.biggestTable });
	updatePositionWithVelocity(ctx, { expected: load.bigTable });
	insertWorld(ctx, { players: load.numPlayers });
});
const runGameIaLoop = spacetimedb.reducer({ name: "run_game_ia_loop" }, { initial_load: t.u32() }, (ctx, { initial_load }) => {
	gameLoopEnemyIa(ctx, { players: newLoad(initial_load).numPlayers });
});

//#endregion
//#region src/synthetic.ts
const empty = spacetimedb.reducer(() => {});
const cpu_heavy = spacetimedb.reducer(() => {
	let x = -1640531527;
	let acc = 0;
	for (let i = 0; i < 1e5; i++) {
		x = x ^ x << 13;
		x = x ^ x >> 17;
		x = x ^ x << 5;
		const base_attack = (x & 255) + 10;
		const base_defense = (x >> 8 & 255) + 5;
		const damage = base_attack * (1 + ((x >> 16 & 63) + 1) * .05) - base_defense * (.3 + base_defense / 1e3);
		acc = acc + (damage > 0 ? damage : 0);
	}
});
const insert_unique_0_u32_u64_str = spacetimedb.reducer({
	id: t.u32(),
	age: t.u64(),
	name: t.string()
}, (ctx, { id, age, name }) => {
	ctx.db.unique0U32U64Str.insert({
		id,
		name,
		age
	});
});
const insert_no_index_u32_u64_str = spacetimedb.reducer({
	id: t.u32(),
	age: t.u64(),
	name: t.string()
}, (ctx, { id, age, name }) => {
	ctx.db.noIndexU32U64Str.insert({
		id,
		name,
		age
	});
});
const insert_btree_each_column_u32_u64_str = spacetimedb.reducer({
	id: t.u32(),
	age: t.u64(),
	name: t.string()
}, (ctx, { id, age, name }) => {
	ctx.db.btreeEachColumnU32U64Str.insert({
		id,
		name,
		age
	});
});
const insert_unique_0_u32_u64_u64 = spacetimedb.reducer({
	id: t.u32(),
	x: t.u64(),
	y: t.u64()
}, (ctx, { id, x, y }) => {
	ctx.db.unique0U32U64U64.insert({
		id,
		x,
		y
	});
});
const insert_no_index_u32_u64_u64 = spacetimedb.reducer({
	id: t.u32(),
	x: t.u64(),
	y: t.u64()
}, (ctx, { id, x, y }) => {
	ctx.db.noIndexU32U64U64.insert({
		id,
		x,
		y
	});
});
const insert_btree_each_column_u32_u64_u64 = spacetimedb.reducer({
	id: t.u32(),
	x: t.u64(),
	y: t.u64()
}, (ctx, { id, x, y }) => {
	ctx.db.btreeEachColumnU32U64U64.insert({
		id,
		x,
		y
	});
});
const insert_bulk_unique_0_u32_u64_u64 = spacetimedb.reducer({ locs: t.array(unique_0_u32_u64_u64_tRow) }, (ctx, { locs }) => {
	for (const loc of locs) ctx.db.unique0U32U64U64.insert(loc);
});
const insert_bulk_no_index_u32_u64_u64 = spacetimedb.reducer({ locs: t.array(no_index_u32_u64_u64_tRow) }, (ctx, { locs }) => {
	for (const loc of locs) ctx.db.noIndexU32U64U64.insert(loc);
});
const insert_bulk_btree_each_column_u32_u64_u64 = spacetimedb.reducer({ locs: t.array(btree_each_column_u32_u64_u64_tRow) }, (ctx, { locs }) => {
	for (const loc of locs) ctx.db.btreeEachColumnU32U64U64.insert(loc);
});
const insert_bulk_unique_0_u32_u64_str = spacetimedb.reducer({ people: t.array(unique_0_u32_u64_str_tRow) }, (ctx, { people }) => {
	for (const p of people) ctx.db.unique0U32U64Str.insert(p);
});
const insert_bulk_no_index_u32_u64_str = spacetimedb.reducer({ people: t.array(no_index_u32_u64_str_tRow) }, (ctx, { people }) => {
	for (const p of people) ctx.db.noIndexU32U64Str.insert(p);
});
const insert_bulk_btree_each_column_u32_u64_str = spacetimedb.reducer({ people: t.array(btree_each_column_u32_u64_str_tRow) }, (ctx, { people }) => {
	for (const p of people) ctx.db.btreeEachColumnU32U64Str.insert(p);
});
function assert(cond) {
	if (!cond) throw new Error("assertion failed");
}
const update_bulk_unique_0_u32_u64_u64 = spacetimedb.reducer({ row_count: t.u32() }, (ctx, { row_count }) => {
	let hit = 0;
	for (const loc of ctx.db.unique0U32U64U64.iter()) {
		if (hit == row_count) break;
		hit += 1;
		ctx.db.unique0U32U64U64.id?.update({
			id: loc.id,
			x: loc.x + 1n,
			y: loc.y
		});
	}
	assert(hit == row_count);
});
const update_bulk_unique_0_u32_u64_str = spacetimedb.reducer({ row_count: t.u32() }, (ctx, { row_count }) => {
	let hit = 0;
	for (const p of ctx.db.unique0U32U64Str.iter()) {
		if (hit == row_count) break;
		hit += 1;
		ctx.db.unique0U32U64Str.id?.update({
			id: p.id,
			age: p.age + 1n,
			name: p.name
		});
	}
	assert(hit == row_count);
});
const iterate_unique_0_u32_u64_str = spacetimedb.reducer((ctx) => {
	for (const x of ctx.db.unique0U32U64Str.iter()) /* @__PURE__ */ blackBox(x);
});
const iterate_unique_0_u32_u64_u64 = spacetimedb.reducer((ctx) => {
	for (const x of ctx.db.unique0U32U64U64.iter()) /* @__PURE__ */ blackBox(x);
});
const filter_unique_0_u32_u64_str_by_id = spacetimedb.reducer({ id: t.u32() }, (ctx, { id }) => {
	/* @__PURE__ */ blackBox(ctx.db.unique0U32U64Str.id?.find(id));
});
const filter_no_index_u32_u64_str_by_id = spacetimedb.reducer({ id: t.u32() }, (ctx, { id }) => {
	for (const r of ctx.db.noIndexU32U64Str.iter()) if (r.id == id) /* @__PURE__ */ blackBox(r);
});
const filter_btree_each_column_u32_u64_str_by_id = spacetimedb.reducer({ id: t.u32() }, (ctx, { id }) => {
	const idIndex = ctx.db.btreeEachColumnU32U64Str.id;
	if (idIndex) for (const r of idIndex.filter(id)) /* @__PURE__ */ blackBox(r);
});
const filter_unique_0_u32_u64_str_by_name = spacetimedb.reducer({ name: t.string() }, (ctx, { name }) => {
	for (const r of ctx.db.unique0U32U64Str.iter()) if (r.name == name) /* @__PURE__ */ blackBox(r);
});
const filter_no_index_u32_u64_str_by_name = spacetimedb.reducer({ name: t.string() }, (ctx, { name }) => {
	for (const r of ctx.db.noIndexU32U64Str.iter()) if (r.name == name) /* @__PURE__ */ blackBox(r);
});
const filter_btree_each_column_u32_u64_str_by_name = spacetimedb.reducer({ name: t.string() }, (ctx, { name }) => {
	const nameIndex = ctx.db.btreeEachColumnU32U64Str.name;
	if (nameIndex) for (const r of nameIndex.filter(name)) /* @__PURE__ */ blackBox(r);
});
const filter_unique_0_u32_u64_u64_by_id = spacetimedb.reducer({ id: t.u32() }, (ctx, { id }) => {
	/* @__PURE__ */ blackBox(ctx.db.unique0U32U64U64.id?.find(id));
});
const filter_no_index_u32_u64_u64_by_id = spacetimedb.reducer({ id: t.u32() }, (ctx, { id }) => {
	for (const r of ctx.db.noIndexU32U64U64.iter()) if (r.id == id) /* @__PURE__ */ blackBox(r);
});
const filter_btree_each_column_u32_u64_u64_by_id = spacetimedb.reducer({ id: t.u32() }, (ctx, { id }) => {
	const idIndex = ctx.db.btreeEachColumnU32U64U64.id;
	if (idIndex) for (const r of idIndex.filter(id)) /* @__PURE__ */ blackBox(r);
});
const filter_unique_0_u32_u64_u64_by_x = spacetimedb.reducer({ x: t.u64() }, (ctx, { x }) => {
	for (const r of ctx.db.unique0U32U64U64.iter()) if (r.x == x) /* @__PURE__ */ blackBox(r);
});
const filter_no_index_u32_u64_u64_by_x = spacetimedb.reducer({ x: t.u64() }, (ctx, { x }) => {
	for (const r of ctx.db.noIndexU32U64U64.iter()) if (r.x == x) /* @__PURE__ */ blackBox(r);
});
const filter_btree_each_column_u32_u64_u64_by_x = spacetimedb.reducer({ x: t.u64() }, (ctx, { x }) => {
	const xIndex = ctx.db.btreeEachColumnU32U64U64.x;
	if (xIndex) for (const r of xIndex.filter(x)) /* @__PURE__ */ blackBox(r);
});
const filter_unique_0_u32_u64_u64_by_y = spacetimedb.reducer({ y: t.u64() }, (ctx, { y }) => {
	for (const r of ctx.db.unique0U32U64U64.iter()) if (r.y == y) /* @__PURE__ */ blackBox(r);
});
const filter_no_index_u32_u64_u64_by_y = spacetimedb.reducer({ y: t.u64() }, (ctx, { y }) => {
	for (const r of ctx.db.noIndexU32U64U64.iter()) if (r.y == y) /* @__PURE__ */ blackBox(r);
});
const filter_btree_each_column_u32_u64_u64_by_y = spacetimedb.reducer({ y: t.u64() }, (ctx, { y }) => {
	const yIndex = ctx.db.btreeEachColumnU32U64U64.y;
	if (yIndex) for (const r of yIndex.filter(y)) /* @__PURE__ */ blackBox(r);
});
const delete_unique_0_u32_u64_str_by_id = spacetimedb.reducer({ id: t.u32() }, (ctx, { id }) => {
	ctx.db.unique0U32U64Str.id?.delete(id);
});
const delete_unique_0_u32_u64_u64_by_id = spacetimedb.reducer({ id: t.u32() }, (ctx, { id }) => {
	ctx.db.unique0U32U64U64.id?.delete(id);
});
function unimplemented() {
	throw new Error("Modules currently have no interface to clear a table");
}
const clear_table_unique_0_u32_u64_str = spacetimedb.reducer(unimplemented);
const clear_table_no_index_u32_u64_str = spacetimedb.reducer(unimplemented);
const clear_table_btree_each_column_u32_u64_str = spacetimedb.reducer(unimplemented);
const clear_table_unique_0_u32_u64_u64 = spacetimedb.reducer(unimplemented);
const clear_table_no_index_u32_u64_u64 = spacetimedb.reducer(unimplemented);
const clear_table_btree_each_column_u32_u64_u64 = spacetimedb.reducer(unimplemented);
const count_unique_0_u32_u64_str = spacetimedb.reducer((ctx) => {
	const count = ctx.db.unique0U32U64Str.count();
	console.info(`COUNT: ${count}`);
});
const count_no_index_u32_u64_str = spacetimedb.reducer((ctx) => {
	const count = ctx.db.noIndexU32U64Str.count();
	console.info(`COUNT: ${count}`);
});
const count_btree_each_column_u32_u64_str = spacetimedb.reducer((ctx) => {
	const count = ctx.db.btreeEachColumnU32U64Str.count();
	console.info(`COUNT: ${count}`);
});
const count_unique_0_u32_u64_u64 = spacetimedb.reducer((ctx) => {
	const count = ctx.db.unique0U32U64U64.count();
	console.info(`COUNT: ${count}`);
});
const count_no_index_u32_u64_u64 = spacetimedb.reducer((ctx) => {
	const count = ctx.db.noIndexU32U64U64.count();
	console.info(`COUNT: ${count}`);
});
const count_btree_each_column_u32_u64_u64 = spacetimedb.reducer((ctx) => {
	const count = ctx.db.btreeEachColumnU32U64U64.count();
	console.info(`COUNT: ${count}`);
});
const fn_with_1_args = spacetimedb.reducer({ _arg: t.string() }, (ctx, { _arg }) => {
	/* @__PURE__ */ blackBox(_arg);
});
const fn_with_32_args = spacetimedb.reducer({
	_arg1: t.string(),
	_arg2: t.string(),
	_arg3: t.string(),
	_arg4: t.string(),
	_arg5: t.string(),
	_arg6: t.string(),
	_arg7: t.string(),
	_arg8: t.string(),
	_arg9: t.string(),
	_arg10: t.string(),
	_arg11: t.string(),
	_arg12: t.string(),
	_arg13: t.string(),
	_arg14: t.string(),
	_arg15: t.string(),
	_arg16: t.string(),
	_arg17: t.string(),
	_arg18: t.string(),
	_arg19: t.string(),
	_arg20: t.string(),
	_arg21: t.string(),
	_arg22: t.string(),
	_arg23: t.string(),
	_arg24: t.string(),
	_arg25: t.string(),
	_arg26: t.string(),
	_arg27: t.string(),
	_arg28: t.string(),
	_arg29: t.string(),
	_arg30: t.string(),
	_arg31: t.string(),
	_arg32: t.string()
}, (ctx, { _arg1, _arg2, _arg3, _arg4, _arg5, _arg6, _arg7, _arg8, _arg9, _arg10, _arg11, _arg12, _arg13, _arg14, _arg15, _arg16, _arg17, _arg18, _arg19, _arg20, _arg21, _arg22, _arg23, _arg24, _arg25, _arg26, _arg27, _arg28, _arg29, _arg30, _arg31, _arg32 }) => {});
const print_many_things = spacetimedb.reducer({ n: t.u32() }, (ctx, { n }) => {
	for (let i = 0; i < n; i++) console.log("hello again!");
});

//#endregion
export { clear_table_btree_each_column_u32_u64_str, clear_table_btree_each_column_u32_u64_u64, clear_table_no_index_u32_u64_str, clear_table_no_index_u32_u64_u64, clear_table_unique_0_u32_u64_str, clear_table_unique_0_u32_u64_u64, count_btree_each_column_u32_u64_str, count_btree_each_column_u32_u64_u64, count_no_index_u32_u64_str, count_no_index_u32_u64_u64, count_unique_0_u32_u64_str, count_unique_0_u32_u64_u64, cpu_heavy, crossJoinAll, crossJoinCircleFood, spacetimedb as default, delete_unique_0_u32_u64_str_by_id, delete_unique_0_u32_u64_u64_by_id, empty, filter_btree_each_column_u32_u64_str_by_id, filter_btree_each_column_u32_u64_str_by_name, filter_btree_each_column_u32_u64_u64_by_id, filter_btree_each_column_u32_u64_u64_by_x, filter_btree_each_column_u32_u64_u64_by_y, filter_no_index_u32_u64_str_by_id, filter_no_index_u32_u64_str_by_name, filter_no_index_u32_u64_u64_by_id, filter_no_index_u32_u64_u64_by_x, filter_no_index_u32_u64_u64_by_y, filter_unique_0_u32_u64_str_by_id, filter_unique_0_u32_u64_str_by_name, filter_unique_0_u32_u64_u64_by_id, filter_unique_0_u32_u64_u64_by_x, filter_unique_0_u32_u64_u64_by_y, fn_with_1_args, fn_with_32_args, gameLoopEnemyIa, initGameCircles, initGameIaLoop, insertBulkCircle, insertBulkEntity, insertBulkFood, insertBulkPosition, insertBulkVelocity, insertWorld, insert_btree_each_column_u32_u64_str, insert_btree_each_column_u32_u64_u64, insert_bulk_btree_each_column_u32_u64_str, insert_bulk_btree_each_column_u32_u64_u64, insert_bulk_no_index_u32_u64_str, insert_bulk_no_index_u32_u64_u64, insert_bulk_unique_0_u32_u64_str, insert_bulk_unique_0_u32_u64_u64, insert_no_index_u32_u64_str, insert_no_index_u32_u64_u64, insert_unique_0_u32_u64_str, insert_unique_0_u32_u64_u64, iterate_unique_0_u32_u64_str, iterate_unique_0_u32_u64_u64, print_many_things, runGameCircles, runGameIaLoop, updatePositionAll, updatePositionWithVelocity, update_bulk_unique_0_u32_u64_str, update_bulk_unique_0_u32_u64_u64 };
//# debugId=24e0d356-ca96-4352-8937-d6e8a2bc4930
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibmFtZXMiOlsiX19jcmVhdGUiLCJfX2RlZlByb3AiLCJfX2dldE93blByb3BEZXNjIiwiX19nZXRPd25Qcm9wTmFtZXMiLCJfX2dldFByb3RvT2YiLCJfX2hhc093blByb3AiLCJfX2NvbW1vbkpTIiwiX19jb3B5UHJvcHMiLCJfX3RvRVNNIiwiI2Vuc3VyZSIsIiNtb2R1bGVEZWYiLCIjcmVnaXN0ZXJDb21wb3VuZFR5cGVSZWN1cnNpdmVseSIsIiNjb21wb3VuZFR5cGVzIiwiI2JvZHkiLCIjaW5uZXIiLCIjZnJvbSIsIiN0byIsIiN1dWlkQ291bnRlciIsIiNzZW5kZXJBdXRoIiwiI2lkZW50aXR5IiwiI3JhbmRvbSIsIiNzY2hlbWEiLCIjcmVkdWNlckFyZ3NEZXNlcmlhbGl6ZXJzIiwiI2RiVmlldyIsIiNkYlZpZXdfIiwiI3JlZHVjZXJDdHgiLCIjcmVkdWNlckN0eF8iLCIjZmluYWxpemF0aW9uUmVnaXN0cnkiLCIjaWQiLCIjZGV0YWNoIiwiI2N0eCJdLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9oZWFkZXJzLXBvbHlmaWxsQDQuMC4zL25vZGVfbW9kdWxlcy9oZWFkZXJzLXBvbHlmaWxsL2xpYi9pbmRleC5tanMiLCIuLi8uLi9jcmF0ZXMvYmluZGluZ3MtdHlwZXNjcmlwdC9kaXN0L3NlcnZlci9pbmRleC5tanMiLCJzcmMvc2NoZW1hLnRzIiwic3JjL2xvYWQudHMiLCJzcmMvY2lyY2xlcy50cyIsInNyYy9pYV9sb29wLnRzIiwic3JjL3N5bnRoZXRpYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX19jcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xudmFyIF9fZGVmUHJvcCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcbnZhciBfX2dldE93blByb3BEZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbnZhciBfX2dldE93blByb3BOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzO1xudmFyIF9fZ2V0UHJvdG9PZiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbnZhciBfX2hhc093blByb3AgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIF9fY29tbW9uSlMgPSAoY2IsIG1vZCkgPT4gZnVuY3Rpb24gX19yZXF1aXJlKCkge1xuICByZXR1cm4gbW9kIHx8ICgwLCBjYltfX2dldE93blByb3BOYW1lcyhjYilbMF1dKSgobW9kID0geyBleHBvcnRzOiB7fSB9KS5leHBvcnRzLCBtb2QpLCBtb2QuZXhwb3J0cztcbn07XG52YXIgX19jb3B5UHJvcHMgPSAodG8sIGZyb20sIGV4Y2VwdCwgZGVzYykgPT4ge1xuICBpZiAoZnJvbSAmJiB0eXBlb2YgZnJvbSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgZnJvbSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZm9yIChsZXQga2V5IG9mIF9fZ2V0T3duUHJvcE5hbWVzKGZyb20pKVxuICAgICAgaWYgKCFfX2hhc093blByb3AuY2FsbCh0bywga2V5KSAmJiBrZXkgIT09IGV4Y2VwdClcbiAgICAgICAgX19kZWZQcm9wKHRvLCBrZXksIHsgZ2V0OiAoKSA9PiBmcm9tW2tleV0sIGVudW1lcmFibGU6ICEoZGVzYyA9IF9fZ2V0T3duUHJvcERlc2MoZnJvbSwga2V5KSkgfHwgZGVzYy5lbnVtZXJhYmxlIH0pO1xuICB9XG4gIHJldHVybiB0bztcbn07XG52YXIgX190b0VTTSA9IChtb2QsIGlzTm9kZU1vZGUsIHRhcmdldCkgPT4gKHRhcmdldCA9IG1vZCAhPSBudWxsID8gX19jcmVhdGUoX19nZXRQcm90b09mKG1vZCkpIDoge30sIF9fY29weVByb3BzKFxuICAvLyBJZiB0aGUgaW1wb3J0ZXIgaXMgaW4gbm9kZSBjb21wYXRpYmlsaXR5IG1vZGUgb3IgdGhpcyBpcyBub3QgYW4gRVNNXG4gIC8vIGZpbGUgdGhhdCBoYXMgYmVlbiBjb252ZXJ0ZWQgdG8gYSBDb21tb25KUyBmaWxlIHVzaW5nIGEgQmFiZWwtXG4gIC8vIGNvbXBhdGlibGUgdHJhbnNmb3JtIChpLmUuIFwiX19lc01vZHVsZVwiIGhhcyBub3QgYmVlbiBzZXQpLCB0aGVuIHNldFxuICAvLyBcImRlZmF1bHRcIiB0byB0aGUgQ29tbW9uSlMgXCJtb2R1bGUuZXhwb3J0c1wiIGZvciBub2RlIGNvbXBhdGliaWxpdHkuXG4gIGlzTm9kZU1vZGUgfHwgIW1vZCB8fCAhbW9kLl9fZXNNb2R1bGUgPyBfX2RlZlByb3AodGFyZ2V0LCBcImRlZmF1bHRcIiwgeyB2YWx1ZTogbW9kLCBlbnVtZXJhYmxlOiB0cnVlIH0pIDogdGFyZ2V0LFxuICBtb2RcbikpO1xuXG4vLyBub2RlX21vZHVsZXMvc2V0LWNvb2tpZS1wYXJzZXIvbGliL3NldC1jb29raWUuanNcbnZhciByZXF1aXJlX3NldF9jb29raWUgPSBfX2NvbW1vbkpTKHtcbiAgXCJub2RlX21vZHVsZXMvc2V0LWNvb2tpZS1wYXJzZXIvbGliL3NldC1jb29raWUuanNcIihleHBvcnRzLCBtb2R1bGUpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgZGVmYXVsdFBhcnNlT3B0aW9ucyA9IHtcbiAgICAgIGRlY29kZVZhbHVlczogdHJ1ZSxcbiAgICAgIG1hcDogZmFsc2UsXG4gICAgICBzaWxlbnQ6IGZhbHNlXG4gICAgfTtcbiAgICBmdW5jdGlvbiBpc05vbkVtcHR5U3RyaW5nKHN0cikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBzdHIgPT09IFwic3RyaW5nXCIgJiYgISFzdHIudHJpbSgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwYXJzZVN0cmluZyhzZXRDb29raWVWYWx1ZSwgb3B0aW9ucykge1xuICAgICAgdmFyIHBhcnRzID0gc2V0Q29va2llVmFsdWUuc3BsaXQoXCI7XCIpLmZpbHRlcihpc05vbkVtcHR5U3RyaW5nKTtcbiAgICAgIHZhciBuYW1lVmFsdWVQYWlyU3RyID0gcGFydHMuc2hpZnQoKTtcbiAgICAgIHZhciBwYXJzZWQgPSBwYXJzZU5hbWVWYWx1ZVBhaXIobmFtZVZhbHVlUGFpclN0cik7XG4gICAgICB2YXIgbmFtZSA9IHBhcnNlZC5uYW1lO1xuICAgICAgdmFyIHZhbHVlID0gcGFyc2VkLnZhbHVlO1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPyBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0UGFyc2VPcHRpb25zLCBvcHRpb25zKSA6IGRlZmF1bHRQYXJzZU9wdGlvbnM7XG4gICAgICB0cnkge1xuICAgICAgICB2YWx1ZSA9IG9wdGlvbnMuZGVjb2RlVmFsdWVzID8gZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSA6IHZhbHVlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgIFwic2V0LWNvb2tpZS1wYXJzZXIgZW5jb3VudGVyZWQgYW4gZXJyb3Igd2hpbGUgZGVjb2RpbmcgYSBjb29raWUgd2l0aCB2YWx1ZSAnXCIgKyB2YWx1ZSArIFwiJy4gU2V0IG9wdGlvbnMuZGVjb2RlVmFsdWVzIHRvIGZhbHNlIHRvIGRpc2FibGUgdGhpcyBmZWF0dXJlLlwiLFxuICAgICAgICAgIGVcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHZhciBjb29raWUgPSB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIHZhbHVlXG4gICAgICB9O1xuICAgICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KSB7XG4gICAgICAgIHZhciBzaWRlcyA9IHBhcnQuc3BsaXQoXCI9XCIpO1xuICAgICAgICB2YXIga2V5ID0gc2lkZXMuc2hpZnQoKS50cmltTGVmdCgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHZhciB2YWx1ZTIgPSBzaWRlcy5qb2luKFwiPVwiKTtcbiAgICAgICAgaWYgKGtleSA9PT0gXCJleHBpcmVzXCIpIHtcbiAgICAgICAgICBjb29raWUuZXhwaXJlcyA9IG5ldyBEYXRlKHZhbHVlMik7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSBcIm1heC1hZ2VcIikge1xuICAgICAgICAgIGNvb2tpZS5tYXhBZ2UgPSBwYXJzZUludCh2YWx1ZTIsIDEwKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwic2VjdXJlXCIpIHtcbiAgICAgICAgICBjb29raWUuc2VjdXJlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwiaHR0cG9ubHlcIikge1xuICAgICAgICAgIGNvb2tpZS5odHRwT25seSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSBcInNhbWVzaXRlXCIpIHtcbiAgICAgICAgICBjb29raWUuc2FtZVNpdGUgPSB2YWx1ZTI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29va2llW2tleV0gPSB2YWx1ZTI7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNvb2tpZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcGFyc2VOYW1lVmFsdWVQYWlyKG5hbWVWYWx1ZVBhaXJTdHIpIHtcbiAgICAgIHZhciBuYW1lID0gXCJcIjtcbiAgICAgIHZhciB2YWx1ZSA9IFwiXCI7XG4gICAgICB2YXIgbmFtZVZhbHVlQXJyID0gbmFtZVZhbHVlUGFpclN0ci5zcGxpdChcIj1cIik7XG4gICAgICBpZiAobmFtZVZhbHVlQXJyLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgbmFtZSA9IG5hbWVWYWx1ZUFyci5zaGlmdCgpO1xuICAgICAgICB2YWx1ZSA9IG5hbWVWYWx1ZUFyci5qb2luKFwiPVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gbmFtZVZhbHVlUGFpclN0cjtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IG5hbWUsIHZhbHVlIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyA/IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQYXJzZU9wdGlvbnMsIG9wdGlvbnMpIDogZGVmYXVsdFBhcnNlT3B0aW9ucztcbiAgICAgIGlmICghaW5wdXQpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zLm1hcCkge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpbnB1dC5oZWFkZXJzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQuaGVhZGVycy5nZXRTZXRDb29raWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIGlucHV0ID0gaW5wdXQuaGVhZGVycy5nZXRTZXRDb29raWUoKTtcbiAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5oZWFkZXJzW1wic2V0LWNvb2tpZVwiXSkge1xuICAgICAgICAgIGlucHV0ID0gaW5wdXQuaGVhZGVyc1tcInNldC1jb29raWVcIl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHNjaCA9IGlucHV0LmhlYWRlcnNbT2JqZWN0LmtleXMoaW5wdXQuaGVhZGVycykuZmluZChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gXCJzZXQtY29va2llXCI7XG4gICAgICAgICAgfSldO1xuICAgICAgICAgIGlmICghc2NoICYmIGlucHV0LmhlYWRlcnMuY29va2llICYmICFvcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICBcIldhcm5pbmc6IHNldC1jb29raWUtcGFyc2VyIGFwcGVhcnMgdG8gaGF2ZSBiZWVuIGNhbGxlZCBvbiBhIHJlcXVlc3Qgb2JqZWN0LiBJdCBpcyBkZXNpZ25lZCB0byBwYXJzZSBTZXQtQ29va2llIGhlYWRlcnMgZnJvbSByZXNwb25zZXMsIG5vdCBDb29raWUgaGVhZGVycyBmcm9tIHJlcXVlc3RzLiBTZXQgdGhlIG9wdGlvbiB7c2lsZW50OiB0cnVlfSB0byBzdXBwcmVzcyB0aGlzIHdhcm5pbmcuXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlucHV0ID0gc2NoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICAgIGlucHV0ID0gW2lucHV0XTtcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zID8gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdFBhcnNlT3B0aW9ucywgb3B0aW9ucykgOiBkZWZhdWx0UGFyc2VPcHRpb25zO1xuICAgICAgaWYgKCFvcHRpb25zLm1hcCkge1xuICAgICAgICByZXR1cm4gaW5wdXQuZmlsdGVyKGlzTm9uRW1wdHlTdHJpbmcpLm1hcChmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgICByZXR1cm4gcGFyc2VTdHJpbmcoc3RyLCBvcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgY29va2llcyA9IHt9O1xuICAgICAgICByZXR1cm4gaW5wdXQuZmlsdGVyKGlzTm9uRW1wdHlTdHJpbmcpLnJlZHVjZShmdW5jdGlvbihjb29raWVzMiwgc3RyKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IHBhcnNlU3RyaW5nKHN0ciwgb3B0aW9ucyk7XG4gICAgICAgICAgY29va2llczJbY29va2llLm5hbWVdID0gY29va2llO1xuICAgICAgICAgIHJldHVybiBjb29raWVzMjtcbiAgICAgICAgfSwgY29va2llcyk7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNwbGl0Q29va2llc1N0cmluZzIoY29va2llc1N0cmluZykge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29va2llc1N0cmluZykpIHtcbiAgICAgICAgcmV0dXJuIGNvb2tpZXNTdHJpbmc7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGNvb2tpZXNTdHJpbmcgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgdmFyIGNvb2tpZXNTdHJpbmdzID0gW107XG4gICAgICB2YXIgcG9zID0gMDtcbiAgICAgIHZhciBzdGFydDtcbiAgICAgIHZhciBjaDtcbiAgICAgIHZhciBsYXN0Q29tbWE7XG4gICAgICB2YXIgbmV4dFN0YXJ0O1xuICAgICAgdmFyIGNvb2tpZXNTZXBhcmF0b3JGb3VuZDtcbiAgICAgIGZ1bmN0aW9uIHNraXBXaGl0ZXNwYWNlKCkge1xuICAgICAgICB3aGlsZSAocG9zIDwgY29va2llc1N0cmluZy5sZW5ndGggJiYgL1xccy8udGVzdChjb29raWVzU3RyaW5nLmNoYXJBdChwb3MpKSkge1xuICAgICAgICAgIHBvcyArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG5vdFNwZWNpYWxDaGFyKCkge1xuICAgICAgICBjaCA9IGNvb2tpZXNTdHJpbmcuY2hhckF0KHBvcyk7XG4gICAgICAgIHJldHVybiBjaCAhPT0gXCI9XCIgJiYgY2ggIT09IFwiO1wiICYmIGNoICE9PSBcIixcIjtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aCkge1xuICAgICAgICBzdGFydCA9IHBvcztcbiAgICAgICAgY29va2llc1NlcGFyYXRvckZvdW5kID0gZmFsc2U7XG4gICAgICAgIHdoaWxlIChza2lwV2hpdGVzcGFjZSgpKSB7XG4gICAgICAgICAgY2ggPSBjb29raWVzU3RyaW5nLmNoYXJBdChwb3MpO1xuICAgICAgICAgIGlmIChjaCA9PT0gXCIsXCIpIHtcbiAgICAgICAgICAgIGxhc3RDb21tYSA9IHBvcztcbiAgICAgICAgICAgIHBvcyArPSAxO1xuICAgICAgICAgICAgc2tpcFdoaXRlc3BhY2UoKTtcbiAgICAgICAgICAgIG5leHRTdGFydCA9IHBvcztcbiAgICAgICAgICAgIHdoaWxlIChwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aCAmJiBub3RTcGVjaWFsQ2hhcigpKSB7XG4gICAgICAgICAgICAgIHBvcyArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoICYmIGNvb2tpZXNTdHJpbmcuY2hhckF0KHBvcykgPT09IFwiPVwiKSB7XG4gICAgICAgICAgICAgIGNvb2tpZXNTZXBhcmF0b3JGb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgIHBvcyA9IG5leHRTdGFydDtcbiAgICAgICAgICAgICAgY29va2llc1N0cmluZ3MucHVzaChjb29raWVzU3RyaW5nLnN1YnN0cmluZyhzdGFydCwgbGFzdENvbW1hKSk7XG4gICAgICAgICAgICAgIHN0YXJ0ID0gcG9zO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcG9zID0gbGFzdENvbW1hICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghY29va2llc1NlcGFyYXRvckZvdW5kIHx8IHBvcyA+PSBjb29raWVzU3RyaW5nLmxlbmd0aCkge1xuICAgICAgICAgIGNvb2tpZXNTdHJpbmdzLnB1c2goY29va2llc1N0cmluZy5zdWJzdHJpbmcoc3RhcnQsIGNvb2tpZXNTdHJpbmcubGVuZ3RoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjb29raWVzU3RyaW5ncztcbiAgICB9XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBwYXJzZTtcbiAgICBtb2R1bGUuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xuICAgIG1vZHVsZS5leHBvcnRzLnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG4gICAgbW9kdWxlLmV4cG9ydHMuc3BsaXRDb29raWVzU3RyaW5nID0gc3BsaXRDb29raWVzU3RyaW5nMjtcbiAgfVxufSk7XG5cbi8vIHNyYy9IZWFkZXJzLnRzXG52YXIgaW1wb3J0X3NldF9jb29raWVfcGFyc2VyID0gX190b0VTTShyZXF1aXJlX3NldF9jb29raWUoKSk7XG5cbi8vIHNyYy91dGlscy9ub3JtYWxpemVIZWFkZXJOYW1lLnRzXG52YXIgSEVBREVSU19JTlZBTElEX0NIQVJBQ1RFUlMgPSAvW15hLXowLTlcXC0jJCUmJyorLl5fYHx+XS9pO1xuZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKSB7XG4gIGlmIChIRUFERVJTX0lOVkFMSURfQ0hBUkFDVEVSUy50ZXN0KG5hbWUpIHx8IG5hbWUudHJpbSgpID09PSBcIlwiKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lXCIpO1xuICB9XG4gIHJldHVybiBuYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xufVxuXG4vLyBzcmMvdXRpbHMvbm9ybWFsaXplSGVhZGVyVmFsdWUudHNcbnZhciBjaGFyQ29kZXNUb1JlbW92ZSA9IFtcbiAgU3RyaW5nLmZyb21DaGFyQ29kZSgxMCksXG4gIFN0cmluZy5mcm9tQ2hhckNvZGUoMTMpLFxuICBTdHJpbmcuZnJvbUNoYXJDb2RlKDkpLFxuICBTdHJpbmcuZnJvbUNoYXJDb2RlKDMyKVxuXTtcbnZhciBIRUFERVJfVkFMVUVfUkVNT1ZFX1JFR0VYUCA9IG5ldyBSZWdFeHAoXG4gIGAoXlske2NoYXJDb2Rlc1RvUmVtb3ZlLmpvaW4oXCJcIil9XXwkWyR7Y2hhckNvZGVzVG9SZW1vdmUuam9pbihcIlwiKX1dKWAsXG4gIFwiZ1wiXG4pO1xuZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyVmFsdWUodmFsdWUpIHtcbiAgY29uc3QgbmV4dFZhbHVlID0gdmFsdWUucmVwbGFjZShIRUFERVJfVkFMVUVfUkVNT1ZFX1JFR0VYUCwgXCJcIik7XG4gIHJldHVybiBuZXh0VmFsdWU7XG59XG5cbi8vIHNyYy91dGlscy9pc1ZhbGlkSGVhZGVyTmFtZS50c1xuZnVuY3Rpb24gaXNWYWxpZEhlYWRlck5hbWUodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjaGFyYWN0ZXIgPSB2YWx1ZS5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChjaGFyYWN0ZXIgPiAxMjcgfHwgIWlzVG9rZW4oY2hhcmFjdGVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGlzVG9rZW4odmFsdWUpIHtcbiAgcmV0dXJuICFbXG4gICAgMTI3LFxuICAgIDMyLFxuICAgIFwiKFwiLFxuICAgIFwiKVwiLFxuICAgIFwiPFwiLFxuICAgIFwiPlwiLFxuICAgIFwiQFwiLFxuICAgIFwiLFwiLFxuICAgIFwiO1wiLFxuICAgIFwiOlwiLFxuICAgIFwiXFxcXFwiLFxuICAgICdcIicsXG4gICAgXCIvXCIsXG4gICAgXCJbXCIsXG4gICAgXCJdXCIsXG4gICAgXCI/XCIsXG4gICAgXCI9XCIsXG4gICAgXCJ7XCIsXG4gICAgXCJ9XCJcbiAgXS5pbmNsdWRlcyh2YWx1ZSk7XG59XG5cbi8vIHNyYy91dGlscy9pc1ZhbGlkSGVhZGVyVmFsdWUudHNcbmZ1bmN0aW9uIGlzVmFsaWRIZWFkZXJWYWx1ZSh2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWx1ZS50cmltKCkgIT09IHZhbHVlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjaGFyYWN0ZXIgPSB2YWx1ZS5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChcbiAgICAgIC8vIE5VTC5cbiAgICAgIGNoYXJhY3RlciA9PT0gMCB8fCAvLyBIVFRQIG5ld2xpbmUgYnl0ZXMuXG4gICAgICBjaGFyYWN0ZXIgPT09IDEwIHx8IGNoYXJhY3RlciA9PT0gMTNcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIHNyYy9IZWFkZXJzLnRzXG52YXIgTk9STUFMSVpFRF9IRUFERVJTID0gU3ltYm9sKFwibm9ybWFsaXplZEhlYWRlcnNcIik7XG52YXIgUkFXX0hFQURFUl9OQU1FUyA9IFN5bWJvbChcInJhd0hlYWRlck5hbWVzXCIpO1xudmFyIEhFQURFUl9WQUxVRV9ERUxJTUlURVIgPSBcIiwgXCI7XG52YXIgX2EsIF9iLCBfYztcbnZhciBIZWFkZXJzID0gY2xhc3MgX0hlYWRlcnMge1xuICBjb25zdHJ1Y3Rvcihpbml0KSB7XG4gICAgLy8gTm9ybWFsaXplZCBoZWFkZXIge1wibmFtZVwiOlwiYSwgYlwifSBzdG9yYWdlLlxuICAgIHRoaXNbX2FdID0ge307XG4gICAgLy8gS2VlcHMgdGhlIG1hcHBpbmcgYmV0d2VlbiB0aGUgcmF3IGhlYWRlciBuYW1lXG4gICAgLy8gYW5kIHRoZSBub3JtYWxpemVkIGhlYWRlciBuYW1lIHRvIGVhc2UgdGhlIGxvb2t1cC5cbiAgICB0aGlzW19iXSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpc1tfY10gPSBcIkhlYWRlcnNcIjtcbiAgICBpZiAoW1wiSGVhZGVyc1wiLCBcIkhlYWRlcnNQb2x5ZmlsbFwiXS5pbmNsdWRlcyhpbml0Py5jb25zdHJ1Y3Rvci5uYW1lKSB8fCBpbml0IGluc3RhbmNlb2YgX0hlYWRlcnMgfHwgdHlwZW9mIGdsb2JhbFRoaXMuSGVhZGVycyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBpbml0IGluc3RhbmNlb2YgZ2xvYmFsVGhpcy5IZWFkZXJzKSB7XG4gICAgICBjb25zdCBpbml0aWFsSGVhZGVycyA9IGluaXQ7XG4gICAgICBpbml0aWFsSGVhZGVycy5mb3JFYWNoKCh2YWx1ZSwgbmFtZSkgPT4ge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaW5pdCkpIHtcbiAgICAgIGluaXQuZm9yRWFjaCgoW25hbWUsIHZhbHVlXSkgPT4ge1xuICAgICAgICB0aGlzLmFwcGVuZChcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUuam9pbihIRUFERVJfVkFMVUVfREVMSU1JVEVSKSA6IHZhbHVlXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGluaXQpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGluaXQpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBpbml0W25hbWVdO1xuICAgICAgICB0aGlzLmFwcGVuZChcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUuam9pbihIRUFERVJfVkFMVUVfREVMSU1JVEVSKSA6IHZhbHVlXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgWyhfYSA9IE5PUk1BTElaRURfSEVBREVSUywgX2IgPSBSQVdfSEVBREVSX05BTUVTLCBfYyA9IFN5bWJvbC50b1N0cmluZ1RhZywgU3ltYm9sLml0ZXJhdG9yKV0oKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllcygpO1xuICB9XG4gICprZXlzKCkge1xuICAgIGZvciAoY29uc3QgW25hbWVdIG9mIHRoaXMuZW50cmllcygpKSB7XG4gICAgICB5aWVsZCBuYW1lO1xuICAgIH1cbiAgfVxuICAqdmFsdWVzKCkge1xuICAgIGZvciAoY29uc3QgWywgdmFsdWVdIG9mIHRoaXMuZW50cmllcygpKSB7XG4gICAgICB5aWVsZCB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgKmVudHJpZXMoKSB7XG4gICAgbGV0IHNvcnRlZEtleXMgPSBPYmplY3Qua2V5cyh0aGlzW05PUk1BTElaRURfSEVBREVSU10pLnNvcnQoXG4gICAgICAoYSwgYikgPT4gYS5sb2NhbGVDb21wYXJlKGIpXG4gICAgKTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2Ygc29ydGVkS2V5cykge1xuICAgICAgaWYgKG5hbWUgPT09IFwic2V0LWNvb2tpZVwiKSB7XG4gICAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdGhpcy5nZXRTZXRDb29raWUoKSkge1xuICAgICAgICAgIHlpZWxkIFtuYW1lLCB2YWx1ZV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHlpZWxkIFtuYW1lLCB0aGlzLmdldChuYW1lKV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBzdGF0aW5nIHdoZXRoZXIgYSBgSGVhZGVyc2Agb2JqZWN0IGNvbnRhaW5zIGEgY2VydGFpbiBoZWFkZXIuXG4gICAqL1xuICBoYXMobmFtZSkge1xuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgaGVhZGVyIG5hbWUgXCIke25hbWV9XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNbTk9STUFMSVpFRF9IRUFERVJTXS5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVIZWFkZXJOYW1lKG5hbWUpKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIGBCeXRlU3RyaW5nYCBzZXF1ZW5jZSBvZiBhbGwgdGhlIHZhbHVlcyBvZiBhIGhlYWRlciB3aXRoIGEgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIGdldChuYW1lKSB7XG4gICAgaWYgKCFpc1ZhbGlkSGVhZGVyTmFtZShuYW1lKSkge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKGBJbnZhbGlkIGhlYWRlciBuYW1lIFwiJHtuYW1lfVwiYCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzW05PUk1BTElaRURfSEVBREVSU11bbm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKV0gPz8gbnVsbDtcbiAgfVxuICAvKipcbiAgICogU2V0cyBhIG5ldyB2YWx1ZSBmb3IgYW4gZXhpc3RpbmcgaGVhZGVyIGluc2lkZSBhIGBIZWFkZXJzYCBvYmplY3QsIG9yIGFkZHMgdGhlIGhlYWRlciBpZiBpdCBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0LlxuICAgKi9cbiAgc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgaWYgKCFpc1ZhbGlkSGVhZGVyTmFtZShuYW1lKSB8fCAhaXNWYWxpZEhlYWRlclZhbHVlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBub3JtYWxpemVkTmFtZSA9IG5vcm1hbGl6ZUhlYWRlck5hbWUobmFtZSk7XG4gICAgY29uc3Qgbm9ybWFsaXplZFZhbHVlID0gbm9ybWFsaXplSGVhZGVyVmFsdWUodmFsdWUpO1xuICAgIHRoaXNbTk9STUFMSVpFRF9IRUFERVJTXVtub3JtYWxpemVkTmFtZV0gPSBub3JtYWxpemVIZWFkZXJWYWx1ZShub3JtYWxpemVkVmFsdWUpO1xuICAgIHRoaXNbUkFXX0hFQURFUl9OQU1FU10uc2V0KG5vcm1hbGl6ZWROYW1lLCBuYW1lKTtcbiAgfVxuICAvKipcbiAgICogQXBwZW5kcyBhIG5ldyB2YWx1ZSBvbnRvIGFuIGV4aXN0aW5nIGhlYWRlciBpbnNpZGUgYSBgSGVhZGVyc2Agb2JqZWN0LCBvciBhZGRzIHRoZSBoZWFkZXIgaWYgaXQgZG9lcyBub3QgYWxyZWFkeSBleGlzdC5cbiAgICovXG4gIGFwcGVuZChuYW1lLCB2YWx1ZSkge1xuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkgfHwgIWlzVmFsaWRIZWFkZXJWYWx1ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemVIZWFkZXJOYW1lKG5hbWUpO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRWYWx1ZSA9IG5vcm1hbGl6ZUhlYWRlclZhbHVlKHZhbHVlKTtcbiAgICBsZXQgcmVzb2x2ZWRWYWx1ZSA9IHRoaXMuaGFzKG5vcm1hbGl6ZWROYW1lKSA/IGAke3RoaXMuZ2V0KG5vcm1hbGl6ZWROYW1lKX0sICR7bm9ybWFsaXplZFZhbHVlfWAgOiBub3JtYWxpemVkVmFsdWU7XG4gICAgdGhpcy5zZXQobmFtZSwgcmVzb2x2ZWRWYWx1ZSk7XG4gIH1cbiAgLyoqXG4gICAqIERlbGV0ZXMgYSBoZWFkZXIgZnJvbSB0aGUgYEhlYWRlcnNgIG9iamVjdC5cbiAgICovXG4gIGRlbGV0ZShuYW1lKSB7XG4gICAgaWYgKCFpc1ZhbGlkSGVhZGVyTmFtZShuYW1lKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaGFzKG5hbWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5vcm1hbGl6ZWROYW1lID0gbm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKTtcbiAgICBkZWxldGUgdGhpc1tOT1JNQUxJWkVEX0hFQURFUlNdW25vcm1hbGl6ZWROYW1lXTtcbiAgICB0aGlzW1JBV19IRUFERVJfTkFNRVNdLmRlbGV0ZShub3JtYWxpemVkTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqIFRyYXZlcnNlcyB0aGUgYEhlYWRlcnNgIG9iamVjdCxcbiAgICogY2FsbGluZyB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGVhY2ggaGVhZGVyLlxuICAgKi9cbiAgZm9yRWFjaChjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiB0aGlzLmVudHJpZXMoKSkge1xuICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgbmFtZSwgdGhpcyk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIHZhbHVlc1xuICAgKiBvZiBhbGwgU2V0LUNvb2tpZSBoZWFkZXJzIGFzc29jaWF0ZWRcbiAgICogd2l0aCBhIHJlc3BvbnNlXG4gICAqL1xuICBnZXRTZXRDb29raWUoKSB7XG4gICAgY29uc3Qgc2V0Q29va2llSGVhZGVyID0gdGhpcy5nZXQoXCJzZXQtY29va2llXCIpO1xuICAgIGlmIChzZXRDb29raWVIZWFkZXIgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgaWYgKHNldENvb2tpZUhlYWRlciA9PT0gXCJcIikge1xuICAgICAgcmV0dXJuIFtcIlwiXTtcbiAgICB9XG4gICAgcmV0dXJuICgwLCBpbXBvcnRfc2V0X2Nvb2tpZV9wYXJzZXIuc3BsaXRDb29raWVzU3RyaW5nKShzZXRDb29raWVIZWFkZXIpO1xuICB9XG59O1xuXG4vLyBzcmMvZ2V0UmF3SGVhZGVycy50c1xuZnVuY3Rpb24gZ2V0UmF3SGVhZGVycyhoZWFkZXJzKSB7XG4gIGNvbnN0IHJhd0hlYWRlcnMgPSB7fTtcbiAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIGhlYWRlcnMuZW50cmllcygpKSB7XG4gICAgcmF3SGVhZGVyc1toZWFkZXJzW1JBV19IRUFERVJfTkFNRVNdLmdldChuYW1lKV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gcmF3SGVhZGVycztcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9oZWFkZXJzVG9MaXN0LnRzXG5mdW5jdGlvbiBoZWFkZXJzVG9MaXN0KGhlYWRlcnMpIHtcbiAgY29uc3QgaGVhZGVyc0xpc3QgPSBbXTtcbiAgaGVhZGVycy5mb3JFYWNoKCh2YWx1ZSwgbmFtZSkgPT4ge1xuICAgIGNvbnN0IHJlc29sdmVkVmFsdWUgPSB2YWx1ZS5pbmNsdWRlcyhcIixcIikgPyB2YWx1ZS5zcGxpdChcIixcIikubWFwKCh2YWx1ZTIpID0+IHZhbHVlMi50cmltKCkpIDogdmFsdWU7XG4gICAgaGVhZGVyc0xpc3QucHVzaChbbmFtZSwgcmVzb2x2ZWRWYWx1ZV0pO1xuICB9KTtcbiAgcmV0dXJuIGhlYWRlcnNMaXN0O1xufVxuXG4vLyBzcmMvdHJhbnNmb3JtZXJzL2hlYWRlcnNUb1N0cmluZy50c1xuZnVuY3Rpb24gaGVhZGVyc1RvU3RyaW5nKGhlYWRlcnMpIHtcbiAgY29uc3QgbGlzdCA9IGhlYWRlcnNUb0xpc3QoaGVhZGVycyk7XG4gIGNvbnN0IGxpbmVzID0gbGlzdC5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+IHtcbiAgICBjb25zdCB2YWx1ZXMgPSBbXS5jb25jYXQodmFsdWUpO1xuICAgIHJldHVybiBgJHtuYW1lfTogJHt2YWx1ZXMuam9pbihcIiwgXCIpfWA7XG4gIH0pO1xuICByZXR1cm4gbGluZXMuam9pbihcIlxcclxcblwiKTtcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9oZWFkZXJzVG9PYmplY3QudHNcbnZhciBzaW5nbGVWYWx1ZUhlYWRlcnMgPSBbXCJ1c2VyLWFnZW50XCJdO1xuZnVuY3Rpb24gaGVhZGVyc1RvT2JqZWN0KGhlYWRlcnMpIHtcbiAgY29uc3QgaGVhZGVyc09iamVjdCA9IHt9O1xuICBoZWFkZXJzLmZvckVhY2goKHZhbHVlLCBuYW1lKSA9PiB7XG4gICAgY29uc3QgaXNNdWx0aVZhbHVlID0gIXNpbmdsZVZhbHVlSGVhZGVycy5pbmNsdWRlcyhuYW1lLnRvTG93ZXJDYXNlKCkpICYmIHZhbHVlLmluY2x1ZGVzKFwiLFwiKTtcbiAgICBoZWFkZXJzT2JqZWN0W25hbWVdID0gaXNNdWx0aVZhbHVlID8gdmFsdWUuc3BsaXQoXCIsXCIpLm1hcCgocykgPT4gcy50cmltKCkpIDogdmFsdWU7XG4gIH0pO1xuICByZXR1cm4gaGVhZGVyc09iamVjdDtcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9zdHJpbmdUb0hlYWRlcnMudHNcbmZ1bmN0aW9uIHN0cmluZ1RvSGVhZGVycyhzdHIpIHtcbiAgY29uc3QgbGluZXMgPSBzdHIudHJpbSgpLnNwbGl0KC9bXFxyXFxuXSsvKTtcbiAgcmV0dXJuIGxpbmVzLnJlZHVjZSgoaGVhZGVycywgbGluZSkgPT4ge1xuICAgIGlmIChsaW5lLnRyaW0oKSA9PT0gXCJcIikge1xuICAgICAgcmV0dXJuIGhlYWRlcnM7XG4gICAgfVxuICAgIGNvbnN0IHBhcnRzID0gbGluZS5zcGxpdChcIjogXCIpO1xuICAgIGNvbnN0IG5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuICAgIGNvbnN0IHZhbHVlID0gcGFydHMuam9pbihcIjogXCIpO1xuICAgIGhlYWRlcnMuYXBwZW5kKG5hbWUsIHZhbHVlKTtcbiAgICByZXR1cm4gaGVhZGVycztcbiAgfSwgbmV3IEhlYWRlcnMoKSk7XG59XG5cbi8vIHNyYy90cmFuc2Zvcm1lcnMvbGlzdFRvSGVhZGVycy50c1xuZnVuY3Rpb24gbGlzdFRvSGVhZGVycyhsaXN0KSB7XG4gIGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xuICBsaXN0LmZvckVhY2goKFtuYW1lLCB2YWx1ZV0pID0+IHtcbiAgICBjb25zdCB2YWx1ZXMgPSBbXS5jb25jYXQodmFsdWUpO1xuICAgIHZhbHVlcy5mb3JFYWNoKCh2YWx1ZTIpID0+IHtcbiAgICAgIGhlYWRlcnMuYXBwZW5kKG5hbWUsIHZhbHVlMik7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gaGVhZGVycztcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9yZWR1Y2VIZWFkZXJzT2JqZWN0LnRzXG5mdW5jdGlvbiByZWR1Y2VIZWFkZXJzT2JqZWN0KGhlYWRlcnMsIHJlZHVjZXIsIGluaXRpYWxTdGF0ZSkge1xuICByZXR1cm4gT2JqZWN0LmtleXMoaGVhZGVycykucmVkdWNlKChuZXh0SGVhZGVycywgbmFtZSkgPT4ge1xuICAgIHJldHVybiByZWR1Y2VyKG5leHRIZWFkZXJzLCBuYW1lLCBoZWFkZXJzW25hbWVdKTtcbiAgfSwgaW5pdGlhbFN0YXRlKTtcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9vYmplY3RUb0hlYWRlcnMudHNcbmZ1bmN0aW9uIG9iamVjdFRvSGVhZGVycyhoZWFkZXJzT2JqZWN0KSB7XG4gIHJldHVybiByZWR1Y2VIZWFkZXJzT2JqZWN0KFxuICAgIGhlYWRlcnNPYmplY3QsXG4gICAgKGhlYWRlcnMsIG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZXMgPSBbXS5jb25jYXQodmFsdWUpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgIHZhbHVlcy5mb3JFYWNoKCh2YWx1ZTIpID0+IHtcbiAgICAgICAgaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUyKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGhlYWRlcnM7XG4gICAgfSxcbiAgICBuZXcgSGVhZGVycygpXG4gICk7XG59XG5cbi8vIHNyYy90cmFuc2Zvcm1lcnMvZmxhdHRlbkhlYWRlcnNMaXN0LnRzXG5mdW5jdGlvbiBmbGF0dGVuSGVhZGVyc0xpc3QobGlzdCkge1xuICByZXR1cm4gbGlzdC5tYXAoKFtuYW1lLCB2YWx1ZXNdKSA9PiB7XG4gICAgcmV0dXJuIFtuYW1lLCBbXS5jb25jYXQodmFsdWVzKS5qb2luKFwiLCBcIildO1xuICB9KTtcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9mbGF0dGVuSGVhZGVyc09iamVjdC50c1xuZnVuY3Rpb24gZmxhdHRlbkhlYWRlcnNPYmplY3QoaGVhZGVyc09iamVjdCkge1xuICByZXR1cm4gcmVkdWNlSGVhZGVyc09iamVjdChcbiAgICBoZWFkZXJzT2JqZWN0LFxuICAgIChoZWFkZXJzLCBuYW1lLCB2YWx1ZSkgPT4ge1xuICAgICAgaGVhZGVyc1tuYW1lXSA9IFtdLmNvbmNhdCh2YWx1ZSkuam9pbihcIiwgXCIpO1xuICAgICAgcmV0dXJuIGhlYWRlcnM7XG4gICAgfSxcbiAgICB7fVxuICApO1xufVxuZXhwb3J0IHtcbiAgSGVhZGVycyxcbiAgZmxhdHRlbkhlYWRlcnNMaXN0LFxuICBmbGF0dGVuSGVhZGVyc09iamVjdCxcbiAgZ2V0UmF3SGVhZGVycyxcbiAgaGVhZGVyc1RvTGlzdCxcbiAgaGVhZGVyc1RvT2JqZWN0LFxuICBoZWFkZXJzVG9TdHJpbmcsXG4gIGxpc3RUb0hlYWRlcnMsXG4gIG9iamVjdFRvSGVhZGVycyxcbiAgcmVkdWNlSGVhZGVyc09iamVjdCxcbiAgc3RyaW5nVG9IZWFkZXJzXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcCIsImltcG9ydCAqIGFzIF9zeXNjYWxsczJfMCBmcm9tICdzcGFjZXRpbWU6c3lzQDIuMCc7XG5pbXBvcnQgeyBtb2R1bGVIb29rcyB9IGZyb20gJ3NwYWNldGltZTpzeXNAMi4wJztcbmltcG9ydCB7IEhlYWRlcnMsIGhlYWRlcnNUb0xpc3QgfSBmcm9tICdoZWFkZXJzLXBvbHlmaWxsJztcbmV4cG9ydCB7IEhlYWRlcnMgfSBmcm9tICdoZWFkZXJzLXBvbHlmaWxsJztcbmltcG9ydCAqIGFzIF9zeXNjYWxsczJfMSBmcm9tICdzcGFjZXRpbWU6c3lzQDIuMSc7XG5cbnR5cGVvZiBnbG9iYWxUaGlzIT09XCJ1bmRlZmluZWRcIiYmKChnbG9iYWxUaGlzLmdsb2JhbD1nbG9iYWxUaGlzLmdsb2JhbHx8Z2xvYmFsVGhpcyksKGdsb2JhbFRoaXMud2luZG93PWdsb2JhbFRoaXMud2luZG93fHxnbG9iYWxUaGlzKSk7XG52YXIgX19jcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xudmFyIF9fZGVmUHJvcCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcbnZhciBfX2dldE93blByb3BEZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbnZhciBfX2dldE93blByb3BOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzO1xudmFyIF9fZ2V0UHJvdG9PZiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbnZhciBfX2hhc093blByb3AgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIF9fZXNtID0gKGZuLCByZXMpID0+IGZ1bmN0aW9uIF9faW5pdCgpIHtcbiAgcmV0dXJuIGZuICYmIChyZXMgPSAoMCwgZm5bX19nZXRPd25Qcm9wTmFtZXMoZm4pWzBdXSkoZm4gPSAwKSksIHJlcztcbn07XG52YXIgX19jb21tb25KUyA9IChjYiwgbW9kKSA9PiBmdW5jdGlvbiBfX3JlcXVpcmUoKSB7XG4gIHJldHVybiBtb2QgfHwgKDAsIGNiW19fZ2V0T3duUHJvcE5hbWVzKGNiKVswXV0pKChtb2QgPSB7IGV4cG9ydHM6IHt9IH0pLmV4cG9ydHMsIG1vZCksIG1vZC5leHBvcnRzO1xufTtcbnZhciBfX2V4cG9ydCA9ICh0YXJnZXQsIGFsbCkgPT4ge1xuICBmb3IgKHZhciBuYW1lIGluIGFsbClcbiAgICBfX2RlZlByb3AodGFyZ2V0LCBuYW1lLCB7IGdldDogYWxsW25hbWVdLCBlbnVtZXJhYmxlOiB0cnVlIH0pO1xufTtcbnZhciBfX2NvcHlQcm9wcyA9ICh0bywgZnJvbSwgZXhjZXB0LCBkZXNjKSA9PiB7XG4gIGlmIChmcm9tICYmIHR5cGVvZiBmcm9tID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBmcm9tID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBmb3IgKGxldCBrZXkgb2YgX19nZXRPd25Qcm9wTmFtZXMoZnJvbSkpXG4gICAgICBpZiAoIV9faGFzT3duUHJvcC5jYWxsKHRvLCBrZXkpICYmIGtleSAhPT0gZXhjZXB0KVxuICAgICAgICBfX2RlZlByb3AodG8sIGtleSwgeyBnZXQ6ICgpID0+IGZyb21ba2V5XSwgZW51bWVyYWJsZTogIShkZXNjID0gX19nZXRPd25Qcm9wRGVzYyhmcm9tLCBrZXkpKSB8fCBkZXNjLmVudW1lcmFibGUgfSk7XG4gIH1cbiAgcmV0dXJuIHRvO1xufTtcbnZhciBfX3RvRVNNID0gKG1vZCwgaXNOb2RlTW9kZSwgdGFyZ2V0KSA9PiAodGFyZ2V0ID0gbW9kICE9IG51bGwgPyBfX2NyZWF0ZShfX2dldFByb3RvT2YobW9kKSkgOiB7fSwgX19jb3B5UHJvcHMoXG4gIC8vIElmIHRoZSBpbXBvcnRlciBpcyBpbiBub2RlIGNvbXBhdGliaWxpdHkgbW9kZSBvciB0aGlzIGlzIG5vdCBhbiBFU01cbiAgLy8gZmlsZSB0aGF0IGhhcyBiZWVuIGNvbnZlcnRlZCB0byBhIENvbW1vbkpTIGZpbGUgdXNpbmcgYSBCYWJlbC1cbiAgLy8gY29tcGF0aWJsZSB0cmFuc2Zvcm0gKGkuZS4gXCJfX2VzTW9kdWxlXCIgaGFzIG5vdCBiZWVuIHNldCksIHRoZW4gc2V0XG4gIC8vIFwiZGVmYXVsdFwiIHRvIHRoZSBDb21tb25KUyBcIm1vZHVsZS5leHBvcnRzXCIgZm9yIG5vZGUgY29tcGF0aWJpbGl0eS5cbiAgX19kZWZQcm9wKHRhcmdldCwgXCJkZWZhdWx0XCIsIHsgdmFsdWU6IG1vZCwgZW51bWVyYWJsZTogdHJ1ZSB9KSAsXG4gIG1vZFxuKSk7XG52YXIgX190b0NvbW1vbkpTID0gKG1vZCkgPT4gX19jb3B5UHJvcHMoX19kZWZQcm9wKHt9LCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KSwgbW9kKTtcblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2Jhc2U2NC1qc0AxLjUuMS9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzXG52YXIgcmVxdWlyZV9iYXNlNjRfanMgPSBfX2NvbW1vbkpTKHtcbiAgXCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vYmFzZTY0LWpzQDEuNS4xL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvaW5kZXguanNcIihleHBvcnRzKSB7XG4gICAgZXhwb3J0cy5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aDtcbiAgICBleHBvcnRzLnRvQnl0ZUFycmF5ID0gdG9CeXRlQXJyYXk7XG4gICAgZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gZnJvbUJ5dGVBcnJheTI7XG4gICAgdmFyIGxvb2t1cCA9IFtdO1xuICAgIHZhciByZXZMb29rdXAgPSBbXTtcbiAgICB2YXIgQXJyID0gdHlwZW9mIFVpbnQ4QXJyYXkgIT09IFwidW5kZWZpbmVkXCIgPyBVaW50OEFycmF5IDogQXJyYXk7XG4gICAgdmFyIGNvZGUgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky9cIjtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSBjb2RlLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBsb29rdXBbaV0gPSBjb2RlW2ldO1xuICAgICAgcmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV0gPSBpO1xuICAgIH1cbiAgICB2YXIgaTtcbiAgICB2YXIgbGVuO1xuICAgIHJldkxvb2t1cFtcIi1cIi5jaGFyQ29kZUF0KDApXSA9IDYyO1xuICAgIHJldkxvb2t1cFtcIl9cIi5jaGFyQ29kZUF0KDApXSA9IDYzO1xuICAgIGZ1bmN0aW9uIGdldExlbnMoYjY0KSB7XG4gICAgICB2YXIgbGVuMiA9IGI2NC5sZW5ndGg7XG4gICAgICBpZiAobGVuMiAlIDQgPiAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDRcIik7XG4gICAgICB9XG4gICAgICB2YXIgdmFsaWRMZW4gPSBiNjQuaW5kZXhPZihcIj1cIik7XG4gICAgICBpZiAodmFsaWRMZW4gPT09IC0xKSB2YWxpZExlbiA9IGxlbjI7XG4gICAgICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gdmFsaWRMZW4gPT09IGxlbjIgPyAwIDogNCAtIHZhbGlkTGVuICUgNDtcbiAgICAgIHJldHVybiBbdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbl07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGJ5dGVMZW5ndGgoYjY0KSB7XG4gICAgICB2YXIgbGVucyA9IGdldExlbnMoYjY0KTtcbiAgICAgIHZhciB2YWxpZExlbiA9IGxlbnNbMF07XG4gICAgICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gbGVuc1sxXTtcbiAgICAgIHJldHVybiAodmFsaWRMZW4gKyBwbGFjZUhvbGRlcnNMZW4pICogMyAvIDQgLSBwbGFjZUhvbGRlcnNMZW47XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9ieXRlTGVuZ3RoKGI2NCwgdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbikge1xuICAgICAgcmV0dXJuICh2YWxpZExlbiArIHBsYWNlSG9sZGVyc0xlbikgKiAzIC8gNCAtIHBsYWNlSG9sZGVyc0xlbjtcbiAgICB9XG4gICAgZnVuY3Rpb24gdG9CeXRlQXJyYXkoYjY0KSB7XG4gICAgICB2YXIgdG1wO1xuICAgICAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NCk7XG4gICAgICB2YXIgdmFsaWRMZW4gPSBsZW5zWzBdO1xuICAgICAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IGxlbnNbMV07XG4gICAgICB2YXIgYXJyID0gbmV3IEFycihfYnl0ZUxlbmd0aChiNjQsIHZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW4pKTtcbiAgICAgIHZhciBjdXJCeXRlID0gMDtcbiAgICAgIHZhciBsZW4yID0gcGxhY2VIb2xkZXJzTGVuID4gMCA/IHZhbGlkTGVuIC0gNCA6IHZhbGlkTGVuO1xuICAgICAgdmFyIGkyO1xuICAgICAgZm9yIChpMiA9IDA7IGkyIDwgbGVuMjsgaTIgKz0gNCkge1xuICAgICAgICB0bXAgPSByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIpXSA8PCAxOCB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMiArIDEpXSA8PCAxMiB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMiArIDIpXSA8PCA2IHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyICsgMyldO1xuICAgICAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCA+PiAxNiAmIDI1NTtcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgPj4gOCAmIDI1NTtcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAyNTU7XG4gICAgICB9XG4gICAgICBpZiAocGxhY2VIb2xkZXJzTGVuID09PSAyKSB7XG4gICAgICAgIHRtcCA9IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMildIDw8IDIgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAxKV0gPj4gNDtcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAyNTU7XG4gICAgICB9XG4gICAgICBpZiAocGxhY2VIb2xkZXJzTGVuID09PSAxKSB7XG4gICAgICAgIHRtcCA9IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMildIDw8IDEwIHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyICsgMSldIDw8IDQgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAyKV0gPj4gMjtcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgPj4gOCAmIDI1NTtcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAyNTU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJyO1xuICAgIH1cbiAgICBmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQobnVtKSB7XG4gICAgICByZXR1cm4gbG9va3VwW251bSA+PiAxOCAmIDYzXSArIGxvb2t1cFtudW0gPj4gMTIgJiA2M10gKyBsb29rdXBbbnVtID4+IDYgJiA2M10gKyBsb29rdXBbbnVtICYgNjNdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBlbmNvZGVDaHVuayh1aW50OCwgc3RhcnQsIGVuZCkge1xuICAgICAgdmFyIHRtcDtcbiAgICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICAgIGZvciAodmFyIGkyID0gc3RhcnQ7IGkyIDwgZW5kOyBpMiArPSAzKSB7XG4gICAgICAgIHRtcCA9ICh1aW50OFtpMl0gPDwgMTYgJiAxNjcxMTY4MCkgKyAodWludDhbaTIgKyAxXSA8PCA4ICYgNjUyODApICsgKHVpbnQ4W2kyICsgMl0gJiAyNTUpO1xuICAgICAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0LmpvaW4oXCJcIik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGZyb21CeXRlQXJyYXkyKHVpbnQ4KSB7XG4gICAgICB2YXIgdG1wO1xuICAgICAgdmFyIGxlbjIgPSB1aW50OC5sZW5ndGg7XG4gICAgICB2YXIgZXh0cmFCeXRlcyA9IGxlbjIgJSAzO1xuICAgICAgdmFyIHBhcnRzID0gW107XG4gICAgICB2YXIgbWF4Q2h1bmtMZW5ndGggPSAxNjM4MztcbiAgICAgIGZvciAodmFyIGkyID0gMCwgbGVuMjIgPSBsZW4yIC0gZXh0cmFCeXRlczsgaTIgPCBsZW4yMjsgaTIgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICAgICAgcGFydHMucHVzaChlbmNvZGVDaHVuayh1aW50OCwgaTIsIGkyICsgbWF4Q2h1bmtMZW5ndGggPiBsZW4yMiA/IGxlbjIyIDogaTIgKyBtYXhDaHVua0xlbmd0aCkpO1xuICAgICAgfVxuICAgICAgaWYgKGV4dHJhQnl0ZXMgPT09IDEpIHtcbiAgICAgICAgdG1wID0gdWludDhbbGVuMiAtIDFdO1xuICAgICAgICBwYXJ0cy5wdXNoKFxuICAgICAgICAgIGxvb2t1cFt0bXAgPj4gMl0gKyBsb29rdXBbdG1wIDw8IDQgJiA2M10gKyBcIj09XCJcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAoZXh0cmFCeXRlcyA9PT0gMikge1xuICAgICAgICB0bXAgPSAodWludDhbbGVuMiAtIDJdIDw8IDgpICsgdWludDhbbGVuMiAtIDFdO1xuICAgICAgICBwYXJ0cy5wdXNoKFxuICAgICAgICAgIGxvb2t1cFt0bXAgPj4gMTBdICsgbG9va3VwW3RtcCA+PiA0ICYgNjNdICsgbG9va3VwW3RtcCA8PCAyICYgNjNdICsgXCI9XCJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXJ0cy5qb2luKFwiXCIpO1xuICAgIH1cbiAgfVxufSk7XG5cbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zdGF0dXNlc0AyLjAuMi9ub2RlX21vZHVsZXMvc3RhdHVzZXMvY29kZXMuanNvblxudmFyIHJlcXVpcmVfY29kZXMgPSBfX2NvbW1vbkpTKHtcbiAgXCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc3RhdHVzZXNAMi4wLjIvbm9kZV9tb2R1bGVzL3N0YXR1c2VzL2NvZGVzLmpzb25cIihleHBvcnRzLCBtb2R1bGUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgIFwiMTAwXCI6IFwiQ29udGludWVcIixcbiAgICAgIFwiMTAxXCI6IFwiU3dpdGNoaW5nIFByb3RvY29sc1wiLFxuICAgICAgXCIxMDJcIjogXCJQcm9jZXNzaW5nXCIsXG4gICAgICBcIjEwM1wiOiBcIkVhcmx5IEhpbnRzXCIsXG4gICAgICBcIjIwMFwiOiBcIk9LXCIsXG4gICAgICBcIjIwMVwiOiBcIkNyZWF0ZWRcIixcbiAgICAgIFwiMjAyXCI6IFwiQWNjZXB0ZWRcIixcbiAgICAgIFwiMjAzXCI6IFwiTm9uLUF1dGhvcml0YXRpdmUgSW5mb3JtYXRpb25cIixcbiAgICAgIFwiMjA0XCI6IFwiTm8gQ29udGVudFwiLFxuICAgICAgXCIyMDVcIjogXCJSZXNldCBDb250ZW50XCIsXG4gICAgICBcIjIwNlwiOiBcIlBhcnRpYWwgQ29udGVudFwiLFxuICAgICAgXCIyMDdcIjogXCJNdWx0aS1TdGF0dXNcIixcbiAgICAgIFwiMjA4XCI6IFwiQWxyZWFkeSBSZXBvcnRlZFwiLFxuICAgICAgXCIyMjZcIjogXCJJTSBVc2VkXCIsXG4gICAgICBcIjMwMFwiOiBcIk11bHRpcGxlIENob2ljZXNcIixcbiAgICAgIFwiMzAxXCI6IFwiTW92ZWQgUGVybWFuZW50bHlcIixcbiAgICAgIFwiMzAyXCI6IFwiRm91bmRcIixcbiAgICAgIFwiMzAzXCI6IFwiU2VlIE90aGVyXCIsXG4gICAgICBcIjMwNFwiOiBcIk5vdCBNb2RpZmllZFwiLFxuICAgICAgXCIzMDVcIjogXCJVc2UgUHJveHlcIixcbiAgICAgIFwiMzA3XCI6IFwiVGVtcG9yYXJ5IFJlZGlyZWN0XCIsXG4gICAgICBcIjMwOFwiOiBcIlBlcm1hbmVudCBSZWRpcmVjdFwiLFxuICAgICAgXCI0MDBcIjogXCJCYWQgUmVxdWVzdFwiLFxuICAgICAgXCI0MDFcIjogXCJVbmF1dGhvcml6ZWRcIixcbiAgICAgIFwiNDAyXCI6IFwiUGF5bWVudCBSZXF1aXJlZFwiLFxuICAgICAgXCI0MDNcIjogXCJGb3JiaWRkZW5cIixcbiAgICAgIFwiNDA0XCI6IFwiTm90IEZvdW5kXCIsXG4gICAgICBcIjQwNVwiOiBcIk1ldGhvZCBOb3QgQWxsb3dlZFwiLFxuICAgICAgXCI0MDZcIjogXCJOb3QgQWNjZXB0YWJsZVwiLFxuICAgICAgXCI0MDdcIjogXCJQcm94eSBBdXRoZW50aWNhdGlvbiBSZXF1aXJlZFwiLFxuICAgICAgXCI0MDhcIjogXCJSZXF1ZXN0IFRpbWVvdXRcIixcbiAgICAgIFwiNDA5XCI6IFwiQ29uZmxpY3RcIixcbiAgICAgIFwiNDEwXCI6IFwiR29uZVwiLFxuICAgICAgXCI0MTFcIjogXCJMZW5ndGggUmVxdWlyZWRcIixcbiAgICAgIFwiNDEyXCI6IFwiUHJlY29uZGl0aW9uIEZhaWxlZFwiLFxuICAgICAgXCI0MTNcIjogXCJQYXlsb2FkIFRvbyBMYXJnZVwiLFxuICAgICAgXCI0MTRcIjogXCJVUkkgVG9vIExvbmdcIixcbiAgICAgIFwiNDE1XCI6IFwiVW5zdXBwb3J0ZWQgTWVkaWEgVHlwZVwiLFxuICAgICAgXCI0MTZcIjogXCJSYW5nZSBOb3QgU2F0aXNmaWFibGVcIixcbiAgICAgIFwiNDE3XCI6IFwiRXhwZWN0YXRpb24gRmFpbGVkXCIsXG4gICAgICBcIjQxOFwiOiBcIkknbSBhIFRlYXBvdFwiLFxuICAgICAgXCI0MjFcIjogXCJNaXNkaXJlY3RlZCBSZXF1ZXN0XCIsXG4gICAgICBcIjQyMlwiOiBcIlVucHJvY2Vzc2FibGUgRW50aXR5XCIsXG4gICAgICBcIjQyM1wiOiBcIkxvY2tlZFwiLFxuICAgICAgXCI0MjRcIjogXCJGYWlsZWQgRGVwZW5kZW5jeVwiLFxuICAgICAgXCI0MjVcIjogXCJUb28gRWFybHlcIixcbiAgICAgIFwiNDI2XCI6IFwiVXBncmFkZSBSZXF1aXJlZFwiLFxuICAgICAgXCI0MjhcIjogXCJQcmVjb25kaXRpb24gUmVxdWlyZWRcIixcbiAgICAgIFwiNDI5XCI6IFwiVG9vIE1hbnkgUmVxdWVzdHNcIixcbiAgICAgIFwiNDMxXCI6IFwiUmVxdWVzdCBIZWFkZXIgRmllbGRzIFRvbyBMYXJnZVwiLFxuICAgICAgXCI0NTFcIjogXCJVbmF2YWlsYWJsZSBGb3IgTGVnYWwgUmVhc29uc1wiLFxuICAgICAgXCI1MDBcIjogXCJJbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcIixcbiAgICAgIFwiNTAxXCI6IFwiTm90IEltcGxlbWVudGVkXCIsXG4gICAgICBcIjUwMlwiOiBcIkJhZCBHYXRld2F5XCIsXG4gICAgICBcIjUwM1wiOiBcIlNlcnZpY2UgVW5hdmFpbGFibGVcIixcbiAgICAgIFwiNTA0XCI6IFwiR2F0ZXdheSBUaW1lb3V0XCIsXG4gICAgICBcIjUwNVwiOiBcIkhUVFAgVmVyc2lvbiBOb3QgU3VwcG9ydGVkXCIsXG4gICAgICBcIjUwNlwiOiBcIlZhcmlhbnQgQWxzbyBOZWdvdGlhdGVzXCIsXG4gICAgICBcIjUwN1wiOiBcIkluc3VmZmljaWVudCBTdG9yYWdlXCIsXG4gICAgICBcIjUwOFwiOiBcIkxvb3AgRGV0ZWN0ZWRcIixcbiAgICAgIFwiNTA5XCI6IFwiQmFuZHdpZHRoIExpbWl0IEV4Y2VlZGVkXCIsXG4gICAgICBcIjUxMFwiOiBcIk5vdCBFeHRlbmRlZFwiLFxuICAgICAgXCI1MTFcIjogXCJOZXR3b3JrIEF1dGhlbnRpY2F0aW9uIFJlcXVpcmVkXCJcbiAgICB9O1xuICB9XG59KTtcblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3N0YXR1c2VzQDIuMC4yL25vZGVfbW9kdWxlcy9zdGF0dXNlcy9pbmRleC5qc1xudmFyIHJlcXVpcmVfc3RhdHVzZXMgPSBfX2NvbW1vbkpTKHtcbiAgXCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc3RhdHVzZXNAMi4wLjIvbm9kZV9tb2R1bGVzL3N0YXR1c2VzL2luZGV4LmpzXCIoZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgdmFyIGNvZGVzID0gcmVxdWlyZV9jb2RlcygpO1xuICAgIG1vZHVsZS5leHBvcnRzID0gc3RhdHVzMjtcbiAgICBzdGF0dXMyLm1lc3NhZ2UgPSBjb2RlcztcbiAgICBzdGF0dXMyLmNvZGUgPSBjcmVhdGVNZXNzYWdlVG9TdGF0dXNDb2RlTWFwKGNvZGVzKTtcbiAgICBzdGF0dXMyLmNvZGVzID0gY3JlYXRlU3RhdHVzQ29kZUxpc3QoY29kZXMpO1xuICAgIHN0YXR1czIucmVkaXJlY3QgPSB7XG4gICAgICAzMDA6IHRydWUsXG4gICAgICAzMDE6IHRydWUsXG4gICAgICAzMDI6IHRydWUsXG4gICAgICAzMDM6IHRydWUsXG4gICAgICAzMDU6IHRydWUsXG4gICAgICAzMDc6IHRydWUsXG4gICAgICAzMDg6IHRydWVcbiAgICB9O1xuICAgIHN0YXR1czIuZW1wdHkgPSB7XG4gICAgICAyMDQ6IHRydWUsXG4gICAgICAyMDU6IHRydWUsXG4gICAgICAzMDQ6IHRydWVcbiAgICB9O1xuICAgIHN0YXR1czIucmV0cnkgPSB7XG4gICAgICA1MDI6IHRydWUsXG4gICAgICA1MDM6IHRydWUsXG4gICAgICA1MDQ6IHRydWVcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VUb1N0YXR1c0NvZGVNYXAoY29kZXMyKSB7XG4gICAgICB2YXIgbWFwID0ge307XG4gICAgICBPYmplY3Qua2V5cyhjb2RlczIpLmZvckVhY2goZnVuY3Rpb24gZm9yRWFjaENvZGUoY29kZSkge1xuICAgICAgICB2YXIgbWVzc2FnZSA9IGNvZGVzMltjb2RlXTtcbiAgICAgICAgdmFyIHN0YXR1czMgPSBOdW1iZXIoY29kZSk7XG4gICAgICAgIG1hcFttZXNzYWdlLnRvTG93ZXJDYXNlKCldID0gc3RhdHVzMztcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlU3RhdHVzQ29kZUxpc3QoY29kZXMyKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMoY29kZXMyKS5tYXAoZnVuY3Rpb24gbWFwQ29kZShjb2RlKSB7XG4gICAgICAgIHJldHVybiBOdW1iZXIoY29kZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0U3RhdHVzQ29kZShtZXNzYWdlKSB7XG4gICAgICB2YXIgbXNnID0gbWVzc2FnZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc3RhdHVzMi5jb2RlLCBtc2cpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzdGF0dXMgbWVzc2FnZTogXCInICsgbWVzc2FnZSArICdcIicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0YXR1czIuY29kZVttc2ddO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXRTdGF0dXNNZXNzYWdlKGNvZGUpIHtcbiAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHN0YXR1czIubWVzc2FnZSwgY29kZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBzdGF0dXMgY29kZTogXCIgKyBjb2RlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdGF0dXMyLm1lc3NhZ2VbY29kZV07XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN0YXR1czIoY29kZSkge1xuICAgICAgaWYgKHR5cGVvZiBjb2RlID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHJldHVybiBnZXRTdGF0dXNNZXNzYWdlKGNvZGUpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBjb2RlICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJjb2RlIG11c3QgYmUgYSBudW1iZXIgb3Igc3RyaW5nXCIpO1xuICAgICAgfVxuICAgICAgdmFyIG4gPSBwYXJzZUludChjb2RlLCAxMCk7XG4gICAgICBpZiAoIWlzTmFOKG4pKSB7XG4gICAgICAgIHJldHVybiBnZXRTdGF0dXNNZXNzYWdlKG4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGdldFN0YXR1c0NvZGUoY29kZSk7XG4gICAgfVxuICB9XG59KTtcblxuLy8gc3JjL3V0aWwtc3R1Yi50c1xudmFyIHV0aWxfc3R1Yl9leHBvcnRzID0ge307XG5fX2V4cG9ydCh1dGlsX3N0dWJfZXhwb3J0cywge1xuICBpbnNwZWN0OiAoKSA9PiBpbnNwZWN0XG59KTtcbnZhciBpbnNwZWN0O1xudmFyIGluaXRfdXRpbF9zdHViID0gX19lc20oe1xuICBcInNyYy91dGlsLXN0dWIudHNcIigpIHtcbiAgICBpbnNwZWN0ID0ge307XG4gIH1cbn0pO1xuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vb2JqZWN0LWluc3BlY3RAMS4xMy40L25vZGVfbW9kdWxlcy9vYmplY3QtaW5zcGVjdC91dGlsLmluc3BlY3QuanNcbnZhciByZXF1aXJlX3V0aWxfaW5zcGVjdCA9IF9fY29tbW9uSlMoe1xuICBcIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9vYmplY3QtaW5zcGVjdEAxLjEzLjQvbm9kZV9tb2R1bGVzL29iamVjdC1pbnNwZWN0L3V0aWwuaW5zcGVjdC5qc1wiKGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gKGluaXRfdXRpbF9zdHViKCksIF9fdG9Db21tb25KUyh1dGlsX3N0dWJfZXhwb3J0cykpLmluc3BlY3Q7XG4gIH1cbn0pO1xuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vb2JqZWN0LWluc3BlY3RAMS4xMy40L25vZGVfbW9kdWxlcy9vYmplY3QtaW5zcGVjdC9pbmRleC5qc1xudmFyIHJlcXVpcmVfb2JqZWN0X2luc3BlY3QgPSBfX2NvbW1vbkpTKHtcbiAgXCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vb2JqZWN0LWluc3BlY3RAMS4xMy40L25vZGVfbW9kdWxlcy9vYmplY3QtaW5zcGVjdC9pbmRleC5qc1wiKGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIHZhciBoYXNNYXAgPSB0eXBlb2YgTWFwID09PSBcImZ1bmN0aW9uXCIgJiYgTWFwLnByb3RvdHlwZTtcbiAgICB2YXIgbWFwU2l6ZURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICYmIGhhc01hcCA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTWFwLnByb3RvdHlwZSwgXCJzaXplXCIpIDogbnVsbDtcbiAgICB2YXIgbWFwU2l6ZSA9IGhhc01hcCAmJiBtYXBTaXplRGVzY3JpcHRvciAmJiB0eXBlb2YgbWFwU2l6ZURlc2NyaXB0b3IuZ2V0ID09PSBcImZ1bmN0aW9uXCIgPyBtYXBTaXplRGVzY3JpcHRvci5nZXQgOiBudWxsO1xuICAgIHZhciBtYXBGb3JFYWNoID0gaGFzTWFwICYmIE1hcC5wcm90b3R5cGUuZm9yRWFjaDtcbiAgICB2YXIgaGFzU2V0ID0gdHlwZW9mIFNldCA9PT0gXCJmdW5jdGlvblwiICYmIFNldC5wcm90b3R5cGU7XG4gICAgdmFyIHNldFNpemVEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciAmJiBoYXNTZXQgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKFNldC5wcm90b3R5cGUsIFwic2l6ZVwiKSA6IG51bGw7XG4gICAgdmFyIHNldFNpemUgPSBoYXNTZXQgJiYgc2V0U2l6ZURlc2NyaXB0b3IgJiYgdHlwZW9mIHNldFNpemVEZXNjcmlwdG9yLmdldCA9PT0gXCJmdW5jdGlvblwiID8gc2V0U2l6ZURlc2NyaXB0b3IuZ2V0IDogbnVsbDtcbiAgICB2YXIgc2V0Rm9yRWFjaCA9IGhhc1NldCAmJiBTZXQucHJvdG90eXBlLmZvckVhY2g7XG4gICAgdmFyIGhhc1dlYWtNYXAgPSB0eXBlb2YgV2Vha01hcCA9PT0gXCJmdW5jdGlvblwiICYmIFdlYWtNYXAucHJvdG90eXBlO1xuICAgIHZhciB3ZWFrTWFwSGFzID0gaGFzV2Vha01hcCA/IFdlYWtNYXAucHJvdG90eXBlLmhhcyA6IG51bGw7XG4gICAgdmFyIGhhc1dlYWtTZXQgPSB0eXBlb2YgV2Vha1NldCA9PT0gXCJmdW5jdGlvblwiICYmIFdlYWtTZXQucHJvdG90eXBlO1xuICAgIHZhciB3ZWFrU2V0SGFzID0gaGFzV2Vha1NldCA/IFdlYWtTZXQucHJvdG90eXBlLmhhcyA6IG51bGw7XG4gICAgdmFyIGhhc1dlYWtSZWYgPSB0eXBlb2YgV2Vha1JlZiA9PT0gXCJmdW5jdGlvblwiICYmIFdlYWtSZWYucHJvdG90eXBlO1xuICAgIHZhciB3ZWFrUmVmRGVyZWYgPSBoYXNXZWFrUmVmID8gV2Vha1JlZi5wcm90b3R5cGUuZGVyZWYgOiBudWxsO1xuICAgIHZhciBib29sZWFuVmFsdWVPZiA9IEJvb2xlYW4ucHJvdG90eXBlLnZhbHVlT2Y7XG4gICAgdmFyIG9iamVjdFRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgICB2YXIgZnVuY3Rpb25Ub1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcbiAgICB2YXIgJG1hdGNoID0gU3RyaW5nLnByb3RvdHlwZS5tYXRjaDtcbiAgICB2YXIgJHNsaWNlID0gU3RyaW5nLnByb3RvdHlwZS5zbGljZTtcbiAgICB2YXIgJHJlcGxhY2UgPSBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2U7XG4gICAgdmFyICR0b1VwcGVyQ2FzZSA9IFN0cmluZy5wcm90b3R5cGUudG9VcHBlckNhc2U7XG4gICAgdmFyICR0b0xvd2VyQ2FzZSA9IFN0cmluZy5wcm90b3R5cGUudG9Mb3dlckNhc2U7XG4gICAgdmFyICR0ZXN0ID0gUmVnRXhwLnByb3RvdHlwZS50ZXN0O1xuICAgIHZhciAkY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcbiAgICB2YXIgJGpvaW4gPSBBcnJheS5wcm90b3R5cGUuam9pbjtcbiAgICB2YXIgJGFyclNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuICAgIHZhciAkZmxvb3IgPSBNYXRoLmZsb29yO1xuICAgIHZhciBiaWdJbnRWYWx1ZU9mID0gdHlwZW9mIEJpZ0ludCA9PT0gXCJmdW5jdGlvblwiID8gQmlnSW50LnByb3RvdHlwZS52YWx1ZU9mIDogbnVsbDtcbiAgICB2YXIgZ09QUyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG4gICAgdmFyIHN5bVRvU3RyaW5nID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBTeW1ib2wucHJvdG90eXBlLnRvU3RyaW5nIDogbnVsbDtcbiAgICB2YXIgaGFzU2hhbW1lZFN5bWJvbHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJvYmplY3RcIjtcbiAgICB2YXIgdG9TdHJpbmdUYWcgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLnRvU3RyaW5nVGFnICYmICh0eXBlb2YgU3ltYm9sLnRvU3RyaW5nVGFnID09PSBoYXNTaGFtbWVkU3ltYm9scyA/IFwib2JqZWN0XCIgOiBcInN5bWJvbFwiKSA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IG51bGw7XG4gICAgdmFyIGlzRW51bWVyYWJsZSA9IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGU7XG4gICAgdmFyIGdQTyA9ICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJmdW5jdGlvblwiID8gUmVmbGVjdC5nZXRQcm90b3R5cGVPZiA6IE9iamVjdC5nZXRQcm90b3R5cGVPZikgfHwgKFtdLl9fcHJvdG9fXyA9PT0gQXJyYXkucHJvdG90eXBlID8gZnVuY3Rpb24oTykge1xuICAgICAgcmV0dXJuIE8uX19wcm90b19fO1xuICAgIH0gOiBudWxsKTtcbiAgICBmdW5jdGlvbiBhZGROdW1lcmljU2VwYXJhdG9yKG51bSwgc3RyKSB7XG4gICAgICBpZiAobnVtID09PSBJbmZpbml0eSB8fCBudW0gPT09IC1JbmZpbml0eSB8fCBudW0gIT09IG51bSB8fCBudW0gJiYgbnVtID4gLTFlMyAmJiBudW0gPCAxZTMgfHwgJHRlc3QuY2FsbCgvZS8sIHN0cikpIHtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgIH1cbiAgICAgIHZhciBzZXBSZWdleCA9IC9bMC05XSg/PSg/OlswLTldezN9KSsoPyFbMC05XSkpL2c7XG4gICAgICBpZiAodHlwZW9mIG51bSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICB2YXIgaW50ID0gbnVtIDwgMCA/IC0kZmxvb3IoLW51bSkgOiAkZmxvb3IobnVtKTtcbiAgICAgICAgaWYgKGludCAhPT0gbnVtKSB7XG4gICAgICAgICAgdmFyIGludFN0ciA9IFN0cmluZyhpbnQpO1xuICAgICAgICAgIHZhciBkZWMgPSAkc2xpY2UuY2FsbChzdHIsIGludFN0ci5sZW5ndGggKyAxKTtcbiAgICAgICAgICByZXR1cm4gJHJlcGxhY2UuY2FsbChpbnRTdHIsIHNlcFJlZ2V4LCBcIiQmX1wiKSArIFwiLlwiICsgJHJlcGxhY2UuY2FsbCgkcmVwbGFjZS5jYWxsKGRlYywgLyhbMC05XXszfSkvZywgXCIkJl9cIiksIC9fJC8sIFwiXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gJHJlcGxhY2UuY2FsbChzdHIsIHNlcFJlZ2V4LCBcIiQmX1wiKTtcbiAgICB9XG4gICAgdmFyIHV0aWxJbnNwZWN0ID0gcmVxdWlyZV91dGlsX2luc3BlY3QoKTtcbiAgICB2YXIgaW5zcGVjdEN1c3RvbSA9IHV0aWxJbnNwZWN0LmN1c3RvbTtcbiAgICB2YXIgaW5zcGVjdFN5bWJvbCA9IGlzU3ltYm9sKGluc3BlY3RDdXN0b20pID8gaW5zcGVjdEN1c3RvbSA6IG51bGw7XG4gICAgdmFyIHF1b3RlcyA9IHtcbiAgICAgIF9fcHJvdG9fXzogbnVsbCxcbiAgICAgIFwiZG91YmxlXCI6ICdcIicsXG4gICAgICBzaW5nbGU6IFwiJ1wiXG4gICAgfTtcbiAgICB2YXIgcXVvdGVSRXMgPSB7XG4gICAgICBfX3Byb3RvX186IG51bGwsXG4gICAgICBcImRvdWJsZVwiOiAvKFtcIlxcXFxdKS9nLFxuICAgICAgc2luZ2xlOiAvKFsnXFxcXF0pL2dcbiAgICB9O1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5zcGVjdF8ob2JqLCBvcHRpb25zLCBkZXB0aCwgc2Vlbikge1xuICAgICAgdmFyIG9wdHMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgaWYgKGhhcyhvcHRzLCBcInF1b3RlU3R5bGVcIikgJiYgIWhhcyhxdW90ZXMsIG9wdHMucXVvdGVTdHlsZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIFwicXVvdGVTdHlsZVwiIG11c3QgYmUgXCJzaW5nbGVcIiBvciBcImRvdWJsZVwiJyk7XG4gICAgICB9XG4gICAgICBpZiAoaGFzKG9wdHMsIFwibWF4U3RyaW5nTGVuZ3RoXCIpICYmICh0eXBlb2Ygb3B0cy5tYXhTdHJpbmdMZW5ndGggPT09IFwibnVtYmVyXCIgPyBvcHRzLm1heFN0cmluZ0xlbmd0aCA8IDAgJiYgb3B0cy5tYXhTdHJpbmdMZW5ndGggIT09IEluZmluaXR5IDogb3B0cy5tYXhTdHJpbmdMZW5ndGggIT09IG51bGwpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiBcIm1heFN0cmluZ0xlbmd0aFwiLCBpZiBwcm92aWRlZCwgbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXIsIEluZmluaXR5LCBvciBgbnVsbGAnKTtcbiAgICAgIH1cbiAgICAgIHZhciBjdXN0b21JbnNwZWN0ID0gaGFzKG9wdHMsIFwiY3VzdG9tSW5zcGVjdFwiKSA/IG9wdHMuY3VzdG9tSW5zcGVjdCA6IHRydWU7XG4gICAgICBpZiAodHlwZW9mIGN1c3RvbUluc3BlY3QgIT09IFwiYm9vbGVhblwiICYmIGN1c3RvbUluc3BlY3QgIT09IFwic3ltYm9sXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIm9wdGlvbiBcXFwiY3VzdG9tSW5zcGVjdFxcXCIsIGlmIHByb3ZpZGVkLCBtdXN0IGJlIGB0cnVlYCwgYGZhbHNlYCwgb3IgYCdzeW1ib2wnYFwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXMob3B0cywgXCJpbmRlbnRcIikgJiYgb3B0cy5pbmRlbnQgIT09IG51bGwgJiYgb3B0cy5pbmRlbnQgIT09IFwiXHRcIiAmJiAhKHBhcnNlSW50KG9wdHMuaW5kZW50LCAxMCkgPT09IG9wdHMuaW5kZW50ICYmIG9wdHMuaW5kZW50ID4gMCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIFwiaW5kZW50XCIgbXVzdCBiZSBcIlxcXFx0XCIsIGFuIGludGVnZXIgPiAwLCBvciBgbnVsbGAnKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXMob3B0cywgXCJudW1lcmljU2VwYXJhdG9yXCIpICYmIHR5cGVvZiBvcHRzLm51bWVyaWNTZXBhcmF0b3IgIT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiBcIm51bWVyaWNTZXBhcmF0b3JcIiwgaWYgcHJvdmlkZWQsIG11c3QgYmUgYHRydWVgIG9yIGBmYWxzZWAnKTtcbiAgICAgIH1cbiAgICAgIHZhciBudW1lcmljU2VwYXJhdG9yID0gb3B0cy5udW1lcmljU2VwYXJhdG9yO1xuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcmV0dXJuIFwidW5kZWZpbmVkXCI7XG4gICAgICB9XG4gICAgICBpZiAob2JqID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBcIm51bGxcIjtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICByZXR1cm4gb2JqID8gXCJ0cnVlXCIgOiBcImZhbHNlXCI7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICByZXR1cm4gaW5zcGVjdFN0cmluZyhvYmosIG9wdHMpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgaWYgKG9iaiA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBJbmZpbml0eSAvIG9iaiA+IDAgPyBcIjBcIiA6IFwiLTBcIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3RyID0gU3RyaW5nKG9iaik7XG4gICAgICAgIHJldHVybiBudW1lcmljU2VwYXJhdG9yID8gYWRkTnVtZXJpY1NlcGFyYXRvcihvYmosIHN0cikgOiBzdHI7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJiaWdpbnRcIikge1xuICAgICAgICB2YXIgYmlnSW50U3RyID0gU3RyaW5nKG9iaikgKyBcIm5cIjtcbiAgICAgICAgcmV0dXJuIG51bWVyaWNTZXBhcmF0b3IgPyBhZGROdW1lcmljU2VwYXJhdG9yKG9iaiwgYmlnSW50U3RyKSA6IGJpZ0ludFN0cjtcbiAgICAgIH1cbiAgICAgIHZhciBtYXhEZXB0aCA9IHR5cGVvZiBvcHRzLmRlcHRoID09PSBcInVuZGVmaW5lZFwiID8gNSA6IG9wdHMuZGVwdGg7XG4gICAgICBpZiAodHlwZW9mIGRlcHRoID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGRlcHRoID0gMDtcbiAgICAgIH1cbiAgICAgIGlmIChkZXB0aCA+PSBtYXhEZXB0aCAmJiBtYXhEZXB0aCA+IDAgJiYgdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gaXNBcnJheShvYmopID8gXCJbQXJyYXldXCIgOiBcIltPYmplY3RdXCI7XG4gICAgICB9XG4gICAgICB2YXIgaW5kZW50ID0gZ2V0SW5kZW50KG9wdHMsIGRlcHRoKTtcbiAgICAgIGlmICh0eXBlb2Ygc2VlbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBzZWVuID0gW107XG4gICAgICB9IGVsc2UgaWYgKGluZGV4T2Yoc2Vlbiwgb2JqKSA+PSAwKSB7XG4gICAgICAgIHJldHVybiBcIltDaXJjdWxhcl1cIjtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGluc3BlY3QzKHZhbHVlLCBmcm9tLCBub0luZGVudCkge1xuICAgICAgICBpZiAoZnJvbSkge1xuICAgICAgICAgIHNlZW4gPSAkYXJyU2xpY2UuY2FsbChzZWVuKTtcbiAgICAgICAgICBzZWVuLnB1c2goZnJvbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vSW5kZW50KSB7XG4gICAgICAgICAgdmFyIG5ld09wdHMgPSB7XG4gICAgICAgICAgICBkZXB0aDogb3B0cy5kZXB0aFxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKGhhcyhvcHRzLCBcInF1b3RlU3R5bGVcIikpIHtcbiAgICAgICAgICAgIG5ld09wdHMucXVvdGVTdHlsZSA9IG9wdHMucXVvdGVTdHlsZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGluc3BlY3RfKHZhbHVlLCBuZXdPcHRzLCBkZXB0aCArIDEsIHNlZW4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnNwZWN0Xyh2YWx1ZSwgb3B0cywgZGVwdGggKyAxLCBzZWVuKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcImZ1bmN0aW9uXCIgJiYgIWlzUmVnRXhwKG9iaikpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBuYW1lT2Yob2JqKTtcbiAgICAgICAgdmFyIGtleXMgPSBhcnJPYmpLZXlzKG9iaiwgaW5zcGVjdDMpO1xuICAgICAgICByZXR1cm4gXCJbRnVuY3Rpb25cIiArIChuYW1lID8gXCI6IFwiICsgbmFtZSA6IFwiIChhbm9ueW1vdXMpXCIpICsgXCJdXCIgKyAoa2V5cy5sZW5ndGggPiAwID8gXCIgeyBcIiArICRqb2luLmNhbGwoa2V5cywgXCIsIFwiKSArIFwiIH1cIiA6IFwiXCIpO1xuICAgICAgfVxuICAgICAgaWYgKGlzU3ltYm9sKG9iaikpIHtcbiAgICAgICAgdmFyIHN5bVN0cmluZyA9IGhhc1NoYW1tZWRTeW1ib2xzID8gJHJlcGxhY2UuY2FsbChTdHJpbmcob2JqKSwgL14oU3ltYm9sXFwoLipcXCkpX1teKV0qJC8sIFwiJDFcIikgOiBzeW1Ub1N0cmluZy5jYWxsKG9iaik7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmICFoYXNTaGFtbWVkU3ltYm9scyA/IG1hcmtCb3hlZChzeW1TdHJpbmcpIDogc3ltU3RyaW5nO1xuICAgICAgfVxuICAgICAgaWYgKGlzRWxlbWVudChvYmopKSB7XG4gICAgICAgIHZhciBzID0gXCI8XCIgKyAkdG9Mb3dlckNhc2UuY2FsbChTdHJpbmcob2JqLm5vZGVOYW1lKSk7XG4gICAgICAgIHZhciBhdHRycyA9IG9iai5hdHRyaWJ1dGVzIHx8IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgcyArPSBcIiBcIiArIGF0dHJzW2ldLm5hbWUgKyBcIj1cIiArIHdyYXBRdW90ZXMocXVvdGUoYXR0cnNbaV0udmFsdWUpLCBcImRvdWJsZVwiLCBvcHRzKTtcbiAgICAgICAgfVxuICAgICAgICBzICs9IFwiPlwiO1xuICAgICAgICBpZiAob2JqLmNoaWxkTm9kZXMgJiYgb2JqLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgcyArPSBcIi4uLlwiO1xuICAgICAgICB9XG4gICAgICAgIHMgKz0gXCI8L1wiICsgJHRvTG93ZXJDYXNlLmNhbGwoU3RyaW5nKG9iai5ub2RlTmFtZSkpICsgXCI+XCI7XG4gICAgICAgIHJldHVybiBzO1xuICAgICAgfVxuICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICBpZiAob2JqLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBcIltdXCI7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHhzID0gYXJyT2JqS2V5cyhvYmosIGluc3BlY3QzKTtcbiAgICAgICAgaWYgKGluZGVudCAmJiAhc2luZ2xlTGluZVZhbHVlcyh4cykpIHtcbiAgICAgICAgICByZXR1cm4gXCJbXCIgKyBpbmRlbnRlZEpvaW4oeHMsIGluZGVudCkgKyBcIl1cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJbIFwiICsgJGpvaW4uY2FsbCh4cywgXCIsIFwiKSArIFwiIF1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpc0Vycm9yKG9iaikpIHtcbiAgICAgICAgdmFyIHBhcnRzID0gYXJyT2JqS2V5cyhvYmosIGluc3BlY3QzKTtcbiAgICAgICAgaWYgKCEoXCJjYXVzZVwiIGluIEVycm9yLnByb3RvdHlwZSkgJiYgXCJjYXVzZVwiIGluIG9iaiAmJiAhaXNFbnVtZXJhYmxlLmNhbGwob2JqLCBcImNhdXNlXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFwieyBbXCIgKyBTdHJpbmcob2JqKSArIFwiXSBcIiArICRqb2luLmNhbGwoJGNvbmNhdC5jYWxsKFwiW2NhdXNlXTogXCIgKyBpbnNwZWN0MyhvYmouY2F1c2UpLCBwYXJ0cyksIFwiLCBcIikgKyBcIiB9XCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBcIltcIiArIFN0cmluZyhvYmopICsgXCJdXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFwieyBbXCIgKyBTdHJpbmcob2JqKSArIFwiXSBcIiArICRqb2luLmNhbGwocGFydHMsIFwiLCBcIikgKyBcIiB9XCI7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBjdXN0b21JbnNwZWN0KSB7XG4gICAgICAgIGlmIChpbnNwZWN0U3ltYm9sICYmIHR5cGVvZiBvYmpbaW5zcGVjdFN5bWJvbF0gPT09IFwiZnVuY3Rpb25cIiAmJiB1dGlsSW5zcGVjdCkge1xuICAgICAgICAgIHJldHVybiB1dGlsSW5zcGVjdChvYmosIHsgZGVwdGg6IG1heERlcHRoIC0gZGVwdGggfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VzdG9tSW5zcGVjdCAhPT0gXCJzeW1ib2xcIiAmJiB0eXBlb2Ygb2JqLmluc3BlY3QgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiBvYmouaW5zcGVjdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaXNNYXAob2JqKSkge1xuICAgICAgICB2YXIgbWFwUGFydHMgPSBbXTtcbiAgICAgICAgaWYgKG1hcEZvckVhY2gpIHtcbiAgICAgICAgICBtYXBGb3JFYWNoLmNhbGwob2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICBtYXBQYXJ0cy5wdXNoKGluc3BlY3QzKGtleSwgb2JqLCB0cnVlKSArIFwiID0+IFwiICsgaW5zcGVjdDModmFsdWUsIG9iaikpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uT2YoXCJNYXBcIiwgbWFwU2l6ZS5jYWxsKG9iaiksIG1hcFBhcnRzLCBpbmRlbnQpO1xuICAgICAgfVxuICAgICAgaWYgKGlzU2V0KG9iaikpIHtcbiAgICAgICAgdmFyIHNldFBhcnRzID0gW107XG4gICAgICAgIGlmIChzZXRGb3JFYWNoKSB7XG4gICAgICAgICAgc2V0Rm9yRWFjaC5jYWxsKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHNldFBhcnRzLnB1c2goaW5zcGVjdDModmFsdWUsIG9iaikpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uT2YoXCJTZXRcIiwgc2V0U2l6ZS5jYWxsKG9iaiksIHNldFBhcnRzLCBpbmRlbnQpO1xuICAgICAgfVxuICAgICAgaWYgKGlzV2Vha01hcChvYmopKSB7XG4gICAgICAgIHJldHVybiB3ZWFrQ29sbGVjdGlvbk9mKFwiV2Vha01hcFwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1dlYWtTZXQob2JqKSkge1xuICAgICAgICByZXR1cm4gd2Vha0NvbGxlY3Rpb25PZihcIldlYWtTZXRcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXNXZWFrUmVmKG9iaikpIHtcbiAgICAgICAgcmV0dXJuIHdlYWtDb2xsZWN0aW9uT2YoXCJXZWFrUmVmXCIpO1xuICAgICAgfVxuICAgICAgaWYgKGlzTnVtYmVyKG9iaikpIHtcbiAgICAgICAgcmV0dXJuIG1hcmtCb3hlZChpbnNwZWN0MyhOdW1iZXIob2JqKSkpO1xuICAgICAgfVxuICAgICAgaWYgKGlzQmlnSW50KG9iaikpIHtcbiAgICAgICAgcmV0dXJuIG1hcmtCb3hlZChpbnNwZWN0MyhiaWdJbnRWYWx1ZU9mLmNhbGwob2JqKSkpO1xuICAgICAgfVxuICAgICAgaWYgKGlzQm9vbGVhbihvYmopKSB7XG4gICAgICAgIHJldHVybiBtYXJrQm94ZWQoYm9vbGVhblZhbHVlT2YuY2FsbChvYmopKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1N0cmluZyhvYmopKSB7XG4gICAgICAgIHJldHVybiBtYXJrQm94ZWQoaW5zcGVjdDMoU3RyaW5nKG9iaikpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIG9iaiA9PT0gd2luZG93KSB7XG4gICAgICAgIHJldHVybiBcInsgW29iamVjdCBXaW5kb3ddIH1cIjtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBvYmogPT09IGdsb2JhbFRoaXMgfHwgdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBvYmogPT09IGdsb2JhbCkge1xuICAgICAgICByZXR1cm4gXCJ7IFtvYmplY3QgZ2xvYmFsVGhpc10gfVwiO1xuICAgICAgfVxuICAgICAgaWYgKCFpc0RhdGUob2JqKSAmJiAhaXNSZWdFeHAob2JqKSkge1xuICAgICAgICB2YXIgeXMgPSBhcnJPYmpLZXlzKG9iaiwgaW5zcGVjdDMpO1xuICAgICAgICB2YXIgaXNQbGFpbk9iamVjdCA9IGdQTyA/IGdQTyhvYmopID09PSBPYmplY3QucHJvdG90eXBlIDogb2JqIGluc3RhbmNlb2YgT2JqZWN0IHx8IG9iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0O1xuICAgICAgICB2YXIgcHJvdG9UYWcgPSBvYmogaW5zdGFuY2VvZiBPYmplY3QgPyBcIlwiIDogXCJudWxsIHByb3RvdHlwZVwiO1xuICAgICAgICB2YXIgc3RyaW5nVGFnID0gIWlzUGxhaW5PYmplY3QgJiYgdG9TdHJpbmdUYWcgJiYgT2JqZWN0KG9iaikgPT09IG9iaiAmJiB0b1N0cmluZ1RhZyBpbiBvYmogPyAkc2xpY2UuY2FsbCh0b1N0cihvYmopLCA4LCAtMSkgOiBwcm90b1RhZyA/IFwiT2JqZWN0XCIgOiBcIlwiO1xuICAgICAgICB2YXIgY29uc3RydWN0b3JUYWcgPSBpc1BsYWluT2JqZWN0IHx8IHR5cGVvZiBvYmouY29uc3RydWN0b3IgIT09IFwiZnVuY3Rpb25cIiA/IFwiXCIgOiBvYmouY29uc3RydWN0b3IubmFtZSA/IG9iai5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgOiBcIlwiO1xuICAgICAgICB2YXIgdGFnID0gY29uc3RydWN0b3JUYWcgKyAoc3RyaW5nVGFnIHx8IHByb3RvVGFnID8gXCJbXCIgKyAkam9pbi5jYWxsKCRjb25jYXQuY2FsbChbXSwgc3RyaW5nVGFnIHx8IFtdLCBwcm90b1RhZyB8fCBbXSksIFwiOiBcIikgKyBcIl0gXCIgOiBcIlwiKTtcbiAgICAgICAgaWYgKHlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiB0YWcgKyBcInt9XCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZGVudCkge1xuICAgICAgICAgIHJldHVybiB0YWcgKyBcIntcIiArIGluZGVudGVkSm9pbih5cywgaW5kZW50KSArIFwifVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YWcgKyBcInsgXCIgKyAkam9pbi5jYWxsKHlzLCBcIiwgXCIpICsgXCIgfVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFN0cmluZyhvYmopO1xuICAgIH07XG4gICAgZnVuY3Rpb24gd3JhcFF1b3RlcyhzLCBkZWZhdWx0U3R5bGUsIG9wdHMpIHtcbiAgICAgIHZhciBzdHlsZSA9IG9wdHMucXVvdGVTdHlsZSB8fCBkZWZhdWx0U3R5bGU7XG4gICAgICB2YXIgcXVvdGVDaGFyID0gcXVvdGVzW3N0eWxlXTtcbiAgICAgIHJldHVybiBxdW90ZUNoYXIgKyBzICsgcXVvdGVDaGFyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBxdW90ZShzKSB7XG4gICAgICByZXR1cm4gJHJlcGxhY2UuY2FsbChTdHJpbmcocyksIC9cIi9nLCBcIiZxdW90O1wiKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2FuVHJ1c3RUb1N0cmluZyhvYmopIHtcbiAgICAgIHJldHVybiAhdG9TdHJpbmdUYWcgfHwgISh0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmICh0b1N0cmluZ1RhZyBpbiBvYmogfHwgdHlwZW9mIG9ialt0b1N0cmluZ1RhZ10gIT09IFwidW5kZWZpbmVkXCIpKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNBcnJheShvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgQXJyYXldXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc0RhdGUob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IERhdGVdXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1JlZ0V4cChvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgUmVnRXhwXVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNFcnJvcihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgRXJyb3JdXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1N0cmluZyhvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgU3RyaW5nXVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNOdW1iZXIob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IE51bWJlcl1cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzQm9vbGVhbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgQm9vbGVhbl1cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzU3ltYm9sKG9iaikge1xuICAgICAgaWYgKGhhc1NoYW1tZWRTeW1ib2xzKSB7XG4gICAgICAgIHJldHVybiBvYmogJiYgdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBvYmogaW5zdGFuY2VvZiBTeW1ib2w7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJzeW1ib2xcIikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICghb2JqIHx8IHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIgfHwgIXN5bVRvU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIHN5bVRvU3RyaW5nLmNhbGwob2JqKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzQmlnSW50KG9iaikge1xuICAgICAgaWYgKCFvYmogfHwgdHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIiB8fCAhYmlnSW50VmFsdWVPZikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBiaWdJbnRWYWx1ZU9mLmNhbGwob2JqKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBoYXNPd24yID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSB8fCBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBrZXkgaW4gdGhpcztcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGhhcyhvYmosIGtleSkge1xuICAgICAgcmV0dXJuIGhhc093bjIuY2FsbChvYmosIGtleSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRvU3RyKG9iaikge1xuICAgICAgcmV0dXJuIG9iamVjdFRvU3RyaW5nLmNhbGwob2JqKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbmFtZU9mKGYpIHtcbiAgICAgIGlmIChmLm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGYubmFtZTtcbiAgICAgIH1cbiAgICAgIHZhciBtID0gJG1hdGNoLmNhbGwoZnVuY3Rpb25Ub1N0cmluZy5jYWxsKGYpLCAvXmZ1bmN0aW9uXFxzKihbXFx3JF0rKS8pO1xuICAgICAgaWYgKG0pIHtcbiAgICAgICAgcmV0dXJuIG1bMV07XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW5kZXhPZih4cywgeCkge1xuICAgICAgaWYgKHhzLmluZGV4T2YpIHtcbiAgICAgICAgcmV0dXJuIHhzLmluZGV4T2YoeCk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHhzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoeHNbaV0gPT09IHgpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc01hcCh4KSB7XG4gICAgICBpZiAoIW1hcFNpemUgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgbWFwU2l6ZS5jYWxsKHgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHNldFNpemUuY2FsbCh4KTtcbiAgICAgICAgfSBjYXRjaCAocykge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgTWFwO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1dlYWtNYXAoeCkge1xuICAgICAgaWYgKCF3ZWFrTWFwSGFzIHx8ICF4IHx8IHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIHdlYWtNYXBIYXMuY2FsbCh4LCB3ZWFrTWFwSGFzKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB3ZWFrU2V0SGFzLmNhbGwoeCwgd2Vha1NldEhhcyk7XG4gICAgICAgIH0gY2F0Y2ggKHMpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geCBpbnN0YW5jZW9mIFdlYWtNYXA7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzV2Vha1JlZih4KSB7XG4gICAgICBpZiAoIXdlYWtSZWZEZXJlZiB8fCAheCB8fCB0eXBlb2YgeCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICB3ZWFrUmVmRGVyZWYuY2FsbCh4KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzU2V0KHgpIHtcbiAgICAgIGlmICghc2V0U2l6ZSB8fCAheCB8fCB0eXBlb2YgeCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBzZXRTaXplLmNhbGwoeCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbWFwU2l6ZS5jYWxsKHgpO1xuICAgICAgICB9IGNhdGNoIChtKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBTZXQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzV2Vha1NldCh4KSB7XG4gICAgICBpZiAoIXdlYWtTZXRIYXMgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgd2Vha1NldEhhcy5jYWxsKHgsIHdlYWtTZXRIYXMpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHdlYWtNYXBIYXMuY2FsbCh4LCB3ZWFrTWFwSGFzKTtcbiAgICAgICAgfSBjYXRjaCAocykge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgV2Vha1NldDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNFbGVtZW50KHgpIHtcbiAgICAgIGlmICgheCB8fCB0eXBlb2YgeCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIEhUTUxFbGVtZW50ICE9PSBcInVuZGVmaW5lZFwiICYmIHggaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0eXBlb2YgeC5ub2RlTmFtZSA9PT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgeC5nZXRBdHRyaWJ1dGUgPT09IFwiZnVuY3Rpb25cIjtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW5zcGVjdFN0cmluZyhzdHIsIG9wdHMpIHtcbiAgICAgIGlmIChzdHIubGVuZ3RoID4gb3B0cy5tYXhTdHJpbmdMZW5ndGgpIHtcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IHN0ci5sZW5ndGggLSBvcHRzLm1heFN0cmluZ0xlbmd0aDtcbiAgICAgICAgdmFyIHRyYWlsZXIgPSBcIi4uLiBcIiArIHJlbWFpbmluZyArIFwiIG1vcmUgY2hhcmFjdGVyXCIgKyAocmVtYWluaW5nID4gMSA/IFwic1wiIDogXCJcIik7XG4gICAgICAgIHJldHVybiBpbnNwZWN0U3RyaW5nKCRzbGljZS5jYWxsKHN0ciwgMCwgb3B0cy5tYXhTdHJpbmdMZW5ndGgpLCBvcHRzKSArIHRyYWlsZXI7XG4gICAgICB9XG4gICAgICB2YXIgcXVvdGVSRSA9IHF1b3RlUkVzW29wdHMucXVvdGVTdHlsZSB8fCBcInNpbmdsZVwiXTtcbiAgICAgIHF1b3RlUkUubGFzdEluZGV4ID0gMDtcbiAgICAgIHZhciBzID0gJHJlcGxhY2UuY2FsbCgkcmVwbGFjZS5jYWxsKHN0ciwgcXVvdGVSRSwgXCJcXFxcJDFcIiksIC9bXFx4MDAtXFx4MWZdL2csIGxvd2J5dGUpO1xuICAgICAgcmV0dXJuIHdyYXBRdW90ZXMocywgXCJzaW5nbGVcIiwgb3B0cyk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGxvd2J5dGUoYykge1xuICAgICAgdmFyIG4gPSBjLmNoYXJDb2RlQXQoMCk7XG4gICAgICB2YXIgeCA9IHtcbiAgICAgICAgODogXCJiXCIsXG4gICAgICAgIDk6IFwidFwiLFxuICAgICAgICAxMDogXCJuXCIsXG4gICAgICAgIDEyOiBcImZcIixcbiAgICAgICAgMTM6IFwiclwiXG4gICAgICB9W25dO1xuICAgICAgaWYgKHgpIHtcbiAgICAgICAgcmV0dXJuIFwiXFxcXFwiICsgeDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBcIlxcXFx4XCIgKyAobiA8IDE2ID8gXCIwXCIgOiBcIlwiKSArICR0b1VwcGVyQ2FzZS5jYWxsKG4udG9TdHJpbmcoMTYpKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbWFya0JveGVkKHN0cikge1xuICAgICAgcmV0dXJuIFwiT2JqZWN0KFwiICsgc3RyICsgXCIpXCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHdlYWtDb2xsZWN0aW9uT2YodHlwZSkge1xuICAgICAgcmV0dXJuIHR5cGUgKyBcIiB7ID8gfVwiO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjb2xsZWN0aW9uT2YodHlwZSwgc2l6ZSwgZW50cmllcywgaW5kZW50KSB7XG4gICAgICB2YXIgam9pbmVkRW50cmllcyA9IGluZGVudCA/IGluZGVudGVkSm9pbihlbnRyaWVzLCBpbmRlbnQpIDogJGpvaW4uY2FsbChlbnRyaWVzLCBcIiwgXCIpO1xuICAgICAgcmV0dXJuIHR5cGUgKyBcIiAoXCIgKyBzaXplICsgXCIpIHtcIiArIGpvaW5lZEVudHJpZXMgKyBcIn1cIjtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2luZ2xlTGluZVZhbHVlcyh4cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaW5kZXhPZih4c1tpXSwgXCJcXG5cIikgPj0gMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldEluZGVudChvcHRzLCBkZXB0aCkge1xuICAgICAgdmFyIGJhc2VJbmRlbnQ7XG4gICAgICBpZiAob3B0cy5pbmRlbnQgPT09IFwiXHRcIikge1xuICAgICAgICBiYXNlSW5kZW50ID0gXCJcdFwiO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0cy5pbmRlbnQgPT09IFwibnVtYmVyXCIgJiYgb3B0cy5pbmRlbnQgPiAwKSB7XG4gICAgICAgIGJhc2VJbmRlbnQgPSAkam9pbi5jYWxsKEFycmF5KG9wdHMuaW5kZW50ICsgMSksIFwiIFwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYmFzZTogYmFzZUluZGVudCxcbiAgICAgICAgcHJldjogJGpvaW4uY2FsbChBcnJheShkZXB0aCArIDEpLCBiYXNlSW5kZW50KVxuICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW5kZW50ZWRKb2luKHhzLCBpbmRlbnQpIHtcbiAgICAgIGlmICh4cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICB9XG4gICAgICB2YXIgbGluZUpvaW5lciA9IFwiXFxuXCIgKyBpbmRlbnQucHJldiArIGluZGVudC5iYXNlO1xuICAgICAgcmV0dXJuIGxpbmVKb2luZXIgKyAkam9pbi5jYWxsKHhzLCBcIixcIiArIGxpbmVKb2luZXIpICsgXCJcXG5cIiArIGluZGVudC5wcmV2O1xuICAgIH1cbiAgICBmdW5jdGlvbiBhcnJPYmpLZXlzKG9iaiwgaW5zcGVjdDMpIHtcbiAgICAgIHZhciBpc0FyciA9IGlzQXJyYXkob2JqKTtcbiAgICAgIHZhciB4cyA9IFtdO1xuICAgICAgaWYgKGlzQXJyKSB7XG4gICAgICAgIHhzLmxlbmd0aCA9IG9iai5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgeHNbaV0gPSBoYXMob2JqLCBpKSA/IGluc3BlY3QzKG9ialtpXSwgb2JqKSA6IFwiXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBzeW1zID0gdHlwZW9mIGdPUFMgPT09IFwiZnVuY3Rpb25cIiA/IGdPUFMob2JqKSA6IFtdO1xuICAgICAgdmFyIHN5bU1hcDtcbiAgICAgIGlmIChoYXNTaGFtbWVkU3ltYm9scykge1xuICAgICAgICBzeW1NYXAgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBzeW1zLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgc3ltTWFwW1wiJFwiICsgc3ltc1trXV0gPSBzeW1zW2tdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmICghaGFzKG9iaiwga2V5KSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0FyciAmJiBTdHJpbmcoTnVtYmVyKGtleSkpID09PSBrZXkgJiYga2V5IDwgb2JqLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNTaGFtbWVkU3ltYm9scyAmJiBzeW1NYXBbXCIkXCIgKyBrZXldIGluc3RhbmNlb2YgU3ltYm9sKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSBpZiAoJHRlc3QuY2FsbCgvW15cXHckXS8sIGtleSkpIHtcbiAgICAgICAgICB4cy5wdXNoKGluc3BlY3QzKGtleSwgb2JqKSArIFwiOiBcIiArIGluc3BlY3QzKG9ialtrZXldLCBvYmopKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB4cy5wdXNoKGtleSArIFwiOiBcIiArIGluc3BlY3QzKG9ialtrZXldLCBvYmopKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBnT1BTID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzeW1zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKGlzRW51bWVyYWJsZS5jYWxsKG9iaiwgc3ltc1tqXSkpIHtcbiAgICAgICAgICAgIHhzLnB1c2goXCJbXCIgKyBpbnNwZWN0MyhzeW1zW2pdKSArIFwiXTogXCIgKyBpbnNwZWN0MyhvYmpbc3ltc1tqXV0sIG9iaikpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHhzO1xuICAgIH1cbiAgfVxufSk7XG5cbi8vIHNyYy9saWIvdGltZV9kdXJhdGlvbi50c1xudmFyIFRpbWVEdXJhdGlvbiA9IGNsYXNzIF9UaW1lRHVyYXRpb24ge1xuICBfX3RpbWVfZHVyYXRpb25fbWljcm9zX187XG4gIHN0YXRpYyBNSUNST1NfUEVSX01JTExJUyA9IDEwMDBuO1xuICAvKipcbiAgICogR2V0IHRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUge0BsaW5rIFRpbWVEdXJhdGlvbn0gdHlwZS5cbiAgICogQHJldHVybnMgVGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0eXBlLlxuICAgKi9cbiAgc3RhdGljIGdldEFsZ2VicmFpY1R5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7XG4gICAgICBlbGVtZW50czogW1xuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogXCJfX3RpbWVfZHVyYXRpb25fbWljcm9zX19cIixcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLkk2NFxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSk7XG4gIH1cbiAgc3RhdGljIGlzVGltZUR1cmF0aW9uKGFsZ2VicmFpY1R5cGUpIHtcbiAgICBpZiAoYWxnZWJyYWljVHlwZS50YWcgIT09IFwiUHJvZHVjdFwiKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGVsZW1lbnRzID0gYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cztcbiAgICBpZiAoZWxlbWVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IG1pY3Jvc0VsZW1lbnQgPSBlbGVtZW50c1swXTtcbiAgICByZXR1cm4gbWljcm9zRWxlbWVudC5uYW1lID09PSBcIl9fdGltZV9kdXJhdGlvbl9taWNyb3NfX1wiICYmIG1pY3Jvc0VsZW1lbnQuYWxnZWJyYWljVHlwZS50YWcgPT09IFwiSTY0XCI7XG4gIH1cbiAgZ2V0IG1pY3JvcygpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWVfZHVyYXRpb25fbWljcm9zX187XG4gIH1cbiAgZ2V0IG1pbGxpcygpIHtcbiAgICByZXR1cm4gTnVtYmVyKHRoaXMubWljcm9zIC8gX1RpbWVEdXJhdGlvbi5NSUNST1NfUEVSX01JTExJUyk7XG4gIH1cbiAgY29uc3RydWN0b3IobWljcm9zKSB7XG4gICAgdGhpcy5fX3RpbWVfZHVyYXRpb25fbWljcm9zX18gPSBtaWNyb3M7XG4gIH1cbiAgc3RhdGljIGZyb21NaWxsaXMobWlsbGlzKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZUR1cmF0aW9uKEJpZ0ludChtaWxsaXMpICogX1RpbWVEdXJhdGlvbi5NSUNST1NfUEVSX01JTExJUyk7XG4gIH1cbiAgLyoqIFRoaXMgb3V0cHV0cyB0aGUgc2FtZSBzdHJpbmcgZm9ybWF0IHRoYXQgd2UgdXNlIGluIHRoZSBob3N0IGFuZCBpbiBSdXN0IG1vZHVsZXMgKi9cbiAgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgbWljcm9zID0gdGhpcy5taWNyb3M7XG4gICAgY29uc3Qgc2lnbiA9IG1pY3JvcyA8IDAgPyBcIi1cIiA6IFwiK1wiO1xuICAgIGNvbnN0IHBvcyA9IG1pY3JvcyA8IDAgPyAtbWljcm9zIDogbWljcm9zO1xuICAgIGNvbnN0IHNlY3MgPSBwb3MgLyAxMDAwMDAwbjtcbiAgICBjb25zdCBtaWNyb3NfcmVtYWluaW5nID0gcG9zICUgMTAwMDAwMG47XG4gICAgcmV0dXJuIGAke3NpZ259JHtzZWNzfS4ke1N0cmluZyhtaWNyb3NfcmVtYWluaW5nKS5wYWRTdGFydCg2LCBcIjBcIil9YDtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi90aW1lc3RhbXAudHNcbnZhciBUaW1lc3RhbXAgPSBjbGFzcyBfVGltZXN0YW1wIHtcbiAgX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXztcbiAgc3RhdGljIE1JQ1JPU19QRVJfTUlMTElTID0gMTAwMG47XG4gIGdldCBtaWNyb3NTaW5jZVVuaXhFcG9jaCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fO1xuICB9XG4gIGNvbnN0cnVjdG9yKG1pY3Jvcykge1xuICAgIHRoaXMuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXyA9IG1pY3JvcztcbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUge0BsaW5rIFRpbWVzdGFtcH0gdHlwZS5cbiAgICogQHJldHVybnMgVGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0eXBlLlxuICAgKi9cbiAgc3RhdGljIGdldEFsZ2VicmFpY1R5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7XG4gICAgICBlbGVtZW50czogW1xuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogXCJfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fXCIsXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogQWxnZWJyYWljVHlwZS5JNjRcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pO1xuICB9XG4gIHN0YXRpYyBpc1RpbWVzdGFtcChhbGdlYnJhaWNUeXBlKSB7XG4gICAgaWYgKGFsZ2VicmFpY1R5cGUudGFnICE9PSBcIlByb2R1Y3RcIikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBlbGVtZW50cyA9IGFsZ2VicmFpY1R5cGUudmFsdWUuZWxlbWVudHM7XG4gICAgaWYgKGVsZW1lbnRzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBtaWNyb3NFbGVtZW50ID0gZWxlbWVudHNbMF07XG4gICAgcmV0dXJuIG1pY3Jvc0VsZW1lbnQubmFtZSA9PT0gXCJfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fXCIgJiYgbWljcm9zRWxlbWVudC5hbGdlYnJhaWNUeXBlLnRhZyA9PT0gXCJJNjRcIjtcbiAgfVxuICAvKipcbiAgICogVGhlIFVuaXggZXBvY2gsIHRoZSBtaWRuaWdodCBhdCB0aGUgYmVnaW5uaW5nIG9mIEphbnVhcnkgMSwgMTk3MCwgVVRDLlxuICAgKi9cbiAgc3RhdGljIFVOSVhfRVBPQ0ggPSBuZXcgX1RpbWVzdGFtcCgwbik7XG4gIC8qKlxuICAgKiBHZXQgYSBgVGltZXN0YW1wYCByZXByZXNlbnRpbmcgdGhlIGV4ZWN1dGlvbiBlbnZpcm9ubWVudCdzIGJlbGllZiBvZiB0aGUgY3VycmVudCBtb21lbnQgaW4gdGltZS5cbiAgICovXG4gIHN0YXRpYyBub3coKSB7XG4gICAgcmV0dXJuIF9UaW1lc3RhbXAuZnJvbURhdGUoLyogQF9fUFVSRV9fICovIG5ldyBEYXRlKCkpO1xuICB9XG4gIC8qKiBDb252ZXJ0IHRvIG1pbGxpc2Vjb25kcyBzaW5jZSBVbml4IGVwb2NoLiAqL1xuICB0b01pbGxpcygpIHtcbiAgICByZXR1cm4gdGhpcy5taWNyb3NTaW5jZVVuaXhFcG9jaCAvIDEwMDBuO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgYSBgVGltZXN0YW1wYCByZXByZXNlbnRpbmcgdGhlIHNhbWUgcG9pbnQgaW4gdGltZSBhcyBgZGF0ZWAuXG4gICAqL1xuICBzdGF0aWMgZnJvbURhdGUoZGF0ZSkge1xuICAgIGNvbnN0IG1pbGxpcyA9IGRhdGUuZ2V0VGltZSgpO1xuICAgIGNvbnN0IG1pY3JvcyA9IEJpZ0ludChtaWxsaXMpICogX1RpbWVzdGFtcC5NSUNST1NfUEVSX01JTExJUztcbiAgICByZXR1cm4gbmV3IF9UaW1lc3RhbXAobWljcm9zKTtcbiAgfVxuICAvKipcbiAgICogR2V0IGEgYERhdGVgIHJlcHJlc2VudGluZyBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIHBvaW50IGluIHRpbWUgYXMgYHRoaXNgLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCB0cnVuY2F0ZXMgdG8gbWlsbGlzZWNvbmQgcHJlY2lzaW9uLFxuICAgKiBhbmQgdGhyb3dzIGBSYW5nZUVycm9yYCBpZiB0aGUgYFRpbWVzdGFtcGAgaXMgb3V0c2lkZSB0aGUgcmFuZ2UgcmVwcmVzZW50YWJsZSBhcyBhIGBEYXRlYC5cbiAgICovXG4gIHRvRGF0ZSgpIHtcbiAgICBjb25zdCBtaWNyb3MgPSB0aGlzLl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX187XG4gICAgY29uc3QgbWlsbGlzID0gbWljcm9zIC8gX1RpbWVzdGFtcC5NSUNST1NfUEVSX01JTExJUztcbiAgICBpZiAobWlsbGlzID4gQmlnSW50KE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSB8fCBtaWxsaXMgPCBCaWdJbnQoTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIpKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcbiAgICAgICAgXCJUaW1lc3RhbXAgaXMgb3V0c2lkZSBvZiB0aGUgcmVwcmVzZW50YWJsZSByYW5nZSBvZiBKUydzIERhdGVcIlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEYXRlKE51bWJlcihtaWxsaXMpKTtcbiAgfVxuICAvKipcbiAgICogR2V0IGFuIElTTyA4NjAxIC8gUkZDIDMzMzkgZm9ybWF0dGVkIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIHRpbWVzdGFtcCB3aXRoIG1pY3Jvc2Vjb25kIHByZWNpc2lvbi5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgcHJlc2VydmVzIHRoZSBmdWxsIG1pY3Jvc2Vjb25kIHByZWNpc2lvbiBvZiB0aGUgdGltZXN0YW1wLFxuICAgKiBhbmQgdGhyb3dzIGBSYW5nZUVycm9yYCBpZiB0aGUgYFRpbWVzdGFtcGAgaXMgb3V0c2lkZSB0aGUgcmFuZ2UgcmVwcmVzZW50YWJsZSBpbiBJU08gZm9ybWF0LlxuICAgKlxuICAgKiBAcmV0dXJucyBJU08gODYwMSBmb3JtYXR0ZWQgc3RyaW5nIHdpdGggbWljcm9zZWNvbmQgcHJlY2lzaW9uIChlLmcuLCAnMjAyNS0wMi0xN1QxMDozMDo0NS4xMjM0NTZaJylcbiAgICovXG4gIHRvSVNPU3RyaW5nKCkge1xuICAgIGNvbnN0IG1pY3JvcyA9IHRoaXMuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXztcbiAgICBjb25zdCBtaWxsaXMgPSBtaWNyb3MgLyBfVGltZXN0YW1wLk1JQ1JPU19QRVJfTUlMTElTO1xuICAgIGlmIChtaWxsaXMgPiBCaWdJbnQoTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHx8IG1pbGxpcyA8IEJpZ0ludChOdW1iZXIuTUlOX1NBRkVfSU5URUdFUikpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFxuICAgICAgICBcIlRpbWVzdGFtcCBpcyBvdXRzaWRlIG9mIHRoZSByZXByZXNlbnRhYmxlIHJhbmdlIGZvciBJU08gc3RyaW5nIGZvcm1hdHRpbmdcIlxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKE51bWJlcihtaWxsaXMpKTtcbiAgICBjb25zdCBpc29CYXNlID0gZGF0ZS50b0lTT1N0cmluZygpO1xuICAgIGNvbnN0IG1pY3Jvc1JlbWFpbmRlciA9IE1hdGguYWJzKE51bWJlcihtaWNyb3MgJSAxMDAwMDAwbikpO1xuICAgIGNvbnN0IGZyYWN0aW9uYWxQYXJ0ID0gU3RyaW5nKG1pY3Jvc1JlbWFpbmRlcikucGFkU3RhcnQoNiwgXCIwXCIpO1xuICAgIHJldHVybiBpc29CYXNlLnJlcGxhY2UoL1xcLlxcZHszfVokLywgYC4ke2ZyYWN0aW9uYWxQYXJ0fVpgKTtcbiAgfVxuICBzaW5jZShvdGhlcikge1xuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uKFxuICAgICAgdGhpcy5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fIC0gb3RoZXIuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfX1xuICAgICk7XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvdXVpZC50c1xudmFyIFV1aWQgPSBjbGFzcyBfVXVpZCB7XG4gIF9fdXVpZF9fO1xuICAvKipcbiAgICogVGhlIG5pbCBVVUlEIChhbGwgemVyb3MpLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0c1xuICAgKiBjb25zdCB1dWlkID0gVXVpZC5OSUw7XG4gICAqIGNvbnNvbGUuYXNzZXJ0KFxuICAgKiAgIHV1aWQudG9TdHJpbmcoKSA9PT0gXCIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDBcIlxuICAgKiApO1xuICAgKiBgYGBcbiAgICovXG4gIHN0YXRpYyBOSUwgPSBuZXcgX1V1aWQoMG4pO1xuICBzdGF0aWMgTUFYX1VVSURfQklHSU5UID0gMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZm47XG4gIC8qKlxuICAgKiBUaGUgbWF4IFVVSUQgKGFsbCBvbmVzKS5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgdHNcbiAgICogY29uc3QgdXVpZCA9IFV1aWQuTUFYO1xuICAgKiBjb25zb2xlLmFzc2VydChcbiAgICogICB1dWlkLnRvU3RyaW5nKCkgPT09IFwiZmZmZmZmZmYtZmZmZi1mZmZmLWZmZmYtZmZmZmZmZmZmZmZmXCJcbiAgICogKTtcbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgTUFYID0gbmV3IF9VdWlkKF9VdWlkLk1BWF9VVUlEX0JJR0lOVCk7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBVVUlEIGZyb20gYSByYXcgMTI4LWJpdCB2YWx1ZS5cbiAgICpcbiAgICogQHBhcmFtIHUgLSBVbnNpZ25lZCAxMjgtYml0IGludGVnZXJcbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSB2YWx1ZSBpcyBvdXRzaWRlIHRoZSB2YWxpZCBVVUlEIHJhbmdlXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih1KSB7XG4gICAgaWYgKHUgPCAwbiB8fCB1ID4gX1V1aWQuTUFYX1VVSURfQklHSU5UKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIFVVSUQ6IG11c3QgYmUgYmV0d2VlbiAwIGFuZCBgTUFYX1VVSURfQklHSU5UYFwiKTtcbiAgICB9XG4gICAgdGhpcy5fX3V1aWRfXyA9IHU7XG4gIH1cbiAgLyoqXG4gICAqIENyZWF0ZSBhIFVVSUQgYHY0YCBmcm9tIGV4cGxpY2l0IHJhbmRvbSBieXRlcy5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgYXNzdW1lcyB0aGUgYnl0ZXMgYXJlIGFscmVhZHkgc3VmZmljaWVudGx5IHJhbmRvbS5cbiAgICogSXQgb25seSBzZXRzIHRoZSBhcHByb3ByaWF0ZSBiaXRzIGZvciB0aGUgVVVJRCB2ZXJzaW9uIGFuZCB2YXJpYW50LlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgLSBFeGFjdGx5IDE2IHJhbmRvbSBieXRlc1xuICAgKiBAcmV0dXJucyBBIFVVSUQgYHY0YFxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgYGJ5dGVzLmxlbmd0aCAhPT0gMTZgXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHRzXG4gICAqIGNvbnN0IHJhbmRvbUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuICAgKiBjb25zdCB1dWlkID0gVXVpZC5mcm9tUmFuZG9tQnl0ZXNWNChyYW5kb21CeXRlcyk7XG4gICAqXG4gICAqIGNvbnNvbGUuYXNzZXJ0KFxuICAgKiAgIHV1aWQudG9TdHJpbmcoKSA9PT0gXCIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDBcIlxuICAgKiApO1xuICAgKiBgYGBcbiAgICovXG4gIHN0YXRpYyBmcm9tUmFuZG9tQnl0ZXNWNChieXRlcykge1xuICAgIGlmIChieXRlcy5sZW5ndGggIT09IDE2KSB0aHJvdyBuZXcgRXJyb3IoXCJVVUlEIHY0IHJlcXVpcmVzIDE2IGJ5dGVzXCIpO1xuICAgIGNvbnN0IGFyciA9IG5ldyBVaW50OEFycmF5KGJ5dGVzKTtcbiAgICBhcnJbNl0gPSBhcnJbNl0gJiAxNSB8IDY0O1xuICAgIGFycls4XSA9IGFycls4XSAmIDYzIHwgMTI4O1xuICAgIHJldHVybiBuZXcgX1V1aWQoX1V1aWQuYnl0ZXNUb0JpZ0ludChhcnIpKTtcbiAgfVxuICAvKipcbiAgICogR2VuZXJhdGUgYSBVVUlEIGB2N2AgdXNpbmcgYSBtb25vdG9uaWMgY291bnRlciBmcm9tIGAwYCB0byBgMl4zMSAtIDFgLFxuICAgKiBhIHRpbWVzdGFtcCwgYW5kIDQgcmFuZG9tIGJ5dGVzLlxuICAgKlxuICAgKiBUaGUgY291bnRlciB3cmFwcyBhcm91bmQgb24gb3ZlcmZsb3cuXG4gICAqXG4gICAqIFRoZSBVVUlEIGB2N2AgaXMgc3RydWN0dXJlZCBhcyBmb2xsb3dzOlxuICAgKlxuICAgKiBgYGBhc2NpaVxuICAgKiDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilKzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbiAgICogfCBCMCAgfCBCMSAgfCBCMiAgfCBCMyAgfCBCNCAgfCBCNSAgICAgICAgICAgICAgfCAgICAgICAgIEI2ICAgICAgICB8XG4gICAqIOKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpFxuICAgKiB8ICAgICAgICAgICAgICAgICB1bml4X3RzX21zICAgICAgICAgICAgICAgICAgICB8ICAgICAgdmVyc2lvbiA3ICAgIHxcbiAgICog4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS04pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4gICAqIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuICAgKiB8IEI3ICAgICAgICAgICB8IEI4ICAgICAgfCBCOSAgfCBCMTAgfCBCMTEgIHwgQjEyIHwgQjEzIHwgQjE0IHwgQjE1IHxcbiAgICog4pSc4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS84pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS84pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS84pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkXG4gICAqIHwgY291bnRlcl9oaWdoIHwgdmFyaWFudCB8ICAgIGNvdW50ZXJfbG93ICAgfCAgICAgICAgcmFuZG9tICAgICAgICAgfFxuICAgKiDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilLTilIDilIDilIDilIDilIDilIDilIDilIDilIDilLTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilLTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBjb3VudGVyIC0gTXV0YWJsZSBtb25vdG9uaWMgY291bnRlciAoMzEtYml0KVxuICAgKiBAcGFyYW0gbm93IC0gVGltZXN0YW1wIHNpbmNlIHRoZSBVbml4IGVwb2NoXG4gICAqIEBwYXJhbSByYW5kb21CeXRlcyAtIEV4YWN0bHkgNCByYW5kb20gYnl0ZXNcbiAgICogQHJldHVybnMgQSBVVUlEIGB2N2BcbiAgICpcbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBgY291bnRlcmAgaXMgbmVnYXRpdmVcbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBgdGltZXN0YW1wYCBpcyBiZWZvcmUgdGhlIFVuaXggZXBvY2hcbiAgICogQHRocm93cyB7RXJyb3J9IElmIGByYW5kb21CeXRlcy5sZW5ndGggIT09IDRgXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHRzXG4gICAqIGNvbnN0IG5vdyA9IFRpbWVzdGFtcC5mcm9tTWlsbGlzKDFfNjg2XzAwMF8wMDBfMDAwbik7XG4gICAqIGNvbnN0IGNvdW50ZXIgPSB7IHZhbHVlOiAxIH07XG4gICAqIGNvbnN0IHJhbmRvbUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoNCk7XG4gICAqXG4gICAqIGNvbnN0IHV1aWQgPSBVdWlkLmZyb21Db3VudGVyVjcoY291bnRlciwgbm93LCByYW5kb21CeXRlcyk7XG4gICAqXG4gICAqIGNvbnNvbGUuYXNzZXJ0KFxuICAgKiAgIHV1aWQudG9TdHJpbmcoKSA9PT0gXCIwMDAwNjQ3ZS01MTgwLTcwMDAtODAwMC0wMDAyMDAwMDAwMDBcIlxuICAgKiApO1xuICAgKiBgYGBcbiAgICovXG4gIHN0YXRpYyBmcm9tQ291bnRlclY3KGNvdW50ZXIsIG5vdywgcmFuZG9tQnl0ZXMpIHtcbiAgICBpZiAocmFuZG9tQnl0ZXMubGVuZ3RoICE9PSA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJgZnJvbUNvdW50ZXJWN2AgcmVxdWlyZXMgYHJhbmRvbUJ5dGVzLmxlbmd0aCA9PSA0YFwiKTtcbiAgICB9XG4gICAgaWYgKGNvdW50ZXIudmFsdWUgPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJgZnJvbUNvdW50ZXJWN2AgdXVpZCBgY291bnRlcmAgbXVzdCBiZSBub24tbmVnYXRpdmVcIik7XG4gICAgfVxuICAgIGlmIChub3cuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXyA8IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImBmcm9tQ291bnRlclY3YCBgdGltZXN0YW1wYCBiZWZvcmUgdW5peCBlcG9jaFwiKTtcbiAgICB9XG4gICAgY29uc3QgY291bnRlclZhbCA9IGNvdW50ZXIudmFsdWU7XG4gICAgY291bnRlci52YWx1ZSA9IGNvdW50ZXJWYWwgKyAxICYgMjE0NzQ4MzY0NztcbiAgICBjb25zdCB0c01zID0gbm93LnRvTWlsbGlzKCkgJiAweGZmZmZmZmZmZmZmZm47XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheSgxNik7XG4gICAgYnl0ZXNbMF0gPSBOdW1iZXIodHNNcyA+PiA0MG4gJiAweGZmbik7XG4gICAgYnl0ZXNbMV0gPSBOdW1iZXIodHNNcyA+PiAzMm4gJiAweGZmbik7XG4gICAgYnl0ZXNbMl0gPSBOdW1iZXIodHNNcyA+PiAyNG4gJiAweGZmbik7XG4gICAgYnl0ZXNbM10gPSBOdW1iZXIodHNNcyA+PiAxNm4gJiAweGZmbik7XG4gICAgYnl0ZXNbNF0gPSBOdW1iZXIodHNNcyA+PiA4biAmIDB4ZmZuKTtcbiAgICBieXRlc1s1XSA9IE51bWJlcih0c01zICYgMHhmZm4pO1xuICAgIGJ5dGVzWzddID0gY291bnRlclZhbCA+Pj4gMjMgJiAyNTU7XG4gICAgYnl0ZXNbOV0gPSBjb3VudGVyVmFsID4+PiAxNSAmIDI1NTtcbiAgICBieXRlc1sxMF0gPSBjb3VudGVyVmFsID4+PiA3ICYgMjU1O1xuICAgIGJ5dGVzWzExXSA9IChjb3VudGVyVmFsICYgMTI3KSA8PCAxICYgMjU1O1xuICAgIGJ5dGVzWzEyXSB8PSByYW5kb21CeXRlc1swXSAmIDEyNztcbiAgICBieXRlc1sxM10gPSByYW5kb21CeXRlc1sxXTtcbiAgICBieXRlc1sxNF0gPSByYW5kb21CeXRlc1syXTtcbiAgICBieXRlc1sxNV0gPSByYW5kb21CeXRlc1szXTtcbiAgICBieXRlc1s2XSA9IGJ5dGVzWzZdICYgMTUgfCAxMTI7XG4gICAgYnl0ZXNbOF0gPSBieXRlc1s4XSAmIDYzIHwgMTI4O1xuICAgIHJldHVybiBuZXcgX1V1aWQoX1V1aWQuYnl0ZXNUb0JpZ0ludChieXRlcykpO1xuICB9XG4gIC8qKlxuICAgKiBQYXJzZSBhIFVVSUQgZnJvbSBhIHN0cmluZyByZXByZXNlbnRhdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHMgLSBVVUlEIHN0cmluZ1xuICAgKiBAcmV0dXJucyBQYXJzZWQgVVVJRFxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHN0cmluZyBpcyBub3QgYSB2YWxpZCBVVUlEXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHRzXG4gICAqIGNvbnN0IHMgPSBcIjAxODg4ZDZlLTVjMDAtNzAwMC04MDAwLTAwMDAwMDAwMDAwMFwiO1xuICAgKiBjb25zdCB1dWlkID0gVXVpZC5wYXJzZShzKTtcbiAgICpcbiAgICogY29uc29sZS5hc3NlcnQodXVpZC50b1N0cmluZygpID09PSBzKTtcbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgcGFyc2Uocykge1xuICAgIGNvbnN0IGhleCA9IHMucmVwbGFjZSgvLS9nLCBcIlwiKTtcbiAgICBpZiAoaGV4Lmxlbmd0aCAhPT0gMzIpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaGV4IFVVSURcIik7XG4gICAgbGV0IHYgPSAwbjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDMyOyBpICs9IDIpIHtcbiAgICAgIHYgPSB2IDw8IDhuIHwgQmlnSW50KHBhcnNlSW50KGhleC5zbGljZShpLCBpICsgMiksIDE2KSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgX1V1aWQodik7XG4gIH1cbiAgLyoqIENvbnZlcnQgdG8gc3RyaW5nIChoeXBoZW5hdGVkIGZvcm0pLiAqL1xuICB0b1N0cmluZygpIHtcbiAgICBjb25zdCBieXRlcyA9IF9VdWlkLmJpZ0ludFRvQnl0ZXModGhpcy5fX3V1aWRfXyk7XG4gICAgY29uc3QgaGV4ID0gWy4uLmJ5dGVzXS5tYXAoKGIpID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsIFwiMFwiKSkuam9pbihcIlwiKTtcbiAgICByZXR1cm4gaGV4LnNsaWNlKDAsIDgpICsgXCItXCIgKyBoZXguc2xpY2UoOCwgMTIpICsgXCItXCIgKyBoZXguc2xpY2UoMTIsIDE2KSArIFwiLVwiICsgaGV4LnNsaWNlKDE2LCAyMCkgKyBcIi1cIiArIGhleC5zbGljZSgyMCk7XG4gIH1cbiAgLyoqIENvbnZlcnQgdG8gYmlnaW50ICh1MTI4KS4gKi9cbiAgYXNCaWdJbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX191dWlkX187XG4gIH1cbiAgLyoqIFJldHVybiBhIGBVaW50OEFycmF5YCBvZiAxNiBieXRlcy4gKi9cbiAgdG9CeXRlcygpIHtcbiAgICByZXR1cm4gX1V1aWQuYmlnSW50VG9CeXRlcyh0aGlzLl9fdXVpZF9fKTtcbiAgfVxuICBzdGF0aWMgYnl0ZXNUb0JpZ0ludChieXRlcykge1xuICAgIGxldCByZXN1bHQgPSAwbjtcbiAgICBmb3IgKGNvbnN0IGIgb2YgYnl0ZXMpIHJlc3VsdCA9IHJlc3VsdCA8PCA4biB8IEJpZ0ludChiKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIHN0YXRpYyBiaWdJbnRUb0J5dGVzKHZhbHVlKSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheSgxNik7XG4gICAgZm9yIChsZXQgaSA9IDE1OyBpID49IDA7IGktLSkge1xuICAgICAgYnl0ZXNbaV0gPSBOdW1iZXIodmFsdWUgJiAweGZmbik7XG4gICAgICB2YWx1ZSA+Pj0gOG47XG4gICAgfVxuICAgIHJldHVybiBieXRlcztcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmVyc2lvbiBvZiB0aGlzIFVVSUQuXG4gICAqXG4gICAqIFRoaXMgcmVwcmVzZW50cyB0aGUgYWxnb3JpdGhtIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIHZhbHVlLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGBVdWlkVmVyc2lvbmBcbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSB2ZXJzaW9uIGZpZWxkIGlzIG5vdCByZWNvZ25pemVkXG4gICAqL1xuICBnZXRWZXJzaW9uKCkge1xuICAgIGNvbnN0IHZlcnNpb24gPSB0aGlzLnRvQnl0ZXMoKVs2XSA+PiA0ICYgMTU7XG4gICAgc3dpdGNoICh2ZXJzaW9uKSB7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIHJldHVybiBcIlY0XCI7XG4gICAgICBjYXNlIDc6XG4gICAgICAgIHJldHVybiBcIlY3XCI7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAodGhpcyA9PSBfVXVpZC5OSUwpIHtcbiAgICAgICAgICByZXR1cm4gXCJOaWxcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcyA9PSBfVXVpZC5NQVgpIHtcbiAgICAgICAgICByZXR1cm4gXCJNYXhcIjtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIFVVSUQgdmVyc2lvbjogJHt2ZXJzaW9ufWApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogRXh0cmFjdCB0aGUgbW9ub3RvbmljIGNvdW50ZXIgZnJvbSBhIFVVSUR2Ny5cbiAgICpcbiAgICogSW50ZW5kZWQgZm9yIHRlc3RpbmcgYW5kIGRpYWdub3N0aWNzLlxuICAgKiBCZWhhdmlvciBpcyB1bmRlZmluZWQgaWYgY2FsbGVkIG9uIGEgbm9uLVY3IFVVSUQuXG4gICAqXG4gICAqIEByZXR1cm5zIDMxLWJpdCBjb3VudGVyIHZhbHVlXG4gICAqL1xuICBnZXRDb3VudGVyKCkge1xuICAgIGNvbnN0IGJ5dGVzID0gdGhpcy50b0J5dGVzKCk7XG4gICAgY29uc3QgaGlnaCA9IGJ5dGVzWzddO1xuICAgIGNvbnN0IG1pZDEgPSBieXRlc1s5XTtcbiAgICBjb25zdCBtaWQyID0gYnl0ZXNbMTBdO1xuICAgIGNvbnN0IGxvdyA9IGJ5dGVzWzExXSA+Pj4gMTtcbiAgICByZXR1cm4gaGlnaCA8PCAyMyB8IG1pZDEgPDwgMTUgfCBtaWQyIDw8IDcgfCBsb3cgfCAwO1xuICB9XG4gIGNvbXBhcmVUbyhvdGhlcikge1xuICAgIGlmICh0aGlzLl9fdXVpZF9fIDwgb3RoZXIuX191dWlkX18pIHJldHVybiAtMTtcbiAgICBpZiAodGhpcy5fX3V1aWRfXyA+IG90aGVyLl9fdXVpZF9fKSByZXR1cm4gMTtcbiAgICByZXR1cm4gMDtcbiAgfVxuICBzdGF0aWMgZ2V0QWxnZWJyYWljVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcbiAgICAgIGVsZW1lbnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBcIl9fdXVpZF9fXCIsXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogQWxnZWJyYWljVHlwZS5VMTI4XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KTtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi9iaW5hcnlfcmVhZGVyLnRzXG52YXIgQmluYXJ5UmVhZGVyID0gY2xhc3Mge1xuICAvKipcbiAgICogVGhlIERhdGFWaWV3IHVzZWQgdG8gcmVhZCB2YWx1ZXMgZnJvbSB0aGUgYmluYXJ5IGRhdGEuXG4gICAqXG4gICAqIE5vdGU6IFRoZSBEYXRhVmlldydzIGBieXRlT2Zmc2V0YCBpcyByZWxhdGl2ZSB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZVxuICAgKiB1bmRlcmx5aW5nIEFycmF5QnVmZmVyLCBub3QgdGhlIHN0YXJ0IG9mIHRoZSBwcm92aWRlZCBVaW50OEFycmF5IGlucHV0LlxuICAgKiBUaGlzIGBCaW5hcnlSZWFkZXJgJ3MgYCNvZmZzZXRgIGZpZWxkIGlzIHVzZWQgdG8gdHJhY2sgdGhlIGN1cnJlbnQgcmVhZCBwb3NpdGlvblxuICAgKiByZWxhdGl2ZSB0byB0aGUgc3RhcnQgb2YgdGhlIHByb3ZpZGVkIFVpbnQ4QXJyYXkgaW5wdXQuXG4gICAqL1xuICB2aWV3O1xuICAvKipcbiAgICogUmVwcmVzZW50cyB0aGUgb2Zmc2V0IChpbiBieXRlcykgcmVsYXRpdmUgdG8gdGhlIHN0YXJ0IG9mIHRoZSBEYXRhVmlld1xuICAgKiBhbmQgcHJvdmlkZWQgVWludDhBcnJheSBpbnB1dC5cbiAgICpcbiAgICogTm90ZTogVGhpcyBpcyAqbm90KiB0aGUgYWJzb2x1dGUgYnl0ZSBvZmZzZXQgd2l0aGluIHRoZSB1bmRlcmx5aW5nIEFycmF5QnVmZmVyLlxuICAgKi9cbiAgb2Zmc2V0ID0gMDtcbiAgY29uc3RydWN0b3IoaW5wdXQpIHtcbiAgICB0aGlzLnZpZXcgPSBpbnB1dCBpbnN0YW5jZW9mIERhdGFWaWV3ID8gaW5wdXQgOiBuZXcgRGF0YVZpZXcoaW5wdXQuYnVmZmVyLCBpbnB1dC5ieXRlT2Zmc2V0LCBpbnB1dC5ieXRlTGVuZ3RoKTtcbiAgICB0aGlzLm9mZnNldCA9IDA7XG4gIH1cbiAgcmVzZXQoaW5wdXQpIHtcbiAgICB0aGlzLnZpZXcgPSBpbnB1dCBpbnN0YW5jZW9mIERhdGFWaWV3ID8gaW5wdXQgOiBuZXcgRGF0YVZpZXcoaW5wdXQuYnVmZmVyLCBpbnB1dC5ieXRlT2Zmc2V0LCBpbnB1dC5ieXRlTGVuZ3RoKTtcbiAgICB0aGlzLm9mZnNldCA9IDA7XG4gIH1cbiAgZ2V0IHJlbWFpbmluZygpIHtcbiAgICByZXR1cm4gdGhpcy52aWV3LmJ5dGVMZW5ndGggLSB0aGlzLm9mZnNldDtcbiAgfVxuICAvKiogRW5zdXJlIHdlIGhhdmUgYXQgbGVhc3QgYG5gIGJ5dGVzIGxlZnQgdG8gcmVhZCAqL1xuICAjZW5zdXJlKG4pIHtcbiAgICBpZiAodGhpcy5vZmZzZXQgKyBuID4gdGhpcy52aWV3LmJ5dGVMZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFxuICAgICAgICBgVHJpZWQgdG8gcmVhZCAke259IGJ5dGUocykgYXQgcmVsYXRpdmUgb2Zmc2V0ICR7dGhpcy5vZmZzZXR9LCBidXQgb25seSAke3RoaXMucmVtYWluaW5nfSBieXRlKHMpIHJlbWFpbmBcbiAgICAgICk7XG4gICAgfVxuICB9XG4gIHJlYWRVSW50OEFycmF5KCkge1xuICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMucmVhZFUzMigpO1xuICAgIHRoaXMuI2Vuc3VyZShsZW5ndGgpO1xuICAgIHJldHVybiB0aGlzLnJlYWRCeXRlcyhsZW5ndGgpO1xuICB9XG4gIHJlYWRCb29sKCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldFVpbnQ4KHRoaXMub2Zmc2V0KTtcbiAgICB0aGlzLm9mZnNldCArPSAxO1xuICAgIHJldHVybiB2YWx1ZSAhPT0gMDtcbiAgfVxuICByZWFkQnl0ZSgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRVaW50OCh0aGlzLm9mZnNldCk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZEJ5dGVzKGxlbmd0aCkge1xuICAgIGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoXG4gICAgICB0aGlzLnZpZXcuYnVmZmVyLFxuICAgICAgdGhpcy52aWV3LmJ5dGVPZmZzZXQgKyB0aGlzLm9mZnNldCxcbiAgICAgIGxlbmd0aFxuICAgICk7XG4gICAgdGhpcy5vZmZzZXQgKz0gbGVuZ3RoO1xuICAgIHJldHVybiBhcnJheTtcbiAgfVxuICByZWFkSTgoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0SW50OCh0aGlzLm9mZnNldCk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZFU4KCkge1xuICAgIHJldHVybiB0aGlzLnJlYWRCeXRlKCk7XG4gIH1cbiAgcmVhZEkxNigpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRJbnQxNih0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMjtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZFUxNigpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRVaW50MTYodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDI7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJlYWRJMzIoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0SW50MzIodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJlYWRVMzIoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0VWludDMyKHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA0O1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZWFkSTY0KCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldEJpZ0ludDY0KHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA4O1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZWFkVTY0KCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gODtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZFUxMjgoKSB7XG4gICAgY29uc3QgbG93ZXJQYXJ0ID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgY29uc3QgdXBwZXJQYXJ0ID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDgsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE2O1xuICAgIHJldHVybiAodXBwZXJQYXJ0IDw8IEJpZ0ludCg2NCkpICsgbG93ZXJQYXJ0O1xuICB9XG4gIHJlYWRJMTI4KCkge1xuICAgIGNvbnN0IGxvd2VyUGFydCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIGNvbnN0IHVwcGVyUGFydCA9IHRoaXMudmlldy5nZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCArIDgsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE2O1xuICAgIHJldHVybiAodXBwZXJQYXJ0IDw8IEJpZ0ludCg2NCkpICsgbG93ZXJQYXJ0O1xuICB9XG4gIHJlYWRVMjU2KCkge1xuICAgIGNvbnN0IHAwID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgY29uc3QgcDEgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCwgdHJ1ZSk7XG4gICAgY29uc3QgcDIgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgMTYsIHRydWUpO1xuICAgIGNvbnN0IHAzID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDI0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAzMjtcbiAgICByZXR1cm4gKHAzIDw8IEJpZ0ludCgzICogNjQpKSArIChwMiA8PCBCaWdJbnQoMiAqIDY0KSkgKyAocDEgPDwgQmlnSW50KDEgKiA2NCkpICsgcDA7XG4gIH1cbiAgcmVhZEkyNTYoKSB7XG4gICAgY29uc3QgcDAgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICBjb25zdCBwMSA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4LCB0cnVlKTtcbiAgICBjb25zdCBwMiA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyAxNiwgdHJ1ZSk7XG4gICAgY29uc3QgcDMgPSB0aGlzLnZpZXcuZ2V0QmlnSW50NjQodGhpcy5vZmZzZXQgKyAyNCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMzI7XG4gICAgcmV0dXJuIChwMyA8PCBCaWdJbnQoMyAqIDY0KSkgKyAocDIgPDwgQmlnSW50KDIgKiA2NCkpICsgKHAxIDw8IEJpZ0ludCgxICogNjQpKSArIHAwO1xuICB9XG4gIHJlYWRGMzIoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0RmxvYXQzMih0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZEY2NCgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRGbG9hdDY0KHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA4O1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZWFkU3RyaW5nKCkge1xuICAgIGNvbnN0IHVpbnQ4QXJyYXkgPSB0aGlzLnJlYWRVSW50OEFycmF5KCk7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcihcInV0Zi04XCIpLmRlY29kZSh1aW50OEFycmF5KTtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi9iaW5hcnlfd3JpdGVyLnRzXG52YXIgaW1wb3J0X2Jhc2U2NF9qcyA9IF9fdG9FU00ocmVxdWlyZV9iYXNlNjRfanMoKSk7XG52YXIgQXJyYXlCdWZmZXJQcm90b3R5cGVUcmFuc2ZlciA9IEFycmF5QnVmZmVyLnByb3RvdHlwZS50cmFuc2ZlciA/PyBmdW5jdGlvbihuZXdCeXRlTGVuZ3RoKSB7XG4gIGlmIChuZXdCeXRlTGVuZ3RoID09PSB2b2lkIDApIHtcbiAgICByZXR1cm4gdGhpcy5zbGljZSgpO1xuICB9IGVsc2UgaWYgKG5ld0J5dGVMZW5ndGggPD0gdGhpcy5ieXRlTGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2xpY2UoMCwgbmV3Qnl0ZUxlbmd0aCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgY29weSA9IG5ldyBVaW50OEFycmF5KG5ld0J5dGVMZW5ndGgpO1xuICAgIGNvcHkuc2V0KG5ldyBVaW50OEFycmF5KHRoaXMpKTtcbiAgICByZXR1cm4gY29weS5idWZmZXI7XG4gIH1cbn07XG52YXIgUmVzaXphYmxlQnVmZmVyID0gY2xhc3Mge1xuICBidWZmZXI7XG4gIHZpZXc7XG4gIGNvbnN0cnVjdG9yKGluaXQpIHtcbiAgICB0aGlzLmJ1ZmZlciA9IHR5cGVvZiBpbml0ID09PSBcIm51bWJlclwiID8gbmV3IEFycmF5QnVmZmVyKGluaXQpIDogaW5pdDtcbiAgICB0aGlzLnZpZXcgPSBuZXcgRGF0YVZpZXcodGhpcy5idWZmZXIpO1xuICB9XG4gIGdldCBjYXBhY2l0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5idWZmZXIuYnl0ZUxlbmd0aDtcbiAgfVxuICBncm93KG5ld1NpemUpIHtcbiAgICBpZiAobmV3U2l6ZSA8PSB0aGlzLmJ1ZmZlci5ieXRlTGVuZ3RoKSByZXR1cm47XG4gICAgdGhpcy5idWZmZXIgPSBBcnJheUJ1ZmZlclByb3RvdHlwZVRyYW5zZmVyLmNhbGwodGhpcy5idWZmZXIsIG5ld1NpemUpO1xuICAgIHRoaXMudmlldyA9IG5ldyBEYXRhVmlldyh0aGlzLmJ1ZmZlcik7XG4gIH1cbn07XG52YXIgQmluYXJ5V3JpdGVyID0gY2xhc3Mge1xuICBidWZmZXI7XG4gIG9mZnNldCA9IDA7XG4gIGNvbnN0cnVjdG9yKGluaXQpIHtcbiAgICB0aGlzLmJ1ZmZlciA9IHR5cGVvZiBpbml0ID09PSBcIm51bWJlclwiID8gbmV3IFJlc2l6YWJsZUJ1ZmZlcihpbml0KSA6IGluaXQ7XG4gIH1cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5vZmZzZXQgPSAwO1xuICB9XG4gIHJlc2V0KGJ1ZmZlcikge1xuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICAgIHRoaXMub2Zmc2V0ID0gMDtcbiAgfVxuICBleHBhbmRCdWZmZXIoYWRkaXRpb25hbENhcGFjaXR5KSB7XG4gICAgY29uc3QgbWluQ2FwYWNpdHkgPSB0aGlzLm9mZnNldCArIGFkZGl0aW9uYWxDYXBhY2l0eSArIDE7XG4gICAgaWYgKG1pbkNhcGFjaXR5IDw9IHRoaXMuYnVmZmVyLmNhcGFjaXR5KSByZXR1cm47XG4gICAgbGV0IG5ld0NhcGFjaXR5ID0gdGhpcy5idWZmZXIuY2FwYWNpdHkgKiAyO1xuICAgIGlmIChuZXdDYXBhY2l0eSA8IG1pbkNhcGFjaXR5KSBuZXdDYXBhY2l0eSA9IG1pbkNhcGFjaXR5O1xuICAgIHRoaXMuYnVmZmVyLmdyb3cobmV3Q2FwYWNpdHkpO1xuICB9XG4gIHRvQmFzZTY0KCkge1xuICAgIHJldHVybiAoMCwgaW1wb3J0X2Jhc2U2NF9qcy5mcm9tQnl0ZUFycmF5KSh0aGlzLmdldEJ1ZmZlcigpKTtcbiAgfVxuICBnZXRCdWZmZXIoKSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHRoaXMuYnVmZmVyLmJ1ZmZlciwgMCwgdGhpcy5vZmZzZXQpO1xuICB9XG4gIGdldCB2aWV3KCkge1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlci52aWV3O1xuICB9XG4gIHdyaXRlVUludDhBcnJheSh2YWx1ZSkge1xuICAgIGNvbnN0IGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig0ICsgbGVuZ3RoKTtcbiAgICB0aGlzLndyaXRlVTMyKGxlbmd0aCk7XG4gICAgbmV3IFVpbnQ4QXJyYXkodGhpcy5idWZmZXIuYnVmZmVyLCB0aGlzLm9mZnNldCkuc2V0KHZhbHVlKTtcbiAgICB0aGlzLm9mZnNldCArPSBsZW5ndGg7XG4gIH1cbiAgd3JpdGVCb29sKHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMSk7XG4gICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMub2Zmc2V0LCB2YWx1ZSA/IDEgOiAwKTtcbiAgICB0aGlzLm9mZnNldCArPSAxO1xuICB9XG4gIHdyaXRlQnl0ZSh2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDEpO1xuICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLm9mZnNldCwgdmFsdWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE7XG4gIH1cbiAgd3JpdGVCeXRlcyh2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKHZhbHVlLmxlbmd0aCk7XG4gICAgbmV3IFVpbnQ4QXJyYXkodGhpcy5idWZmZXIuYnVmZmVyLCB0aGlzLm9mZnNldCwgdmFsdWUubGVuZ3RoKS5zZXQodmFsdWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IHZhbHVlLmxlbmd0aDtcbiAgfVxuICB3cml0ZUk4KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMSk7XG4gICAgdGhpcy52aWV3LnNldEludDgodGhpcy5vZmZzZXQsIHZhbHVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAxO1xuICB9XG4gIHdyaXRlVTgodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxKTtcbiAgICB0aGlzLnZpZXcuc2V0VWludDgodGhpcy5vZmZzZXQsIHZhbHVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAxO1xuICB9XG4gIHdyaXRlSTE2KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMik7XG4gICAgdGhpcy52aWV3LnNldEludDE2KHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMjtcbiAgfVxuICB3cml0ZVUxNih2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDIpO1xuICAgIHRoaXMudmlldy5zZXRVaW50MTYodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAyO1xuICB9XG4gIHdyaXRlSTMyKHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoNCk7XG4gICAgdGhpcy52aWV3LnNldEludDMyKHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcbiAgfVxuICB3cml0ZVUzMih2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDQpO1xuICAgIHRoaXMudmlldy5zZXRVaW50MzIodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA0O1xuICB9XG4gIHdyaXRlSTY0KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoOCk7XG4gICAgdGhpcy52aWV3LnNldEJpZ0ludDY0KHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gODtcbiAgfVxuICB3cml0ZVU2NCh2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDgpO1xuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA4O1xuICB9XG4gIHdyaXRlVTEyOCh2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDE2KTtcbiAgICBjb25zdCBsb3dlclBhcnQgPSB2YWx1ZSAmIEJpZ0ludChcIjB4RkZGRkZGRkZGRkZGRkZGRlwiKTtcbiAgICBjb25zdCB1cHBlclBhcnQgPSB2YWx1ZSA+PiBCaWdJbnQoNjQpO1xuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIGxvd2VyUGFydCwgdHJ1ZSk7XG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDgsIHVwcGVyUGFydCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMTY7XG4gIH1cbiAgd3JpdGVJMTI4KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMTYpO1xuICAgIGNvbnN0IGxvd2VyUGFydCA9IHZhbHVlICYgQmlnSW50KFwiMHhGRkZGRkZGRkZGRkZGRkZGXCIpO1xuICAgIGNvbnN0IHVwcGVyUGFydCA9IHZhbHVlID4+IEJpZ0ludCg2NCk7XG4gICAgdGhpcy52aWV3LnNldEJpZ0ludDY0KHRoaXMub2Zmc2V0LCBsb3dlclBhcnQsIHRydWUpO1xuICAgIHRoaXMudmlldy5zZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCArIDgsIHVwcGVyUGFydCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMTY7XG4gIH1cbiAgd3JpdGVVMjU2KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMzIpO1xuICAgIGNvbnN0IGxvd182NF9tYXNrID0gQmlnSW50KFwiMHhGRkZGRkZGRkZGRkZGRkZGXCIpO1xuICAgIGNvbnN0IHAwID0gdmFsdWUgJiBsb3dfNjRfbWFzaztcbiAgICBjb25zdCBwMSA9IHZhbHVlID4+IEJpZ0ludCg2NCAqIDEpICYgbG93XzY0X21hc2s7XG4gICAgY29uc3QgcDIgPSB2YWx1ZSA+PiBCaWdJbnQoNjQgKiAyKSAmIGxvd182NF9tYXNrO1xuICAgIGNvbnN0IHAzID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMyk7XG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAwLCBwMCwgdHJ1ZSk7XG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAxLCBwMSwgdHJ1ZSk7XG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAyLCBwMiwgdHJ1ZSk7XG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAzLCBwMywgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMzI7XG4gIH1cbiAgd3JpdGVJMjU2KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMzIpO1xuICAgIGNvbnN0IGxvd182NF9tYXNrID0gQmlnSW50KFwiMHhGRkZGRkZGRkZGRkZGRkZGXCIpO1xuICAgIGNvbnN0IHAwID0gdmFsdWUgJiBsb3dfNjRfbWFzaztcbiAgICBjb25zdCBwMSA9IHZhbHVlID4+IEJpZ0ludCg2NCAqIDEpICYgbG93XzY0X21hc2s7XG4gICAgY29uc3QgcDIgPSB2YWx1ZSA+PiBCaWdJbnQoNjQgKiAyKSAmIGxvd182NF9tYXNrO1xuICAgIGNvbnN0IHAzID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMyk7XG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAwLCBwMCwgdHJ1ZSk7XG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAxLCBwMSwgdHJ1ZSk7XG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAyLCBwMiwgdHJ1ZSk7XG4gICAgdGhpcy52aWV3LnNldEJpZ0ludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDMsIHAzLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAzMjtcbiAgfVxuICB3cml0ZUYzMih2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDQpO1xuICAgIHRoaXMudmlldy5zZXRGbG9hdDMyKHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcbiAgfVxuICB3cml0ZUY2NCh2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDgpO1xuICAgIHRoaXMudmlldy5zZXRGbG9hdDY0KHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gODtcbiAgfVxuICB3cml0ZVN0cmluZyh2YWx1ZSkge1xuICAgIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBlbmNvZGVkU3RyaW5nID0gZW5jb2Rlci5lbmNvZGUodmFsdWUpO1xuICAgIHRoaXMud3JpdGVVSW50OEFycmF5KGVuY29kZWRTdHJpbmcpO1xuICB9XG59O1xuXG4vLyBzcmMvbGliL3V0aWwudHNcbmZ1bmN0aW9uIHVpbnQ4QXJyYXlUb0hleFN0cmluZyhhcnJheSkge1xuICByZXR1cm4gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGFycmF5LnJldmVyc2UoKSwgKHgpID0+IChcIjAwXCIgKyB4LnRvU3RyaW5nKDE2KSkuc2xpY2UoLTIpKS5qb2luKFwiXCIpO1xufVxuZnVuY3Rpb24gdWludDhBcnJheVRvVTEyOChhcnJheSkge1xuICBpZiAoYXJyYXkubGVuZ3RoICE9IDE2KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVaW50OEFycmF5IGlzIG5vdCAxNiBieXRlcyBsb25nOiAke2FycmF5fWApO1xuICB9XG4gIHJldHVybiBuZXcgQmluYXJ5UmVhZGVyKGFycmF5KS5yZWFkVTEyOCgpO1xufVxuZnVuY3Rpb24gdWludDhBcnJheVRvVTI1NihhcnJheSkge1xuICBpZiAoYXJyYXkubGVuZ3RoICE9IDMyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVaW50OEFycmF5IGlzIG5vdCAzMiBieXRlcyBsb25nOiBbJHthcnJheX1dYCk7XG4gIH1cbiAgcmV0dXJuIG5ldyBCaW5hcnlSZWFkZXIoYXJyYXkpLnJlYWRVMjU2KCk7XG59XG5mdW5jdGlvbiBoZXhTdHJpbmdUb1VpbnQ4QXJyYXkoc3RyKSB7XG4gIGlmIChzdHIuc3RhcnRzV2l0aChcIjB4XCIpKSB7XG4gICAgc3RyID0gc3RyLnNsaWNlKDIpO1xuICB9XG4gIGNvbnN0IG1hdGNoZXMgPSBzdHIubWF0Y2goLy57MSwyfS9nKSB8fCBbXTtcbiAgY29uc3QgZGF0YSA9IFVpbnQ4QXJyYXkuZnJvbShcbiAgICBtYXRjaGVzLm1hcCgoYnl0ZSkgPT4gcGFyc2VJbnQoYnl0ZSwgMTYpKVxuICApO1xuICByZXR1cm4gZGF0YS5yZXZlcnNlKCk7XG59XG5mdW5jdGlvbiBoZXhTdHJpbmdUb1UxMjgoc3RyKSB7XG4gIHJldHVybiB1aW50OEFycmF5VG9VMTI4KGhleFN0cmluZ1RvVWludDhBcnJheShzdHIpKTtcbn1cbmZ1bmN0aW9uIGhleFN0cmluZ1RvVTI1NihzdHIpIHtcbiAgcmV0dXJuIHVpbnQ4QXJyYXlUb1UyNTYoaGV4U3RyaW5nVG9VaW50OEFycmF5KHN0cikpO1xufVxuZnVuY3Rpb24gdTEyOFRvVWludDhBcnJheShkYXRhKSB7XG4gIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTYpO1xuICB3cml0ZXIud3JpdGVVMTI4KGRhdGEpO1xuICByZXR1cm4gd3JpdGVyLmdldEJ1ZmZlcigpO1xufVxuZnVuY3Rpb24gdTEyOFRvSGV4U3RyaW5nKGRhdGEpIHtcbiAgcmV0dXJuIHVpbnQ4QXJyYXlUb0hleFN0cmluZyh1MTI4VG9VaW50OEFycmF5KGRhdGEpKTtcbn1cbmZ1bmN0aW9uIHUyNTZUb1VpbnQ4QXJyYXkoZGF0YSkge1xuICBjb25zdCB3cml0ZXIgPSBuZXcgQmluYXJ5V3JpdGVyKDMyKTtcbiAgd3JpdGVyLndyaXRlVTI1NihkYXRhKTtcbiAgcmV0dXJuIHdyaXRlci5nZXRCdWZmZXIoKTtcbn1cbmZ1bmN0aW9uIHUyNTZUb0hleFN0cmluZyhkYXRhKSB7XG4gIHJldHVybiB1aW50OEFycmF5VG9IZXhTdHJpbmcodTI1NlRvVWludDhBcnJheShkYXRhKSk7XG59XG5mdW5jdGlvbiB0b1Bhc2NhbENhc2Uocykge1xuICBjb25zdCBzdHIgPSB0b0NhbWVsQ2FzZShzKTtcbiAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKTtcbn1cbmZ1bmN0aW9uIHRvQ2FtZWxDYXNlKHMpIHtcbiAgY29uc3Qgc3RyID0gcy5yZXBsYWNlKC9bLV9dKy9nLCBcIl9cIikucmVwbGFjZSgvXyhbYS16QS1aMC05XSkvZywgKF8sIGMpID0+IGMudG9VcHBlckNhc2UoKSk7XG4gIHJldHVybiBzdHIuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7XG59XG5mdW5jdGlvbiBic2F0bkJhc2VTaXplKHR5cGVzcGFjZSwgdHkpIHtcbiAgY29uc3QgYXNzdW1lZEFycmF5TGVuZ3RoID0gNDtcbiAgd2hpbGUgKHR5LnRhZyA9PT0gXCJSZWZcIikgdHkgPSB0eXBlc3BhY2UudHlwZXNbdHkudmFsdWVdO1xuICBpZiAodHkudGFnID09PSBcIlByb2R1Y3RcIikge1xuICAgIGxldCBzdW0gPSAwO1xuICAgIGZvciAoY29uc3QgeyBhbGdlYnJhaWNUeXBlOiBlbGVtIH0gb2YgdHkudmFsdWUuZWxlbWVudHMpIHtcbiAgICAgIHN1bSArPSBic2F0bkJhc2VTaXplKHR5cGVzcGFjZSwgZWxlbSk7XG4gICAgfVxuICAgIHJldHVybiBzdW07XG4gIH0gZWxzZSBpZiAodHkudGFnID09PSBcIlN1bVwiKSB7XG4gICAgbGV0IG1pbiA9IEluZmluaXR5O1xuICAgIGZvciAoY29uc3QgeyBhbGdlYnJhaWNUeXBlOiB2YXJpIH0gb2YgdHkudmFsdWUudmFyaWFudHMpIHtcbiAgICAgIGNvbnN0IHZTaXplID0gYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIHZhcmkpO1xuICAgICAgaWYgKHZTaXplIDwgbWluKSBtaW4gPSB2U2l6ZTtcbiAgICB9XG4gICAgaWYgKG1pbiA9PT0gSW5maW5pdHkpIG1pbiA9IDA7XG4gICAgcmV0dXJuIDQgKyBtaW47XG4gIH0gZWxzZSBpZiAodHkudGFnID09IFwiQXJyYXlcIikge1xuICAgIHJldHVybiA0ICsgYXNzdW1lZEFycmF5TGVuZ3RoICogYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIHR5LnZhbHVlKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIFN0cmluZzogNCArIGFzc3VtZWRBcnJheUxlbmd0aCxcbiAgICBTdW06IDEsXG4gICAgQm9vbDogMSxcbiAgICBJODogMSxcbiAgICBVODogMSxcbiAgICBJMTY6IDIsXG4gICAgVTE2OiAyLFxuICAgIEkzMjogNCxcbiAgICBVMzI6IDQsXG4gICAgRjMyOiA0LFxuICAgIEk2NDogOCxcbiAgICBVNjQ6IDgsXG4gICAgRjY0OiA4LFxuICAgIEkxMjg6IDE2LFxuICAgIFUxMjg6IDE2LFxuICAgIEkyNTY6IDMyLFxuICAgIFUyNTY6IDMyXG4gIH1bdHkudGFnXTtcbn1cbnZhciBoYXNPd24gPSBPYmplY3QuaGFzT3duO1xuXG4vLyBzcmMvbGliL2Nvbm5lY3Rpb25faWQudHNcbnZhciBDb25uZWN0aW9uSWQgPSBjbGFzcyBfQ29ubmVjdGlvbklkIHtcbiAgX19jb25uZWN0aW9uX2lkX187XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBDb25uZWN0aW9uSWRgLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgIHRoaXMuX19jb25uZWN0aW9uX2lkX18gPSBkYXRhO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgdGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB7QGxpbmsgQ29ubmVjdGlvbklkfSB0eXBlLlxuICAgKiBAcmV0dXJucyBUaGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHR5cGUuXG4gICAqL1xuICBzdGF0aWMgZ2V0QWxnZWJyYWljVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcbiAgICAgIGVsZW1lbnRzOiBbXG4gICAgICAgIHsgbmFtZTogXCJfX2Nvbm5lY3Rpb25faWRfX1wiLCBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLlUxMjggfVxuICAgICAgXVxuICAgIH0pO1xuICB9XG4gIGlzWmVybygpIHtcbiAgICByZXR1cm4gdGhpcy5fX2Nvbm5lY3Rpb25faWRfXyA9PT0gQmlnSW50KDApO1xuICB9XG4gIHN0YXRpYyBudWxsSWZaZXJvKGFkZHIpIHtcbiAgICBpZiAoYWRkci5pc1plcm8oKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhZGRyO1xuICAgIH1cbiAgfVxuICBzdGF0aWMgcmFuZG9tKCkge1xuICAgIGZ1bmN0aW9uIHJhbmRvbVU4KCkge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1NSk7XG4gICAgfVxuICAgIGxldCByZXN1bHQgPSBCaWdJbnQoMCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjsgaSsrKSB7XG4gICAgICByZXN1bHQgPSByZXN1bHQgPDwgQmlnSW50KDgpIHwgQmlnSW50KHJhbmRvbVU4KCkpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWQocmVzdWx0KTtcbiAgfVxuICAvKipcbiAgICogQ29tcGFyZSB0d28gY29ubmVjdGlvbiBJRHMgZm9yIGVxdWFsaXR5LlxuICAgKi9cbiAgaXNFcXVhbChvdGhlcikge1xuICAgIHJldHVybiB0aGlzLl9fY29ubmVjdGlvbl9pZF9fID09IG90aGVyLl9fY29ubmVjdGlvbl9pZF9fO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiB0d28gY29ubmVjdGlvbiBJRHMgYXJlIGVxdWFsLlxuICAgKi9cbiAgZXF1YWxzKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNFcXVhbChvdGhlcik7XG4gIH1cbiAgLyoqXG4gICAqIFByaW50IHRoZSBjb25uZWN0aW9uIElEIGFzIGEgaGV4YWRlY2ltYWwgc3RyaW5nLlxuICAgKi9cbiAgdG9IZXhTdHJpbmcoKSB7XG4gICAgcmV0dXJuIHUxMjhUb0hleFN0cmluZyh0aGlzLl9fY29ubmVjdGlvbl9pZF9fKTtcbiAgfVxuICAvKipcbiAgICogQ29udmVydCB0aGUgY29ubmVjdGlvbiBJRCB0byBhIFVpbnQ4QXJyYXkuXG4gICAqL1xuICB0b1VpbnQ4QXJyYXkoKSB7XG4gICAgcmV0dXJuIHUxMjhUb1VpbnQ4QXJyYXkodGhpcy5fX2Nvbm5lY3Rpb25faWRfXyk7XG4gIH1cbiAgLyoqXG4gICAqIFBhcnNlIGEgY29ubmVjdGlvbiBJRCBmcm9tIGEgaGV4YWRlY2ltYWwgc3RyaW5nLlxuICAgKi9cbiAgc3RhdGljIGZyb21TdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkKGhleFN0cmluZ1RvVTEyOChzdHIpKTtcbiAgfVxuICBzdGF0aWMgZnJvbVN0cmluZ09yTnVsbChzdHIpIHtcbiAgICBjb25zdCBhZGRyID0gX0Nvbm5lY3Rpb25JZC5mcm9tU3RyaW5nKHN0cik7XG4gICAgaWYgKGFkZHIuaXNaZXJvKCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYWRkcjtcbiAgICB9XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvaWRlbnRpdHkudHNcbnZhciBJZGVudGl0eSA9IGNsYXNzIF9JZGVudGl0eSB7XG4gIF9faWRlbnRpdHlfXztcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYElkZW50aXR5YC5cbiAgICpcbiAgICogYGRhdGFgIGNhbiBiZSBhIGhleGFkZWNpbWFsIHN0cmluZyBvciBhIGBiaWdpbnRgLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgIHRoaXMuX19pZGVudGl0eV9fID0gdHlwZW9mIGRhdGEgPT09IFwic3RyaW5nXCIgPyBoZXhTdHJpbmdUb1UyNTYoZGF0YSkgOiBkYXRhO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgdGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB7QGxpbmsgSWRlbnRpdHl9IHR5cGUuXG4gICAqIEByZXR1cm5zIFRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHlwZS5cbiAgICovXG4gIHN0YXRpYyBnZXRBbGdlYnJhaWNUeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlByb2R1Y3Qoe1xuICAgICAgZWxlbWVudHM6IFt7IG5hbWU6IFwiX19pZGVudGl0eV9fXCIsIGFsZ2VicmFpY1R5cGU6IEFsZ2VicmFpY1R5cGUuVTI1NiB9XVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiB0d28gaWRlbnRpdGllcyBhcmUgZXF1YWwuXG4gICAqL1xuICBpc0VxdWFsKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMudG9IZXhTdHJpbmcoKSA9PT0gb3RoZXIudG9IZXhTdHJpbmcoKTtcbiAgfVxuICAvKipcbiAgICogQ2hlY2sgaWYgdHdvIGlkZW50aXRpZXMgYXJlIGVxdWFsLlxuICAgKi9cbiAgZXF1YWxzKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNFcXVhbChvdGhlcik7XG4gIH1cbiAgLyoqXG4gICAqIFByaW50IHRoZSBpZGVudGl0eSBhcyBhIGhleGFkZWNpbWFsIHN0cmluZy5cbiAgICovXG4gIHRvSGV4U3RyaW5nKCkge1xuICAgIHJldHVybiB1MjU2VG9IZXhTdHJpbmcodGhpcy5fX2lkZW50aXR5X18pO1xuICB9XG4gIC8qKlxuICAgKiBDb252ZXJ0IHRoZSBhZGRyZXNzIHRvIGEgVWludDhBcnJheS5cbiAgICovXG4gIHRvVWludDhBcnJheSgpIHtcbiAgICByZXR1cm4gdTI1NlRvVWludDhBcnJheSh0aGlzLl9faWRlbnRpdHlfXyk7XG4gIH1cbiAgLyoqXG4gICAqIFBhcnNlIGFuIElkZW50aXR5IGZyb20gYSBoZXhhZGVjaW1hbCBzdHJpbmcuXG4gICAqL1xuICBzdGF0aWMgZnJvbVN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gbmV3IF9JZGVudGl0eShzdHIpO1xuICB9XG4gIC8qKlxuICAgKiBaZXJvIGlkZW50aXR5ICgweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDApXG4gICAqL1xuICBzdGF0aWMgemVybygpIHtcbiAgICByZXR1cm4gbmV3IF9JZGVudGl0eSgwbik7XG4gIH1cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9IZXhTdHJpbmcoKTtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi9hbGdlYnJhaWNfdHlwZS50c1xudmFyIFNFUklBTElaRVJTID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciBERVNFUklBTElaRVJTID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciBBbGdlYnJhaWNUeXBlID0ge1xuICBSZWY6ICh2YWx1ZSkgPT4gKHsgdGFnOiBcIlJlZlwiLCB2YWx1ZSB9KSxcbiAgU3VtOiAodmFsdWUpID0+ICh7XG4gICAgdGFnOiBcIlN1bVwiLFxuICAgIHZhbHVlXG4gIH0pLFxuICBQcm9kdWN0OiAodmFsdWUpID0+ICh7XG4gICAgdGFnOiBcIlByb2R1Y3RcIixcbiAgICB2YWx1ZVxuICB9KSxcbiAgQXJyYXk6ICh2YWx1ZSkgPT4gKHtcbiAgICB0YWc6IFwiQXJyYXlcIixcbiAgICB2YWx1ZVxuICB9KSxcbiAgU3RyaW5nOiB7IHRhZzogXCJTdHJpbmdcIiB9LFxuICBCb29sOiB7IHRhZzogXCJCb29sXCIgfSxcbiAgSTg6IHsgdGFnOiBcIkk4XCIgfSxcbiAgVTg6IHsgdGFnOiBcIlU4XCIgfSxcbiAgSTE2OiB7IHRhZzogXCJJMTZcIiB9LFxuICBVMTY6IHsgdGFnOiBcIlUxNlwiIH0sXG4gIEkzMjogeyB0YWc6IFwiSTMyXCIgfSxcbiAgVTMyOiB7IHRhZzogXCJVMzJcIiB9LFxuICBJNjQ6IHsgdGFnOiBcIkk2NFwiIH0sXG4gIFU2NDogeyB0YWc6IFwiVTY0XCIgfSxcbiAgSTEyODogeyB0YWc6IFwiSTEyOFwiIH0sXG4gIFUxMjg6IHsgdGFnOiBcIlUxMjhcIiB9LFxuICBJMjU2OiB7IHRhZzogXCJJMjU2XCIgfSxcbiAgVTI1NjogeyB0YWc6IFwiVTI1NlwiIH0sXG4gIEYzMjogeyB0YWc6IFwiRjMyXCIgfSxcbiAgRjY0OiB7IHRhZzogXCJGNjRcIiB9LFxuICBtYWtlU2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XG4gICAgaWYgKHR5LnRhZyA9PT0gXCJSZWZcIikge1xuICAgICAgaWYgKCF0eXBlc3BhY2UpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNhbm5vdCBzZXJpYWxpemUgcmVmcyB3aXRob3V0IGEgdHlwZXNwYWNlXCIpO1xuICAgICAgd2hpbGUgKHR5LnRhZyA9PT0gXCJSZWZcIikgdHkgPSB0eXBlc3BhY2UudHlwZXNbdHkudmFsdWVdO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5LnRhZykge1xuICAgICAgY2FzZSBcIlByb2R1Y3RcIjpcbiAgICAgICAgcmV0dXJuIFByb2R1Y3RUeXBlLm1ha2VTZXJpYWxpemVyKHR5LnZhbHVlLCB0eXBlc3BhY2UpO1xuICAgICAgY2FzZSBcIlN1bVwiOlxuICAgICAgICByZXR1cm4gU3VtVHlwZS5tYWtlU2VyaWFsaXplcih0eS52YWx1ZSwgdHlwZXNwYWNlKTtcbiAgICAgIGNhc2UgXCJBcnJheVwiOlxuICAgICAgICBpZiAodHkudmFsdWUudGFnID09PSBcIlU4XCIpIHtcbiAgICAgICAgICByZXR1cm4gc2VyaWFsaXplVWludDhBcnJheTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBzZXJpYWxpemUgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHR5LnZhbHVlLCB0eXBlc3BhY2UpO1xuICAgICAgICAgIHJldHVybiAod3JpdGVyLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgd3JpdGVyLndyaXRlVTMyKHZhbHVlLmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVsZW0gb2YgdmFsdWUpIHtcbiAgICAgICAgICAgICAgc2VyaWFsaXplKHdyaXRlciwgZWxlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHByaW1pdGl2ZVNlcmlhbGl6ZXJzW3R5LnRhZ107XG4gICAgfVxuICB9LFxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIGBtYWtlU2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cbiAgc2VyaWFsaXplVmFsdWUod3JpdGVyLCB0eSwgdmFsdWUsIHR5cGVzcGFjZSkge1xuICAgIEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkod3JpdGVyLCB2YWx1ZSk7XG4gIH0sXG4gIG1ha2VEZXNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkge1xuICAgIGlmICh0eS50YWcgPT09IFwiUmVmXCIpIHtcbiAgICAgIGlmICghdHlwZXNwYWNlKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3QgZGVzZXJpYWxpemUgcmVmcyB3aXRob3V0IGEgdHlwZXNwYWNlXCIpO1xuICAgICAgd2hpbGUgKHR5LnRhZyA9PT0gXCJSZWZcIikgdHkgPSB0eXBlc3BhY2UudHlwZXNbdHkudmFsdWVdO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5LnRhZykge1xuICAgICAgY2FzZSBcIlByb2R1Y3RcIjpcbiAgICAgICAgcmV0dXJuIFByb2R1Y3RUeXBlLm1ha2VEZXNlcmlhbGl6ZXIodHkudmFsdWUsIHR5cGVzcGFjZSk7XG4gICAgICBjYXNlIFwiU3VtXCI6XG4gICAgICAgIHJldHVybiBTdW1UeXBlLm1ha2VEZXNlcmlhbGl6ZXIodHkudmFsdWUsIHR5cGVzcGFjZSk7XG4gICAgICBjYXNlIFwiQXJyYXlcIjpcbiAgICAgICAgaWYgKHR5LnZhbHVlLnRhZyA9PT0gXCJVOFwiKSB7XG4gICAgICAgICAgcmV0dXJuIGRlc2VyaWFsaXplVWludDhBcnJheTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBkZXNlcmlhbGl6ZSA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcbiAgICAgICAgICAgIHR5LnZhbHVlLFxuICAgICAgICAgICAgdHlwZXNwYWNlXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gKHJlYWRlcikgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0gcmVhZGVyLnJlYWRVMzIoKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHJlc3VsdFtpXSA9IGRlc2VyaWFsaXplKHJlYWRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBwcmltaXRpdmVEZXNlcmlhbGl6ZXJzW3R5LnRhZ107XG4gICAgfVxuICB9LFxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIGBtYWtlRGVzZXJpYWxpemVyYCBpbnN0ZWFkLiAqL1xuICBkZXNlcmlhbGl6ZVZhbHVlKHJlYWRlciwgdHksIHR5cGVzcGFjZSkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkocmVhZGVyKTtcbiAgfSxcbiAgLyoqXG4gICAqIENvbnZlcnQgYSB2YWx1ZSBvZiB0aGUgYWxnZWJyYWljIHR5cGUgaW50byBzb21ldGhpbmcgdGhhdCBjYW4gYmUgdXNlZCBhcyBhIGtleSBpbiBhIG1hcC5cbiAgICogVGhlcmUgYXJlIG5vIGd1YXJhbnRlZXMgYWJvdXQgYmVpbmcgYWJsZSB0byBvcmRlciBpdC5cbiAgICogVGhpcyBpcyBvbmx5IGd1YXJhbnRlZWQgdG8gYmUgY29tcGFyYWJsZSB0byBvdGhlciB2YWx1ZXMgb2YgdGhlIHNhbWUgdHlwZS5cbiAgICogQHBhcmFtIHZhbHVlIEEgdmFsdWUgb2YgdGhlIGFsZ2VicmFpYyB0eXBlXG4gICAqIEByZXR1cm5zIFNvbWV0aGluZyB0aGF0IGNhbiBiZSB1c2VkIGFzIGEga2V5IGluIGEgbWFwLlxuICAgKi9cbiAgaW50b01hcEtleTogZnVuY3Rpb24odHksIHZhbHVlKSB7XG4gICAgc3dpdGNoICh0eS50YWcpIHtcbiAgICAgIGNhc2UgXCJVOFwiOlxuICAgICAgY2FzZSBcIlUxNlwiOlxuICAgICAgY2FzZSBcIlUzMlwiOlxuICAgICAgY2FzZSBcIlU2NFwiOlxuICAgICAgY2FzZSBcIlUxMjhcIjpcbiAgICAgIGNhc2UgXCJVMjU2XCI6XG4gICAgICBjYXNlIFwiSThcIjpcbiAgICAgIGNhc2UgXCJJMTZcIjpcbiAgICAgIGNhc2UgXCJJMzJcIjpcbiAgICAgIGNhc2UgXCJJNjRcIjpcbiAgICAgIGNhc2UgXCJJMTI4XCI6XG4gICAgICBjYXNlIFwiSTI1NlwiOlxuICAgICAgY2FzZSBcIkYzMlwiOlxuICAgICAgY2FzZSBcIkY2NFwiOlxuICAgICAgY2FzZSBcIlN0cmluZ1wiOlxuICAgICAgY2FzZSBcIkJvb2xcIjpcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgY2FzZSBcIlByb2R1Y3RcIjpcbiAgICAgICAgcmV0dXJuIFByb2R1Y3RUeXBlLmludG9NYXBLZXkodHkudmFsdWUsIHZhbHVlKTtcbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgY29uc3Qgd3JpdGVyID0gbmV3IEJpbmFyeVdyaXRlcigxMCk7XG4gICAgICAgIEFsZ2VicmFpY1R5cGUuc2VyaWFsaXplVmFsdWUod3JpdGVyLCB0eSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gd3JpdGVyLnRvQmFzZTY0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuZnVuY3Rpb24gYmluZENhbGwoZikge1xuICByZXR1cm4gRnVuY3Rpb24ucHJvdG90eXBlLmNhbGwuYmluZChmKTtcbn1cbnZhciBwcmltaXRpdmVTZXJpYWxpemVycyA9IHtcbiAgQm9vbDogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUJvb2wpLFxuICBJODogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUk4KSxcbiAgVTg6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVOCksXG4gIEkxNjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUkxNiksXG4gIFUxNjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVUxNiksXG4gIEkzMjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUkzMiksXG4gIFUzMjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVUzMiksXG4gIEk2NDogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUk2NCksXG4gIFU2NDogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVU2NCksXG4gIEkxMjg6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJMTI4KSxcbiAgVTEyODogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVUxMjgpLFxuICBJMjU2OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlSTI1NiksXG4gIFUyNTY6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVMjU2KSxcbiAgRjMyOiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlRjMyKSxcbiAgRjY0OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlRjY0KSxcbiAgU3RyaW5nOiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlU3RyaW5nKVxufTtcbk9iamVjdC5mcmVlemUocHJpbWl0aXZlU2VyaWFsaXplcnMpO1xudmFyIHNlcmlhbGl6ZVVpbnQ4QXJyYXkgPSBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlVUludDhBcnJheSk7XG52YXIgcHJpbWl0aXZlRGVzZXJpYWxpemVycyA9IHtcbiAgQm9vbDogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkQm9vbCksXG4gIEk4OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRJOCksXG4gIFU4OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVOCksXG4gIEkxNjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkSTE2KSxcbiAgVTE2OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVMTYpLFxuICBJMzI6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEkzMiksXG4gIFUzMjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTMyKSxcbiAgSTY0OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRJNjQpLFxuICBVNjQ6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFU2NCksXG4gIEkxMjg6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEkxMjgpLFxuICBVMTI4OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVMTI4KSxcbiAgSTI1NjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkSTI1NiksXG4gIFUyNTY6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFUyNTYpLFxuICBGMzI6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEYzMiksXG4gIEY2NDogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkRjY0KSxcbiAgU3RyaW5nOiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRTdHJpbmcpXG59O1xuT2JqZWN0LmZyZWV6ZShwcmltaXRpdmVEZXNlcmlhbGl6ZXJzKTtcbnZhciBkZXNlcmlhbGl6ZVVpbnQ4QXJyYXkgPSBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVSW50OEFycmF5KTtcbnZhciBwcmltaXRpdmVTaXplcyA9IHtcbiAgQm9vbDogMSxcbiAgSTg6IDEsXG4gIFU4OiAxLFxuICBJMTY6IDIsXG4gIFUxNjogMixcbiAgSTMyOiA0LFxuICBVMzI6IDQsXG4gIEk2NDogOCxcbiAgVTY0OiA4LFxuICBJMTI4OiAxNixcbiAgVTEyODogMTYsXG4gIEkyNTY6IDMyLFxuICBVMjU2OiAzMixcbiAgRjMyOiA0LFxuICBGNjQ6IDhcbn07XG52YXIgZml4ZWRTaXplUHJpbWl0aXZlcyA9IG5ldyBTZXQoT2JqZWN0LmtleXMocHJpbWl0aXZlU2l6ZXMpKTtcbnZhciBpc0ZpeGVkU2l6ZVByb2R1Y3QgPSAodHkpID0+IHR5LmVsZW1lbnRzLmV2ZXJ5KFxuICAoeyBhbGdlYnJhaWNUeXBlIH0pID0+IGZpeGVkU2l6ZVByaW1pdGl2ZXMuaGFzKGFsZ2VicmFpY1R5cGUudGFnKVxuKTtcbnZhciBwcm9kdWN0U2l6ZSA9ICh0eSkgPT4gdHkuZWxlbWVudHMucmVkdWNlKFxuICAoYWNjLCB7IGFsZ2VicmFpY1R5cGUgfSkgPT4gYWNjICsgcHJpbWl0aXZlU2l6ZXNbYWxnZWJyYWljVHlwZS50YWddLFxuICAwXG4pO1xudmFyIHByaW1pdGl2ZUpTTmFtZSA9IHtcbiAgQm9vbDogXCJVaW50OFwiLFxuICBJODogXCJJbnQ4XCIsXG4gIFU4OiBcIlVpbnQ4XCIsXG4gIEkxNjogXCJJbnQxNlwiLFxuICBVMTY6IFwiVWludDE2XCIsXG4gIEkzMjogXCJJbnQzMlwiLFxuICBVMzI6IFwiVWludDMyXCIsXG4gIEk2NDogXCJCaWdJbnQ2NFwiLFxuICBVNjQ6IFwiQmlnVWludDY0XCIsXG4gIEYzMjogXCJGbG9hdDMyXCIsXG4gIEY2NDogXCJGbG9hdDY0XCJcbn07XG52YXIgc3BlY2lhbFByb2R1Y3REZXNlcmlhbGl6ZXJzID0ge1xuICBfX3RpbWVfZHVyYXRpb25fbWljcm9zX186IChyZWFkZXIpID0+IG5ldyBUaW1lRHVyYXRpb24ocmVhZGVyLnJlYWRJNjQoKSksXG4gIF9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX186IChyZWFkZXIpID0+IG5ldyBUaW1lc3RhbXAocmVhZGVyLnJlYWRJNjQoKSksXG4gIF9faWRlbnRpdHlfXzogKHJlYWRlcikgPT4gbmV3IElkZW50aXR5KHJlYWRlci5yZWFkVTI1NigpKSxcbiAgX19jb25uZWN0aW9uX2lkX186IChyZWFkZXIpID0+IG5ldyBDb25uZWN0aW9uSWQocmVhZGVyLnJlYWRVMTI4KCkpLFxuICBfX3V1aWRfXzogKHJlYWRlcikgPT4gbmV3IFV1aWQocmVhZGVyLnJlYWRVMTI4KCkpXG59O1xuT2JqZWN0LmZyZWV6ZShzcGVjaWFsUHJvZHVjdERlc2VyaWFsaXplcnMpO1xudmFyIHVuaXREZXNlcmlhbGl6ZXIgPSAoKSA9PiAoe30pO1xudmFyIGdldEVsZW1lbnRJbml0aWFsaXplciA9IChlbGVtZW50KSA9PiB7XG4gIGxldCBpbml0O1xuICBzd2l0Y2ggKGVsZW1lbnQuYWxnZWJyYWljVHlwZS50YWcpIHtcbiAgICBjYXNlIFwiU3RyaW5nXCI6XG4gICAgICBpbml0ID0gXCInJ1wiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIkJvb2xcIjpcbiAgICAgIGluaXQgPSBcImZhbHNlXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiSThcIjpcbiAgICBjYXNlIFwiVThcIjpcbiAgICBjYXNlIFwiSTE2XCI6XG4gICAgY2FzZSBcIlUxNlwiOlxuICAgIGNhc2UgXCJJMzJcIjpcbiAgICBjYXNlIFwiVTMyXCI6XG4gICAgICBpbml0ID0gXCIwXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiSTY0XCI6XG4gICAgY2FzZSBcIlU2NFwiOlxuICAgIGNhc2UgXCJJMTI4XCI6XG4gICAgY2FzZSBcIlUxMjhcIjpcbiAgICBjYXNlIFwiSTI1NlwiOlxuICAgIGNhc2UgXCJVMjU2XCI6XG4gICAgICBpbml0ID0gXCIwblwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIkYzMlwiOlxuICAgIGNhc2UgXCJGNjRcIjpcbiAgICAgIGluaXQgPSBcIjAuMFwiO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGluaXQgPSBcInVuZGVmaW5lZFwiO1xuICB9XG4gIHJldHVybiBgJHtlbGVtZW50Lm5hbWV9OiAke2luaXR9YDtcbn07XG52YXIgUHJvZHVjdFR5cGUgPSB7XG4gIG1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpIHtcbiAgICBsZXQgc2VyaWFsaXplciA9IFNFUklBTElaRVJTLmdldCh0eSk7XG4gICAgaWYgKHNlcmlhbGl6ZXIgIT0gbnVsbCkgcmV0dXJuIHNlcmlhbGl6ZXI7XG4gICAgaWYgKGlzRml4ZWRTaXplUHJvZHVjdCh0eSkpIHtcbiAgICAgIGNvbnN0IHNpemUgPSBwcm9kdWN0U2l6ZSh0eSk7XG4gICAgICBjb25zdCBib2R5MiA9IGBcInVzZSBzdHJpY3RcIjtcbndyaXRlci5leHBhbmRCdWZmZXIoJHtzaXplfSk7XG5jb25zdCB2aWV3ID0gd3JpdGVyLnZpZXc7XG4ke3R5LmVsZW1lbnRzLm1hcChcbiAgICAgICAgKHsgbmFtZSwgYWxnZWJyYWljVHlwZTogeyB0YWcgfSB9KSA9PiB0YWcgaW4gcHJpbWl0aXZlSlNOYW1lID8gYHZpZXcuc2V0JHtwcmltaXRpdmVKU05hbWVbdGFnXX0od3JpdGVyLm9mZnNldCwgdmFsdWUuJHtuYW1lfSwgJHtwcmltaXRpdmVTaXplc1t0YWddID4gMSA/IFwidHJ1ZVwiIDogXCJcIn0pO1xud3JpdGVyLm9mZnNldCArPSAke3ByaW1pdGl2ZVNpemVzW3RhZ119O2AgOiBgd3JpdGVyLndyaXRlJHt0YWd9KHZhbHVlLiR7bmFtZX0pO2BcbiAgICAgICkuam9pbihcIlxcblwiKX1gO1xuICAgICAgc2VyaWFsaXplciA9IEZ1bmN0aW9uKFwid3JpdGVyXCIsIFwidmFsdWVcIiwgYm9keTIpO1xuICAgICAgU0VSSUFMSVpFUlMuc2V0KHR5LCBzZXJpYWxpemVyKTtcbiAgICAgIHJldHVybiBzZXJpYWxpemVyO1xuICAgIH1cbiAgICBjb25zdCBzZXJpYWxpemVycyA9IHt9O1xuICAgIGNvbnN0IGJvZHkgPSAnXCJ1c2Ugc3RyaWN0XCI7XFxuJyArIHR5LmVsZW1lbnRzLm1hcChcbiAgICAgIChlbGVtZW50KSA9PiBgdGhpcy4ke2VsZW1lbnQubmFtZX0od3JpdGVyLCB2YWx1ZS4ke2VsZW1lbnQubmFtZX0pO2BcbiAgICApLmpvaW4oXCJcXG5cIik7XG4gICAgc2VyaWFsaXplciA9IEZ1bmN0aW9uKFwid3JpdGVyXCIsIFwidmFsdWVcIiwgYm9keSkuYmluZChcbiAgICAgIHNlcmlhbGl6ZXJzXG4gICAgKTtcbiAgICBTRVJJQUxJWkVSUy5zZXQodHksIHNlcmlhbGl6ZXIpO1xuICAgIGZvciAoY29uc3QgeyBuYW1lLCBhbGdlYnJhaWNUeXBlIH0gb2YgdHkuZWxlbWVudHMpIHtcbiAgICAgIHNlcmlhbGl6ZXJzW25hbWVdID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcbiAgICAgICAgYWxnZWJyYWljVHlwZSxcbiAgICAgICAgdHlwZXNwYWNlXG4gICAgICApO1xuICAgIH1cbiAgICBPYmplY3QuZnJlZXplKHNlcmlhbGl6ZXJzKTtcbiAgICByZXR1cm4gc2VyaWFsaXplcjtcbiAgfSxcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZVNlcmlhbGl6ZXJgIGluc3RlYWQuICovXG4gIHNlcmlhbGl6ZVZhbHVlKHdyaXRlciwgdHksIHZhbHVlLCB0eXBlc3BhY2UpIHtcbiAgICBQcm9kdWN0VHlwZS5tYWtlU2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSh3cml0ZXIsIHZhbHVlKTtcbiAgfSxcbiAgbWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XG4gICAgc3dpdGNoICh0eS5lbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuIHVuaXREZXNlcmlhbGl6ZXI7XG4gICAgICBjYXNlIDE6IHtcbiAgICAgICAgY29uc3QgZmllbGROYW1lID0gdHkuZWxlbWVudHNbMF0ubmFtZTtcbiAgICAgICAgaWYgKGhhc093bihzcGVjaWFsUHJvZHVjdERlc2VyaWFsaXplcnMsIGZpZWxkTmFtZSkpXG4gICAgICAgICAgcmV0dXJuIHNwZWNpYWxQcm9kdWN0RGVzZXJpYWxpemVyc1tmaWVsZE5hbWVdO1xuICAgICAgfVxuICAgIH1cbiAgICBsZXQgZGVzZXJpYWxpemVyID0gREVTRVJJQUxJWkVSUy5nZXQodHkpO1xuICAgIGlmIChkZXNlcmlhbGl6ZXIgIT0gbnVsbCkgcmV0dXJuIGRlc2VyaWFsaXplcjtcbiAgICBpZiAoaXNGaXhlZFNpemVQcm9kdWN0KHR5KSkge1xuICAgICAgY29uc3QgYm9keSA9IGBcInVzZSBzdHJpY3RcIjtcbmNvbnN0IHJlc3VsdCA9IHsgJHt0eS5lbGVtZW50cy5tYXAoZ2V0RWxlbWVudEluaXRpYWxpemVyKS5qb2luKFwiLCBcIil9IH07XG5jb25zdCB2aWV3ID0gcmVhZGVyLnZpZXc7XG4ke3R5LmVsZW1lbnRzLm1hcChcbiAgICAgICAgKHsgbmFtZSwgYWxnZWJyYWljVHlwZTogeyB0YWcgfSB9KSA9PiB0YWcgaW4gcHJpbWl0aXZlSlNOYW1lID8gdGFnID09PSBcIkJvb2xcIiA/IGByZXN1bHQuJHtuYW1lfSA9IHZpZXcuZ2V0VWludDgocmVhZGVyLm9mZnNldCkgIT09IDA7XG5yZWFkZXIub2Zmc2V0ICs9IDE7YCA6IGByZXN1bHQuJHtuYW1lfSA9IHZpZXcuZ2V0JHtwcmltaXRpdmVKU05hbWVbdGFnXX0ocmVhZGVyLm9mZnNldCwgJHtwcmltaXRpdmVTaXplc1t0YWddID4gMSA/IFwidHJ1ZVwiIDogXCJcIn0pO1xucmVhZGVyLm9mZnNldCArPSAke3ByaW1pdGl2ZVNpemVzW3RhZ119O2AgOiBgcmVzdWx0LiR7bmFtZX0gPSByZWFkZXIucmVhZCR7dGFnfSgpO2BcbiAgICAgICkuam9pbihcIlxcblwiKX1cbnJldHVybiByZXN1bHQ7YDtcbiAgICAgIGRlc2VyaWFsaXplciA9IEZ1bmN0aW9uKFwicmVhZGVyXCIsIGJvZHkpO1xuICAgICAgREVTRVJJQUxJWkVSUy5zZXQodHksIGRlc2VyaWFsaXplcik7XG4gICAgICByZXR1cm4gZGVzZXJpYWxpemVyO1xuICAgIH1cbiAgICBjb25zdCBkZXNlcmlhbGl6ZXJzID0ge307XG4gICAgZGVzZXJpYWxpemVyID0gRnVuY3Rpb24oXG4gICAgICBcInJlYWRlclwiLFxuICAgICAgYFwidXNlIHN0cmljdFwiO1xuY29uc3QgcmVzdWx0ID0geyAke3R5LmVsZW1lbnRzLm1hcChnZXRFbGVtZW50SW5pdGlhbGl6ZXIpLmpvaW4oXCIsIFwiKX0gfTtcbiR7dHkuZWxlbWVudHMubWFwKCh7IG5hbWUgfSkgPT4gYHJlc3VsdC4ke25hbWV9ID0gdGhpcy4ke25hbWV9KHJlYWRlcik7YCkuam9pbihcIlxcblwiKX1cbnJldHVybiByZXN1bHQ7YFxuICAgICkuYmluZChkZXNlcmlhbGl6ZXJzKTtcbiAgICBERVNFUklBTElaRVJTLnNldCh0eSwgZGVzZXJpYWxpemVyKTtcbiAgICBmb3IgKGNvbnN0IHsgbmFtZSwgYWxnZWJyYWljVHlwZSB9IG9mIHR5LmVsZW1lbnRzKSB7XG4gICAgICBkZXNlcmlhbGl6ZXJzW25hbWVdID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxuICAgICAgICBhbGdlYnJhaWNUeXBlLFxuICAgICAgICB0eXBlc3BhY2VcbiAgICAgICk7XG4gICAgfVxuICAgIE9iamVjdC5mcmVlemUoZGVzZXJpYWxpemVycyk7XG4gICAgcmV0dXJuIGRlc2VyaWFsaXplcjtcbiAgfSxcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZURlc2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cbiAgZGVzZXJpYWxpemVWYWx1ZShyZWFkZXIsIHR5LCB0eXBlc3BhY2UpIHtcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUubWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKShyZWFkZXIpO1xuICB9LFxuICBpbnRvTWFwS2V5KHR5LCB2YWx1ZSkge1xuICAgIGlmICh0eS5lbGVtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IHR5LmVsZW1lbnRzWzBdLm5hbWU7XG4gICAgICBpZiAoaGFzT3duKHNwZWNpYWxQcm9kdWN0RGVzZXJpYWxpemVycywgZmllbGROYW1lKSkge1xuICAgICAgICByZXR1cm4gdmFsdWVbZmllbGROYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgd3JpdGVyID0gbmV3IEJpbmFyeVdyaXRlcigxMCk7XG4gICAgQWxnZWJyYWljVHlwZS5zZXJpYWxpemVWYWx1ZSh3cml0ZXIsIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh0eSksIHZhbHVlKTtcbiAgICByZXR1cm4gd3JpdGVyLnRvQmFzZTY0KCk7XG4gIH1cbn07XG52YXIgU3VtVHlwZSA9IHtcbiAgbWFrZVNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkge1xuICAgIGlmICh0eS52YXJpYW50cy5sZW5ndGggPT0gMiAmJiB0eS52YXJpYW50c1swXS5uYW1lID09PSBcInNvbWVcIiAmJiB0eS52YXJpYW50c1sxXS5uYW1lID09PSBcIm5vbmVcIikge1xuICAgICAgY29uc3Qgc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcbiAgICAgICAgdHkudmFyaWFudHNbMF0uYWxnZWJyYWljVHlwZSxcbiAgICAgICAgdHlwZXNwYWNlXG4gICAgICApO1xuICAgICAgcmV0dXJuICh3cml0ZXIsIHZhbHVlKSA9PiB7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgd3JpdGVyLndyaXRlQnl0ZSgwKTtcbiAgICAgICAgICBzZXJpYWxpemUod3JpdGVyLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd3JpdGVyLndyaXRlQnl0ZSgxKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHR5LnZhcmlhbnRzLmxlbmd0aCA9PSAyICYmIHR5LnZhcmlhbnRzWzBdLm5hbWUgPT09IFwib2tcIiAmJiB0eS52YXJpYW50c1sxXS5uYW1lID09PSBcImVyclwiKSB7XG4gICAgICBjb25zdCBzZXJpYWxpemVPayA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXG4gICAgICAgIHR5LnZhcmlhbnRzWzBdLmFsZ2VicmFpY1R5cGUsXG4gICAgICAgIHR5cGVzcGFjZVxuICAgICAgKTtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZUVyciA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXG4gICAgICAgIHR5LnZhcmlhbnRzWzBdLmFsZ2VicmFpY1R5cGUsXG4gICAgICAgIHR5cGVzcGFjZVxuICAgICAgKTtcbiAgICAgIHJldHVybiAod3JpdGVyLCB2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAoXCJva1wiIGluIHZhbHVlKSB7XG4gICAgICAgICAgd3JpdGVyLndyaXRlVTgoMCk7XG4gICAgICAgICAgc2VyaWFsaXplT2sod3JpdGVyLCB2YWx1ZS5vayk7XG4gICAgICAgIH0gZWxzZSBpZiAoXCJlcnJcIiBpbiB2YWx1ZSkge1xuICAgICAgICAgIHdyaXRlci53cml0ZVU4KDEpO1xuICAgICAgICAgIHNlcmlhbGl6ZUVycih3cml0ZXIsIHZhbHVlLmVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgIFwiY291bGQgbm90IHNlcmlhbGl6ZSByZXN1bHQ6IG9iamVjdCBoYWQgbmVpdGhlciBhIGBva2Agbm9yIGFuIGBlcnJgIGZpZWxkXCJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgc2VyaWFsaXplciA9IFNFUklBTElaRVJTLmdldCh0eSk7XG4gICAgICBpZiAoc2VyaWFsaXplciAhPSBudWxsKSByZXR1cm4gc2VyaWFsaXplcjtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZXJzID0ge307XG4gICAgICBjb25zdCBib2R5ID0gYHN3aXRjaCAodmFsdWUudGFnKSB7XG4ke3R5LnZhcmlhbnRzLm1hcChcbiAgICAgICAgKHsgbmFtZSB9LCBpKSA9PiBgICBjYXNlICR7SlNPTi5zdHJpbmdpZnkobmFtZSl9OlxuICAgIHdyaXRlci53cml0ZUJ5dGUoJHtpfSk7XG4gICAgcmV0dXJuIHRoaXMuJHtuYW1lfSh3cml0ZXIsIHZhbHVlLnZhbHVlKTtgXG4gICAgICApLmpvaW4oXCJcXG5cIil9XG4gIGRlZmF1bHQ6XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgIFxcYENvdWxkIG5vdCBzZXJpYWxpemUgc3VtIHR5cGU7IHVua25vd24gdGFnIFxcJHt2YWx1ZS50YWd9XFxgXG4gICAgKVxufVxuYDtcbiAgICAgIHNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcIndyaXRlclwiLCBcInZhbHVlXCIsIGJvZHkpLmJpbmQoXG4gICAgICAgIHNlcmlhbGl6ZXJzXG4gICAgICApO1xuICAgICAgU0VSSUFMSVpFUlMuc2V0KHR5LCBzZXJpYWxpemVyKTtcbiAgICAgIGZvciAoY29uc3QgeyBuYW1lLCBhbGdlYnJhaWNUeXBlIH0gb2YgdHkudmFyaWFudHMpIHtcbiAgICAgICAgc2VyaWFsaXplcnNbbmFtZV0gPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKFxuICAgICAgICAgIGFsZ2VicmFpY1R5cGUsXG4gICAgICAgICAgdHlwZXNwYWNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBPYmplY3QuZnJlZXplKHNlcmlhbGl6ZXJzKTtcbiAgICAgIHJldHVybiBzZXJpYWxpemVyO1xuICAgIH1cbiAgfSxcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZVNlcmlhbGl6ZXJgIGluc3RlYWQuICovXG4gIHNlcmlhbGl6ZVZhbHVlKHdyaXRlciwgdHksIHZhbHVlLCB0eXBlc3BhY2UpIHtcbiAgICBTdW1UeXBlLm1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHdyaXRlciwgdmFsdWUpO1xuICB9LFxuICBtYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpIHtcbiAgICBpZiAodHkudmFyaWFudHMubGVuZ3RoID09IDIgJiYgdHkudmFyaWFudHNbMF0ubmFtZSA9PT0gXCJzb21lXCIgJiYgdHkudmFyaWFudHNbMV0ubmFtZSA9PT0gXCJub25lXCIpIHtcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxuICAgICAgICB0eS52YXJpYW50c1swXS5hbGdlYnJhaWNUeXBlLFxuICAgICAgICB0eXBlc3BhY2VcbiAgICAgICk7XG4gICAgICByZXR1cm4gKHJlYWRlcikgPT4ge1xuICAgICAgICBjb25zdCB0YWcgPSByZWFkZXIucmVhZFU4KCk7XG4gICAgICAgIGlmICh0YWcgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gZGVzZXJpYWxpemUocmVhZGVyKTtcbiAgICAgICAgfSBlbHNlIGlmICh0YWcgPT09IDEpIHtcbiAgICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGBDYW4ndCBkZXNlcmlhbGl6ZSBhbiBvcHRpb24gdHlwZSwgY291bGRuJ3QgZmluZCAke3RhZ30gdGFnYDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHR5LnZhcmlhbnRzLmxlbmd0aCA9PSAyICYmIHR5LnZhcmlhbnRzWzBdLm5hbWUgPT09IFwib2tcIiAmJiB0eS52YXJpYW50c1sxXS5uYW1lID09PSBcImVyclwiKSB7XG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZU9rID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxuICAgICAgICB0eS52YXJpYW50c1swXS5hbGdlYnJhaWNUeXBlLFxuICAgICAgICB0eXBlc3BhY2VcbiAgICAgICk7XG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZUVyciA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcbiAgICAgICAgdHkudmFyaWFudHNbMV0uYWxnZWJyYWljVHlwZSxcbiAgICAgICAgdHlwZXNwYWNlXG4gICAgICApO1xuICAgICAgcmV0dXJuIChyZWFkZXIpID0+IHtcbiAgICAgICAgY29uc3QgdGFnID0gcmVhZGVyLnJlYWRCeXRlKCk7XG4gICAgICAgIGlmICh0YWcgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4geyBvazogZGVzZXJpYWxpemVPayhyZWFkZXIpIH07XG4gICAgICAgIH0gZWxzZSBpZiAodGFnID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIHsgZXJyOiBkZXNlcmlhbGl6ZUVycihyZWFkZXIpIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgYENhbid0IGRlc2VyaWFsaXplIGEgcmVzdWx0IHR5cGUsIGNvdWxkbid0IGZpbmQgJHt0YWd9IHRhZ2A7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBkZXNlcmlhbGl6ZXIgPSBERVNFUklBTElaRVJTLmdldCh0eSk7XG4gICAgICBpZiAoZGVzZXJpYWxpemVyICE9IG51bGwpIHJldHVybiBkZXNlcmlhbGl6ZXI7XG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZXJzID0ge307XG4gICAgICBkZXNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcbiAgICAgICAgXCJyZWFkZXJcIixcbiAgICAgICAgYHN3aXRjaCAocmVhZGVyLnJlYWRVOCgpKSB7XG4ke3R5LnZhcmlhbnRzLm1hcChcbiAgICAgICAgICAoeyBuYW1lIH0sIGkpID0+IGBjYXNlICR7aX06IHJldHVybiB7IHRhZzogJHtKU09OLnN0cmluZ2lmeShuYW1lKX0sIHZhbHVlOiB0aGlzLiR7bmFtZX0ocmVhZGVyKSB9O2BcbiAgICAgICAgKS5qb2luKFwiXFxuXCIpfSB9YFxuICAgICAgKS5iaW5kKGRlc2VyaWFsaXplcnMpO1xuICAgICAgREVTRVJJQUxJWkVSUy5zZXQodHksIGRlc2VyaWFsaXplcik7XG4gICAgICBmb3IgKGNvbnN0IHsgbmFtZSwgYWxnZWJyYWljVHlwZSB9IG9mIHR5LnZhcmlhbnRzKSB7XG4gICAgICAgIGRlc2VyaWFsaXplcnNbbmFtZV0gPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXG4gICAgICAgICAgYWxnZWJyYWljVHlwZSxcbiAgICAgICAgICB0eXBlc3BhY2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5mcmVlemUoZGVzZXJpYWxpemVycyk7XG4gICAgICByZXR1cm4gZGVzZXJpYWxpemVyO1xuICAgIH1cbiAgfSxcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZURlc2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cbiAgZGVzZXJpYWxpemVWYWx1ZShyZWFkZXIsIHR5LCB0eXBlc3BhY2UpIHtcbiAgICByZXR1cm4gU3VtVHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHJlYWRlcik7XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvb3B0aW9uLnRzXG52YXIgT3B0aW9uID0ge1xuICBnZXRBbGdlYnJhaWNUeXBlKGlubmVyVHlwZSkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlN1bSh7XG4gICAgICB2YXJpYW50czogW1xuICAgICAgICB7IG5hbWU6IFwic29tZVwiLCBhbGdlYnJhaWNUeXBlOiBpbm5lclR5cGUgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IFwibm9uZVwiLFxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7IGVsZW1lbnRzOiBbXSB9KVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSk7XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvcmVzdWx0LnRzXG52YXIgUmVzdWx0ID0ge1xuICBnZXRBbGdlYnJhaWNUeXBlKG9rVHlwZSwgZXJyVHlwZSkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlN1bSh7XG4gICAgICB2YXJpYW50czogW1xuICAgICAgICB7IG5hbWU6IFwib2tcIiwgYWxnZWJyYWljVHlwZTogb2tUeXBlIH0sXG4gICAgICAgIHsgbmFtZTogXCJlcnJcIiwgYWxnZWJyYWljVHlwZTogZXJyVHlwZSB9XG4gICAgICBdXG4gICAgfSk7XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvc2NoZWR1bGVfYXQudHNcbnZhciBTY2hlZHVsZUF0ID0ge1xuICBpbnRlcnZhbCh2YWx1ZSkge1xuICAgIHJldHVybiBJbnRlcnZhbCh2YWx1ZSk7XG4gIH0sXG4gIHRpbWUodmFsdWUpIHtcbiAgICByZXR1cm4gVGltZSh2YWx1ZSk7XG4gIH0sXG4gIGdldEFsZ2VicmFpY1R5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuU3VtKHtcbiAgICAgIHZhcmlhbnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBcIkludGVydmFsXCIsXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogVGltZUR1cmF0aW9uLmdldEFsZ2VicmFpY1R5cGUoKVxuICAgICAgICB9LFxuICAgICAgICB7IG5hbWU6IFwiVGltZVwiLCBhbGdlYnJhaWNUeXBlOiBUaW1lc3RhbXAuZ2V0QWxnZWJyYWljVHlwZSgpIH1cbiAgICAgIF1cbiAgICB9KTtcbiAgfSxcbiAgaXNTY2hlZHVsZUF0KGFsZ2VicmFpY1R5cGUpIHtcbiAgICBpZiAoYWxnZWJyYWljVHlwZS50YWcgIT09IFwiU3VtXCIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgdmFyaWFudHMgPSBhbGdlYnJhaWNUeXBlLnZhbHVlLnZhcmlhbnRzO1xuICAgIGlmICh2YXJpYW50cy5sZW5ndGggIT09IDIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgaW50ZXJ2YWxWYXJpYW50ID0gdmFyaWFudHMuZmluZCgodikgPT4gdi5uYW1lID09PSBcIkludGVydmFsXCIpO1xuICAgIGNvbnN0IHRpbWVWYXJpYW50ID0gdmFyaWFudHMuZmluZCgodikgPT4gdi5uYW1lID09PSBcIlRpbWVcIik7XG4gICAgaWYgKCFpbnRlcnZhbFZhcmlhbnQgfHwgIXRpbWVWYXJpYW50KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBUaW1lRHVyYXRpb24uaXNUaW1lRHVyYXRpb24oaW50ZXJ2YWxWYXJpYW50LmFsZ2VicmFpY1R5cGUpICYmIFRpbWVzdGFtcC5pc1RpbWVzdGFtcCh0aW1lVmFyaWFudC5hbGdlYnJhaWNUeXBlKTtcbiAgfVxufTtcbnZhciBJbnRlcnZhbCA9IChtaWNyb3MpID0+ICh7XG4gIHRhZzogXCJJbnRlcnZhbFwiLFxuICB2YWx1ZTogbmV3IFRpbWVEdXJhdGlvbihtaWNyb3MpXG59KTtcbnZhciBUaW1lID0gKG1pY3Jvc1NpbmNlVW5peEVwb2NoKSA9PiAoe1xuICB0YWc6IFwiVGltZVwiLFxuICB2YWx1ZTogbmV3IFRpbWVzdGFtcChtaWNyb3NTaW5jZVVuaXhFcG9jaClcbn0pO1xudmFyIHNjaGVkdWxlX2F0X2RlZmF1bHQgPSBTY2hlZHVsZUF0O1xuXG4vLyBzcmMvbGliL3R5cGVfdXRpbC50c1xuZnVuY3Rpb24gc2V0KHgsIHQyKSB7XG4gIHJldHVybiB7IC4uLngsIC4uLnQyIH07XG59XG5cbi8vIHNyYy9saWIvdHlwZV9idWlsZGVycy50c1xudmFyIFR5cGVCdWlsZGVyID0gY2xhc3Mge1xuICAvKipcbiAgICogVGhlIFR5cGVTY3JpcHQgcGhhbnRvbSB0eXBlLiBUaGlzIGlzIG5vdCBzdG9yZWQgYXQgcnVudGltZSxcbiAgICogYnV0IGlzIHZpc2libGUgdG8gdGhlIGNvbXBpbGVyXG4gICAqL1xuICB0eXBlO1xuICAvKipcbiAgICogVGhlIFNwYWNldGltZURCIGFsZ2VicmFpYyB0eXBlIChydW7igJF0aW1lIHZhbHVlKS4gSW4gYWRkaXRpb24gdG8gc3RvcmluZ1xuICAgKiB0aGUgcnVudGltZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgYEFsZ2VicmFpY1R5cGVgLCBpdCBhbHNvIGNhcHR1cmVzXG4gICAqIHRoZSBUeXBlU2NyaXB0IHR5cGUgaW5mb3JtYXRpb24gb2YgdGhlIGBBbGdlYnJhaWNUeXBlYC4gVGhhdCBpcyB0byBzYXlcbiAgICogdGhlIHZhbHVlIGlzIG5vdCBtZXJlbHkgYW4gYEFsZ2VicmFpY1R5cGVgLCBidXQgaXMgY29uc3RydWN0ZWQgdG8gYmVcbiAgICogdGhlIGNvcnJlc3BvbmRpbmcgY29uY3JldGUgYEFsZ2VicmFpY1R5cGVgIGZvciB0aGUgVHlwZVNjcmlwdCB0eXBlIGBUeXBlYC5cbiAgICpcbiAgICogZS5nLiBgc3RyaW5nYCBjb3JyZXNwb25kcyB0byBgQWxnZWJyYWljVHlwZS5TdHJpbmdgXG4gICAqL1xuICBhbGdlYnJhaWNUeXBlO1xuICBjb25zdHJ1Y3RvcihhbGdlYnJhaWNUeXBlKSB7XG4gICAgdGhpcy5hbGdlYnJhaWNUeXBlID0gYWxnZWJyYWljVHlwZTtcbiAgfVxuICBvcHRpb25hbCgpIHtcbiAgICByZXR1cm4gbmV3IE9wdGlvbkJ1aWxkZXIodGhpcyk7XG4gIH1cbiAgc2VyaWFsaXplKHdyaXRlciwgdmFsdWUpIHtcbiAgICBjb25zdCBzZXJpYWxpemUgPSB0aGlzLnNlcmlhbGl6ZSA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXG4gICAgICB0aGlzLmFsZ2VicmFpY1R5cGVcbiAgICApO1xuICAgIHNlcmlhbGl6ZSh3cml0ZXIsIHZhbHVlKTtcbiAgfVxuICBkZXNlcmlhbGl6ZShyZWFkZXIpIHtcbiAgICBjb25zdCBkZXNlcmlhbGl6ZSA9IHRoaXMuZGVzZXJpYWxpemUgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXG4gICAgICB0aGlzLmFsZ2VicmFpY1R5cGVcbiAgICApO1xuICAgIHJldHVybiBkZXNlcmlhbGl6ZShyZWFkZXIpO1xuICB9XG59O1xudmFyIFU4QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlU4KTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBVOENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgVThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBVOENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBVMTZCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuVTE2KTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgVTE2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBVMzJCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuVTMyKTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFUzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFUzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFUzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFUzMkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBVNjRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuVTY0KTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBVMTI4QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlUxMjgpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgVTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgVTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgVTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBVMTI4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFUyNTZCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuVTI1Nik7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBVMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBVMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBVMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgSThCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTgpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IEk4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBJOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IEk4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEkxNkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5JMTYpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBJMTZDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBJMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEkzMkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5JMzIpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgSTMyQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEk2NEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5JNjQpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEkxMjhCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTEyOCk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBJMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBJMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBJMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IEkxMjhDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgSTI1NkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5JMjU2KTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IEkyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IEkyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBJMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IEkyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBJMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBGMzJCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuRjMyKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBGMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBGMzJDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgRjY0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkY2NCk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgRjY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgRjY0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEJvb2xCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuQm9vbCk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBCb29sQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBCb29sQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgQm9vbENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IEJvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBCb29sQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFN0cmluZ0J1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5TdHJpbmcpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgU3RyaW5nQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgQXJyYXlCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGVsZW1lbnQ7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkFycmF5KGVsZW1lbnQuYWxnZWJyYWljVHlwZSkpO1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgQXJyYXlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBBcnJheUNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBCeXRlQXJyYXlCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuQXJyYXkoQWxnZWJyYWljVHlwZS5VOCkpO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IEJ5dGVBcnJheUNvbHVtbkJ1aWxkZXIoXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgQnl0ZUFycmF5Q29sdW1uQnVpbGRlcihzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIE9wdGlvbkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgdmFsdWU7XG4gIGNvbnN0cnVjdG9yKHZhbHVlKSB7XG4gICAgc3VwZXIoT3B0aW9uLmdldEFsZ2VicmFpY1R5cGUodmFsdWUuYWxnZWJyYWljVHlwZSkpO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBPcHRpb25Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBPcHRpb25Db2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgUHJvZHVjdEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgdHlwZU5hbWU7XG4gIGVsZW1lbnRzO1xuICBjb25zdHJ1Y3RvcihlbGVtZW50cywgbmFtZSkge1xuICAgIGZ1bmN0aW9uIGVsZW1lbnRzQXJyYXlGcm9tRWxlbWVudHNPYmoob2JqKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5tYXAoKGtleSkgPT4gKHtcbiAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAvLyBMYXppbHkgcmVzb2x2ZSB0aGUgdW5kZXJseWluZyBvYmplY3QncyBhbGdlYnJhaWNUeXBlLlxuICAgICAgICAvLyBUaGlzIHdpbGwgY2FsbCBvYmpba2V5XS5hbGdlYnJhaWNUeXBlIG9ubHkgd2hlbiBzb21lb25lXG4gICAgICAgIC8vIGFjdHVhbGx5IHJlYWRzIHRoaXMgcHJvcGVydHkuXG4gICAgICAgIGdldCBhbGdlYnJhaWNUeXBlKCkge1xuICAgICAgICAgIHJldHVybiBvYmpba2V5XS5hbGdlYnJhaWNUeXBlO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfVxuICAgIHN1cGVyKFxuICAgICAgQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcbiAgICAgICAgZWxlbWVudHM6IGVsZW1lbnRzQXJyYXlGcm9tRWxlbWVudHNPYmooZWxlbWVudHMpXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy50eXBlTmFtZSA9IG5hbWU7XG4gICAgdGhpcy5lbGVtZW50cyA9IGVsZW1lbnRzO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFByb2R1Y3RDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9kdWN0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFJlc3VsdEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgb2s7XG4gIGVycjtcbiAgY29uc3RydWN0b3Iob2ssIGVycikge1xuICAgIHN1cGVyKFJlc3VsdC5nZXRBbGdlYnJhaWNUeXBlKG9rLmFsZ2VicmFpY1R5cGUsIGVyci5hbGdlYnJhaWNUeXBlKSk7XG4gICAgdGhpcy5vayA9IG9rO1xuICAgIHRoaXMuZXJyID0gZXJyO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFJlc3VsdENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pKTtcbiAgfVxufTtcbnZhciBVbml0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7IHRhZzogXCJQcm9kdWN0XCIsIHZhbHVlOiB7IGVsZW1lbnRzOiBbXSB9IH0pO1xuICB9XG59O1xudmFyIFJvd0J1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgcm93O1xuICB0eXBlTmFtZTtcbiAgY29uc3RydWN0b3Iocm93LCBuYW1lKSB7XG4gICAgY29uc3QgbWFwcGVkUm93ID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgT2JqZWN0LmVudHJpZXMocm93KS5tYXAoKFtjb2xOYW1lLCBidWlsZGVyXSkgPT4gW1xuICAgICAgICBjb2xOYW1lLFxuICAgICAgICBidWlsZGVyIGluc3RhbmNlb2YgQ29sdW1uQnVpbGRlciA/IGJ1aWxkZXIgOiBuZXcgQ29sdW1uQnVpbGRlcihidWlsZGVyLCB7fSlcbiAgICAgIF0pXG4gICAgKTtcbiAgICBjb25zdCBlbGVtZW50cyA9IE9iamVjdC5rZXlzKG1hcHBlZFJvdykubWFwKChuYW1lMikgPT4gKHtcbiAgICAgIG5hbWU6IG5hbWUyLFxuICAgICAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XG4gICAgICAgIHJldHVybiBtYXBwZWRSb3dbbmFtZTJdLnR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGU7XG4gICAgICB9XG4gICAgfSkpO1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7IGVsZW1lbnRzIH0pKTtcbiAgICB0aGlzLnJvdyA9IG1hcHBlZFJvdztcbiAgICB0aGlzLnR5cGVOYW1lID0gbmFtZTtcbiAgfVxufTtcbnZhciBTdW1CdWlsZGVySW1wbCA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICB2YXJpYW50cztcbiAgdHlwZU5hbWU7XG4gIGNvbnN0cnVjdG9yKHZhcmlhbnRzLCBuYW1lKSB7XG4gICAgZnVuY3Rpb24gdmFyaWFudHNBcnJheUZyb21WYXJpYW50c09iaih2YXJpYW50czIpIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyh2YXJpYW50czIpLm1hcCgoa2V5KSA9PiAoe1xuICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgIC8vIExhemlseSByZXNvbHZlIHRoZSB1bmRlcmx5aW5nIG9iamVjdCdzIGFsZ2VicmFpY1R5cGUuXG4gICAgICAgIC8vIFRoaXMgd2lsbCBjYWxsIG9ialtrZXldLmFsZ2VicmFpY1R5cGUgb25seSB3aGVuIHNvbWVvbmVcbiAgICAgICAgLy8gYWN0dWFsbHkgcmVhZHMgdGhpcyBwcm9wZXJ0eS5cbiAgICAgICAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XG4gICAgICAgICAgcmV0dXJuIHZhcmlhbnRzMltrZXldLmFsZ2VicmFpY1R5cGU7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICB9XG4gICAgc3VwZXIoXG4gICAgICBBbGdlYnJhaWNUeXBlLlN1bSh7XG4gICAgICAgIHZhcmlhbnRzOiB2YXJpYW50c0FycmF5RnJvbVZhcmlhbnRzT2JqKHZhcmlhbnRzKVxuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMudmFyaWFudHMgPSB2YXJpYW50cztcbiAgICB0aGlzLnR5cGVOYW1lID0gbmFtZTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh2YXJpYW50cykpIHtcbiAgICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhcmlhbnRzLCBrZXkpO1xuICAgICAgY29uc3QgaXNBY2Nlc3NvciA9ICEhZGVzYyAmJiAodHlwZW9mIGRlc2MuZ2V0ID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIGRlc2Muc2V0ID09PSBcImZ1bmN0aW9uXCIpO1xuICAgICAgbGV0IGlzVW5pdDIgPSBmYWxzZTtcbiAgICAgIGlmICghaXNBY2Nlc3Nvcikge1xuICAgICAgICBjb25zdCB2YXJpYW50ID0gdmFyaWFudHNba2V5XTtcbiAgICAgICAgaXNVbml0MiA9IHZhcmlhbnQgaW5zdGFuY2VvZiBVbml0QnVpbGRlcjtcbiAgICAgIH1cbiAgICAgIGlmIChpc1VuaXQyKSB7XG4gICAgICAgIGNvbnN0IGNvbnN0YW50ID0gdGhpcy5jcmVhdGUoa2V5KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGtleSwge1xuICAgICAgICAgIHZhbHVlOiBjb25zdGFudCxcbiAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZm4gPSAoKHZhbHVlKSA9PiB0aGlzLmNyZWF0ZShrZXksIHZhbHVlKSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBrZXksIHtcbiAgICAgICAgICB2YWx1ZTogZm4sXG4gICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY3JlYXRlKHRhZywgdmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHZvaWQgMCA/IHsgdGFnIH0gOiB7IHRhZywgdmFsdWUgfTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBTdW1Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBTdW1Db2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgU3VtQnVpbGRlciA9IFN1bUJ1aWxkZXJJbXBsO1xudmFyIFNpbXBsZVN1bUJ1aWxkZXJJbXBsID0gY2xhc3MgZXh0ZW5kcyBTdW1CdWlsZGVySW1wbCB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgU2ltcGxlU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgU2ltcGxlU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgU2ltcGxlU3VtQnVpbGRlciA9IFNpbXBsZVN1bUJ1aWxkZXJJbXBsO1xudmFyIFNjaGVkdWxlQXRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKHNjaGVkdWxlX2F0X2RlZmF1bHQuZ2V0QWxnZWJyYWljVHlwZSgpKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBTY2hlZHVsZUF0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBJZGVudGl0eUJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoSWRlbnRpdHkuZ2V0QWxnZWJyYWljVHlwZSgpKTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBDb25uZWN0aW9uSWRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKENvbm5lY3Rpb25JZC5nZXRBbGdlYnJhaWNUeXBlKCkpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFRpbWVzdGFtcEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoVGltZXN0YW1wLmdldEFsZ2VicmFpY1R5cGUoKSk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgVGltZUR1cmF0aW9uQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihUaW1lRHVyYXRpb24uZ2V0QWxnZWJyYWljVHlwZSgpKTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBVdWlkQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihVdWlkLmdldEFsZ2VicmFpY1R5cGUoKSk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFV1aWRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgZGVmYXVsdE1ldGFkYXRhID0ge307XG52YXIgQ29sdW1uQnVpbGRlciA9IGNsYXNzIHtcbiAgdHlwZUJ1aWxkZXI7XG4gIGNvbHVtbk1ldGFkYXRhO1xuICBjb25zdHJ1Y3Rvcih0eXBlQnVpbGRlciwgbWV0YWRhdGEpIHtcbiAgICB0aGlzLnR5cGVCdWlsZGVyID0gdHlwZUJ1aWxkZXI7XG4gICAgdGhpcy5jb2x1bW5NZXRhZGF0YSA9IG1ldGFkYXRhO1xuICB9XG4gIHNlcmlhbGl6ZSh3cml0ZXIsIHZhbHVlKSB7XG4gICAgdGhpcy50eXBlQnVpbGRlci5zZXJpYWxpemUod3JpdGVyLCB2YWx1ZSk7XG4gIH1cbiAgZGVzZXJpYWxpemUocmVhZGVyKSB7XG4gICAgcmV0dXJuIHRoaXMudHlwZUJ1aWxkZXIuZGVzZXJpYWxpemUocmVhZGVyKTtcbiAgfVxufTtcbnZhciBVOENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVThDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9VOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9VOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBVMTZDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1UxNkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1UxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9VMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9VMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFUzMkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVTMyQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgVTY0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9VNjRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX1U2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9VNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX1U2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX1U2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBVMTI4Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9VMTI4Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1UxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX1UxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfVTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgVTI1NkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVTI1NkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1UyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEk4Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JOENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0k4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0k4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEkxNkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfSTE2Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0kxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX0kxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgSTMyQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9JMzJDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9JMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBJNjRDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0k2NENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX0k2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEkxMjhDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0kxMjhDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9JMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBJMjU2Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JMjU2Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfSTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgRjMyQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9GMzJDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9GMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9GMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEY2NENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfRjY0Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfRjY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfRjY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBCb29sQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9Cb29sQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9Cb29sQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9Cb29sQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBTdHJpbmdDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1N0cmluZ0NvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfU3RyaW5nQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1N0cmluZ0NvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfU3RyaW5nQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEFycmF5Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9BcnJheUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0FycmF5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfQXJyYXlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEJ5dGVBcnJheUNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfQnl0ZUFycmF5Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcihtZXRhZGF0YSkge1xuICAgIHN1cGVyKG5ldyBUeXBlQnVpbGRlcihBbGdlYnJhaWNUeXBlLkFycmF5KEFsZ2VicmFpY1R5cGUuVTgpKSwgbWV0YWRhdGEpO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9CeXRlQXJyYXlDb2x1bW5CdWlsZGVyKFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfQnl0ZUFycmF5Q29sdW1uQnVpbGRlcihzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBPcHRpb25Db2x1bW5CdWlsZGVyID0gY2xhc3MgX09wdGlvbkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX09wdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX09wdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgUmVzdWx0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9SZXN1bHRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKHR5cGVCdWlsZGVyLCBtZXRhZGF0YSkge1xuICAgIHN1cGVyKHR5cGVCdWlsZGVyLCBtZXRhZGF0YSk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1Jlc3VsdENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFByb2R1Y3RDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1Byb2R1Y3RDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9Qcm9kdWN0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9Qcm9kdWN0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBTdW1Db2x1bW5CdWlsZGVyID0gY2xhc3MgX1N1bUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1N1bUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBTaW1wbGVTdW1Db2x1bW5CdWlsZGVyID0gY2xhc3MgX1NpbXBsZVN1bUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBTdW1Db2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfU2ltcGxlU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9TaW1wbGVTdW1Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1NjaGVkdWxlQXRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1NjaGVkdWxlQXRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIElkZW50aXR5Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JZGVudGl0eUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0lkZW50aXR5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9JZGVudGl0eUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9UaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFV1aWRDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1V1aWRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX1V1aWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgUmVmQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICByZWY7XG4gIC8qKiBUaGUgcGhhbnRvbSB0eXBlIG9mIHRoZSBwb2ludGVlIG9mIHRoaXMgcmVmLiAqL1xuICBfX3NwYWNldGltZVR5cGU7XG4gIGNvbnN0cnVjdG9yKHJlZikge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuUmVmKHJlZikpO1xuICAgIHRoaXMucmVmID0gcmVmO1xuICB9XG59O1xudmFyIGVudW1JbXBsID0gKChuYW1lT3JPYmosIG1heWJlT2JqKSA9PiB7XG4gIGxldCBvYmogPSBuYW1lT3JPYmo7XG4gIGxldCBuYW1lID0gdm9pZCAwO1xuICBpZiAodHlwZW9mIG5hbWVPck9iaiA9PT0gXCJzdHJpbmdcIikge1xuICAgIGlmICghbWF5YmVPYmopIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgIFwiV2hlbiBwcm92aWRpbmcgYSBuYW1lLCB5b3UgbXVzdCBhbHNvIHByb3ZpZGUgdGhlIHZhcmlhbnRzIG9iamVjdCBvciBhcnJheS5cIlxuICAgICAgKTtcbiAgICB9XG4gICAgb2JqID0gbWF5YmVPYmo7XG4gICAgbmFtZSA9IG5hbWVPck9iajtcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgY29uc3Qgc2ltcGxlVmFyaWFudHNPYmogPSB7fTtcbiAgICBmb3IgKGNvbnN0IHZhcmlhbnQgb2Ygb2JqKSB7XG4gICAgICBzaW1wbGVWYXJpYW50c09ialt2YXJpYW50XSA9IG5ldyBVbml0QnVpbGRlcigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFNpbXBsZVN1bUJ1aWxkZXJJbXBsKHNpbXBsZVZhcmlhbnRzT2JqLCBuYW1lKTtcbiAgfVxuICByZXR1cm4gbmV3IFN1bUJ1aWxkZXIob2JqLCBuYW1lKTtcbn0pO1xudmFyIHQgPSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBCb29sYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgYm9vbGVhbmAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEJvb2xCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgYm9vbDogKCkgPT4gbmV3IEJvb2xCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBTdHJpbmdgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBzdHJpbmdgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBTdHJpbmdCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgc3RyaW5nOiAoKSA9PiBuZXcgU3RyaW5nQnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgRjY0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgRjY0QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIG51bWJlcjogKCkgPT4gbmV3IEY2NEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEk4YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSThCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgaTg6ICgpID0+IG5ldyBJOEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYFU4YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVThCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgdTg6ICgpID0+IG5ldyBVOEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEkxNmAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEkxNkJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBpMTY6ICgpID0+IG5ldyBJMTZCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBVMTZgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBVMTZCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgdTE2OiAoKSA9PiBuZXcgVTE2QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgSTMyYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSTMyQnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIGkzMjogKCkgPT4gbmV3IEkzMkJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYFUzMmAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFUzMkJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICB1MzI6ICgpID0+IG5ldyBVMzJCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBJNjRgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBJNjRCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgaTY0OiAoKSA9PiBuZXcgSTY0QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgVTY0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgYmlnaW50YCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVTY0QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIHU2NDogKCkgPT4gbmV3IFU2NEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEkxMjhgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBJMTI4QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIGkxMjg6ICgpID0+IG5ldyBJMTI4QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgVTEyOGAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJpZ2ludGAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFUxMjhCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgdTEyODogKCkgPT4gbmV3IFUxMjhCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBJMjU2YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgYmlnaW50YCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSTI1NkJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBpMjU2OiAoKSA9PiBuZXcgSTI1NkJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYFUyNTZgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBVMjU2QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIHUyNTY6ICgpID0+IG5ldyBVMjU2QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgRjMyYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgRjMyQnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIGYzMjogKCkgPT4gbmV3IEYzMkJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEY2NGAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEY2NEJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBmNjQ6ICgpID0+IG5ldyBGNjRCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBQcm9kdWN0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9ucy4gUHJvZHVjdCB0eXBlcyBpbiBTcGFjZXRpbWVEQlxuICAgKiBhcmUgZXNzZW50aWFsbHkgdGhlIHNhbWUgYXMgb2JqZWN0cyBpbiBKYXZhU2NyaXB0L1R5cGVTY3JpcHQuXG4gICAqIFByb3BlcnRpZXMgb2YgdGhlIG9iamVjdCBtdXN0IGFsc28gYmUge0BsaW5rIFR5cGVCdWlsZGVyfXMuXG4gICAqIFJlcHJlc2VudGVkIGFzIGFuIG9iamVjdCB3aXRoIHNwZWNpZmljIHByb3BlcnRpZXMgaW4gVHlwZVNjcmlwdC5cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgKG9wdGlvbmFsKSBBIGRpc3BsYXkgbmFtZSBmb3IgdGhlIHByb2R1Y3QgdHlwZS4gSWYgb21pdHRlZCwgYW4gYW5vbnltb3VzIHByb2R1Y3QgdHlwZSBpcyBjcmVhdGVkLlxuICAgKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgZGVmaW5pbmcgdGhlIHByb3BlcnRpZXMgb2YgdGhlIHR5cGUsIHdob3NlIHByb3BlcnR5XG4gICAqIHZhbHVlcyBtdXN0IGJlIHtAbGluayBUeXBlQnVpbGRlcn1zLlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgUHJvZHVjdEJ1aWxkZXJ9IGluc3RhbmNlLlxuICAgKi9cbiAgb2JqZWN0OiAoKG5hbWVPck9iaiwgbWF5YmVPYmopID0+IHtcbiAgICBpZiAodHlwZW9mIG5hbWVPck9iaiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgaWYgKCFtYXliZU9iaikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiV2hlbiBwcm92aWRpbmcgYSBuYW1lLCB5b3UgbXVzdCBhbHNvIHByb3ZpZGUgdGhlIG9iamVjdC5cIlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBQcm9kdWN0QnVpbGRlcihtYXliZU9iaiwgbmFtZU9yT2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9kdWN0QnVpbGRlcihuYW1lT3JPYmosIHZvaWQgMCk7XG4gIH0pLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgUm93YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9ucy4gUm93IHR5cGVzIGluIFNwYWNldGltZURCXG4gICAqIGFyZSBzaW1pbGFyIHRvIGBQcm9kdWN0YCB0eXBlcywgYnV0IGFyZSBzcGVjaWZpY2FsbHkgdXNlZCB0byBkZWZpbmUgdGhlIHNjaGVtYSBvZiBhIHRhYmxlIHJvdy5cbiAgICogUHJvcGVydGllcyBvZiB0aGUgb2JqZWN0IG11c3QgYWxzbyBiZSB7QGxpbmsgVHlwZUJ1aWxkZXJ9IG9yIHtAbGluayBDb2x1bW5CdWlsZGVyfXMuXG4gICAqXG4gICAqIFlvdSBjYW4gcmVwcmVzZW50IGEgYFJvd2AgYXMgZWl0aGVyIGEge0BsaW5rIFJvd09ian0gb3IgYW4ge0BsaW5rIFJvd0J1aWxkZXJ9IHR5cGUgd2hlblxuICAgKiBkZWZpbmluZyBhIHRhYmxlIHNjaGVtYS5cbiAgICpcbiAgICogVGhlIHtAbGluayBSb3dCdWlsZGVyfSB0eXBlIGlzIHVzZWZ1bCB3aGVuIHlvdSB3YW50IHRvIGNyZWF0ZSBhIHR5cGUgd2hpY2ggY2FuIGJlIHVzZWQgYW55d2hlcmVcbiAgICogYSB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGlzIGFjY2VwdGVkLCBzdWNoIGFzIGluIG5lc3RlZCBvYmplY3RzIG9yIGFycmF5cywgb3IgYXMgdGhlIGFyZ3VtZW50XG4gICAqIHRvIGEgc2NoZWR1bGVkIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgZGVmaW5pbmcgdGhlIHByb3BlcnRpZXMgb2YgdGhlIHJvdywgd2hvc2UgcHJvcGVydHlcbiAgICogdmFsdWVzIG11c3QgYmUge0BsaW5rIFR5cGVCdWlsZGVyfXMgb3Ige0BsaW5rIENvbHVtbkJ1aWxkZXJ9cy5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFJvd0J1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICByb3c6ICgobmFtZU9yT2JqLCBtYXliZU9iaikgPT4ge1xuICAgIGNvbnN0IFtvYmosIG5hbWVdID0gdHlwZW9mIG5hbWVPck9iaiA9PT0gXCJzdHJpbmdcIiA/IFttYXliZU9iaiwgbmFtZU9yT2JqXSA6IFtuYW1lT3JPYmosIHZvaWQgMF07XG4gICAgcmV0dXJuIG5ldyBSb3dCdWlsZGVyKG9iaiwgbmFtZSk7XG4gIH0pLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zLlxuICAgKiBSZXByZXNlbnRlZCBhcyBhbiBhcnJheSBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0eXBlIG9mIHRoZSBhcnJheSwgd2hpY2ggbXVzdCBiZSBhIGBUeXBlQnVpbGRlcmAuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBBcnJheUJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBhcnJheShlKSB7XG4gICAgcmV0dXJuIG5ldyBBcnJheUJ1aWxkZXIoZSk7XG4gIH0sXG4gIGVudW06IGVudW1JbXBsLFxuICAvKipcbiAgICogVGhpcyBpcyBhIHNwZWNpYWwgaGVscGVyIGZ1bmN0aW9uIGZvciBjb252ZW5pZW50bHkgY3JlYXRpbmcgYFByb2R1Y3RgIHR5cGUgY29sdW1ucyB3aXRoIG5vIGZpZWxkcy5cbiAgICpcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFByb2R1Y3RCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIG5vIGZpZWxkcy5cbiAgICovXG4gIHVuaXQoKSB7XG4gICAgcmV0dXJuIG5ldyBVbml0QnVpbGRlcigpO1xuICB9LFxuICAvKipcbiAgICogQ3JlYXRlcyBhIGxhemlseS1ldmFsdWF0ZWQge0BsaW5rIFR5cGVCdWlsZGVyfS4gVGhpcyBpcyB1c2VmdWwgZm9yIGNyZWF0aW5nXG4gICAqIHJlY3Vyc2l2ZSB0eXBlcywgc3VjaCBhcyBhIHRyZWUgb3IgbGlua2VkIGxpc3QuXG4gICAqIEBwYXJhbSB0aHVuayBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHtAbGluayBUeXBlQnVpbGRlcn0uXG4gICAqIEByZXR1cm5zIEEgcHJveHkge0BsaW5rIFR5cGVCdWlsZGVyfSB0aGF0IGV2YWx1YXRlcyB0aGUgdGh1bmsgb24gZmlyc3QgYWNjZXNzLlxuICAgKi9cbiAgbGF6eSh0aHVuaykge1xuICAgIGxldCBjYWNoZWQgPSBudWxsO1xuICAgIGNvbnN0IGdldCA9ICgpID0+IGNhY2hlZCA/Pz0gdGh1bmsoKTtcbiAgICBjb25zdCBwcm94eSA9IG5ldyBQcm94eSh7fSwge1xuICAgICAgZ2V0KF90LCBwcm9wLCByZWN2KSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGdldCgpO1xuICAgICAgICBjb25zdCB2YWwgPSBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3AsIHJlY3YpO1xuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gXCJmdW5jdGlvblwiID8gdmFsLmJpbmQodGFyZ2V0KSA6IHZhbDtcbiAgICAgIH0sXG4gICAgICBzZXQoX3QsIHByb3AsIHZhbHVlLCByZWN2KSB7XG4gICAgICAgIHJldHVybiBSZWZsZWN0LnNldChnZXQoKSwgcHJvcCwgdmFsdWUsIHJlY3YpO1xuICAgICAgfSxcbiAgICAgIGhhcyhfdCwgcHJvcCkge1xuICAgICAgICByZXR1cm4gcHJvcCBpbiBnZXQoKTtcbiAgICAgIH0sXG4gICAgICBvd25LZXlzKCkge1xuICAgICAgICByZXR1cm4gUmVmbGVjdC5vd25LZXlzKGdldCgpKTtcbiAgICAgIH0sXG4gICAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoX3QsIHByb3ApIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZ2V0KCksIHByb3ApO1xuICAgICAgfSxcbiAgICAgIGdldFByb3RvdHlwZU9mKCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKGdldCgpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcHJveHk7XG4gIH0sXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgc3BlY2lhbCBoZWxwZXIgZnVuY3Rpb24gZm9yIGNvbnZlbmllbnRseSBjcmVhdGluZyB7QGxpbmsgU2NoZWR1bGVBdH0gdHlwZSBjb2x1bW5zLlxuICAgKiBAcmV0dXJucyBBIG5ldyBDb2x1bW5CdWlsZGVyIGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBTY2hlZHVsZUF0fSB0eXBlLlxuICAgKi9cbiAgc2NoZWR1bGVBdDogKCkgPT4ge1xuICAgIHJldHVybiBuZXcgU2NoZWR1bGVBdEJ1aWxkZXIoKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBPcHRpb259IHR5cGUuXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGVudW0gd2l0aCBhIGBzb21lYCBhbmQgYG5vbmVgIHZhcmlhbnQuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdHlwZSBvZiB0aGUgdmFsdWUgY29udGFpbmVkIGluIHRoZSBgc29tZWAgdmFyaWFudCBvZiB0aGUgYE9wdGlvbmAuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBPcHRpb25CdWlsZGVyfSBpbnN0YW5jZSB3aXRoIHRoZSB7QGxpbmsgT3B0aW9ufSB0eXBlLlxuICAgKi9cbiAgb3B0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBPcHRpb25CdWlsZGVyKHZhbHVlKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBSZXN1bHR9IHR5cGUuXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGVudW0gd2l0aCBhbiBgb2tgIGFuZCBgZXJyYCB2YXJpYW50LlxuICAgKiBAcGFyYW0gb2sgVGhlIHR5cGUgb2YgdGhlIHZhbHVlIGNvbnRhaW5lZCBpbiB0aGUgYG9rYCB2YXJpYW50IG9mIHRoZSBgUmVzdWx0YC5cbiAgICogQHBhcmFtIGVyciBUaGUgdHlwZSBvZiB0aGUgdmFsdWUgY29udGFpbmVkIGluIHRoZSBgZXJyYCB2YXJpYW50IG9mIHRoZSBgUmVzdWx0YC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFJlc3VsdEJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBSZXN1bHR9IHR5cGUuXG4gICAqL1xuICByZXN1bHQob2ssIGVycikge1xuICAgIHJldHVybiBuZXcgUmVzdWx0QnVpbGRlcihvaywgZXJyKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBJZGVudGl0eX0gdHlwZS5cbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX19pZGVudGl0eV9fYCBlbGVtZW50LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBJZGVudGl0eX0gdHlwZS5cbiAgICovXG4gIGlkZW50aXR5OiAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUJ1aWxkZXIoKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBDb25uZWN0aW9uSWR9IHR5cGUuXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGBvYmplY3RgIHdpdGggYSBzaW5nbGUgYF9fY29ubmVjdGlvbl9pZF9fYCBlbGVtZW50LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBDb25uZWN0aW9uSWR9IHR5cGUuXG4gICAqL1xuICBjb25uZWN0aW9uSWQ6ICgpID0+IHtcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZEJ1aWxkZXIoKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBUaW1lc3RhbXB9IHR5cGUuXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGBvYmplY3RgIHdpdGggYSBzaW5nbGUgYF9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX19gIGVsZW1lbnQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBUeXBlQnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIFRpbWVzdGFtcH0gdHlwZS5cbiAgICovXG4gIHRpbWVzdGFtcDogKCkgPT4ge1xuICAgIHJldHVybiBuZXcgVGltZXN0YW1wQnVpbGRlcigpO1xuICB9LFxuICAvKipcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIFRpbWVEdXJhdGlvbn0gdHlwZS5cbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX190aW1lX2R1cmF0aW9uX21pY3Jvc19fYCBlbGVtZW50LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBUaW1lRHVyYXRpb259IHR5cGUuXG4gICAqL1xuICB0aW1lRHVyYXRpb246ICgpID0+IHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkJ1aWxkZXIoKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBVdWlkfSB0eXBlLlxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBgb2JqZWN0YCB3aXRoIGEgc2luZ2xlIGBfX3V1aWRfX2AgZWxlbWVudC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFR5cGVCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIHRoZSB7QGxpbmsgVXVpZH0gdHlwZS5cbiAgICovXG4gIHV1aWQ6ICgpID0+IHtcbiAgICByZXR1cm4gbmV3IFV1aWRCdWlsZGVyKCk7XG4gIH0sXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgbWV0aG9kIGZvciBjcmVhdGluZyBhIGNvbHVtbiB3aXRoIHRoZSBgQnl0ZUFycmF5YCB0eXBlLlxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBgYXJyYXlgIG9mIGB1OGAuXG4gICAqIFRoZSBUeXBlU2NyaXB0IHJlcHJlc2VudGF0aW9uIGlzIHtAbGluayBVaW50OEFycmF5fS5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEJ5dGVBcnJheUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIGBCeXRlQXJyYXlgIHR5cGUuXG4gICAqL1xuICBieXRlQXJyYXk6ICgpID0+IHtcbiAgICByZXR1cm4gbmV3IEJ5dGVBcnJheUJ1aWxkZXIoKTtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi9hdXRvZ2VuL3R5cGVzLnRzXG52YXIgQWxnZWJyYWljVHlwZTIgPSB0LmVudW0oXCJBbGdlYnJhaWNUeXBlXCIsIHtcbiAgUmVmOiB0LnUzMigpLFxuICBnZXQgU3VtKCkge1xuICAgIHJldHVybiBTdW1UeXBlMjtcbiAgfSxcbiAgZ2V0IFByb2R1Y3QoKSB7XG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcbiAgfSxcbiAgZ2V0IEFycmF5KCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfSxcbiAgU3RyaW5nOiB0LnVuaXQoKSxcbiAgQm9vbDogdC51bml0KCksXG4gIEk4OiB0LnVuaXQoKSxcbiAgVTg6IHQudW5pdCgpLFxuICBJMTY6IHQudW5pdCgpLFxuICBVMTY6IHQudW5pdCgpLFxuICBJMzI6IHQudW5pdCgpLFxuICBVMzI6IHQudW5pdCgpLFxuICBJNjQ6IHQudW5pdCgpLFxuICBVNjQ6IHQudW5pdCgpLFxuICBJMTI4OiB0LnVuaXQoKSxcbiAgVTEyODogdC51bml0KCksXG4gIEkyNTY6IHQudW5pdCgpLFxuICBVMjU2OiB0LnVuaXQoKSxcbiAgRjMyOiB0LnVuaXQoKSxcbiAgRjY0OiB0LnVuaXQoKVxufSk7XG52YXIgQ2FzZUNvbnZlcnNpb25Qb2xpY3kgPSB0LmVudW0oXCJDYXNlQ29udmVyc2lvblBvbGljeVwiLCB7XG4gIE5vbmU6IHQudW5pdCgpLFxuICBTbmFrZUNhc2U6IHQudW5pdCgpXG59KTtcbnZhciBFeHBsaWNpdE5hbWVFbnRyeSA9IHQuZW51bShcIkV4cGxpY2l0TmFtZUVudHJ5XCIsIHtcbiAgZ2V0IFRhYmxlKCkge1xuICAgIHJldHVybiBOYW1lTWFwcGluZztcbiAgfSxcbiAgZ2V0IEZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBOYW1lTWFwcGluZztcbiAgfSxcbiAgZ2V0IEluZGV4KCkge1xuICAgIHJldHVybiBOYW1lTWFwcGluZztcbiAgfVxufSk7XG52YXIgRXhwbGljaXROYW1lcyA9IHQub2JqZWN0KFwiRXhwbGljaXROYW1lc1wiLCB7XG4gIGdldCBlbnRyaWVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KEV4cGxpY2l0TmFtZUVudHJ5KTtcbiAgfVxufSk7XG52YXIgRnVuY3Rpb25WaXNpYmlsaXR5ID0gdC5lbnVtKFwiRnVuY3Rpb25WaXNpYmlsaXR5XCIsIHtcbiAgUHJpdmF0ZTogdC51bml0KCksXG4gIENsaWVudENhbGxhYmxlOiB0LnVuaXQoKVxufSk7XG52YXIgSHR0cEhlYWRlclBhaXIgPSB0Lm9iamVjdChcIkh0dHBIZWFkZXJQYWlyXCIsIHtcbiAgbmFtZTogdC5zdHJpbmcoKSxcbiAgdmFsdWU6IHQuYnl0ZUFycmF5KClcbn0pO1xudmFyIEh0dHBIZWFkZXJzID0gdC5vYmplY3QoXCJIdHRwSGVhZGVyc1wiLCB7XG4gIGdldCBlbnRyaWVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KEh0dHBIZWFkZXJQYWlyKTtcbiAgfVxufSk7XG52YXIgSHR0cE1ldGhvZCA9IHQuZW51bShcIkh0dHBNZXRob2RcIiwge1xuICBHZXQ6IHQudW5pdCgpLFxuICBIZWFkOiB0LnVuaXQoKSxcbiAgUG9zdDogdC51bml0KCksXG4gIFB1dDogdC51bml0KCksXG4gIERlbGV0ZTogdC51bml0KCksXG4gIENvbm5lY3Q6IHQudW5pdCgpLFxuICBPcHRpb25zOiB0LnVuaXQoKSxcbiAgVHJhY2U6IHQudW5pdCgpLFxuICBQYXRjaDogdC51bml0KCksXG4gIEV4dGVuc2lvbjogdC5zdHJpbmcoKVxufSk7XG52YXIgSHR0cFJlcXVlc3QgPSB0Lm9iamVjdChcIkh0dHBSZXF1ZXN0XCIsIHtcbiAgZ2V0IG1ldGhvZCgpIHtcbiAgICByZXR1cm4gSHR0cE1ldGhvZDtcbiAgfSxcbiAgZ2V0IGhlYWRlcnMoKSB7XG4gICAgcmV0dXJuIEh0dHBIZWFkZXJzO1xuICB9LFxuICB0aW1lb3V0OiB0Lm9wdGlvbih0LnRpbWVEdXJhdGlvbigpKSxcbiAgdXJpOiB0LnN0cmluZygpLFxuICBnZXQgdmVyc2lvbigpIHtcbiAgICByZXR1cm4gSHR0cFZlcnNpb247XG4gIH1cbn0pO1xudmFyIEh0dHBSZXNwb25zZSA9IHQub2JqZWN0KFwiSHR0cFJlc3BvbnNlXCIsIHtcbiAgZ2V0IGhlYWRlcnMoKSB7XG4gICAgcmV0dXJuIEh0dHBIZWFkZXJzO1xuICB9LFxuICBnZXQgdmVyc2lvbigpIHtcbiAgICByZXR1cm4gSHR0cFZlcnNpb247XG4gIH0sXG4gIGNvZGU6IHQudTE2KClcbn0pO1xudmFyIEh0dHBWZXJzaW9uID0gdC5lbnVtKFwiSHR0cFZlcnNpb25cIiwge1xuICBIdHRwMDk6IHQudW5pdCgpLFxuICBIdHRwMTA6IHQudW5pdCgpLFxuICBIdHRwMTE6IHQudW5pdCgpLFxuICBIdHRwMjogdC51bml0KCksXG4gIEh0dHAzOiB0LnVuaXQoKVxufSk7XG52YXIgSW5kZXhUeXBlID0gdC5lbnVtKFwiSW5kZXhUeXBlXCIsIHtcbiAgQlRyZWU6IHQudW5pdCgpLFxuICBIYXNoOiB0LnVuaXQoKVxufSk7XG52YXIgTGlmZWN5Y2xlID0gdC5lbnVtKFwiTGlmZWN5Y2xlXCIsIHtcbiAgSW5pdDogdC51bml0KCksXG4gIE9uQ29ubmVjdDogdC51bml0KCksXG4gIE9uRGlzY29ubmVjdDogdC51bml0KClcbn0pO1xudmFyIE1ldGhvZE9yQW55ID0gdC5lbnVtKFwiTWV0aG9kT3JBbnlcIiwge1xuICBBbnk6IHQudW5pdCgpLFxuICBnZXQgTWV0aG9kKCkge1xuICAgIHJldHVybiBIdHRwTWV0aG9kO1xuICB9XG59KTtcbnZhciBNaXNjTW9kdWxlRXhwb3J0ID0gdC5lbnVtKFwiTWlzY01vZHVsZUV4cG9ydFwiLCB7XG4gIGdldCBUeXBlQWxpYXMoKSB7XG4gICAgcmV0dXJuIFR5cGVBbGlhcztcbiAgfVxufSk7XG52YXIgTmFtZU1hcHBpbmcgPSB0Lm9iamVjdChcIk5hbWVNYXBwaW5nXCIsIHtcbiAgc291cmNlTmFtZTogdC5zdHJpbmcoKSxcbiAgY2Fub25pY2FsTmFtZTogdC5zdHJpbmcoKVxufSk7XG52YXIgUHJvZHVjdFR5cGUyID0gdC5vYmplY3QoXCJQcm9kdWN0VHlwZVwiLCB7XG4gIGdldCBlbGVtZW50cygpIHtcbiAgICByZXR1cm4gdC5hcnJheShQcm9kdWN0VHlwZUVsZW1lbnQpO1xuICB9XG59KTtcbnZhciBQcm9kdWN0VHlwZUVsZW1lbnQgPSB0Lm9iamVjdChcIlByb2R1Y3RUeXBlRWxlbWVudFwiLCB7XG4gIG5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxuICBnZXQgYWxnZWJyYWljVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XG4gIH1cbn0pO1xudmFyIFJhd0NvbHVtbkRlZlY4ID0gdC5vYmplY3QoXCJSYXdDb2x1bW5EZWZWOFwiLCB7XG4gIGNvbE5hbWU6IHQuc3RyaW5nKCksXG4gIGdldCBjb2xUeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfVxufSk7XG52YXIgUmF3Q29sdW1uRGVmYXVsdFZhbHVlVjEwID0gdC5vYmplY3QoXCJSYXdDb2x1bW5EZWZhdWx0VmFsdWVWMTBcIiwge1xuICBjb2xJZDogdC51MTYoKSxcbiAgdmFsdWU6IHQuYnl0ZUFycmF5KClcbn0pO1xudmFyIFJhd0NvbHVtbkRlZmF1bHRWYWx1ZVY5ID0gdC5vYmplY3QoXCJSYXdDb2x1bW5EZWZhdWx0VmFsdWVWOVwiLCB7XG4gIHRhYmxlOiB0LnN0cmluZygpLFxuICBjb2xJZDogdC51MTYoKSxcbiAgdmFsdWU6IHQuYnl0ZUFycmF5KClcbn0pO1xudmFyIFJhd0NvbnN0cmFpbnREYXRhVjkgPSB0LmVudW0oXCJSYXdDb25zdHJhaW50RGF0YVY5XCIsIHtcbiAgZ2V0IFVuaXF1ZSgpIHtcbiAgICByZXR1cm4gUmF3VW5pcXVlQ29uc3RyYWludERhdGFWOTtcbiAgfVxufSk7XG52YXIgUmF3Q29uc3RyYWludERlZlYxMCA9IHQub2JqZWN0KFwiUmF3Q29uc3RyYWludERlZlYxMFwiLCB7XG4gIHNvdXJjZU5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxuICBnZXQgZGF0YSgpIHtcbiAgICByZXR1cm4gUmF3Q29uc3RyYWludERhdGFWOTtcbiAgfVxufSk7XG52YXIgUmF3Q29uc3RyYWludERlZlY4ID0gdC5vYmplY3QoXCJSYXdDb25zdHJhaW50RGVmVjhcIiwge1xuICBjb25zdHJhaW50TmFtZTogdC5zdHJpbmcoKSxcbiAgY29uc3RyYWludHM6IHQudTgoKSxcbiAgY29sdW1uczogdC5hcnJheSh0LnUxNigpKVxufSk7XG52YXIgUmF3Q29uc3RyYWludERlZlY5ID0gdC5vYmplY3QoXCJSYXdDb25zdHJhaW50RGVmVjlcIiwge1xuICBuYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgZ2V0IGRhdGEoKSB7XG4gICAgcmV0dXJuIFJhd0NvbnN0cmFpbnREYXRhVjk7XG4gIH1cbn0pO1xudmFyIFJhd0h0dHBIYW5kbGVyRGVmVjEwID0gdC5vYmplY3QoXCJSYXdIdHRwSGFuZGxlckRlZlYxMFwiLCB7XG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKClcbn0pO1xudmFyIFJhd0h0dHBSb3V0ZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3SHR0cFJvdXRlRGVmVjEwXCIsIHtcbiAgaGFuZGxlckZ1bmN0aW9uOiB0LnN0cmluZygpLFxuICBnZXQgbWV0aG9kKCkge1xuICAgIHJldHVybiBNZXRob2RPckFueTtcbiAgfSxcbiAgcGF0aDogdC5zdHJpbmcoKVxufSk7XG52YXIgUmF3SW5kZXhBbGdvcml0aG0gPSB0LmVudW0oXCJSYXdJbmRleEFsZ29yaXRobVwiLCB7XG4gIEJUcmVlOiB0LmFycmF5KHQudTE2KCkpLFxuICBIYXNoOiB0LmFycmF5KHQudTE2KCkpLFxuICBEaXJlY3Q6IHQudTE2KClcbn0pO1xudmFyIFJhd0luZGV4RGVmVjEwID0gdC5vYmplY3QoXCJSYXdJbmRleERlZlYxMFwiLCB7XG4gIHNvdXJjZU5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxuICBhY2Nlc3Nvck5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxuICBnZXQgYWxnb3JpdGhtKCkge1xuICAgIHJldHVybiBSYXdJbmRleEFsZ29yaXRobTtcbiAgfVxufSk7XG52YXIgUmF3SW5kZXhEZWZWOCA9IHQub2JqZWN0KFwiUmF3SW5kZXhEZWZWOFwiLCB7XG4gIGluZGV4TmFtZTogdC5zdHJpbmcoKSxcbiAgaXNVbmlxdWU6IHQuYm9vbCgpLFxuICBnZXQgaW5kZXhUeXBlKCkge1xuICAgIHJldHVybiBJbmRleFR5cGU7XG4gIH0sXG4gIGNvbHVtbnM6IHQuYXJyYXkodC51MTYoKSlcbn0pO1xudmFyIFJhd0luZGV4RGVmVjkgPSB0Lm9iamVjdChcIlJhd0luZGV4RGVmVjlcIiwge1xuICBuYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgYWNjZXNzb3JOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgZ2V0IGFsZ29yaXRobSgpIHtcbiAgICByZXR1cm4gUmF3SW5kZXhBbGdvcml0aG07XG4gIH1cbn0pO1xudmFyIFJhd0xpZmVDeWNsZVJlZHVjZXJEZWZWMTAgPSB0Lm9iamVjdChcbiAgXCJSYXdMaWZlQ3ljbGVSZWR1Y2VyRGVmVjEwXCIsXG4gIHtcbiAgICBnZXQgbGlmZWN5Y2xlU3BlYygpIHtcbiAgICAgIHJldHVybiBMaWZlY3ljbGU7XG4gICAgfSxcbiAgICBmdW5jdGlvbk5hbWU6IHQuc3RyaW5nKClcbiAgfVxuKTtcbnZhciBSYXdNaXNjTW9kdWxlRXhwb3J0VjkgPSB0LmVudW0oXCJSYXdNaXNjTW9kdWxlRXhwb3J0VjlcIiwge1xuICBnZXQgQ29sdW1uRGVmYXVsdFZhbHVlKCkge1xuICAgIHJldHVybiBSYXdDb2x1bW5EZWZhdWx0VmFsdWVWOTtcbiAgfSxcbiAgZ2V0IFByb2NlZHVyZSgpIHtcbiAgICByZXR1cm4gUmF3UHJvY2VkdXJlRGVmVjk7XG4gIH0sXG4gIGdldCBWaWV3KCkge1xuICAgIHJldHVybiBSYXdWaWV3RGVmVjk7XG4gIH1cbn0pO1xudmFyIFJhd01vZHVsZURlZiA9IHQuZW51bShcIlJhd01vZHVsZURlZlwiLCB7XG4gIGdldCBWOEJhY2tDb21wYXQoKSB7XG4gICAgcmV0dXJuIFJhd01vZHVsZURlZlY4O1xuICB9LFxuICBnZXQgVjkoKSB7XG4gICAgcmV0dXJuIFJhd01vZHVsZURlZlY5O1xuICB9LFxuICBnZXQgVjEwKCkge1xuICAgIHJldHVybiBSYXdNb2R1bGVEZWZWMTA7XG4gIH1cbn0pO1xudmFyIFJhd01vZHVsZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3TW9kdWxlRGVmVjEwXCIsIHtcbiAgZ2V0IHNlY3Rpb25zKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd01vZHVsZURlZlYxMFNlY3Rpb24pO1xuICB9XG59KTtcbnZhciBSYXdNb2R1bGVEZWZWMTBTZWN0aW9uID0gdC5lbnVtKFwiUmF3TW9kdWxlRGVmVjEwU2VjdGlvblwiLCB7XG4gIGdldCBUeXBlc3BhY2UoKSB7XG4gICAgcmV0dXJuIFR5cGVzcGFjZTtcbiAgfSxcbiAgZ2V0IFR5cGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1R5cGVEZWZWMTApO1xuICB9LFxuICBnZXQgVGFibGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1RhYmxlRGVmVjEwKTtcbiAgfSxcbiAgZ2V0IFJlZHVjZXJzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1JlZHVjZXJEZWZWMTApO1xuICB9LFxuICBnZXQgUHJvY2VkdXJlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdQcm9jZWR1cmVEZWZWMTApO1xuICB9LFxuICBnZXQgVmlld3MoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Vmlld0RlZlYxMCk7XG4gIH0sXG4gIGdldCBTY2hlZHVsZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3U2NoZWR1bGVEZWZWMTApO1xuICB9LFxuICBnZXQgTGlmZUN5Y2xlUmVkdWNlcnMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3TGlmZUN5Y2xlUmVkdWNlckRlZlYxMCk7XG4gIH0sXG4gIGdldCBSb3dMZXZlbFNlY3VyaXR5KCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1Jvd0xldmVsU2VjdXJpdHlEZWZWOSk7XG4gIH0sXG4gIGdldCBDYXNlQ29udmVyc2lvblBvbGljeSgpIHtcbiAgICByZXR1cm4gQ2FzZUNvbnZlcnNpb25Qb2xpY3k7XG4gIH0sXG4gIGdldCBFeHBsaWNpdE5hbWVzKCkge1xuICAgIHJldHVybiBFeHBsaWNpdE5hbWVzO1xuICB9LFxuICBnZXQgSHR0cEhhbmRsZXJzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd0h0dHBIYW5kbGVyRGVmVjEwKTtcbiAgfSxcbiAgZ2V0IEh0dHBSb3V0ZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3SHR0cFJvdXRlRGVmVjEwKTtcbiAgfVxufSk7XG52YXIgUmF3TW9kdWxlRGVmVjggPSB0Lm9iamVjdChcIlJhd01vZHVsZURlZlY4XCIsIHtcbiAgZ2V0IHR5cGVzcGFjZSgpIHtcbiAgICByZXR1cm4gVHlwZXNwYWNlO1xuICB9LFxuICBnZXQgdGFibGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFRhYmxlRGVzYyk7XG4gIH0sXG4gIGdldCByZWR1Y2VycygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSZWR1Y2VyRGVmKTtcbiAgfSxcbiAgZ2V0IG1pc2NFeHBvcnRzKCkge1xuICAgIHJldHVybiB0LmFycmF5KE1pc2NNb2R1bGVFeHBvcnQpO1xuICB9XG59KTtcbnZhciBSYXdNb2R1bGVEZWZWOSA9IHQub2JqZWN0KFwiUmF3TW9kdWxlRGVmVjlcIiwge1xuICBnZXQgdHlwZXNwYWNlKCkge1xuICAgIHJldHVybiBUeXBlc3BhY2U7XG4gIH0sXG4gIGdldCB0YWJsZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3VGFibGVEZWZWOSk7XG4gIH0sXG4gIGdldCByZWR1Y2VycygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdSZWR1Y2VyRGVmVjkpO1xuICB9LFxuICBnZXQgdHlwZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3VHlwZURlZlY5KTtcbiAgfSxcbiAgZ2V0IG1pc2NFeHBvcnRzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd01pc2NNb2R1bGVFeHBvcnRWOSk7XG4gIH0sXG4gIGdldCByb3dMZXZlbFNlY3VyaXR5KCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1Jvd0xldmVsU2VjdXJpdHlEZWZWOSk7XG4gIH1cbn0pO1xudmFyIFJhd1Byb2NlZHVyZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3UHJvY2VkdXJlRGVmVjEwXCIsIHtcbiAgc291cmNlTmFtZTogdC5zdHJpbmcoKSxcbiAgZ2V0IHBhcmFtcygpIHtcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xuICB9LFxuICBnZXQgcmV0dXJuVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XG4gIH0sXG4gIGdldCB2aXNpYmlsaXR5KCkge1xuICAgIHJldHVybiBGdW5jdGlvblZpc2liaWxpdHk7XG4gIH1cbn0pO1xudmFyIFJhd1Byb2NlZHVyZURlZlY5ID0gdC5vYmplY3QoXCJSYXdQcm9jZWR1cmVEZWZWOVwiLCB7XG4gIG5hbWU6IHQuc3RyaW5nKCksXG4gIGdldCBwYXJhbXMoKSB7XG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcbiAgfSxcbiAgZ2V0IHJldHVyblR5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xuICB9XG59KTtcbnZhciBSYXdSZWR1Y2VyRGVmVjEwID0gdC5vYmplY3QoXCJSYXdSZWR1Y2VyRGVmVjEwXCIsIHtcbiAgc291cmNlTmFtZTogdC5zdHJpbmcoKSxcbiAgZ2V0IHBhcmFtcygpIHtcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xuICB9LFxuICBnZXQgdmlzaWJpbGl0eSgpIHtcbiAgICByZXR1cm4gRnVuY3Rpb25WaXNpYmlsaXR5O1xuICB9LFxuICBnZXQgb2tSZXR1cm5UeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfSxcbiAgZ2V0IGVyclJldHVyblR5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xuICB9XG59KTtcbnZhciBSYXdSZWR1Y2VyRGVmVjkgPSB0Lm9iamVjdChcIlJhd1JlZHVjZXJEZWZWOVwiLCB7XG4gIG5hbWU6IHQuc3RyaW5nKCksXG4gIGdldCBwYXJhbXMoKSB7XG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcbiAgfSxcbiAgZ2V0IGxpZmVjeWNsZSgpIHtcbiAgICByZXR1cm4gdC5vcHRpb24oTGlmZWN5Y2xlKTtcbiAgfVxufSk7XG52YXIgUmF3Um93TGV2ZWxTZWN1cml0eURlZlY5ID0gdC5vYmplY3QoXCJSYXdSb3dMZXZlbFNlY3VyaXR5RGVmVjlcIiwge1xuICBzcWw6IHQuc3RyaW5nKClcbn0pO1xudmFyIFJhd1NjaGVkdWxlRGVmVjEwID0gdC5vYmplY3QoXCJSYXdTY2hlZHVsZURlZlYxMFwiLCB7XG4gIHNvdXJjZU5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxuICB0YWJsZU5hbWU6IHQuc3RyaW5nKCksXG4gIHNjaGVkdWxlQXRDb2w6IHQudTE2KCksXG4gIGZ1bmN0aW9uTmFtZTogdC5zdHJpbmcoKVxufSk7XG52YXIgUmF3U2NoZWR1bGVEZWZWOSA9IHQub2JqZWN0KFwiUmF3U2NoZWR1bGVEZWZWOVwiLCB7XG4gIG5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxuICByZWR1Y2VyTmFtZTogdC5zdHJpbmcoKSxcbiAgc2NoZWR1bGVkQXRDb2x1bW46IHQudTE2KClcbn0pO1xudmFyIFJhd1Njb3BlZFR5cGVOYW1lVjEwID0gdC5vYmplY3QoXCJSYXdTY29wZWRUeXBlTmFtZVYxMFwiLCB7XG4gIHNjb3BlOiB0LmFycmF5KHQuc3RyaW5nKCkpLFxuICBzb3VyY2VOYW1lOiB0LnN0cmluZygpXG59KTtcbnZhciBSYXdTY29wZWRUeXBlTmFtZVY5ID0gdC5vYmplY3QoXCJSYXdTY29wZWRUeXBlTmFtZVY5XCIsIHtcbiAgc2NvcGU6IHQuYXJyYXkodC5zdHJpbmcoKSksXG4gIG5hbWU6IHQuc3RyaW5nKClcbn0pO1xudmFyIFJhd1NlcXVlbmNlRGVmVjEwID0gdC5vYmplY3QoXCJSYXdTZXF1ZW5jZURlZlYxMFwiLCB7XG4gIHNvdXJjZU5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxuICBjb2x1bW46IHQudTE2KCksXG4gIHN0YXJ0OiB0Lm9wdGlvbih0LmkxMjgoKSksXG4gIG1pblZhbHVlOiB0Lm9wdGlvbih0LmkxMjgoKSksXG4gIG1heFZhbHVlOiB0Lm9wdGlvbih0LmkxMjgoKSksXG4gIGluY3JlbWVudDogdC5pMTI4KClcbn0pO1xudmFyIFJhd1NlcXVlbmNlRGVmVjggPSB0Lm9iamVjdChcIlJhd1NlcXVlbmNlRGVmVjhcIiwge1xuICBzZXF1ZW5jZU5hbWU6IHQuc3RyaW5nKCksXG4gIGNvbFBvczogdC51MTYoKSxcbiAgaW5jcmVtZW50OiB0LmkxMjgoKSxcbiAgc3RhcnQ6IHQub3B0aW9uKHQuaTEyOCgpKSxcbiAgbWluVmFsdWU6IHQub3B0aW9uKHQuaTEyOCgpKSxcbiAgbWF4VmFsdWU6IHQub3B0aW9uKHQuaTEyOCgpKSxcbiAgYWxsb2NhdGVkOiB0LmkxMjgoKVxufSk7XG52YXIgUmF3U2VxdWVuY2VEZWZWOSA9IHQub2JqZWN0KFwiUmF3U2VxdWVuY2VEZWZWOVwiLCB7XG4gIG5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxuICBjb2x1bW46IHQudTE2KCksXG4gIHN0YXJ0OiB0Lm9wdGlvbih0LmkxMjgoKSksXG4gIG1pblZhbHVlOiB0Lm9wdGlvbih0LmkxMjgoKSksXG4gIG1heFZhbHVlOiB0Lm9wdGlvbih0LmkxMjgoKSksXG4gIGluY3JlbWVudDogdC5pMTI4KClcbn0pO1xudmFyIFJhd1RhYmxlRGVmVjEwID0gdC5vYmplY3QoXCJSYXdUYWJsZURlZlYxMFwiLCB7XG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXG4gIHByb2R1Y3RUeXBlUmVmOiB0LnUzMigpLFxuICBwcmltYXJ5S2V5OiB0LmFycmF5KHQudTE2KCkpLFxuICBnZXQgaW5kZXhlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdJbmRleERlZlYxMCk7XG4gIH0sXG4gIGdldCBjb25zdHJhaW50cygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdDb25zdHJhaW50RGVmVjEwKTtcbiAgfSxcbiAgZ2V0IHNlcXVlbmNlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdTZXF1ZW5jZURlZlYxMCk7XG4gIH0sXG4gIGdldCB0YWJsZVR5cGUoKSB7XG4gICAgcmV0dXJuIFRhYmxlVHlwZTtcbiAgfSxcbiAgZ2V0IHRhYmxlQWNjZXNzKCkge1xuICAgIHJldHVybiBUYWJsZUFjY2VzcztcbiAgfSxcbiAgZ2V0IGRlZmF1bHRWYWx1ZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Q29sdW1uRGVmYXVsdFZhbHVlVjEwKTtcbiAgfSxcbiAgaXNFdmVudDogdC5ib29sKClcbn0pO1xudmFyIFJhd1RhYmxlRGVmVjggPSB0Lm9iamVjdChcIlJhd1RhYmxlRGVmVjhcIiwge1xuICB0YWJsZU5hbWU6IHQuc3RyaW5nKCksXG4gIGdldCBjb2x1bW5zKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd0NvbHVtbkRlZlY4KTtcbiAgfSxcbiAgZ2V0IGluZGV4ZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3SW5kZXhEZWZWOCk7XG4gIH0sXG4gIGdldCBjb25zdHJhaW50cygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdDb25zdHJhaW50RGVmVjgpO1xuICB9LFxuICBnZXQgc2VxdWVuY2VzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1NlcXVlbmNlRGVmVjgpO1xuICB9LFxuICB0YWJsZVR5cGU6IHQuc3RyaW5nKCksXG4gIHRhYmxlQWNjZXNzOiB0LnN0cmluZygpLFxuICBzY2hlZHVsZWQ6IHQub3B0aW9uKHQuc3RyaW5nKCkpXG59KTtcbnZhciBSYXdUYWJsZURlZlY5ID0gdC5vYmplY3QoXCJSYXdUYWJsZURlZlY5XCIsIHtcbiAgbmFtZTogdC5zdHJpbmcoKSxcbiAgcHJvZHVjdFR5cGVSZWY6IHQudTMyKCksXG4gIHByaW1hcnlLZXk6IHQuYXJyYXkodC51MTYoKSksXG4gIGdldCBpbmRleGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd0luZGV4RGVmVjkpO1xuICB9LFxuICBnZXQgY29uc3RyYWludHMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Q29uc3RyYWludERlZlY5KTtcbiAgfSxcbiAgZ2V0IHNlcXVlbmNlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdTZXF1ZW5jZURlZlY5KTtcbiAgfSxcbiAgZ2V0IHNjaGVkdWxlKCkge1xuICAgIHJldHVybiB0Lm9wdGlvbihSYXdTY2hlZHVsZURlZlY5KTtcbiAgfSxcbiAgZ2V0IHRhYmxlVHlwZSgpIHtcbiAgICByZXR1cm4gVGFibGVUeXBlO1xuICB9LFxuICBnZXQgdGFibGVBY2Nlc3MoKSB7XG4gICAgcmV0dXJuIFRhYmxlQWNjZXNzO1xuICB9XG59KTtcbnZhciBSYXdUeXBlRGVmVjEwID0gdC5vYmplY3QoXCJSYXdUeXBlRGVmVjEwXCIsIHtcbiAgZ2V0IHNvdXJjZU5hbWUoKSB7XG4gICAgcmV0dXJuIFJhd1Njb3BlZFR5cGVOYW1lVjEwO1xuICB9LFxuICB0eTogdC51MzIoKSxcbiAgY3VzdG9tT3JkZXJpbmc6IHQuYm9vbCgpXG59KTtcbnZhciBSYXdUeXBlRGVmVjkgPSB0Lm9iamVjdChcIlJhd1R5cGVEZWZWOVwiLCB7XG4gIGdldCBuYW1lKCkge1xuICAgIHJldHVybiBSYXdTY29wZWRUeXBlTmFtZVY5O1xuICB9LFxuICB0eTogdC51MzIoKSxcbiAgY3VzdG9tT3JkZXJpbmc6IHQuYm9vbCgpXG59KTtcbnZhciBSYXdVbmlxdWVDb25zdHJhaW50RGF0YVY5ID0gdC5vYmplY3QoXG4gIFwiUmF3VW5pcXVlQ29uc3RyYWludERhdGFWOVwiLFxuICB7XG4gICAgY29sdW1uczogdC5hcnJheSh0LnUxNigpKVxuICB9XG4pO1xudmFyIFJhd1ZpZXdEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1ZpZXdEZWZWMTBcIiwge1xuICBzb3VyY2VOYW1lOiB0LnN0cmluZygpLFxuICBpbmRleDogdC51MzIoKSxcbiAgaXNQdWJsaWM6IHQuYm9vbCgpLFxuICBpc0Fub255bW91czogdC5ib29sKCksXG4gIGdldCBwYXJhbXMoKSB7XG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcbiAgfSxcbiAgZ2V0IHJldHVyblR5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xuICB9XG59KTtcbnZhciBSYXdWaWV3RGVmVjkgPSB0Lm9iamVjdChcIlJhd1ZpZXdEZWZWOVwiLCB7XG4gIG5hbWU6IHQuc3RyaW5nKCksXG4gIGluZGV4OiB0LnUzMigpLFxuICBpc1B1YmxpYzogdC5ib29sKCksXG4gIGlzQW5vbnltb3VzOiB0LmJvb2woKSxcbiAgZ2V0IHBhcmFtcygpIHtcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xuICB9LFxuICBnZXQgcmV0dXJuVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XG4gIH1cbn0pO1xudmFyIFJlZHVjZXJEZWYgPSB0Lm9iamVjdChcIlJlZHVjZXJEZWZcIiwge1xuICBuYW1lOiB0LnN0cmluZygpLFxuICBnZXQgYXJncygpIHtcbiAgICByZXR1cm4gdC5hcnJheShQcm9kdWN0VHlwZUVsZW1lbnQpO1xuICB9XG59KTtcbnZhciBTdW1UeXBlMiA9IHQub2JqZWN0KFwiU3VtVHlwZVwiLCB7XG4gIGdldCB2YXJpYW50cygpIHtcbiAgICByZXR1cm4gdC5hcnJheShTdW1UeXBlVmFyaWFudCk7XG4gIH1cbn0pO1xudmFyIFN1bVR5cGVWYXJpYW50ID0gdC5vYmplY3QoXCJTdW1UeXBlVmFyaWFudFwiLCB7XG4gIG5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxuICBnZXQgYWxnZWJyYWljVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XG4gIH1cbn0pO1xudmFyIFRhYmxlQWNjZXNzID0gdC5lbnVtKFwiVGFibGVBY2Nlc3NcIiwge1xuICBQdWJsaWM6IHQudW5pdCgpLFxuICBQcml2YXRlOiB0LnVuaXQoKVxufSk7XG52YXIgVGFibGVEZXNjID0gdC5vYmplY3QoXCJUYWJsZURlc2NcIiwge1xuICBnZXQgc2NoZW1hKCkge1xuICAgIHJldHVybiBSYXdUYWJsZURlZlY4O1xuICB9LFxuICBkYXRhOiB0LnUzMigpXG59KTtcbnZhciBUYWJsZVR5cGUgPSB0LmVudW0oXCJUYWJsZVR5cGVcIiwge1xuICBTeXN0ZW06IHQudW5pdCgpLFxuICBVc2VyOiB0LnVuaXQoKVxufSk7XG52YXIgVHlwZUFsaWFzID0gdC5vYmplY3QoXCJUeXBlQWxpYXNcIiwge1xuICBuYW1lOiB0LnN0cmluZygpLFxuICB0eTogdC51MzIoKVxufSk7XG52YXIgVHlwZXNwYWNlID0gdC5vYmplY3QoXCJUeXBlc3BhY2VcIiwge1xuICBnZXQgdHlwZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoQWxnZWJyYWljVHlwZTIpO1xuICB9XG59KTtcbnZhciBWaWV3UmVzdWx0SGVhZGVyID0gdC5lbnVtKFwiVmlld1Jlc3VsdEhlYWRlclwiLCB7XG4gIFJvd0RhdGE6IHQudW5pdCgpLFxuICBSYXdTcWw6IHQuc3RyaW5nKClcbn0pO1xuXG4vLyBzcmMvbGliL3NjaGVtYS50c1xuZnVuY3Rpb24gdGFibGVUb1NjaGVtYShhY2NOYW1lLCBzY2hlbWEyLCB0YWJsZURlZikge1xuICBjb25zdCBnZXRDb2xOYW1lID0gKGkpID0+IHNjaGVtYTIucm93VHlwZS5hbGdlYnJhaWNUeXBlLnZhbHVlLmVsZW1lbnRzW2ldLm5hbWU7XG4gIGNvbnN0IHJlc29sdmVkSW5kZXhlcyA9IHRhYmxlRGVmLmluZGV4ZXMubWFwKFxuICAgIChpZHgpID0+IHtcbiAgICAgIGNvbnN0IGFjY2Vzc29yTmFtZSA9IGlkeC5hY2Nlc3Nvck5hbWU7XG4gICAgICBpZiAodHlwZW9mIGFjY2Vzc29yTmFtZSAhPT0gXCJzdHJpbmdcIiB8fCBhY2Nlc3Nvck5hbWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgYEluZGV4ICcke2lkeC5zb3VyY2VOYW1lID8/IFwiPHVua25vd24+XCJ9JyBvbiB0YWJsZSAnJHt0YWJsZURlZi5zb3VyY2VOYW1lfScgaXMgbWlzc2luZyBhY2Nlc3NvciBuYW1lYFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgY29uc3QgY29sdW1uSWRzID0gaWR4LmFsZ29yaXRobS50YWcgPT09IFwiRGlyZWN0XCIgPyBbaWR4LmFsZ29yaXRobS52YWx1ZV0gOiBpZHguYWxnb3JpdGhtLnZhbHVlO1xuICAgICAgY29uc3QgdW5pcXVlID0gdGFibGVEZWYuY29uc3RyYWludHMuc29tZShcbiAgICAgICAgKGMpID0+IGMuZGF0YS50YWcgPT09IFwiVW5pcXVlXCIgJiYgYy5kYXRhLnZhbHVlLmNvbHVtbnMuZXZlcnkoKGNvbCkgPT4gY29sdW1uSWRzLmluY2x1ZGVzKGNvbCkpXG4gICAgICApO1xuICAgICAgY29uc3QgYWxnb3JpdGhtID0ge1xuICAgICAgICBCVHJlZTogXCJidHJlZVwiLFxuICAgICAgICBIYXNoOiBcImhhc2hcIixcbiAgICAgICAgRGlyZWN0OiBcImRpcmVjdFwiXG4gICAgICB9W2lkeC5hbGdvcml0aG0udGFnXTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IGFjY2Vzc29yTmFtZSxcbiAgICAgICAgdW5pcXVlLFxuICAgICAgICBhbGdvcml0aG0sXG4gICAgICAgIGNvbHVtbnM6IGNvbHVtbklkcy5tYXAoZ2V0Q29sTmFtZSlcbiAgICAgIH07XG4gICAgfVxuICApO1xuICByZXR1cm4ge1xuICAgIC8vIEZvciBjbGllbnQsYHNjaGFtYS50YWJsZU5hbWVgIHdpbGwgYWx3YXlzIGJlIHRoZXJlIGFzIGNhbm9uaWNhbCBuYW1lLlxuICAgIC8vIEZvciBtb2R1bGUsIGlmIGV4cGxpY2l0IG5hbWUgaXMgbm90IHByb3ZpZGVkIHZpYSBgbmFtZWAsIGFjY2Vzc29yIG5hbWUgd2lsbFxuICAgIC8vIGJlIHVzZWQsIGl0IGlzIHN0b3JlZCBhcyBhbGlhcyBpbiBkYXRhYmFzZSwgaGVuY2Ugd29ya3MgaW4gcXVlcnkgYnVpbGRlci5cbiAgICBzb3VyY2VOYW1lOiBzY2hlbWEyLnRhYmxlTmFtZSB8fCBhY2NOYW1lLFxuICAgIGFjY2Vzc29yTmFtZTogYWNjTmFtZSxcbiAgICBjb2x1bW5zOiBzY2hlbWEyLnJvd1R5cGUucm93LFxuICAgIC8vIHR5cGVkIGFzIFRbaV1bJ3Jvd1R5cGUnXVsncm93J10gdW5kZXIgVGFibGVzVG9TY2hlbWE8VD5cbiAgICByb3dUeXBlOiBzY2hlbWEyLnJvd1NwYWNldGltZVR5cGUsXG4gICAgLy8gS2VlcCBkZWNsYXJhdGl2ZSBpbmRleGVzIGluIHRoZWlyIG9yaWdpbmFsIHNoYXBlIGZvciB0eXBlLWxldmVsIGNvbnN1bWVycy5cbiAgICBpbmRleGVzOiBzY2hlbWEyLmlkeHMsXG4gICAgY29uc3RyYWludHM6IHRhYmxlRGVmLmNvbnN0cmFpbnRzLm1hcCgoYykgPT4gKHtcbiAgICAgIG5hbWU6IGMuc291cmNlTmFtZSxcbiAgICAgIGNvbnN0cmFpbnQ6IFwidW5pcXVlXCIsXG4gICAgICBjb2x1bW5zOiBjLmRhdGEudmFsdWUuY29sdW1ucy5tYXAoZ2V0Q29sTmFtZSlcbiAgICB9KSksXG4gICAgLy8gRXhwb3NlIHJlc29sdmVkIHJ1bnRpbWUgaW5kZXhlcyBzZXBhcmF0ZWx5IHNvIHJ1bnRpbWUgdXNlcnMgZG9uJ3QgaGF2ZSB0b1xuICAgIC8vIHJlaW50ZXJwcmV0IGBpbmRleGVzYCB3aXRoIHVuc2FmZSBjYXN0cy5cbiAgICByZXNvbHZlZEluZGV4ZXMsXG4gICAgdGFibGVEZWYsXG4gICAgLi4udGFibGVEZWYuaXNFdmVudCA/IHsgaXNFdmVudDogdHJ1ZSB9IDoge31cbiAgfTtcbn1cbnZhciBNb2R1bGVDb250ZXh0ID0gY2xhc3Mge1xuICAjY29tcG91bmRUeXBlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIC8qKlxuICAgKiBUaGUgZ2xvYmFsIG1vZHVsZSBkZWZpbml0aW9uIHRoYXQgZ2V0cyBwb3B1bGF0ZWQgYnkgY2FsbHMgdG8gYHJlZHVjZXIoKWAgYW5kIGxpZmVjeWNsZSBob29rcy5cbiAgICovXG4gICNtb2R1bGVEZWYgPSB7XG4gICAgdHlwZXNwYWNlOiB7IHR5cGVzOiBbXSB9LFxuICAgIHRhYmxlczogW10sXG4gICAgcmVkdWNlcnM6IFtdLFxuICAgIHR5cGVzOiBbXSxcbiAgICByb3dMZXZlbFNlY3VyaXR5OiBbXSxcbiAgICBzY2hlZHVsZXM6IFtdLFxuICAgIHByb2NlZHVyZXM6IFtdLFxuICAgIHZpZXdzOiBbXSxcbiAgICBsaWZlQ3ljbGVSZWR1Y2VyczogW10sXG4gICAgaHR0cEhhbmRsZXJzOiBbXSxcbiAgICBodHRwUm91dGVzOiBbXSxcbiAgICBjYXNlQ29udmVyc2lvblBvbGljeTogeyB0YWc6IFwiU25ha2VDYXNlXCIgfSxcbiAgICBleHBsaWNpdE5hbWVzOiB7XG4gICAgICBlbnRyaWVzOiBbXVxuICAgIH1cbiAgfTtcbiAgZ2V0IG1vZHVsZURlZigpIHtcbiAgICByZXR1cm4gdGhpcy4jbW9kdWxlRGVmO1xuICB9XG4gIHJhd01vZHVsZURlZlYxMCgpIHtcbiAgICBjb25zdCBzZWN0aW9ucyA9IFtdO1xuICAgIGNvbnN0IHB1c2ggPSAocykgPT4ge1xuICAgICAgaWYgKHMpIHNlY3Rpb25zLnB1c2gocyk7XG4gICAgfTtcbiAgICBjb25zdCBtb2R1bGUgPSB0aGlzLiNtb2R1bGVEZWY7XG4gICAgcHVzaChtb2R1bGUudHlwZXNwYWNlICYmIHsgdGFnOiBcIlR5cGVzcGFjZVwiLCB2YWx1ZTogbW9kdWxlLnR5cGVzcGFjZSB9KTtcbiAgICBwdXNoKG1vZHVsZS50eXBlcyAmJiB7IHRhZzogXCJUeXBlc1wiLCB2YWx1ZTogbW9kdWxlLnR5cGVzIH0pO1xuICAgIHB1c2gobW9kdWxlLnRhYmxlcyAmJiB7IHRhZzogXCJUYWJsZXNcIiwgdmFsdWU6IG1vZHVsZS50YWJsZXMgfSk7XG4gICAgcHVzaChtb2R1bGUucmVkdWNlcnMgJiYgeyB0YWc6IFwiUmVkdWNlcnNcIiwgdmFsdWU6IG1vZHVsZS5yZWR1Y2VycyB9KTtcbiAgICBwdXNoKG1vZHVsZS5wcm9jZWR1cmVzICYmIHsgdGFnOiBcIlByb2NlZHVyZXNcIiwgdmFsdWU6IG1vZHVsZS5wcm9jZWR1cmVzIH0pO1xuICAgIHB1c2gobW9kdWxlLnZpZXdzICYmIHsgdGFnOiBcIlZpZXdzXCIsIHZhbHVlOiBtb2R1bGUudmlld3MgfSk7XG4gICAgcHVzaChtb2R1bGUuc2NoZWR1bGVzICYmIHsgdGFnOiBcIlNjaGVkdWxlc1wiLCB2YWx1ZTogbW9kdWxlLnNjaGVkdWxlcyB9KTtcbiAgICBwdXNoKFxuICAgICAgbW9kdWxlLmxpZmVDeWNsZVJlZHVjZXJzICYmIHtcbiAgICAgICAgdGFnOiBcIkxpZmVDeWNsZVJlZHVjZXJzXCIsXG4gICAgICAgIHZhbHVlOiBtb2R1bGUubGlmZUN5Y2xlUmVkdWNlcnNcbiAgICAgIH1cbiAgICApO1xuICAgIHB1c2goXG4gICAgICBtb2R1bGUuaHR0cEhhbmRsZXJzICYmIHtcbiAgICAgICAgdGFnOiBcIkh0dHBIYW5kbGVyc1wiLFxuICAgICAgICB2YWx1ZTogbW9kdWxlLmh0dHBIYW5kbGVyc1xuICAgICAgfVxuICAgICk7XG4gICAgcHVzaChcbiAgICAgIG1vZHVsZS5odHRwUm91dGVzICYmIHtcbiAgICAgICAgdGFnOiBcIkh0dHBSb3V0ZXNcIixcbiAgICAgICAgdmFsdWU6IG1vZHVsZS5odHRwUm91dGVzXG4gICAgICB9XG4gICAgKTtcbiAgICBwdXNoKFxuICAgICAgbW9kdWxlLnJvd0xldmVsU2VjdXJpdHkgJiYge1xuICAgICAgICB0YWc6IFwiUm93TGV2ZWxTZWN1cml0eVwiLFxuICAgICAgICB2YWx1ZTogbW9kdWxlLnJvd0xldmVsU2VjdXJpdHlcbiAgICAgIH1cbiAgICApO1xuICAgIHB1c2goXG4gICAgICBtb2R1bGUuZXhwbGljaXROYW1lcyAmJiB7XG4gICAgICAgIHRhZzogXCJFeHBsaWNpdE5hbWVzXCIsXG4gICAgICAgIHZhbHVlOiBtb2R1bGUuZXhwbGljaXROYW1lc1xuICAgICAgfVxuICAgICk7XG4gICAgcHVzaChcbiAgICAgIG1vZHVsZS5jYXNlQ29udmVyc2lvblBvbGljeSAmJiB7XG4gICAgICAgIHRhZzogXCJDYXNlQ29udmVyc2lvblBvbGljeVwiLFxuICAgICAgICB2YWx1ZTogbW9kdWxlLmNhc2VDb252ZXJzaW9uUG9saWN5XG4gICAgICB9XG4gICAgKTtcbiAgICByZXR1cm4geyBzZWN0aW9ucyB9O1xuICB9XG4gIC8qKlxuICAgKiBTZXQgdGhlIGNhc2UgY29udmVyc2lvbiBwb2xpY3kgZm9yIHRoaXMgbW9kdWxlLlxuICAgKiBDYWxsZWQgYnkgdGhlIHNldHRpbmdzIG1lY2hhbmlzbS5cbiAgICovXG4gIHNldENhc2VDb252ZXJzaW9uUG9saWN5KHBvbGljeSkge1xuICAgIHRoaXMuI21vZHVsZURlZi5jYXNlQ29udmVyc2lvblBvbGljeSA9IHBvbGljeTtcbiAgfVxuICBnZXQgdHlwZXNwYWNlKCkge1xuICAgIHJldHVybiB0aGlzLiNtb2R1bGVEZWYudHlwZXNwYWNlO1xuICB9XG4gIC8qKlxuICAgKiBSZXNvbHZlcyB0aGUgYWN0dWFsIHR5cGUgb2YgYSBUeXBlQnVpbGRlciBieSBmb2xsb3dpbmcgaXRzIHJlZmVyZW5jZXMgdW50aWwgaXQgcmVhY2hlcyBhIG5vbi1yZWYgdHlwZS5cbiAgICogQHBhcmFtIHR5cGVzcGFjZSBUaGUgdHlwZXNwYWNlIHRvIHJlc29sdmUgdHlwZXMgYWdhaW5zdC5cbiAgICogQHBhcmFtIHR5cGVCdWlsZGVyIFRoZSBUeXBlQnVpbGRlciB0byByZXNvbHZlLlxuICAgKiBAcmV0dXJucyBUaGUgcmVzb2x2ZWQgYWxnZWJyYWljIHR5cGUuXG4gICAqL1xuICByZXNvbHZlVHlwZSh0eXBlQnVpbGRlcikge1xuICAgIGxldCB0eSA9IHR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGU7XG4gICAgd2hpbGUgKHR5LnRhZyA9PT0gXCJSZWZcIikge1xuICAgICAgdHkgPSB0aGlzLnR5cGVzcGFjZS50eXBlc1t0eS52YWx1ZV07XG4gICAgfVxuICAgIHJldHVybiB0eTtcbiAgfVxuICAvKipcbiAgICogQWRkcyBhIHR5cGUgdG8gdGhlIG1vZHVsZSBkZWZpbml0aW9uJ3MgdHlwZXNwYWNlIGFzIGEgYFJlZmAgaWYgaXQgaXMgYSBuYW1lZCBjb21wb3VuZCB0eXBlIChQcm9kdWN0IG9yIFN1bSkuXG4gICAqIE90aGVyd2lzZSwgcmV0dXJucyB0aGUgdHlwZSBhcyBpcy5cbiAgICogQHBhcmFtIG5hbWVcbiAgICogQHBhcmFtIHR5XG4gICAqIEByZXR1cm5zXG4gICAqL1xuICByZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIpIHtcbiAgICBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBQcm9kdWN0QnVpbGRlciAmJiAhaXNVbml0KHR5cGVCdWlsZGVyKSB8fCB0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFN1bUJ1aWxkZXIgfHwgdHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSB7XG4gICAgICByZXR1cm4gdGhpcy4jcmVnaXN0ZXJDb21wb3VuZFR5cGVSZWN1cnNpdmVseSh0eXBlQnVpbGRlcik7XG4gICAgfSBlbHNlIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIE9wdGlvbkJ1aWxkZXIpIHtcbiAgICAgIHJldHVybiBuZXcgT3B0aW9uQnVpbGRlcihcbiAgICAgICAgdGhpcy5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIudmFsdWUpXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBSZXN1bHRCdWlsZGVyKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3VsdEJ1aWxkZXIoXG4gICAgICAgIHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyLm9rKSxcbiAgICAgICAgdGhpcy5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIuZXJyKVxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgQXJyYXlCdWlsZGVyKSB7XG4gICAgICByZXR1cm4gbmV3IEFycmF5QnVpbGRlcihcbiAgICAgICAgdGhpcy5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIuZWxlbWVudClcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0eXBlQnVpbGRlcjtcbiAgICB9XG4gIH1cbiAgI3JlZ2lzdGVyQ29tcG91bmRUeXBlUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIpIHtcbiAgICBjb25zdCB0eSA9IHR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGU7XG4gICAgY29uc3QgbmFtZSA9IHR5cGVCdWlsZGVyLnR5cGVOYW1lO1xuICAgIGlmIChuYW1lID09PSB2b2lkIDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYE1pc3NpbmcgdHlwZSBuYW1lIGZvciAke3R5cGVCdWlsZGVyLmNvbnN0cnVjdG9yLm5hbWUgPz8gXCJUeXBlQnVpbGRlclwifSAke0pTT04uc3RyaW5naWZ5KHR5cGVCdWlsZGVyKX1gXG4gICAgICApO1xuICAgIH1cbiAgICBsZXQgciA9IHRoaXMuI2NvbXBvdW5kVHlwZXMuZ2V0KHR5KTtcbiAgICBpZiAociAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gcjtcbiAgICB9XG4gICAgY29uc3QgbmV3VHkgPSB0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFJvd0J1aWxkZXIgfHwgdHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBQcm9kdWN0QnVpbGRlciA/IHtcbiAgICAgIHRhZzogXCJQcm9kdWN0XCIsXG4gICAgICB2YWx1ZTogeyBlbGVtZW50czogW10gfVxuICAgIH0gOiB7XG4gICAgICB0YWc6IFwiU3VtXCIsXG4gICAgICB2YWx1ZTogeyB2YXJpYW50czogW10gfVxuICAgIH07XG4gICAgciA9IG5ldyBSZWZCdWlsZGVyKHRoaXMuI21vZHVsZURlZi50eXBlc3BhY2UudHlwZXMubGVuZ3RoKTtcbiAgICB0aGlzLiNtb2R1bGVEZWYudHlwZXNwYWNlLnR5cGVzLnB1c2gobmV3VHkpO1xuICAgIHRoaXMuI2NvbXBvdW5kVHlwZXMuc2V0KHR5LCByKTtcbiAgICBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSB7XG4gICAgICBmb3IgKGNvbnN0IFtuYW1lMiwgZWxlbV0gb2YgT2JqZWN0LmVudHJpZXModHlwZUJ1aWxkZXIucm93KSkge1xuICAgICAgICBuZXdUeS52YWx1ZS5lbGVtZW50cy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBuYW1lMixcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseShlbGVtLnR5cGVCdWlsZGVyKS5hbGdlYnJhaWNUeXBlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBQcm9kdWN0QnVpbGRlcikge1xuICAgICAgZm9yIChjb25zdCBbbmFtZTIsIGVsZW1dIG9mIE9iamVjdC5lbnRyaWVzKHR5cGVCdWlsZGVyLmVsZW1lbnRzKSkge1xuICAgICAgICBuZXdUeS52YWx1ZS5lbGVtZW50cy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBuYW1lMixcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseShlbGVtKS5hbGdlYnJhaWNUeXBlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBTdW1CdWlsZGVyKSB7XG4gICAgICBmb3IgKGNvbnN0IFtuYW1lMiwgdmFyaWFudF0gb2YgT2JqZWN0LmVudHJpZXModHlwZUJ1aWxkZXIudmFyaWFudHMpKSB7XG4gICAgICAgIG5ld1R5LnZhbHVlLnZhcmlhbnRzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IG5hbWUyLFxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHZhcmlhbnQpLmFsZ2VicmFpY1R5cGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuI21vZHVsZURlZi50eXBlcy5wdXNoKHtcbiAgICAgIHNvdXJjZU5hbWU6IHNwbGl0TmFtZShuYW1lKSxcbiAgICAgIHR5OiByLnJlZixcbiAgICAgIGN1c3RvbU9yZGVyaW5nOiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIHI7XG4gIH1cbn07XG5mdW5jdGlvbiBpc1VuaXQodHlwZUJ1aWxkZXIpIHtcbiAgcmV0dXJuIHR5cGVCdWlsZGVyLnR5cGVOYW1lID09IG51bGwgJiYgdHlwZUJ1aWxkZXIuYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cy5sZW5ndGggPT09IDA7XG59XG5mdW5jdGlvbiBzcGxpdE5hbWUobmFtZSkge1xuICBjb25zdCBzY29wZSA9IG5hbWUuc3BsaXQoXCIuXCIpO1xuICByZXR1cm4geyBzb3VyY2VOYW1lOiBzY29wZS5wb3AoKSwgc2NvcGUgfTtcbn1cbnZhciB0ZXh0RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xudmFyIHRleHREZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKFwidXRmLThcIik7XG5mdW5jdGlvbiBkZXNlcmlhbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgc3dpdGNoIChtZXRob2QudGFnKSB7XG4gICAgY2FzZSBcIkdldFwiOlxuICAgICAgcmV0dXJuIFwiR0VUXCI7XG4gICAgY2FzZSBcIkhlYWRcIjpcbiAgICAgIHJldHVybiBcIkhFQURcIjtcbiAgICBjYXNlIFwiUG9zdFwiOlxuICAgICAgcmV0dXJuIFwiUE9TVFwiO1xuICAgIGNhc2UgXCJQdXRcIjpcbiAgICAgIHJldHVybiBcIlBVVFwiO1xuICAgIGNhc2UgXCJEZWxldGVcIjpcbiAgICAgIHJldHVybiBcIkRFTEVURVwiO1xuICAgIGNhc2UgXCJDb25uZWN0XCI6XG4gICAgICByZXR1cm4gXCJDT05ORUNUXCI7XG4gICAgY2FzZSBcIk9wdGlvbnNcIjpcbiAgICAgIHJldHVybiBcIk9QVElPTlNcIjtcbiAgICBjYXNlIFwiVHJhY2VcIjpcbiAgICAgIHJldHVybiBcIlRSQUNFXCI7XG4gICAgY2FzZSBcIlBhdGNoXCI6XG4gICAgICByZXR1cm4gXCJQQVRDSFwiO1xuICAgIGNhc2UgXCJFeHRlbnNpb25cIjpcbiAgICAgIHJldHVybiBtZXRob2QudmFsdWU7XG4gIH1cbn1cbnZhciBtZXRob2RzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoW1xuICBbXCJHRVRcIiwgeyB0YWc6IFwiR2V0XCIgfV0sXG4gIFtcIkhFQURcIiwgeyB0YWc6IFwiSGVhZFwiIH1dLFxuICBbXCJQT1NUXCIsIHsgdGFnOiBcIlBvc3RcIiB9XSxcbiAgW1wiUFVUXCIsIHsgdGFnOiBcIlB1dFwiIH1dLFxuICBbXCJERUxFVEVcIiwgeyB0YWc6IFwiRGVsZXRlXCIgfV0sXG4gIFtcIkNPTk5FQ1RcIiwgeyB0YWc6IFwiQ29ubmVjdFwiIH1dLFxuICBbXCJPUFRJT05TXCIsIHsgdGFnOiBcIk9wdGlvbnNcIiB9XSxcbiAgW1wiVFJBQ0VcIiwgeyB0YWc6IFwiVHJhY2VcIiB9XSxcbiAgW1wiUEFUQ0hcIiwgeyB0YWc6IFwiUGF0Y2hcIiB9XVxuXSk7XG5mdW5jdGlvbiBzZXJpYWxpemVNZXRob2QobWV0aG9kKSB7XG4gIHJldHVybiBtZXRob2RzLmdldChtZXRob2Q/LnRvVXBwZXJDYXNlKCkgPz8gXCJHRVRcIikgPz8ge1xuICAgIHRhZzogXCJFeHRlbnNpb25cIixcbiAgICB2YWx1ZTogbWV0aG9kXG4gIH07XG59XG5mdW5jdGlvbiBzZXJpYWxpemVIZWFkZXJzKGhlYWRlcnMpIHtcbiAgcmV0dXJuIHtcbiAgICBlbnRyaWVzOiBoZWFkZXJzVG9MaXN0KGhlYWRlcnMpLmZsYXRNYXAoKFtrLCB2XSkgPT4gQXJyYXkuaXNBcnJheSh2KSA/IHYubWFwKCh2MikgPT4gW2ssIHYyXSkgOiBbW2ssIHZdXSkubWFwKChbbmFtZSwgdmFsdWVdKSA9PiAoeyBuYW1lLCB2YWx1ZTogdGV4dEVuY29kZXIuZW5jb2RlKHZhbHVlKSB9KSlcbiAgfTtcbn1cbmZ1bmN0aW9uIGRlc2VyaWFsaXplSGVhZGVycyhoZWFkZXJzKSB7XG4gIHJldHVybiBuZXcgSGVhZGVycyhcbiAgICBoZWFkZXJzLmVudHJpZXMubWFwKCh7IG5hbWUsIHZhbHVlIH0pID0+IFtcbiAgICAgIG5hbWUsXG4gICAgICB0ZXh0RGVjb2Rlci5kZWNvZGUodmFsdWUpXG4gICAgXSlcbiAgKTtcbn1cbnZhciBtYWtlUmVzcG9uc2UgPSBTeW1ib2woXCJtYWtlUmVzcG9uc2VcIik7XG52YXIgU3luY1Jlc3BvbnNlID0gY2xhc3MgX1N5bmNSZXNwb25zZSB7XG4gICNib2R5O1xuICAjaW5uZXI7XG4gIGNvbnN0cnVjdG9yKGJvZHksIGluaXQpIHtcbiAgICBpZiAoYm9keSA9PSBudWxsKSB7XG4gICAgICB0aGlzLiNib2R5ID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLiNib2R5ID0gYm9keTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4jYm9keSA9IG5ldyBVaW50OEFycmF5KGJvZHkpLmJ1ZmZlcjtcbiAgICB9XG4gICAgdGhpcy4jaW5uZXIgPSB7XG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyhpbml0Py5oZWFkZXJzKSxcbiAgICAgIHN0YXR1czogaW5pdD8uc3RhdHVzID8/IDIwMCxcbiAgICAgIHN0YXR1c1RleHQ6IGluaXQ/LnN0YXR1c1RleHQgPz8gXCJcIixcbiAgICAgIHR5cGU6IFwiZGVmYXVsdFwiLFxuICAgICAgdXJsOiBudWxsLFxuICAgICAgYWJvcnRlZDogZmFsc2UsXG4gICAgICB2ZXJzaW9uOiBpbml0Py52ZXJzaW9uID8/IHsgdGFnOiBcIkh0dHAxMVwiIH1cbiAgICB9O1xuICB9XG4gIHN0YXRpYyBbbWFrZVJlc3BvbnNlXShib2R5LCBpbm5lcikge1xuICAgIGNvbnN0IG1lID0gbmV3IF9TeW5jUmVzcG9uc2UoYm9keSk7XG4gICAgbWUuI2lubmVyID0gaW5uZXI7XG4gICAgcmV0dXJuIG1lO1xuICB9XG4gIGdldCBoZWFkZXJzKCkge1xuICAgIHJldHVybiB0aGlzLiNpbm5lci5oZWFkZXJzO1xuICB9XG4gIGdldCBzdGF0dXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2lubmVyLnN0YXR1cztcbiAgfVxuICBnZXQgc3RhdHVzVGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIuc3RhdHVzVGV4dDtcbiAgfVxuICBnZXQgb2soKSB7XG4gICAgcmV0dXJuIDIwMCA8PSB0aGlzLiNpbm5lci5zdGF0dXMgJiYgdGhpcy4jaW5uZXIuc3RhdHVzIDw9IDI5OTtcbiAgfVxuICBnZXQgdXJsKCkge1xuICAgIHJldHVybiB0aGlzLiNpbm5lci51cmwgPz8gXCJcIjtcbiAgfVxuICBnZXQgdHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIudHlwZTtcbiAgfVxuICBnZXQgdmVyc2lvbigpIHtcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIudmVyc2lvbjtcbiAgfVxuICBhcnJheUJ1ZmZlcigpIHtcbiAgICByZXR1cm4gdGhpcy5ieXRlcygpLmJ1ZmZlcjtcbiAgfVxuICBieXRlcygpIHtcbiAgICBpZiAodGhpcy4jYm9keSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLiNib2R5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICByZXR1cm4gdGV4dEVuY29kZXIuZW5jb2RlKHRoaXMuI2JvZHkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkodGhpcy4jYm9keSk7XG4gICAgfVxuICB9XG4gIGpzb24oKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UodGhpcy50ZXh0KCkpO1xuICB9XG4gIHRleHQoKSB7XG4gICAgaWYgKHRoaXMuI2JvZHkgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy4jYm9keSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgcmV0dXJuIHRoaXMuI2JvZHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0ZXh0RGVjb2Rlci5kZWNvZGUodGhpcy4jYm9keSk7XG4gICAgfVxuICB9XG59O1xuXG4vLyBzcmMvc2VydmVyL2h0dHBfaGFuZGxlcnMudHNcbnZhciBodHRwSGFuZGxlckZuID0gU3ltYm9sKFwiU3BhY2V0aW1lREIuaHR0cEhhbmRsZXJGblwiKTtcbnZhciBBQ0NFUFRBQkxFX1JPVVRFX1BBVEhfQ0hBUlNfSFVNQU5fREVTQ1JJUFRJT04gPSBcIkFTQ0lJIGxvd2VyY2FzZSBsZXR0ZXJzLCBkaWdpdHMgYW5kIGAtX34vYFwiO1xudmFyIG1ha2VSZXF1ZXN0ID0gU3ltYm9sKFwibWFrZVJlcXVlc3RcIik7XG5mdW5jdGlvbiBjb2VyY2VSZXF1ZXN0Qm9keShib2R5KSB7XG4gIGlmIChib2R5ID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAodHlwZW9mIGJvZHkgPT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4gYm9keTtcbiAgfVxuICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYm9keSk7XG59XG5mdW5jdGlvbiByZXF1ZXN0Qm9keVRvQnl0ZXMoYm9keSkge1xuICBpZiAoYm9keSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KCk7XG4gIH1cbiAgaWYgKHR5cGVvZiBib2R5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIHRleHRFbmNvZGVyLmVuY29kZShib2R5KTtcbiAgfVxuICByZXR1cm4gYm9keTtcbn1cbmZ1bmN0aW9uIHJlcXVlc3RCb2R5VG9UZXh0KGJvZHkpIHtcbiAgaWYgKGJvZHkgPT0gbnVsbCkge1xuICAgIHJldHVybiBcIlwiO1xuICB9XG4gIGlmICh0eXBlb2YgYm9keSA9PT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiBib2R5O1xuICB9XG4gIHJldHVybiB0ZXh0RGVjb2Rlci5kZWNvZGUoYm9keSk7XG59XG5mdW5jdGlvbiBjaGFyYWN0ZXJJc0FjY2VwdGFibGVGb3JSb3V0ZVBhdGgoYykge1xuICByZXR1cm4gYyA+PSBcImFcIiAmJiBjIDw9IFwielwiIHx8IGMgPj0gXCIwXCIgJiYgYyA8PSBcIjlcIiB8fCBjID09PSBcIi1cIiB8fCBjID09PSBcIl9cIiB8fCBjID09PSBcIn5cIiB8fCBjID09PSBcIi9cIjtcbn1cbmZ1bmN0aW9uIGFzc2VydFZhbGlkUGF0aChwYXRoKSB7XG4gIGlmIChwYXRoICE9PSBcIlwiICYmICFwYXRoLnN0YXJ0c1dpdGgoXCIvXCIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgUm91dGUgcGF0aHMgbXVzdCBzdGFydCB3aXRoIFxcYC9cXGA6ICR7cGF0aH1gKTtcbiAgfVxuICBpZiAoIVsuLi5wYXRoXS5ldmVyeShjaGFyYWN0ZXJJc0FjY2VwdGFibGVGb3JSb3V0ZVBhdGgpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgIGBSb3V0ZSBwYXRocyBtYXkgY29udGFpbiBvbmx5ICR7QUNDRVBUQUJMRV9ST1VURV9QQVRIX0NIQVJTX0hVTUFOX0RFU0NSSVBUSU9OfTogJHtwYXRofWBcbiAgICApO1xuICB9XG59XG5mdW5jdGlvbiByb3V0ZXNPdmVybGFwKGEsIGIpIHtcbiAgY29uc3QgbWV0aG9kc01hdGNoID0gKGxlZnQsIHJpZ2h0KSA9PiB7XG4gICAgaWYgKGxlZnQudGFnICE9PSByaWdodC50YWcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGxlZnQudGFnID09PSBcIkV4dGVuc2lvblwiICYmIHJpZ2h0LnRhZyA9PT0gXCJFeHRlbnNpb25cIikge1xuICAgICAgcmV0dXJuIGxlZnQudmFsdWUgPT09IHJpZ2h0LnZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgcmV0dXJuIGEucGF0aCA9PT0gYi5wYXRoICYmIChhLm1ldGhvZC50YWcgPT09IFwiQW55XCIgfHwgYi5tZXRob2QudGFnID09PSBcIkFueVwiIHx8IGEubWV0aG9kLnRhZyA9PT0gXCJNZXRob2RcIiAmJiBiLm1ldGhvZC50YWcgPT09IFwiTWV0aG9kXCIgJiYgbWV0aG9kc01hdGNoKGEubWV0aG9kLnZhbHVlLCBiLm1ldGhvZC52YWx1ZSkpO1xufVxuZnVuY3Rpb24gam9pblBhdGhzKHByZWZpeCwgc3VmZml4KSB7XG4gIGlmIChwcmVmaXggPT09IFwiL1wiKSB7XG4gICAgcmV0dXJuIHN1ZmZpeDtcbiAgfVxuICBpZiAoc3VmZml4ID09PSBcIi9cIikge1xuICAgIHJldHVybiBwcmVmaXg7XG4gIH1cbiAgbGV0IHByZWZpeEVuZCA9IHByZWZpeC5sZW5ndGg7XG4gIHdoaWxlIChwcmVmaXhFbmQgPiAwICYmIHByZWZpeFtwcmVmaXhFbmQgLSAxXSA9PT0gXCIvXCIpIHtcbiAgICBwcmVmaXhFbmQtLTtcbiAgfVxuICBsZXQgc3VmZml4U3RhcnQgPSAwO1xuICB3aGlsZSAoc3VmZml4U3RhcnQgPCBzdWZmaXgubGVuZ3RoICYmIHN1ZmZpeFtzdWZmaXhTdGFydF0gPT09IFwiL1wiKSB7XG4gICAgc3VmZml4U3RhcnQrKztcbiAgfVxuICBjb25zdCBqb2luZWRQcmVmaXggPSBwcmVmaXguc2xpY2UoMCwgcHJlZml4RW5kKTtcbiAgY29uc3Qgam9pbmVkU3VmZml4ID0gc3VmZml4LnNsaWNlKHN1ZmZpeFN0YXJ0KTtcbiAgcmV0dXJuIGAke2pvaW5lZFByZWZpeH0vJHtqb2luZWRTdWZmaXh9YDtcbn1cbnZhciBSZXF1ZXN0ID0gY2xhc3MgX1JlcXVlc3Qge1xuICAjYm9keTtcbiAgI2lubmVyO1xuICBjb25zdHJ1Y3Rvcih1cmwsIGluaXQgPSB7fSkge1xuICAgIHRoaXMuI2JvZHkgPSBjb2VyY2VSZXF1ZXN0Qm9keShpbml0LmJvZHkpO1xuICAgIHRoaXMuI2lubmVyID0ge1xuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnMoaW5pdC5oZWFkZXJzKSxcbiAgICAgIG1ldGhvZDogaW5pdC5tZXRob2QgPz8gXCJHRVRcIixcbiAgICAgIHVyaTogXCJcIiArIHVybCxcbiAgICAgIHZlcnNpb246IGluaXQudmVyc2lvbiA/PyB7IHRhZzogXCJIdHRwMTFcIiB9XG4gICAgfTtcbiAgfVxuICBzdGF0aWMgW21ha2VSZXF1ZXN0XShib2R5LCBpbm5lcikge1xuICAgIGNvbnN0IG1lID0gbmV3IF9SZXF1ZXN0KGlubmVyLnVyaSk7XG4gICAgbWUuI2JvZHkgPSBjb2VyY2VSZXF1ZXN0Qm9keShib2R5KTtcbiAgICBtZS4jaW5uZXIgPSBpbm5lcjtcbiAgICByZXR1cm4gbWU7XG4gIH1cbiAgZ2V0IGhlYWRlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2lubmVyLmhlYWRlcnM7XG4gIH1cbiAgZ2V0IG1ldGhvZCgpIHtcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIubWV0aG9kO1xuICB9XG4gIGdldCB1cmkoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2lubmVyLnVyaTtcbiAgfVxuICBnZXQgdXJsKCkge1xuICAgIHJldHVybiB0aGlzLiNpbm5lci51cmk7XG4gIH1cbiAgZ2V0IHZlcnNpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuI2lubmVyLnZlcnNpb247XG4gIH1cbiAgYXJyYXlCdWZmZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuYnl0ZXMoKS5idWZmZXI7XG4gIH1cbiAgYnl0ZXMoKSB7XG4gICAgcmV0dXJuIHJlcXVlc3RCb2R5VG9CeXRlcyh0aGlzLiNib2R5KTtcbiAgfVxuICBqc29uKCkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHRoaXMudGV4dCgpKTtcbiAgfVxuICB0ZXh0KCkge1xuICAgIHJldHVybiByZXF1ZXN0Qm9keVRvVGV4dCh0aGlzLiNib2R5KTtcbiAgfVxufTtcbnZhciBleHBvcnRlZEh0dHBIYW5kbGVyT2JqZWN0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgV2Vha1NldCgpO1xudmFyIFJvdXRlciA9IGNsYXNzIF9Sb3V0ZXIge1xuICAjcm91dGVzO1xuICBjb25zdHJ1Y3Rvcihyb3V0ZXMgPSBbXSkge1xuICAgIHRoaXMuI3JvdXRlcyA9IHJvdXRlcztcbiAgfVxuICBnZXQocGF0aCwgaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLmFkZFJvdXRlKFxuICAgICAgeyB0YWc6IFwiTWV0aG9kXCIsIHZhbHVlOiB7IHRhZzogXCJHZXRcIiB9IH0sXG4gICAgICBwYXRoLFxuICAgICAgaGFuZGxlclxuICAgICk7XG4gIH1cbiAgaGVhZChwYXRoLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUm91dGUoXG4gICAgICB7IHRhZzogXCJNZXRob2RcIiwgdmFsdWU6IHsgdGFnOiBcIkhlYWRcIiB9IH0sXG4gICAgICBwYXRoLFxuICAgICAgaGFuZGxlclxuICAgICk7XG4gIH1cbiAgb3B0aW9ucyhwYXRoLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUm91dGUoXG4gICAgICB7IHRhZzogXCJNZXRob2RcIiwgdmFsdWU6IHsgdGFnOiBcIk9wdGlvbnNcIiB9IH0sXG4gICAgICBwYXRoLFxuICAgICAgaGFuZGxlclxuICAgICk7XG4gIH1cbiAgcHV0KHBhdGgsIGhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRSb3V0ZShcbiAgICAgIHsgdGFnOiBcIk1ldGhvZFwiLCB2YWx1ZTogeyB0YWc6IFwiUHV0XCIgfSB9LFxuICAgICAgcGF0aCxcbiAgICAgIGhhbmRsZXJcbiAgICApO1xuICB9XG4gIGRlbGV0ZShwYXRoLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUm91dGUoXG4gICAgICB7IHRhZzogXCJNZXRob2RcIiwgdmFsdWU6IHsgdGFnOiBcIkRlbGV0ZVwiIH0gfSxcbiAgICAgIHBhdGgsXG4gICAgICBoYW5kbGVyXG4gICAgKTtcbiAgfVxuICBwb3N0KHBhdGgsIGhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRSb3V0ZShcbiAgICAgIHsgdGFnOiBcIk1ldGhvZFwiLCB2YWx1ZTogeyB0YWc6IFwiUG9zdFwiIH0gfSxcbiAgICAgIHBhdGgsXG4gICAgICBoYW5kbGVyXG4gICAgKTtcbiAgfVxuICBwYXRjaChwYXRoLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUm91dGUoXG4gICAgICB7IHRhZzogXCJNZXRob2RcIiwgdmFsdWU6IHsgdGFnOiBcIlBhdGNoXCIgfSB9LFxuICAgICAgcGF0aCxcbiAgICAgIGhhbmRsZXJcbiAgICApO1xuICB9XG4gIGFueShwYXRoLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUm91dGUoeyB0YWc6IFwiQW55XCIgfSwgcGF0aCwgaGFuZGxlcik7XG4gIH1cbiAgbmVzdChwYXRoLCBzdWJSb3V0ZXIpIHtcbiAgICBhc3NlcnRWYWxpZFBhdGgocGF0aCk7XG4gICAgaWYgKHRoaXMuI3JvdXRlcy5zb21lKChyb3V0ZSkgPT4gcm91dGUucGF0aC5zdGFydHNXaXRoKHBhdGgpKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgYENhbm5vdCBuZXN0IHJvdXRlciBhdCBcXGAke3BhdGh9XFxgOyBleGlzdGluZyByb3V0ZXMgb3ZlcmxhcCB3aXRoIG5lc3RlZCBwYXRoYFxuICAgICAgKTtcbiAgICB9XG4gICAgbGV0IG1lcmdlZCA9IG5ldyBfUm91dGVyKHRoaXMuI3JvdXRlcyk7XG4gICAgZm9yIChjb25zdCByb3V0ZSBvZiBzdWJSb3V0ZXIuI3JvdXRlcykge1xuICAgICAgbWVyZ2VkID0gbWVyZ2VkLmFkZFJvdXRlKFxuICAgICAgICByb3V0ZS5tZXRob2QsXG4gICAgICAgIGpvaW5QYXRocyhwYXRoLCByb3V0ZS5wYXRoKSxcbiAgICAgICAgcm91dGUuaGFuZGxlclxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lcmdlZDtcbiAgfVxuICBtZXJnZShvdGhlclJvdXRlcikge1xuICAgIGxldCBtZXJnZWQgPSBuZXcgX1JvdXRlcih0aGlzLiNyb3V0ZXMpO1xuICAgIGZvciAoY29uc3Qgcm91dGUgb2Ygb3RoZXJSb3V0ZXIuI3JvdXRlcykge1xuICAgICAgbWVyZ2VkID0gbWVyZ2VkLmFkZFJvdXRlKHJvdXRlLm1ldGhvZCwgcm91dGUucGF0aCwgcm91dGUuaGFuZGxlcik7XG4gICAgfVxuICAgIHJldHVybiBtZXJnZWQ7XG4gIH1cbiAgaW50b1JvdXRlcygpIHtcbiAgICByZXR1cm4gdGhpcy4jcm91dGVzLnNsaWNlKCk7XG4gIH1cbiAgYWRkUm91dGUobWV0aG9kLCBwYXRoLCBoYW5kbGVyKSB7XG4gICAgYXNzZXJ0VmFsaWRQYXRoKHBhdGgpO1xuICAgIGNvbnN0IGNhbmRpZGF0ZSA9IHsgbWV0aG9kLCBwYXRoLCBoYW5kbGVyIH07XG4gICAgaWYgKHRoaXMuI3JvdXRlcy5zb21lKChyb3V0ZSkgPT4gcm91dGVzT3ZlcmxhcChyb3V0ZSwgY2FuZGlkYXRlKSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFJvdXRlIGNvbmZsaWN0IGZvciBcXGAke3BhdGh9XFxgYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgX1JvdXRlcihbLi4udGhpcy4jcm91dGVzLCBjYW5kaWRhdGVdKTtcbiAgfVxufTtcbmZ1bmN0aW9uIG1ha2VIdHRwSGFuZGxlckV4cG9ydChjdHgsIG9wdHMsIGZuKSB7XG4gIGNvbnN0IGhhbmRsZXJFeHBvcnQgPSB7XG4gICAgW2h0dHBIYW5kbGVyRm5dOiBmbixcbiAgICBbZXhwb3J0Q29udGV4dF06IGN0eCxcbiAgICBbcmVnaXN0ZXJFeHBvcnRdKGN0eDIsIGV4cG9ydE5hbWUpIHtcbiAgICAgIGlmIChleHBvcnRlZEh0dHBIYW5kbGVyT2JqZWN0cy5oYXMoaGFuZGxlckV4cG9ydCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBgSFRUUCBoYW5kbGVyICcke2V4cG9ydE5hbWV9JyB3YXMgZXhwb3J0ZWQgbW9yZSB0aGFuIG9uY2VgXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBleHBvcnRlZEh0dHBIYW5kbGVyT2JqZWN0cy5hZGQoaGFuZGxlckV4cG9ydCk7XG4gICAgICByZWdpc3Rlckh0dHBIYW5kbGVyKGN0eDIsIGV4cG9ydE5hbWUsIGZuLCBvcHRzKTtcbiAgICAgIGN0eDIuaHR0cEhhbmRsZXJFeHBvcnRzLnNldChcbiAgICAgICAgaGFuZGxlckV4cG9ydCxcbiAgICAgICAgZXhwb3J0TmFtZVxuICAgICAgKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBoYW5kbGVyRXhwb3J0O1xufVxuZnVuY3Rpb24gbWFrZUh0dHBSb3V0ZXJFeHBvcnQoY3R4LCByb3V0ZXIpIHtcbiAgcmV0dXJuIHtcbiAgICBbZXhwb3J0Q29udGV4dF06IGN0eCxcbiAgICBbcmVnaXN0ZXJFeHBvcnRdKGN0eDIpIHtcbiAgICAgIGN0eDIucGVuZGluZ0h0dHBSb3V0ZXMucHVzaCguLi5yb3V0ZXIuaW50b1JvdXRlcygpKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiByZWdpc3Rlckh0dHBIYW5kbGVyKGN0eCwgZXhwb3J0TmFtZSwgZm4sIG9wdHMpIHtcbiAgY3R4LmRlZmluZUh0dHBIYW5kbGVyKGV4cG9ydE5hbWUpO1xuICBjdHgubW9kdWxlRGVmLmh0dHBIYW5kbGVycy5wdXNoKHsgc291cmNlTmFtZTogZXhwb3J0TmFtZSB9KTtcbiAgaWYgKG9wdHM/Lm5hbWUgIT0gbnVsbCkge1xuICAgIGN0eC5tb2R1bGVEZWYuZXhwbGljaXROYW1lcy5lbnRyaWVzLnB1c2goe1xuICAgICAgdGFnOiBcIkZ1bmN0aW9uXCIsXG4gICAgICB2YWx1ZToge1xuICAgICAgICBzb3VyY2VOYW1lOiBleHBvcnROYW1lLFxuICAgICAgICBjYW5vbmljYWxOYW1lOiBvcHRzLm5hbWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBpZiAoIWZuLm5hbWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIFwibmFtZVwiLCB7IHZhbHVlOiBleHBvcnROYW1lLCB3cml0YWJsZTogZmFsc2UgfSk7XG4gIH1cbiAgY3R4Lmh0dHBIYW5kbGVycy5wdXNoKGZuKTtcbn1cblxuLy8gc3JjL3NlcnZlci9odHRwX2ludGVybmFsLnRzXG52YXIgaW1wb3J0X3N0YXR1c2VzID0gX190b0VTTShyZXF1aXJlX3N0YXR1c2VzKCkpO1xuXG4vLyBzcmMvc2VydmVyL3JhbmdlLnRzXG52YXIgUmFuZ2UgPSBjbGFzcyB7XG4gICNmcm9tO1xuICAjdG87XG4gIGNvbnN0cnVjdG9yKGZyb20sIHRvKSB7XG4gICAgdGhpcy4jZnJvbSA9IGZyb20gPz8geyB0YWc6IFwidW5ib3VuZGVkXCIgfTtcbiAgICB0aGlzLiN0byA9IHRvID8/IHsgdGFnOiBcInVuYm91bmRlZFwiIH07XG4gIH1cbiAgZ2V0IGZyb20oKSB7XG4gICAgcmV0dXJuIHRoaXMuI2Zyb207XG4gIH1cbiAgZ2V0IHRvKCkge1xuICAgIHJldHVybiB0aGlzLiN0bztcbiAgfVxufTtcblxuLy8gc3JjL2xpYi90YWJsZS50c1xuZnVuY3Rpb24gdGFibGUob3B0cywgcm93LCAuLi5fKSB7XG4gIGNvbnN0IHtcbiAgICBuYW1lLFxuICAgIHB1YmxpYzogaXNQdWJsaWMgPSBmYWxzZSxcbiAgICBpbmRleGVzOiB1c2VySW5kZXhlcyA9IFtdLFxuICAgIHNjaGVkdWxlZCxcbiAgICBldmVudDogaXNFdmVudCA9IGZhbHNlXG4gIH0gPSBvcHRzO1xuICBjb25zdCBjb2xJZHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBjb25zdCBjb2xOYW1lTGlzdCA9IFtdO1xuICBpZiAoIShyb3cgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSkge1xuICAgIHJvdyA9IG5ldyBSb3dCdWlsZGVyKHJvdyk7XG4gIH1cbiAgcm93LmFsZ2VicmFpY1R5cGUudmFsdWUuZWxlbWVudHMuZm9yRWFjaCgoZWxlbSwgaSkgPT4ge1xuICAgIGNvbElkcy5zZXQoZWxlbS5uYW1lLCBpKTtcbiAgICBjb2xOYW1lTGlzdC5wdXNoKGVsZW0ubmFtZSk7XG4gIH0pO1xuICBjb25zdCBwayA9IFtdO1xuICBjb25zdCBpbmRleGVzID0gW107XG4gIGNvbnN0IGNvbnN0cmFpbnRzID0gW107XG4gIGNvbnN0IHNlcXVlbmNlcyA9IFtdO1xuICBsZXQgc2NoZWR1bGVBdENvbDtcbiAgY29uc3QgZGVmYXVsdFZhbHVlcyA9IFtdO1xuICBmb3IgKGNvbnN0IFtuYW1lMiwgYnVpbGRlcl0gb2YgT2JqZWN0LmVudHJpZXMocm93LnJvdykpIHtcbiAgICBjb25zdCBtZXRhID0gYnVpbGRlci5jb2x1bW5NZXRhZGF0YTtcbiAgICBpZiAobWV0YS5pc1ByaW1hcnlLZXkpIHtcbiAgICAgIHBrLnB1c2goY29sSWRzLmdldChuYW1lMikpO1xuICAgIH1cbiAgICBjb25zdCBpc1VuaXF1ZSA9IG1ldGEuaXNVbmlxdWUgfHwgbWV0YS5pc1ByaW1hcnlLZXk7XG4gICAgaWYgKG1ldGEuaW5kZXhUeXBlIHx8IGlzVW5pcXVlKSB7XG4gICAgICBjb25zdCBhbGdvID0gbWV0YS5pbmRleFR5cGUgPz8gXCJidHJlZVwiO1xuICAgICAgY29uc3QgaWQgPSBjb2xJZHMuZ2V0KG5hbWUyKTtcbiAgICAgIGxldCBhbGdvcml0aG07XG4gICAgICBzd2l0Y2ggKGFsZ28pIHtcbiAgICAgICAgY2FzZSBcImJ0cmVlXCI6XG4gICAgICAgICAgYWxnb3JpdGhtID0gUmF3SW5kZXhBbGdvcml0aG0uQlRyZWUoW2lkXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJoYXNoXCI6XG4gICAgICAgICAgYWxnb3JpdGhtID0gUmF3SW5kZXhBbGdvcml0aG0uSGFzaChbaWRdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImRpcmVjdFwiOlxuICAgICAgICAgIGFsZ29yaXRobSA9IFJhd0luZGV4QWxnb3JpdGhtLkRpcmVjdChpZCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpbmRleGVzLnB1c2goe1xuICAgICAgICBzb3VyY2VOYW1lOiB2b2lkIDAsXG4gICAgICAgIC8vIFVubmFtZWQgaW5kZXhlcyB3aWxsIGJlIGFzc2lnbmVkIGEgZ2xvYmFsbHkgdW5pcXVlIG5hbWVcbiAgICAgICAgYWNjZXNzb3JOYW1lOiBuYW1lMixcbiAgICAgICAgYWxnb3JpdGhtXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGlzVW5pcXVlKSB7XG4gICAgICBjb25zdHJhaW50cy5wdXNoKHtcbiAgICAgICAgc291cmNlTmFtZTogdm9pZCAwLFxuICAgICAgICBkYXRhOiB7IHRhZzogXCJVbmlxdWVcIiwgdmFsdWU6IHsgY29sdW1uczogW2NvbElkcy5nZXQobmFtZTIpXSB9IH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAobWV0YS5pc0F1dG9JbmNyZW1lbnQpIHtcbiAgICAgIHNlcXVlbmNlcy5wdXNoKHtcbiAgICAgICAgc291cmNlTmFtZTogdm9pZCAwLFxuICAgICAgICBzdGFydDogdm9pZCAwLFxuICAgICAgICBtaW5WYWx1ZTogdm9pZCAwLFxuICAgICAgICBtYXhWYWx1ZTogdm9pZCAwLFxuICAgICAgICBjb2x1bW46IGNvbElkcy5nZXQobmFtZTIpLFxuICAgICAgICBpbmNyZW1lbnQ6IDFuXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtZXRhLCBcImRlZmF1bHRWYWx1ZVwiKSkge1xuICAgICAgY29uc3Qgd3JpdGVyID0gbmV3IEJpbmFyeVdyaXRlcigxNik7XG4gICAgICBidWlsZGVyLnNlcmlhbGl6ZSh3cml0ZXIsIG1ldGEuZGVmYXVsdFZhbHVlKTtcbiAgICAgIGRlZmF1bHRWYWx1ZXMucHVzaCh7XG4gICAgICAgIGNvbElkOiBjb2xJZHMuZ2V0KG5hbWUyKSxcbiAgICAgICAgdmFsdWU6IHdyaXRlci5nZXRCdWZmZXIoKVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChzY2hlZHVsZWQpIHtcbiAgICAgIGNvbnN0IGFsZ2VicmFpY1R5cGUgPSBidWlsZGVyLnR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGU7XG4gICAgICBpZiAoc2NoZWR1bGVfYXRfZGVmYXVsdC5pc1NjaGVkdWxlQXQoYWxnZWJyYWljVHlwZSkpIHtcbiAgICAgICAgc2NoZWR1bGVBdENvbCA9IGNvbElkcy5nZXQobmFtZTIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IGluZGV4T3B0cyBvZiB1c2VySW5kZXhlcyA/PyBbXSkge1xuICAgIGNvbnN0IGFjY2Vzc29yID0gaW5kZXhPcHRzLmFjY2Vzc29yO1xuICAgIGlmICh0eXBlb2YgYWNjZXNzb3IgIT09IFwic3RyaW5nXCIgfHwgYWNjZXNzb3IubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zdCB0YWJsZUxhYmVsID0gbmFtZSA/PyBcIjx1bm5hbWVkPlwiO1xuICAgICAgY29uc3QgaW5kZXhMYWJlbCA9IGluZGV4T3B0cy5uYW1lID8/IFwiPHVubmFtZWQ+XCI7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBgSW5kZXggJyR7aW5kZXhMYWJlbH0nIG9uIHRhYmxlICcke3RhYmxlTGFiZWx9JyBtdXN0IGRlZmluZSBhIG5vbi1lbXB0eSAnYWNjZXNzb3InYFxuICAgICAgKTtcbiAgICB9XG4gICAgbGV0IGFsZ29yaXRobTtcbiAgICBzd2l0Y2ggKGluZGV4T3B0cy5hbGdvcml0aG0pIHtcbiAgICAgIGNhc2UgXCJidHJlZVwiOlxuICAgICAgICBhbGdvcml0aG0gPSB7XG4gICAgICAgICAgdGFnOiBcIkJUcmVlXCIsXG4gICAgICAgICAgdmFsdWU6IGluZGV4T3B0cy5jb2x1bW5zLm1hcCgoYykgPT4gY29sSWRzLmdldChjKSlcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiaGFzaFwiOlxuICAgICAgICBhbGdvcml0aG0gPSB7XG4gICAgICAgICAgdGFnOiBcIkhhc2hcIixcbiAgICAgICAgICB2YWx1ZTogaW5kZXhPcHRzLmNvbHVtbnMubWFwKChjKSA9PiBjb2xJZHMuZ2V0KGMpKVxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJkaXJlY3RcIjpcbiAgICAgICAgYWxnb3JpdGhtID0geyB0YWc6IFwiRGlyZWN0XCIsIHZhbHVlOiBjb2xJZHMuZ2V0KGluZGV4T3B0cy5jb2x1bW4pIH07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpbmRleGVzLnB1c2goe1xuICAgICAgc291cmNlTmFtZTogdm9pZCAwLFxuICAgICAgYWNjZXNzb3JOYW1lOiBhY2Nlc3NvcixcbiAgICAgIGFsZ29yaXRobSxcbiAgICAgIGNhbm9uaWNhbE5hbWU6IGluZGV4T3B0cy5uYW1lXG4gICAgfSk7XG4gIH1cbiAgZm9yIChjb25zdCBjb25zdHJhaW50T3B0cyBvZiBvcHRzLmNvbnN0cmFpbnRzID8/IFtdKSB7XG4gICAgaWYgKGNvbnN0cmFpbnRPcHRzLmNvbnN0cmFpbnQgPT09IFwidW5pcXVlXCIpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHRhZzogXCJVbmlxdWVcIixcbiAgICAgICAgdmFsdWU6IHsgY29sdW1uczogY29uc3RyYWludE9wdHMuY29sdW1ucy5tYXAoKGMpID0+IGNvbElkcy5nZXQoYykpIH1cbiAgICAgIH07XG4gICAgICBjb25zdHJhaW50cy5wdXNoKHsgc291cmNlTmFtZTogY29uc3RyYWludE9wdHMubmFtZSwgZGF0YSB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgfVxuICBjb25zdCBwcm9kdWN0VHlwZSA9IHJvdy5hbGdlYnJhaWNUeXBlLnZhbHVlO1xuICBjb25zdCBzY2hlZHVsZSA9IHNjaGVkdWxlZCAmJiBzY2hlZHVsZUF0Q29sICE9PSB2b2lkIDAgPyB7IHNjaGVkdWxlQXRDb2wsIHJlZHVjZXI6IHNjaGVkdWxlZCB9IDogdm9pZCAwO1xuICByZXR1cm4ge1xuICAgIHJvd1R5cGU6IHJvdyxcbiAgICB0YWJsZU5hbWU6IG5hbWUsXG4gICAgcm93U3BhY2V0aW1lVHlwZTogcHJvZHVjdFR5cGUsXG4gICAgdGFibGVEZWY6IChjdHgsIGFjY05hbWUpID0+IHtcbiAgICAgIGNvbnN0IHRhYmxlTmFtZSA9IG5hbWUgPz8gYWNjTmFtZTtcbiAgICAgIGlmIChyb3cudHlwZU5hbWUgPT09IHZvaWQgMCkge1xuICAgICAgICByb3cudHlwZU5hbWUgPSB0b1Bhc2NhbENhc2UodGFibGVOYW1lKTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgaW5kZXggb2YgaW5kZXhlcykge1xuICAgICAgICBjb25zdCBjb2xzID0gaW5kZXguYWxnb3JpdGhtLnRhZyA9PT0gXCJEaXJlY3RcIiA/IFtpbmRleC5hbGdvcml0aG0udmFsdWVdIDogaW5kZXguYWxnb3JpdGhtLnZhbHVlO1xuICAgICAgICBjb25zdCBjb2xTID0gY29scy5tYXAoKGkpID0+IGNvbE5hbWVMaXN0W2ldKS5qb2luKFwiX1wiKTtcbiAgICAgICAgY29uc3Qgc291cmNlTmFtZSA9IGluZGV4LnNvdXJjZU5hbWUgPSBgJHthY2NOYW1lfV8ke2NvbFN9X2lkeF8ke2luZGV4LmFsZ29yaXRobS50YWcudG9Mb3dlckNhc2UoKX1gO1xuICAgICAgICBjb25zdCB7IGNhbm9uaWNhbE5hbWUgfSA9IGluZGV4O1xuICAgICAgICBpZiAoY2Fub25pY2FsTmFtZSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgY3R4Lm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaChcbiAgICAgICAgICAgIEV4cGxpY2l0TmFtZUVudHJ5LkluZGV4KHsgc291cmNlTmFtZSwgY2Fub25pY2FsTmFtZSB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvdXJjZU5hbWU6IGFjY05hbWUsXG4gICAgICAgIHByb2R1Y3RUeXBlUmVmOiBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHJvdykucmVmLFxuICAgICAgICBwcmltYXJ5S2V5OiBwayxcbiAgICAgICAgaW5kZXhlcyxcbiAgICAgICAgY29uc3RyYWludHMsXG4gICAgICAgIHNlcXVlbmNlcyxcbiAgICAgICAgdGFibGVUeXBlOiB7IHRhZzogXCJVc2VyXCIgfSxcbiAgICAgICAgdGFibGVBY2Nlc3M6IHsgdGFnOiBpc1B1YmxpYyA/IFwiUHVibGljXCIgOiBcIlByaXZhdGVcIiB9LFxuICAgICAgICBkZWZhdWx0VmFsdWVzLFxuICAgICAgICBpc0V2ZW50XG4gICAgICB9O1xuICAgIH0sXG4gICAgLy8gUHJlc2VydmUgdGhlIGRlY2xhcmVkIGluZGV4IG9wdGlvbnMgYXMgcnVudGltZSBkYXRhIHNvIGB0YWJsZVRvU2NoZW1hYFxuICAgIC8vIGNhbiBleHBvc2UgdGhlbSB3aXRob3V0IHR5cGUtc211Z2dsaW5nLlxuICAgIGlkeHM6IHVzZXJJbmRleGVzLFxuICAgIGNvbnN0cmFpbnRzLFxuICAgIHNjaGVkdWxlXG4gIH07XG59XG5cbi8vIHNyYy9saWIvcXVlcnkudHNcbnZhciBRdWVyeUJyYW5kID0gU3ltYm9sKFwiUXVlcnlCcmFuZFwiKTtcbnZhciBpc1Jvd1R5cGVkUXVlcnkgPSAodmFsKSA9PiAhIXZhbCAmJiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmIFF1ZXJ5QnJhbmQgaW4gdmFsO1xudmFyIGlzVHlwZWRRdWVyeSA9ICh2YWwpID0+ICEhdmFsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgUXVlcnlCcmFuZCBpbiB2YWw7XG5mdW5jdGlvbiB0b1NxbChxKSB7XG4gIHJldHVybiBxLnRvU3FsKCk7XG59XG52YXIgU2VtaWpvaW5JbXBsID0gY2xhc3MgX1NlbWlqb2luSW1wbCB7XG4gIGNvbnN0cnVjdG9yKHNvdXJjZVF1ZXJ5LCBmaWx0ZXJRdWVyeSwgam9pbkNvbmRpdGlvbikge1xuICAgIHRoaXMuc291cmNlUXVlcnkgPSBzb3VyY2VRdWVyeTtcbiAgICB0aGlzLmZpbHRlclF1ZXJ5ID0gZmlsdGVyUXVlcnk7XG4gICAgdGhpcy5qb2luQ29uZGl0aW9uID0gam9pbkNvbmRpdGlvbjtcbiAgICBpZiAoc291cmNlUXVlcnkudGFibGUuc291cmNlTmFtZSA9PT0gZmlsdGVyUXVlcnkudGFibGUuc291cmNlTmFtZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHNlbWlqb2luIGEgdGFibGUgdG8gaXRzZWxmXCIpO1xuICAgIH1cbiAgfVxuICBbUXVlcnlCcmFuZF0gPSB0cnVlO1xuICB0eXBlID0gXCJzZW1pam9pblwiO1xuICBidWlsZCgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB3aGVyZShwcmVkaWNhdGUpIHtcbiAgICBjb25zdCBuZXh0U291cmNlUXVlcnkgPSB0aGlzLnNvdXJjZVF1ZXJ5LndoZXJlKHByZWRpY2F0ZSk7XG4gICAgcmV0dXJuIG5ldyBfU2VtaWpvaW5JbXBsKFxuICAgICAgbmV4dFNvdXJjZVF1ZXJ5LFxuICAgICAgdGhpcy5maWx0ZXJRdWVyeSxcbiAgICAgIHRoaXMuam9pbkNvbmRpdGlvblxuICAgICk7XG4gIH1cbiAgdG9TcWwoKSB7XG4gICAgY29uc3QgbGVmdCA9IHRoaXMuZmlsdGVyUXVlcnk7XG4gICAgY29uc3QgcmlnaHQgPSB0aGlzLnNvdXJjZVF1ZXJ5O1xuICAgIGNvbnN0IGxlZnRUYWJsZSA9IHF1b3RlSWRlbnRpZmllcihsZWZ0LnRhYmxlLnNvdXJjZU5hbWUpO1xuICAgIGNvbnN0IHJpZ2h0VGFibGUgPSBxdW90ZUlkZW50aWZpZXIocmlnaHQudGFibGUuc291cmNlTmFtZSk7XG4gICAgbGV0IHNxbCA9IGBTRUxFQ1QgJHtyaWdodFRhYmxlfS4qIEZST00gJHtsZWZ0VGFibGV9IEpPSU4gJHtyaWdodFRhYmxlfSBPTiAke2Jvb2xlYW5FeHByVG9TcWwodGhpcy5qb2luQ29uZGl0aW9uKX1gO1xuICAgIGNvbnN0IGNsYXVzZXMgPSBbXTtcbiAgICBpZiAobGVmdC53aGVyZUNsYXVzZSkge1xuICAgICAgY2xhdXNlcy5wdXNoKGJvb2xlYW5FeHByVG9TcWwobGVmdC53aGVyZUNsYXVzZSkpO1xuICAgIH1cbiAgICBpZiAocmlnaHQud2hlcmVDbGF1c2UpIHtcbiAgICAgIGNsYXVzZXMucHVzaChib29sZWFuRXhwclRvU3FsKHJpZ2h0LndoZXJlQ2xhdXNlKSk7XG4gICAgfVxuICAgIGlmIChjbGF1c2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHdoZXJlU3FsID0gY2xhdXNlcy5sZW5ndGggPT09IDEgPyBjbGF1c2VzWzBdIDogY2xhdXNlcy5tYXAod3JhcEluUGFyZW5zKS5qb2luKFwiIEFORCBcIik7XG4gICAgICBzcWwgKz0gYCBXSEVSRSAke3doZXJlU3FsfWA7XG4gICAgfVxuICAgIHJldHVybiBzcWw7XG4gIH1cbn07XG52YXIgRnJvbUJ1aWxkZXIgPSBjbGFzcyBfRnJvbUJ1aWxkZXIge1xuICBjb25zdHJ1Y3Rvcih0YWJsZTIsIHdoZXJlQ2xhdXNlKSB7XG4gICAgdGhpcy50YWJsZSA9IHRhYmxlMjtcbiAgICB0aGlzLndoZXJlQ2xhdXNlID0gd2hlcmVDbGF1c2U7XG4gIH1cbiAgW1F1ZXJ5QnJhbmRdID0gdHJ1ZTtcbiAgd2hlcmUocHJlZGljYXRlKSB7XG4gICAgY29uc3QgbmV3Q29uZGl0aW9uID0gbm9ybWFsaXplUHJlZGljYXRlRXhwcihwcmVkaWNhdGUodGhpcy50YWJsZS5jb2xzKSk7XG4gICAgY29uc3QgbmV4dFdoZXJlID0gdGhpcy53aGVyZUNsYXVzZSA/IHRoaXMud2hlcmVDbGF1c2UuYW5kKG5ld0NvbmRpdGlvbikgOiBuZXdDb25kaXRpb247XG4gICAgcmV0dXJuIG5ldyBfRnJvbUJ1aWxkZXIodGhpcy50YWJsZSwgbmV4dFdoZXJlKTtcbiAgfVxuICByaWdodFNlbWlqb2luKHJpZ2h0LCBvbikge1xuICAgIGNvbnN0IHNvdXJjZVF1ZXJ5ID0gbmV3IF9Gcm9tQnVpbGRlcihyaWdodCk7XG4gICAgY29uc3Qgam9pbkNvbmRpdGlvbiA9IG9uKFxuICAgICAgdGhpcy50YWJsZS5pbmRleGVkQ29scyxcbiAgICAgIHJpZ2h0LmluZGV4ZWRDb2xzXG4gICAgKTtcbiAgICByZXR1cm4gbmV3IFNlbWlqb2luSW1wbChzb3VyY2VRdWVyeSwgdGhpcywgam9pbkNvbmRpdGlvbik7XG4gIH1cbiAgbGVmdFNlbWlqb2luKHJpZ2h0LCBvbikge1xuICAgIGNvbnN0IGZpbHRlclF1ZXJ5ID0gbmV3IF9Gcm9tQnVpbGRlcihyaWdodCk7XG4gICAgY29uc3Qgam9pbkNvbmRpdGlvbiA9IG9uKFxuICAgICAgdGhpcy50YWJsZS5pbmRleGVkQ29scyxcbiAgICAgIHJpZ2h0LmluZGV4ZWRDb2xzXG4gICAgKTtcbiAgICByZXR1cm4gbmV3IFNlbWlqb2luSW1wbCh0aGlzLCBmaWx0ZXJRdWVyeSwgam9pbkNvbmRpdGlvbik7XG4gIH1cbiAgdG9TcWwoKSB7XG4gICAgcmV0dXJuIHJlbmRlclNlbGVjdFNxbFdpdGhKb2lucyh0aGlzLnRhYmxlLCB0aGlzLndoZXJlQ2xhdXNlKTtcbiAgfVxuICBidWlsZCgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufTtcbnZhciBUYWJsZVJlZkltcGwgPSBjbGFzcyB7XG4gIFtRdWVyeUJyYW5kXSA9IHRydWU7XG4gIHR5cGUgPSBcInRhYmxlXCI7XG4gIHNvdXJjZU5hbWU7XG4gIGFjY2Vzc29yTmFtZTtcbiAgY29scztcbiAgaW5kZXhlZENvbHM7XG4gIHRhYmxlRGVmO1xuICAvLyBEZWxlZ2F0ZSBVbnR5cGVkVGFibGVEZWYgcHJvcGVydGllcyBmcm9tIHRhYmxlRGVmIHNvIHRoaXMgY2FuIGJlIHVzZWQgYXMgYSB0YWJsZSBkZWYuXG4gIGdldCBjb2x1bW5zKCkge1xuICAgIHJldHVybiB0aGlzLnRhYmxlRGVmLmNvbHVtbnM7XG4gIH1cbiAgZ2V0IGluZGV4ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFibGVEZWYuaW5kZXhlcztcbiAgfVxuICBnZXQgcm93VHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZURlZi5yb3dUeXBlO1xuICB9XG4gIGdldCBjb25zdHJhaW50cygpIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZURlZi5jb25zdHJhaW50cztcbiAgfVxuICBjb25zdHJ1Y3Rvcih0YWJsZURlZikge1xuICAgIHRoaXMuc291cmNlTmFtZSA9IHRhYmxlRGVmLnNvdXJjZU5hbWU7XG4gICAgdGhpcy5hY2Nlc3Nvck5hbWUgPSB0YWJsZURlZi5hY2Nlc3Nvck5hbWU7XG4gICAgdGhpcy5jb2xzID0gY3JlYXRlUm93RXhwcih0YWJsZURlZik7XG4gICAgdGhpcy5pbmRleGVkQ29scyA9IHRoaXMuY29scztcbiAgICB0aGlzLnRhYmxlRGVmID0gdGFibGVEZWY7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuICBhc0Zyb20oKSB7XG4gICAgcmV0dXJuIG5ldyBGcm9tQnVpbGRlcih0aGlzKTtcbiAgfVxuICByaWdodFNlbWlqb2luKG90aGVyLCBvbikge1xuICAgIHJldHVybiB0aGlzLmFzRnJvbSgpLnJpZ2h0U2VtaWpvaW4ob3RoZXIsIG9uKTtcbiAgfVxuICBsZWZ0U2VtaWpvaW4ob3RoZXIsIG9uKSB7XG4gICAgcmV0dXJuIHRoaXMuYXNGcm9tKCkubGVmdFNlbWlqb2luKG90aGVyLCBvbik7XG4gIH1cbiAgYnVpbGQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXNGcm9tKCkuYnVpbGQoKTtcbiAgfVxuICB0b1NxbCgpIHtcbiAgICByZXR1cm4gdGhpcy5hc0Zyb20oKS50b1NxbCgpO1xuICB9XG4gIHdoZXJlKHByZWRpY2F0ZSkge1xuICAgIHJldHVybiB0aGlzLmFzRnJvbSgpLndoZXJlKHByZWRpY2F0ZSk7XG4gIH1cbn07XG5mdW5jdGlvbiBjcmVhdGVUYWJsZVJlZkZyb21EZWYodGFibGVEZWYpIHtcbiAgcmV0dXJuIG5ldyBUYWJsZVJlZkltcGwodGFibGVEZWYpO1xufVxuZnVuY3Rpb24gbWFrZVF1ZXJ5QnVpbGRlcihzY2hlbWEyKSB7XG4gIGNvbnN0IHFiID0gLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGZvciAoY29uc3QgdGFibGUyIG9mIE9iamVjdC52YWx1ZXMoc2NoZW1hMi50YWJsZXMpKSB7XG4gICAgY29uc3QgcmVmID0gY3JlYXRlVGFibGVSZWZGcm9tRGVmKFxuICAgICAgdGFibGUyXG4gICAgKTtcbiAgICBxYlt0YWJsZTIuYWNjZXNzb3JOYW1lXSA9IHJlZjtcbiAgfVxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZShxYik7XG59XG5mdW5jdGlvbiBjcmVhdGVSb3dFeHByKHRhYmxlRGVmKSB7XG4gIGNvbnN0IHJvdyA9IHt9O1xuICBmb3IgKGNvbnN0IGNvbHVtbk5hbWUgb2YgT2JqZWN0LmtleXModGFibGVEZWYuY29sdW1ucykpIHtcbiAgICBjb25zdCBjb2x1bW5CdWlsZGVyID0gdGFibGVEZWYuY29sdW1uc1tjb2x1bW5OYW1lXTtcbiAgICBjb25zdCBjb2x1bW4gPSBuZXcgQ29sdW1uRXhwcmVzc2lvbihcbiAgICAgIHRhYmxlRGVmLnNvdXJjZU5hbWUsXG4gICAgICBjb2x1bW5OYW1lLFxuICAgICAgY29sdW1uQnVpbGRlci50eXBlQnVpbGRlci5hbGdlYnJhaWNUeXBlLFxuICAgICAgY29sdW1uQnVpbGRlci5jb2x1bW5NZXRhZGF0YS5uYW1lXG4gICAgKTtcbiAgICByb3dbY29sdW1uTmFtZV0gPSBPYmplY3QuZnJlZXplKGNvbHVtbik7XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5mcmVlemUocm93KTtcbn1cbmZ1bmN0aW9uIHJlbmRlclNlbGVjdFNxbFdpdGhKb2lucyh0YWJsZTIsIHdoZXJlLCBleHRyYUNsYXVzZXMgPSBbXSkge1xuICBjb25zdCBxdW90ZWRUYWJsZSA9IHF1b3RlSWRlbnRpZmllcih0YWJsZTIuc291cmNlTmFtZSk7XG4gIGNvbnN0IHNxbCA9IGBTRUxFQ1QgKiBGUk9NICR7cXVvdGVkVGFibGV9YDtcbiAgY29uc3QgY2xhdXNlcyA9IFtdO1xuICBpZiAod2hlcmUpIGNsYXVzZXMucHVzaChib29sZWFuRXhwclRvU3FsKHdoZXJlKSk7XG4gIGNsYXVzZXMucHVzaCguLi5leHRyYUNsYXVzZXMpO1xuICBpZiAoY2xhdXNlcy5sZW5ndGggPT09IDApIHJldHVybiBzcWw7XG4gIGNvbnN0IHdoZXJlU3FsID0gY2xhdXNlcy5sZW5ndGggPT09IDEgPyBjbGF1c2VzWzBdIDogY2xhdXNlcy5tYXAod3JhcEluUGFyZW5zKS5qb2luKFwiIEFORCBcIik7XG4gIHJldHVybiBgJHtzcWx9IFdIRVJFICR7d2hlcmVTcWx9YDtcbn1cbnZhciBDb2x1bW5FeHByZXNzaW9uID0gY2xhc3Mge1xuICB0eXBlID0gXCJjb2x1bW5cIjtcbiAgLy8gVGhpcyBpcyB0aGUgY29sdW1uIGFjY2Vzc29yXG4gIGNvbHVtbjtcbiAgLy8gVGhlIG5hbWUgb2YgdGhlIGNvbHVtbiBpbiB0aGUgZGF0YWJhc2UuXG4gIGNvbHVtbk5hbWU7XG4gIHRhYmxlO1xuICAvLyBwaGFudG9tOiBhY3R1YWwgcnVudGltZSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAgdHNWYWx1ZVR5cGU7XG4gIHNwYWNldGltZVR5cGU7XG4gIGNvbnN0cnVjdG9yKHRhYmxlMiwgY29sdW1uLCBzcGFjZXRpbWVUeXBlLCBjb2x1bW5OYW1lKSB7XG4gICAgdGhpcy50YWJsZSA9IHRhYmxlMjtcbiAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcbiAgICB0aGlzLmNvbHVtbk5hbWUgPSBjb2x1bW5OYW1lIHx8IGNvbHVtbjtcbiAgICB0aGlzLnNwYWNldGltZVR5cGUgPSBzcGFjZXRpbWVUeXBlO1xuICB9XG4gIGVxKHgpIHtcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcbiAgICAgIHR5cGU6IFwiZXFcIixcbiAgICAgIGxlZnQ6IHRoaXMsXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcbiAgICB9KTtcbiAgfVxuICBuZSh4KSB7XG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XG4gICAgICB0eXBlOiBcIm5lXCIsXG4gICAgICBsZWZ0OiB0aGlzLFxuICAgICAgcmlnaHQ6IG5vcm1hbGl6ZVZhbHVlKHgpXG4gICAgfSk7XG4gIH1cbiAgbHQoeCkge1xuICAgIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgICAgdHlwZTogXCJsdFwiLFxuICAgICAgbGVmdDogdGhpcyxcbiAgICAgIHJpZ2h0OiBub3JtYWxpemVWYWx1ZSh4KVxuICAgIH0pO1xuICB9XG4gIGx0ZSh4KSB7XG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XG4gICAgICB0eXBlOiBcImx0ZVwiLFxuICAgICAgbGVmdDogdGhpcyxcbiAgICAgIHJpZ2h0OiBub3JtYWxpemVWYWx1ZSh4KVxuICAgIH0pO1xuICB9XG4gIGd0KHgpIHtcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcbiAgICAgIHR5cGU6IFwiZ3RcIixcbiAgICAgIGxlZnQ6IHRoaXMsXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcbiAgICB9KTtcbiAgfVxuICBndGUoeCkge1xuICAgIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgICAgdHlwZTogXCJndGVcIixcbiAgICAgIGxlZnQ6IHRoaXMsXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcbiAgICB9KTtcbiAgfVxufTtcbmZ1bmN0aW9uIGxpdGVyYWwodmFsdWUpIHtcbiAgcmV0dXJuIHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlIH07XG59XG5mdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWwpIHtcbiAgaWYgKHZhbC50eXBlID09PSBcImxpdGVyYWxcIilcbiAgICByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiB2YWwgIT0gbnVsbCAmJiBcInR5cGVcIiBpbiB2YWwgJiYgdmFsLnR5cGUgPT09IFwiY29sdW1uXCIpIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG4gIHJldHVybiBsaXRlcmFsKHZhbCk7XG59XG5mdW5jdGlvbiBub3JtYWxpemVQcmVkaWNhdGVFeHByKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEJvb2xlYW5FeHByKSByZXR1cm4gdmFsdWU7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XG4gICAgICB0eXBlOiBcImVxXCIsXG4gICAgICBsZWZ0OiBsaXRlcmFsKHZhbHVlKSxcbiAgICAgIHJpZ2h0OiBsaXRlcmFsKHRydWUpXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XG4gICAgdHlwZTogXCJlcVwiLFxuICAgIGxlZnQ6IHZhbHVlLFxuICAgIHJpZ2h0OiBsaXRlcmFsKHRydWUpXG4gIH0pO1xufVxudmFyIEJvb2xlYW5FeHByID0gY2xhc3MgX0Jvb2xlYW5FeHByIHtcbiAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gIH1cbiAgYW5kKG90aGVyKSB7XG4gICAgcmV0dXJuIG5ldyBfQm9vbGVhbkV4cHIoe1xuICAgICAgdHlwZTogXCJhbmRcIixcbiAgICAgIGNsYXVzZXM6IFt0aGlzLmRhdGEsIG90aGVyLmRhdGFdXG4gICAgfSk7XG4gIH1cbiAgb3Iob3RoZXIpIHtcbiAgICByZXR1cm4gbmV3IF9Cb29sZWFuRXhwcih7XG4gICAgICB0eXBlOiBcIm9yXCIsXG4gICAgICBjbGF1c2VzOiBbdGhpcy5kYXRhLCBvdGhlci5kYXRhXVxuICAgIH0pO1xuICB9XG4gIG5vdCgpIHtcbiAgICByZXR1cm4gbmV3IF9Cb29sZWFuRXhwcih7IHR5cGU6IFwibm90XCIsIGNsYXVzZTogdGhpcy5kYXRhIH0pO1xuICB9XG59O1xuZnVuY3Rpb24gbm90KGNsYXVzZSkge1xuICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHsgdHlwZTogXCJub3RcIiwgY2xhdXNlOiBjbGF1c2UuZGF0YSB9KTtcbn1cbmZ1bmN0aW9uIGFuZChmaXJzdCwgc2Vjb25kLCAuLi5yZXN0KSB7XG4gIGNvbnN0IGNsYXVzZXMgPSBbZmlyc3QsIHNlY29uZCwgLi4ucmVzdF07XG4gIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgIHR5cGU6IFwiYW5kXCIsXG4gICAgY2xhdXNlczogY2xhdXNlcy5tYXAoKGMpID0+IGMuZGF0YSlcbiAgfSk7XG59XG5mdW5jdGlvbiBvcihmaXJzdCwgc2Vjb25kLCAuLi5yZXN0KSB7XG4gIGNvbnN0IGNsYXVzZXMgPSBbZmlyc3QsIHNlY29uZCwgLi4ucmVzdF07XG4gIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgIHR5cGU6IFwib3JcIixcbiAgICBjbGF1c2VzOiBjbGF1c2VzLm1hcCgoYykgPT4gYy5kYXRhKVxuICB9KTtcbn1cbmZ1bmN0aW9uIGJvb2xlYW5FeHByVG9TcWwoZXhwciwgdGFibGVBbGlhcykge1xuICBjb25zdCBkYXRhID0gZXhwciBpbnN0YW5jZW9mIEJvb2xlYW5FeHByID8gZXhwci5kYXRhIDogZXhwcjtcbiAgc3dpdGNoIChkYXRhLnR5cGUpIHtcbiAgICBjYXNlIFwiZXFcIjpcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA9ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcbiAgICBjYXNlIFwibmVcIjpcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA8PiAke3ZhbHVlRXhwclRvU3FsKGRhdGEucmlnaHQpfWA7XG4gICAgY2FzZSBcImd0XCI6XG4gICAgICByZXR1cm4gYCR7dmFsdWVFeHByVG9TcWwoZGF0YS5sZWZ0KX0gPiAke3ZhbHVlRXhwclRvU3FsKGRhdGEucmlnaHQpfWA7XG4gICAgY2FzZSBcImd0ZVwiOlxuICAgICAgcmV0dXJuIGAke3ZhbHVlRXhwclRvU3FsKGRhdGEubGVmdCl9ID49ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcbiAgICBjYXNlIFwibHRcIjpcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA8ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcbiAgICBjYXNlIFwibHRlXCI6XG4gICAgICByZXR1cm4gYCR7dmFsdWVFeHByVG9TcWwoZGF0YS5sZWZ0KX0gPD0gJHt2YWx1ZUV4cHJUb1NxbChkYXRhLnJpZ2h0KX1gO1xuICAgIGNhc2UgXCJhbmRcIjpcbiAgICAgIHJldHVybiBkYXRhLmNsYXVzZXMubWFwKChjKSA9PiBib29sZWFuRXhwclRvU3FsKGMpKS5tYXAod3JhcEluUGFyZW5zKS5qb2luKFwiIEFORCBcIik7XG4gICAgY2FzZSBcIm9yXCI6XG4gICAgICByZXR1cm4gZGF0YS5jbGF1c2VzLm1hcCgoYykgPT4gYm9vbGVhbkV4cHJUb1NxbChjKSkubWFwKHdyYXBJblBhcmVucykuam9pbihcIiBPUiBcIik7XG4gICAgY2FzZSBcIm5vdFwiOlxuICAgICAgcmV0dXJuIGBOT1QgJHt3cmFwSW5QYXJlbnMoYm9vbGVhbkV4cHJUb1NxbChkYXRhLmNsYXVzZSkpfWA7XG4gIH1cbn1cbmZ1bmN0aW9uIHdyYXBJblBhcmVucyhzcWwpIHtcbiAgcmV0dXJuIGAoJHtzcWx9KWA7XG59XG5mdW5jdGlvbiB2YWx1ZUV4cHJUb1NxbChleHByLCB0YWJsZUFsaWFzKSB7XG4gIGlmIChpc0xpdGVyYWxFeHByKGV4cHIpKSB7XG4gICAgcmV0dXJuIGxpdGVyYWxWYWx1ZVRvU3FsKGV4cHIudmFsdWUpO1xuICB9XG4gIGNvbnN0IHRhYmxlMiA9IGV4cHIudGFibGU7XG4gIHJldHVybiBgJHtxdW90ZUlkZW50aWZpZXIodGFibGUyKX0uJHtxdW90ZUlkZW50aWZpZXIoZXhwci5jb2x1bW5OYW1lKX1gO1xufVxuZnVuY3Rpb24gbGl0ZXJhbFZhbHVlVG9TcWwodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB2b2lkIDApIHtcbiAgICByZXR1cm4gXCJOVUxMXCI7XG4gIH1cbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSWRlbnRpdHkgfHwgdmFsdWUgaW5zdGFuY2VvZiBDb25uZWN0aW9uSWQpIHtcbiAgICByZXR1cm4gYDB4JHt2YWx1ZS50b0hleFN0cmluZygpfWA7XG4gIH1cbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgVGltZXN0YW1wKSB7XG4gICAgcmV0dXJuIGAnJHt2YWx1ZS50b0lTT1N0cmluZygpfSdgO1xuICB9XG4gIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgY2FzZSBcIm51bWJlclwiOlxuICAgIGNhc2UgXCJiaWdpbnRcIjpcbiAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgICByZXR1cm4gdmFsdWUgPyBcIlRSVUVcIiA6IFwiRkFMU0VcIjtcbiAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICByZXR1cm4gYCcke3ZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYDtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGAnJHtKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgO1xuICB9XG59XG5mdW5jdGlvbiBxdW90ZUlkZW50aWZpZXIobmFtZSkge1xuICByZXR1cm4gYFwiJHtuYW1lLnJlcGxhY2UoL1wiL2csICdcIlwiJyl9XCJgO1xufVxuZnVuY3Rpb24gaXNMaXRlcmFsRXhwcihleHByKSB7XG4gIHJldHVybiBleHByLnR5cGUgPT09IFwibGl0ZXJhbFwiO1xufVxuZnVuY3Rpb24gZXZhbHVhdGVCb29sZWFuRXhwcihleHByLCByb3cpIHtcbiAgcmV0dXJuIGV2YWx1YXRlRGF0YShleHByLmRhdGEsIHJvdyk7XG59XG5mdW5jdGlvbiBldmFsdWF0ZURhdGEoZGF0YSwgcm93KSB7XG4gIHN3aXRjaCAoZGF0YS50eXBlKSB7XG4gICAgY2FzZSBcImVxXCI6XG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA9PT0gcmVzb2x2ZVZhbHVlKGRhdGEucmlnaHQsIHJvdyk7XG4gICAgY2FzZSBcIm5lXCI6XG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSAhPT0gcmVzb2x2ZVZhbHVlKGRhdGEucmlnaHQsIHJvdyk7XG4gICAgY2FzZSBcImd0XCI6XG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA+IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xuICAgIGNhc2UgXCJndGVcIjpcbiAgICAgIHJldHVybiByZXNvbHZlVmFsdWUoZGF0YS5sZWZ0LCByb3cpID49IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xuICAgIGNhc2UgXCJsdFwiOlxuICAgICAgcmV0dXJuIHJlc29sdmVWYWx1ZShkYXRhLmxlZnQsIHJvdykgPCByZXNvbHZlVmFsdWUoZGF0YS5yaWdodCwgcm93KTtcbiAgICBjYXNlIFwibHRlXCI6XG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA8PSByZXNvbHZlVmFsdWUoZGF0YS5yaWdodCwgcm93KTtcbiAgICBjYXNlIFwiYW5kXCI6XG4gICAgICByZXR1cm4gZGF0YS5jbGF1c2VzLmV2ZXJ5KChjKSA9PiBldmFsdWF0ZURhdGEoYywgcm93KSk7XG4gICAgY2FzZSBcIm9yXCI6XG4gICAgICByZXR1cm4gZGF0YS5jbGF1c2VzLnNvbWUoKGMpID0+IGV2YWx1YXRlRGF0YShjLCByb3cpKTtcbiAgICBjYXNlIFwibm90XCI6XG4gICAgICByZXR1cm4gIWV2YWx1YXRlRGF0YShkYXRhLmNsYXVzZSwgcm93KTtcbiAgfVxufVxuZnVuY3Rpb24gcmVzb2x2ZVZhbHVlKGV4cHIsIHJvdykge1xuICBpZiAoaXNMaXRlcmFsRXhwcihleHByKSkge1xuICAgIHJldHVybiB0b0NvbXBhcmFibGVWYWx1ZShleHByLnZhbHVlKTtcbiAgfVxuICByZXR1cm4gdG9Db21wYXJhYmxlVmFsdWUocm93W2V4cHIuY29sdW1uXSk7XG59XG5mdW5jdGlvbiBpc0hleFNlcmlhbGl6YWJsZUxpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWx1ZS50b0hleFN0cmluZyA9PT0gXCJmdW5jdGlvblwiO1xufVxuZnVuY3Rpb24gaXNUaW1lc3RhbXBMaWtlKHZhbHVlKSB7XG4gIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiKSByZXR1cm4gZmFsc2U7XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRpbWVzdGFtcCkgcmV0dXJuIHRydWU7XG4gIGNvbnN0IG1pY3JvcyA9IHZhbHVlW1wiX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfX1wiXTtcbiAgcmV0dXJuIHR5cGVvZiBtaWNyb3MgPT09IFwiYmlnaW50XCI7XG59XG5mdW5jdGlvbiB0b0NvbXBhcmFibGVWYWx1ZSh2YWx1ZSkge1xuICBpZiAoaXNIZXhTZXJpYWxpemFibGVMaWtlKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZS50b0hleFN0cmluZygpO1xuICB9XG4gIGlmIChpc1RpbWVzdGFtcExpa2UodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlLl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX187XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gZ2V0UXVlcnlUYWJsZU5hbWUocXVlcnkpIHtcbiAgaWYgKHF1ZXJ5LnRhYmxlKSByZXR1cm4gcXVlcnkudGFibGUubmFtZTtcbiAgaWYgKHF1ZXJ5Lm5hbWUpIHJldHVybiBxdWVyeS5uYW1lO1xuICBpZiAocXVlcnkuc291cmNlUXVlcnkpIHJldHVybiBxdWVyeS5zb3VyY2VRdWVyeS50YWJsZS5uYW1lO1xuICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZXh0cmFjdCB0YWJsZSBuYW1lIGZyb20gcXVlcnlcIik7XG59XG5mdW5jdGlvbiBnZXRRdWVyeUFjY2Vzc29yTmFtZShxdWVyeSkge1xuICBpZiAocXVlcnkudGFibGUpIHJldHVybiBxdWVyeS50YWJsZS5hY2Nlc3Nvck5hbWU7XG4gIGlmIChxdWVyeS5hY2Nlc3Nvck5hbWUpIHJldHVybiBxdWVyeS5hY2Nlc3Nvck5hbWU7XG4gIGlmIChxdWVyeS5zb3VyY2VRdWVyeSkgcmV0dXJuIHF1ZXJ5LnNvdXJjZVF1ZXJ5LnRhYmxlLmFjY2Vzc29yTmFtZTtcbiAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGV4dHJhY3QgYWNjZXNzb3IgbmFtZSBmcm9tIHF1ZXJ5XCIpO1xufVxuZnVuY3Rpb24gZ2V0UXVlcnlXaGVyZUNsYXVzZShxdWVyeSkge1xuICBpZiAocXVlcnkud2hlcmVDbGF1c2UpIHJldHVybiBxdWVyeS53aGVyZUNsYXVzZTtcbiAgcmV0dXJuIHZvaWQgMDtcbn1cblxuLy8gc3JjL3NlcnZlci92aWV3cy50c1xuZnVuY3Rpb24gbWFrZVZpZXdFeHBvcnQoY3R4LCBvcHRzLCBwYXJhbXMsIHJldCwgZm4pIHtcbiAgY29uc3Qgdmlld0V4cG9ydCA9IChcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHR5cGVzY3JpcHQgaW5jb3JyZWN0bHkgc2F5cyBGdW5jdGlvbiNiaW5kIHJlcXVpcmVzIGFuIGFyZ3VtZW50LlxuICAgIGZuLmJpbmQoKVxuICApO1xuICB2aWV3RXhwb3J0W2V4cG9ydENvbnRleHRdID0gY3R4O1xuICB2aWV3RXhwb3J0W3JlZ2lzdGVyRXhwb3J0XSA9IChjdHgyLCBleHBvcnROYW1lKSA9PiB7XG4gICAgcmVnaXN0ZXJWaWV3KGN0eDIsIG9wdHMsIGV4cG9ydE5hbWUsIGZhbHNlLCBwYXJhbXMsIHJldCwgZm4pO1xuICB9O1xuICByZXR1cm4gdmlld0V4cG9ydDtcbn1cbmZ1bmN0aW9uIG1ha2VBbm9uVmlld0V4cG9ydChjdHgsIG9wdHMsIHBhcmFtcywgcmV0LCBmbikge1xuICBjb25zdCB2aWV3RXhwb3J0ID0gKFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHlwZXNjcmlwdCBpbmNvcnJlY3RseSBzYXlzIEZ1bmN0aW9uI2JpbmQgcmVxdWlyZXMgYW4gYXJndW1lbnQuXG4gICAgZm4uYmluZCgpXG4gICk7XG4gIHZpZXdFeHBvcnRbZXhwb3J0Q29udGV4dF0gPSBjdHg7XG4gIHZpZXdFeHBvcnRbcmVnaXN0ZXJFeHBvcnRdID0gKGN0eDIsIGV4cG9ydE5hbWUpID0+IHtcbiAgICByZWdpc3RlclZpZXcoY3R4Miwgb3B0cywgZXhwb3J0TmFtZSwgdHJ1ZSwgcGFyYW1zLCByZXQsIGZuKTtcbiAgfTtcbiAgcmV0dXJuIHZpZXdFeHBvcnQ7XG59XG5mdW5jdGlvbiByZWdpc3RlclZpZXcoY3R4LCBvcHRzLCBleHBvcnROYW1lLCBhbm9uLCBwYXJhbXMsIHJldCwgZm4pIHtcbiAgY3R4LmRlZmluZUZ1bmN0aW9uKGV4cG9ydE5hbWUpO1xuICBjb25zdCBwYXJhbXNCdWlsZGVyID0gbmV3IFJvd0J1aWxkZXIocGFyYW1zLCB0b1Bhc2NhbENhc2UoZXhwb3J0TmFtZSkpO1xuICBsZXQgcmV0dXJuVHlwZSA9IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocmV0KS5hbGdlYnJhaWNUeXBlO1xuICBjb25zdCB7IHR5cGVzcGFjZSB9ID0gY3R4O1xuICBjb25zdCB7IHZhbHVlOiBwYXJhbVR5cGUgfSA9IGN0eC5yZXNvbHZlVHlwZShcbiAgICBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHBhcmFtc0J1aWxkZXIpXG4gICk7XG4gIGN0eC5tb2R1bGVEZWYudmlld3MucHVzaCh7XG4gICAgc291cmNlTmFtZTogZXhwb3J0TmFtZSxcbiAgICBpbmRleDogKGFub24gPyBjdHguYW5vblZpZXdzIDogY3R4LnZpZXdzKS5sZW5ndGgsXG4gICAgaXNQdWJsaWM6IG9wdHMucHVibGljLFxuICAgIGlzQW5vbnltb3VzOiBhbm9uLFxuICAgIHBhcmFtczogcGFyYW1UeXBlLFxuICAgIHJldHVyblR5cGVcbiAgfSk7XG4gIGlmIChvcHRzLm5hbWUgIT0gbnVsbCkge1xuICAgIGN0eC5tb2R1bGVEZWYuZXhwbGljaXROYW1lcy5lbnRyaWVzLnB1c2goe1xuICAgICAgdGFnOiBcIkZ1bmN0aW9uXCIsXG4gICAgICB2YWx1ZToge1xuICAgICAgICBzb3VyY2VOYW1lOiBleHBvcnROYW1lLFxuICAgICAgICBjYW5vbmljYWxOYW1lOiBvcHRzLm5hbWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBpZiAocmV0dXJuVHlwZS50YWcgPT0gXCJTdW1cIikge1xuICAgIGNvbnN0IG9yaWdpbmFsRm4gPSBmbjtcbiAgICBmbiA9ICgoY3R4MiwgYXJncykgPT4ge1xuICAgICAgY29uc3QgcmV0MiA9IG9yaWdpbmFsRm4oY3R4MiwgYXJncyk7XG4gICAgICByZXR1cm4gcmV0MiA9PSBudWxsID8gW10gOiBbcmV0Ml07XG4gICAgfSk7XG4gICAgcmV0dXJuVHlwZSA9IEFsZ2VicmFpY1R5cGUuQXJyYXkoXG4gICAgICByZXR1cm5UeXBlLnZhbHVlLnZhcmlhbnRzWzBdLmFsZ2VicmFpY1R5cGVcbiAgICApO1xuICB9XG4gIChhbm9uID8gY3R4LmFub25WaWV3cyA6IGN0eC52aWV3cykucHVzaCh7XG4gICAgZm4sXG4gICAgZGVzZXJpYWxpemVQYXJhbXM6IFByb2R1Y3RUeXBlLm1ha2VEZXNlcmlhbGl6ZXIocGFyYW1UeXBlLCB0eXBlc3BhY2UpLFxuICAgIHNlcmlhbGl6ZVJldHVybjogQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihyZXR1cm5UeXBlLCB0eXBlc3BhY2UpLFxuICAgIHJldHVyblR5cGVCYXNlU2l6ZTogYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIHJldHVyblR5cGUpXG4gIH0pO1xufVxuXG4vLyBzcmMvbGliL2Vycm9ycy50c1xudmFyIFNlbmRlckVycm9yID0gY2xhc3MgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gXCJTZW5kZXJFcnJvclwiO1xuICB9XG59O1xuXG4vLyBzcmMvc2VydmVyL2Vycm9ycy50c1xudmFyIFNwYWNldGltZUhvc3RFcnJvciA9IGNsYXNzIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuIFwiU3BhY2V0aW1lSG9zdEVycm9yXCI7XG4gIH1cbn07XG52YXIgZXJyb3JEYXRhID0ge1xuICAvKipcbiAgICogQSBnZW5lcmljIGVycm9yIGNsYXNzIGZvciB1bmtub3duIGVycm9yIGNvZGVzLlxuICAgKi9cbiAgSG9zdENhbGxGYWlsdXJlOiAxLFxuICAvKipcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGFuIEFCSSBjYWxsIHdhcyBtYWRlIG91dHNpZGUgb2YgYSB0cmFuc2FjdGlvbi5cbiAgICovXG4gIE5vdEluVHJhbnNhY3Rpb246IDIsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgQlNBVE4gZGVjb2RpbmcgZmFpbGVkLlxuICAgKiBUaGlzIHR5cGljYWxseSBtZWFucyB0aGF0IHRoZSBkYXRhIGNvdWxkIG5vdCBiZSBkZWNvZGVkIHRvIHRoZSBleHBlY3RlZCB0eXBlLlxuICAgKi9cbiAgQnNhdG5EZWNvZGVFcnJvcjogMyxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHNwZWNpZmllZCB0YWJsZSBkb2VzIG5vdCBleGlzdC5cbiAgICovXG4gIE5vU3VjaFRhYmxlOiA0LFxuICAvKipcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgc3BlY2lmaWVkIGluZGV4IGRvZXMgbm90IGV4aXN0LlxuICAgKi9cbiAgTm9TdWNoSW5kZXg6IDUsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYSBzcGVjaWZpZWQgcm93IGl0ZXJhdG9yIGlzIG5vdCB2YWxpZC5cbiAgICovXG4gIE5vU3VjaEl0ZXI6IDYsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYSBzcGVjaWZpZWQgY29uc29sZSB0aW1lciBkb2VzIG5vdCBleGlzdC5cbiAgICovXG4gIE5vU3VjaENvbnNvbGVUaW1lcjogNyxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHNwZWNpZmllZCBieXRlcyBzb3VyY2Ugb3Igc2luayBpcyBub3QgdmFsaWQuXG4gICAqL1xuICBOb1N1Y2hCeXRlczogOCxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHByb3ZpZGVkIHNpbmsgaGFzIG5vIG1vcmUgc3BhY2UgbGVmdC5cbiAgICovXG4gIE5vU3BhY2U6IDksXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgdGhlcmUgaXMgbm8gbW9yZSBzcGFjZSBpbiB0aGUgZGF0YWJhc2UuXG4gICAqL1xuICBCdWZmZXJUb29TbWFsbDogMTEsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYSB2YWx1ZSB3aXRoIGEgZ2l2ZW4gdW5pcXVlIGlkZW50aWZpZXIgYWxyZWFkeSBleGlzdHMuXG4gICAqL1xuICBVbmlxdWVBbHJlYWR5RXhpc3RzOiAxMixcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCB0aGUgc3BlY2lmaWVkIGRlbGF5IGluIHNjaGVkdWxpbmcgYSByb3cgd2FzIHRvbyBsb25nLlxuICAgKi9cbiAgU2NoZWR1bGVBdERlbGF5VG9vTG9uZzogMTMsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYW4gaW5kZXggd2FzIG5vdCB1bmlxdWUgd2hlbiBpdCB3YXMgZXhwZWN0ZWQgdG8gYmUuXG4gICAqL1xuICBJbmRleE5vdFVuaXF1ZTogMTQsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYW4gaW5kZXggd2FzIG5vdCB1bmlxdWUgd2hlbiBpdCB3YXMgZXhwZWN0ZWQgdG8gYmUuXG4gICAqL1xuICBOb1N1Y2hSb3c6IDE1LFxuICAvKipcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGFuIGF1dG8taW5jcmVtZW50IHNlcXVlbmNlIGhhcyBvdmVyZmxvd2VkLlxuICAgKi9cbiAgQXV0b0luY092ZXJmbG93OiAxNixcbiAgV291bGRCbG9ja1RyYW5zYWN0aW9uOiAxNyxcbiAgVHJhbnNhY3Rpb25Ob3RBbm9ueW1vdXM6IDE4LFxuICBUcmFuc2FjdGlvbklzUmVhZE9ubHk6IDE5LFxuICBUcmFuc2FjdGlvbklzTXV0OiAyMCxcbiAgSHR0cEVycm9yOiAyMVxufTtcbmZ1bmN0aW9uIG1hcEVudHJpZXMoeCwgZikge1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKHgpLm1hcCgoW2ssIHZdKSA9PiBbaywgZihrLCB2KV0pXG4gICk7XG59XG52YXIgZXJybm9Ub0NsYXNzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciBlcnJvcnMgPSBPYmplY3QuZnJlZXplKFxuICBtYXBFbnRyaWVzKGVycm9yRGF0YSwgKG5hbWUsIGNvZGUpID0+IHtcbiAgICBjb25zdCBjbHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICBjbGFzcyBleHRlbmRzIFNwYWNldGltZUhvc3RFcnJvciB7XG4gICAgICAgIGdldCBuYW1lKCkge1xuICAgICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJuYW1lXCIsXG4gICAgICB7IHZhbHVlOiBuYW1lLCB3cml0YWJsZTogZmFsc2UgfVxuICAgICk7XG4gICAgZXJybm9Ub0NsYXNzLnNldChjb2RlLCBjbHMpO1xuICAgIHJldHVybiBjbHM7XG4gIH0pXG4pO1xuZnVuY3Rpb24gZ2V0RXJyb3JDb25zdHJ1Y3Rvcihjb2RlKSB7XG4gIHJldHVybiBlcnJub1RvQ2xhc3MuZ2V0KGNvZGUpID8/IFNwYWNldGltZUhvc3RFcnJvcjtcbn1cblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL1Vuc2FmZVVuaWZvcm1CaWdJbnREaXN0cmlidXRpb24uanNcbnZhciBTQmlnSW50ID0gdHlwZW9mIEJpZ0ludCAhPT0gXCJ1bmRlZmluZWRcIiA/IEJpZ0ludCA6IHZvaWQgMDtcbnZhciBPbmUgPSB0eXBlb2YgQmlnSW50ICE9PSBcInVuZGVmaW5lZFwiID8gQmlnSW50KDEpIDogdm9pZCAwO1xudmFyIFRoaXJ0eVR3byA9IHR5cGVvZiBCaWdJbnQgIT09IFwidW5kZWZpbmVkXCIgPyBCaWdJbnQoMzIpIDogdm9pZCAwO1xudmFyIE51bVZhbHVlcyA9IHR5cGVvZiBCaWdJbnQgIT09IFwidW5kZWZpbmVkXCIgPyBCaWdJbnQoNDI5NDk2NzI5NikgOiB2b2lkIDA7XG5mdW5jdGlvbiB1bnNhZmVVbmlmb3JtQmlnSW50RGlzdHJpYnV0aW9uKGZyb20sIHRvLCBybmcpIHtcbiAgdmFyIGRpZmYgPSB0byAtIGZyb20gKyBPbmU7XG4gIHZhciBGaW5hbE51bVZhbHVlcyA9IE51bVZhbHVlcztcbiAgdmFyIE51bUl0ZXJhdGlvbnMgPSAxO1xuICB3aGlsZSAoRmluYWxOdW1WYWx1ZXMgPCBkaWZmKSB7XG4gICAgRmluYWxOdW1WYWx1ZXMgPDw9IFRoaXJ0eVR3bztcbiAgICArK051bUl0ZXJhdGlvbnM7XG4gIH1cbiAgdmFyIHZhbHVlID0gZ2VuZXJhdGVOZXh0KE51bUl0ZXJhdGlvbnMsIHJuZyk7XG4gIGlmICh2YWx1ZSA8IGRpZmYpIHtcbiAgICByZXR1cm4gdmFsdWUgKyBmcm9tO1xuICB9XG4gIGlmICh2YWx1ZSArIGRpZmYgPCBGaW5hbE51bVZhbHVlcykge1xuICAgIHJldHVybiB2YWx1ZSAlIGRpZmYgKyBmcm9tO1xuICB9XG4gIHZhciBNYXhBY2NlcHRlZFJhbmRvbSA9IEZpbmFsTnVtVmFsdWVzIC0gRmluYWxOdW1WYWx1ZXMgJSBkaWZmO1xuICB3aGlsZSAodmFsdWUgPj0gTWF4QWNjZXB0ZWRSYW5kb20pIHtcbiAgICB2YWx1ZSA9IGdlbmVyYXRlTmV4dChOdW1JdGVyYXRpb25zLCBybmcpO1xuICB9XG4gIHJldHVybiB2YWx1ZSAlIGRpZmYgKyBmcm9tO1xufVxuZnVuY3Rpb24gZ2VuZXJhdGVOZXh0KE51bUl0ZXJhdGlvbnMsIHJuZykge1xuICB2YXIgdmFsdWUgPSBTQmlnSW50KHJuZy51bnNhZmVOZXh0KCkgKyAyMTQ3NDgzNjQ4KTtcbiAgZm9yICh2YXIgbnVtID0gMTsgbnVtIDwgTnVtSXRlcmF0aW9uczsgKytudW0pIHtcbiAgICB2YXIgb3V0ID0gcm5nLnVuc2FmZU5leHQoKTtcbiAgICB2YWx1ZSA9ICh2YWx1ZSA8PCBUaGlydHlUd28pICsgU0JpZ0ludChvdXQgKyAyMTQ3NDgzNjQ4KTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9wdXJlLXJhbmRANy4wLjEvbm9kZV9tb2R1bGVzL3B1cmUtcmFuZC9saWIvZXNtL2Rpc3RyaWJ1dGlvbi9pbnRlcm5hbHMvVW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbkludGVybmFsLmpzXG5mdW5jdGlvbiB1bnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uSW50ZXJuYWwocmFuZ2VTaXplLCBybmcpIHtcbiAgdmFyIE1heEFsbG93ZWQgPSByYW5nZVNpemUgPiAyID8gfn4oNDI5NDk2NzI5NiAvIHJhbmdlU2l6ZSkgKiByYW5nZVNpemUgOiA0Mjk0OTY3Mjk2O1xuICB2YXIgZGVsdGFWID0gcm5nLnVuc2FmZU5leHQoKSArIDIxNDc0ODM2NDg7XG4gIHdoaWxlIChkZWx0YVYgPj0gTWF4QWxsb3dlZCkge1xuICAgIGRlbHRhViA9IHJuZy51bnNhZmVOZXh0KCkgKyAyMTQ3NDgzNjQ4O1xuICB9XG4gIHJldHVybiBkZWx0YVYgJSByYW5nZVNpemU7XG59XG5cbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9wdXJlLXJhbmRANy4wLjEvbm9kZV9tb2R1bGVzL3B1cmUtcmFuZC9saWIvZXNtL2Rpc3RyaWJ1dGlvbi9pbnRlcm5hbHMvQXJyYXlJbnQ2NC5qc1xuZnVuY3Rpb24gZnJvbU51bWJlclRvQXJyYXlJbnQ2NChvdXQsIG4pIHtcbiAgaWYgKG4gPCAwKSB7XG4gICAgdmFyIHBvc04gPSAtbjtcbiAgICBvdXQuc2lnbiA9IC0xO1xuICAgIG91dC5kYXRhWzBdID0gfn4ocG9zTiAvIDQyOTQ5NjcyOTYpO1xuICAgIG91dC5kYXRhWzFdID0gcG9zTiA+Pj4gMDtcbiAgfSBlbHNlIHtcbiAgICBvdXQuc2lnbiA9IDE7XG4gICAgb3V0LmRhdGFbMF0gPSB+fihuIC8gNDI5NDk2NzI5Nik7XG4gICAgb3V0LmRhdGFbMV0gPSBuID4+PiAwO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5mdW5jdGlvbiBzdWJzdHJhY3RBcnJheUludDY0KG91dCwgYXJyYXlJbnRBLCBhcnJheUludEIpIHtcbiAgdmFyIGxvd0EgPSBhcnJheUludEEuZGF0YVsxXTtcbiAgdmFyIGhpZ2hBID0gYXJyYXlJbnRBLmRhdGFbMF07XG4gIHZhciBzaWduQSA9IGFycmF5SW50QS5zaWduO1xuICB2YXIgbG93QiA9IGFycmF5SW50Qi5kYXRhWzFdO1xuICB2YXIgaGlnaEIgPSBhcnJheUludEIuZGF0YVswXTtcbiAgdmFyIHNpZ25CID0gYXJyYXlJbnRCLnNpZ247XG4gIG91dC5zaWduID0gMTtcbiAgaWYgKHNpZ25BID09PSAxICYmIHNpZ25CID09PSAtMSkge1xuICAgIHZhciBsb3dfMSA9IGxvd0EgKyBsb3dCO1xuICAgIHZhciBoaWdoID0gaGlnaEEgKyBoaWdoQiArIChsb3dfMSA+IDQyOTQ5NjcyOTUgPyAxIDogMCk7XG4gICAgb3V0LmRhdGFbMF0gPSBoaWdoID4+PiAwO1xuICAgIG91dC5kYXRhWzFdID0gbG93XzEgPj4+IDA7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuICB2YXIgbG93Rmlyc3QgPSBsb3dBO1xuICB2YXIgaGlnaEZpcnN0ID0gaGlnaEE7XG4gIHZhciBsb3dTZWNvbmQgPSBsb3dCO1xuICB2YXIgaGlnaFNlY29uZCA9IGhpZ2hCO1xuICBpZiAoc2lnbkEgPT09IC0xKSB7XG4gICAgbG93Rmlyc3QgPSBsb3dCO1xuICAgIGhpZ2hGaXJzdCA9IGhpZ2hCO1xuICAgIGxvd1NlY29uZCA9IGxvd0E7XG4gICAgaGlnaFNlY29uZCA9IGhpZ2hBO1xuICB9XG4gIHZhciByZW1pbmRlckxvdyA9IDA7XG4gIHZhciBsb3cgPSBsb3dGaXJzdCAtIGxvd1NlY29uZDtcbiAgaWYgKGxvdyA8IDApIHtcbiAgICByZW1pbmRlckxvdyA9IDE7XG4gICAgbG93ID0gbG93ID4+PiAwO1xuICB9XG4gIG91dC5kYXRhWzBdID0gaGlnaEZpcnN0IC0gaGlnaFNlY29uZCAtIHJlbWluZGVyTG93O1xuICBvdXQuZGF0YVsxXSA9IGxvdztcbiAgcmV0dXJuIG91dDtcbn1cblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL2ludGVybmFscy9VbnNhZmVVbmlmb3JtQXJyYXlJbnREaXN0cmlidXRpb25JbnRlcm5hbC5qc1xuZnVuY3Rpb24gdW5zYWZlVW5pZm9ybUFycmF5SW50RGlzdHJpYnV0aW9uSW50ZXJuYWwob3V0LCByYW5nZVNpemUsIHJuZykge1xuICB2YXIgcmFuZ2VMZW5ndGggPSByYW5nZVNpemUubGVuZ3RoO1xuICB3aGlsZSAodHJ1ZSkge1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggIT09IHJhbmdlTGVuZ3RoOyArK2luZGV4KSB7XG4gICAgICB2YXIgaW5kZXhSYW5nZVNpemUgPSBpbmRleCA9PT0gMCA/IHJhbmdlU2l6ZVswXSArIDEgOiA0Mjk0OTY3Mjk2O1xuICAgICAgdmFyIGcgPSB1bnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uSW50ZXJuYWwoaW5kZXhSYW5nZVNpemUsIHJuZyk7XG4gICAgICBvdXRbaW5kZXhdID0gZztcbiAgICB9XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCAhPT0gcmFuZ2VMZW5ndGg7ICsraW5kZXgpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gb3V0W2luZGV4XTtcbiAgICAgIHZhciBjdXJyZW50SW5SYW5nZSA9IHJhbmdlU2l6ZVtpbmRleF07XG4gICAgICBpZiAoY3VycmVudCA8IGN1cnJlbnRJblJhbmdlKSB7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnQgPiBjdXJyZW50SW5SYW5nZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL1Vuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24uanNcbnZhciBzYWZlTnVtYmVyTWF4U2FmZUludGVnZXIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbnZhciBzaGFyZWRBID0geyBzaWduOiAxLCBkYXRhOiBbMCwgMF0gfTtcbnZhciBzaGFyZWRCID0geyBzaWduOiAxLCBkYXRhOiBbMCwgMF0gfTtcbnZhciBzaGFyZWRDID0geyBzaWduOiAxLCBkYXRhOiBbMCwgMF0gfTtcbnZhciBzaGFyZWREYXRhID0gWzAsIDBdO1xuZnVuY3Rpb24gdW5pZm9ybUxhcmdlSW50SW50ZXJuYWwoZnJvbSwgdG8sIHJhbmdlU2l6ZSwgcm5nKSB7XG4gIHZhciByYW5nZVNpemVBcnJheUludFZhbHVlID0gcmFuZ2VTaXplIDw9IHNhZmVOdW1iZXJNYXhTYWZlSW50ZWdlciA/IGZyb21OdW1iZXJUb0FycmF5SW50NjQoc2hhcmVkQywgcmFuZ2VTaXplKSA6IHN1YnN0cmFjdEFycmF5SW50NjQoc2hhcmVkQywgZnJvbU51bWJlclRvQXJyYXlJbnQ2NChzaGFyZWRBLCB0byksIGZyb21OdW1iZXJUb0FycmF5SW50NjQoc2hhcmVkQiwgZnJvbSkpO1xuICBpZiAocmFuZ2VTaXplQXJyYXlJbnRWYWx1ZS5kYXRhWzFdID09PSA0Mjk0OTY3Mjk1KSB7XG4gICAgcmFuZ2VTaXplQXJyYXlJbnRWYWx1ZS5kYXRhWzBdICs9IDE7XG4gICAgcmFuZ2VTaXplQXJyYXlJbnRWYWx1ZS5kYXRhWzFdID0gMDtcbiAgfSBlbHNlIHtcbiAgICByYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGFbMV0gKz0gMTtcbiAgfVxuICB1bnNhZmVVbmlmb3JtQXJyYXlJbnREaXN0cmlidXRpb25JbnRlcm5hbChzaGFyZWREYXRhLCByYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGEsIHJuZyk7XG4gIHJldHVybiBzaGFyZWREYXRhWzBdICogNDI5NDk2NzI5NiArIHNoYXJlZERhdGFbMV0gKyBmcm9tO1xufVxuZnVuY3Rpb24gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbihmcm9tLCB0bywgcm5nKSB7XG4gIHZhciByYW5nZVNpemUgPSB0byAtIGZyb207XG4gIGlmIChyYW5nZVNpemUgPD0gNDI5NDk2NzI5NSkge1xuICAgIHZhciBnID0gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbkludGVybmFsKHJhbmdlU2l6ZSArIDEsIHJuZyk7XG4gICAgcmV0dXJuIGcgKyBmcm9tO1xuICB9XG4gIHJldHVybiB1bmlmb3JtTGFyZ2VJbnRJbnRlcm5hbChmcm9tLCB0bywgcmFuZ2VTaXplLCBybmcpO1xufVxuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHVyZS1yYW5kQDcuMC4xL25vZGVfbW9kdWxlcy9wdXJlLXJhbmQvbGliL2VzbS9nZW5lcmF0b3IvWG9yb1NoaXJvLmpzXG52YXIgWG9yb1NoaXJvMTI4UGx1cyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gWG9yb1NoaXJvMTI4UGx1czIoczAxLCBzMDAsIHMxMSwgczEwKSB7XG4gICAgdGhpcy5zMDEgPSBzMDE7XG4gICAgdGhpcy5zMDAgPSBzMDA7XG4gICAgdGhpcy5zMTEgPSBzMTE7XG4gICAgdGhpcy5zMTAgPSBzMTA7XG4gIH1cbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBYb3JvU2hpcm8xMjhQbHVzMih0aGlzLnMwMSwgdGhpcy5zMDAsIHRoaXMuczExLCB0aGlzLnMxMCk7XG4gIH07XG4gIFhvcm9TaGlybzEyOFBsdXMyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5leHRSbmcgPSBuZXcgWG9yb1NoaXJvMTI4UGx1czIodGhpcy5zMDEsIHRoaXMuczAwLCB0aGlzLnMxMSwgdGhpcy5zMTApO1xuICAgIHZhciBvdXQgPSBuZXh0Um5nLnVuc2FmZU5leHQoKTtcbiAgICByZXR1cm4gW291dCwgbmV4dFJuZ107XG4gIH07XG4gIFhvcm9TaGlybzEyOFBsdXMyLnByb3RvdHlwZS51bnNhZmVOZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IHRoaXMuczAwICsgdGhpcy5zMTAgfCAwO1xuICAgIHZhciBhMCA9IHRoaXMuczEwIF4gdGhpcy5zMDA7XG4gICAgdmFyIGExID0gdGhpcy5zMTEgXiB0aGlzLnMwMTtcbiAgICB2YXIgczAwID0gdGhpcy5zMDA7XG4gICAgdmFyIHMwMSA9IHRoaXMuczAxO1xuICAgIHRoaXMuczAwID0gczAwIDw8IDI0IF4gczAxID4+PiA4IF4gYTAgXiBhMCA8PCAxNjtcbiAgICB0aGlzLnMwMSA9IHMwMSA8PCAyNCBeIHMwMCA+Pj4gOCBeIGExIF4gKGExIDw8IDE2IHwgYTAgPj4+IDE2KTtcbiAgICB0aGlzLnMxMCA9IGExIDw8IDUgXiBhMCA+Pj4gMjc7XG4gICAgdGhpcy5zMTEgPSBhMCA8PCA1IF4gYTEgPj4+IDI3O1xuICAgIHJldHVybiBvdXQ7XG4gIH07XG4gIFhvcm9TaGlybzEyOFBsdXMyLnByb3RvdHlwZS5qdW1wID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5leHRSbmcgPSBuZXcgWG9yb1NoaXJvMTI4UGx1czIodGhpcy5zMDEsIHRoaXMuczAwLCB0aGlzLnMxMSwgdGhpcy5zMTApO1xuICAgIG5leHRSbmcudW5zYWZlSnVtcCgpO1xuICAgIHJldHVybiBuZXh0Um5nO1xuICB9O1xuICBYb3JvU2hpcm8xMjhQbHVzMi5wcm90b3R5cGUudW5zYWZlSnVtcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBuczAxID0gMDtcbiAgICB2YXIgbnMwMCA9IDA7XG4gICAgdmFyIG5zMTEgPSAwO1xuICAgIHZhciBuczEwID0gMDtcbiAgICB2YXIganVtcCA9IFszNjM5OTU2NjQ1LCAzNzUwNzU3MDEyLCAxMjYxNTY4NTA4LCAzODY0MjYzMzVdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpICE9PSA0OyArK2kpIHtcbiAgICAgIGZvciAodmFyIG1hc2sgPSAxOyBtYXNrOyBtYXNrIDw8PSAxKSB7XG4gICAgICAgIGlmIChqdW1wW2ldICYgbWFzaykge1xuICAgICAgICAgIG5zMDEgXj0gdGhpcy5zMDE7XG4gICAgICAgICAgbnMwMCBePSB0aGlzLnMwMDtcbiAgICAgICAgICBuczExIF49IHRoaXMuczExO1xuICAgICAgICAgIG5zMTAgXj0gdGhpcy5zMTA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51bnNhZmVOZXh0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuczAxID0gbnMwMTtcbiAgICB0aGlzLnMwMCA9IG5zMDA7XG4gICAgdGhpcy5zMTEgPSBuczExO1xuICAgIHRoaXMuczEwID0gbnMxMDtcbiAgfTtcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFt0aGlzLnMwMSwgdGhpcy5zMDAsIHRoaXMuczExLCB0aGlzLnMxMF07XG4gIH07XG4gIHJldHVybiBYb3JvU2hpcm8xMjhQbHVzMjtcbn0pKCk7XG5mdW5jdGlvbiBmcm9tU3RhdGUoc3RhdGUpIHtcbiAgdmFyIHZhbGlkID0gc3RhdGUubGVuZ3RoID09PSA0O1xuICBpZiAoIXZhbGlkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHN0YXRlIG11c3QgaGF2ZSBiZWVuIHByb2R1Y2VkIGJ5IGEgeG9yb3NoaXJvMTI4cGx1cyBSYW5kb21HZW5lcmF0b3JcIik7XG4gIH1cbiAgcmV0dXJuIG5ldyBYb3JvU2hpcm8xMjhQbHVzKHN0YXRlWzBdLCBzdGF0ZVsxXSwgc3RhdGVbMl0sIHN0YXRlWzNdKTtcbn1cbnZhciB4b3Jvc2hpcm8xMjhwbHVzID0gT2JqZWN0LmFzc2lnbihmdW5jdGlvbihzZWVkKSB7XG4gIHJldHVybiBuZXcgWG9yb1NoaXJvMTI4UGx1cygtMSwgfnNlZWQsIHNlZWQgfCAwLCAwKTtcbn0sIHsgZnJvbVN0YXRlIH0pO1xuXG4vLyBzcmMvc2VydmVyL3JuZy50c1xudmFyIHsgYXNVaW50TiB9ID0gQmlnSW50O1xuZnVuY3Rpb24gcGNnMzIoc3RhdGUpIHtcbiAgY29uc3QgTVVMID0gNjM2NDEzNjIyMzg0Njc5MzAwNW47XG4gIGNvbnN0IElOQyA9IDExNjM0NTgwMDI3NDYyMjYwNzIzbjtcbiAgc3RhdGUgPSBhc1VpbnROKDY0LCBzdGF0ZSAqIE1VTCArIElOQyk7XG4gIGNvbnN0IHhvcnNoaWZ0ZWQgPSBOdW1iZXIoYXNVaW50TigzMiwgKHN0YXRlID4+IDE4biBeIHN0YXRlKSA+PiAyN24pKTtcbiAgY29uc3Qgcm90ID0gTnVtYmVyKGFzVWludE4oMzIsIHN0YXRlID4+IDU5bikpO1xuICByZXR1cm4geG9yc2hpZnRlZCA+PiByb3QgfCB4b3JzaGlmdGVkIDw8IDMyIC0gcm90O1xufVxuZnVuY3Rpb24gZ2VuZXJhdGVGbG9hdDY0KHJuZykge1xuICBjb25zdCBnMSA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oMCwgKDEgPDwgMjYpIC0gMSwgcm5nKTtcbiAgY29uc3QgZzIgPSB1bnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uKDAsICgxIDw8IDI3KSAtIDEsIHJuZyk7XG4gIGNvbnN0IHZhbHVlID0gKGcxICogTWF0aC5wb3coMiwgMjcpICsgZzIpICogTWF0aC5wb3coMiwgLTUzKTtcbiAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gbWFrZVJhbmRvbShzZWVkKSB7XG4gIGNvbnN0IHJuZyA9IHhvcm9zaGlybzEyOHBsdXMocGNnMzIoc2VlZC5taWNyb3NTaW5jZVVuaXhFcG9jaCkpO1xuICBjb25zdCByYW5kb20gPSAoKSA9PiBnZW5lcmF0ZUZsb2F0NjQocm5nKTtcbiAgcmFuZG9tLmZpbGwgPSAoYXJyYXkpID0+IHtcbiAgICBjb25zdCBlbGVtID0gYXJyYXkuYXQoMCk7XG4gICAgaWYgKHR5cGVvZiBlbGVtID09PSBcImJpZ2ludFwiKSB7XG4gICAgICBjb25zdCB1cHBlciA9ICgxbiA8PCBCaWdJbnQoYXJyYXkuQllURVNfUEVSX0VMRU1FTlQgKiA4KSkgLSAxbjtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJyYXlbaV0gPSB1bnNhZmVVbmlmb3JtQmlnSW50RGlzdHJpYnV0aW9uKDBuLCB1cHBlciwgcm5nKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbGVtID09PSBcIm51bWJlclwiKSB7XG4gICAgICBjb25zdCB1cHBlciA9ICgxIDw8IGFycmF5LkJZVEVTX1BFUl9FTEVNRU5UICogOCkgLSAxO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcnJheVtpXSA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oMCwgdXBwZXIsIHJuZyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbiAgfTtcbiAgcmFuZG9tLnVpbnQzMiA9ICgpID0+IHJuZy51bnNhZmVOZXh0KCk7XG4gIHJhbmRvbS5pbnRlZ2VySW5SYW5nZSA9IChtaW4sIG1heCkgPT4gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbihtaW4sIG1heCwgcm5nKTtcbiAgcmFuZG9tLmJpZ2ludEluUmFuZ2UgPSAobWluLCBtYXgpID0+IHVuc2FmZVVuaWZvcm1CaWdJbnREaXN0cmlidXRpb24obWluLCBtYXgsIHJuZyk7XG4gIHJldHVybiByYW5kb207XG59XG5cbi8vIHNyYy9zZXJ2ZXIvcnVudGltZS50c1xudmFyIHsgZnJlZXplIH0gPSBPYmplY3Q7XG52YXIgc3lzID0geyAuLi5fc3lzY2FsbHMyXzAsIC4uLl9zeXNjYWxsczJfMSB9O1xuZnVuY3Rpb24gcmVxdWVzdEZyb21XaXJlKHJlcXVlc3QsIGJvZHkpIHtcbiAgcmV0dXJuIFJlcXVlc3RbbWFrZVJlcXVlc3RdKGJvZHksIHtcbiAgICBoZWFkZXJzOiBkZXNlcmlhbGl6ZUhlYWRlcnMocmVxdWVzdC5oZWFkZXJzKSxcbiAgICBtZXRob2Q6IGRlc2VyaWFsaXplTWV0aG9kKHJlcXVlc3QubWV0aG9kKSxcbiAgICB1cmk6IHJlcXVlc3QudXJpLFxuICAgIHZlcnNpb246IHJlcXVlc3QudmVyc2lvblxuICB9KTtcbn1cbmZ1bmN0aW9uIHJlc3BvbnNlSW50b1dpcmUocmVzcG9uc2UpIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBoZWFkZXJzOiBzZXJpYWxpemVIZWFkZXJzKHJlc3BvbnNlLmhlYWRlcnMpLFxuICAgICAgdmVyc2lvbjogcmVzcG9uc2UudmVyc2lvbixcbiAgICAgIGNvZGU6IHJlc3BvbnNlLnN0YXR1c1xuICAgIH0sXG4gICAgcmVzcG9uc2UuYnl0ZXMoKVxuICBdO1xufVxuZnVuY3Rpb24gcGFyc2VKc29uT2JqZWN0KGpzb24pIHtcbiAgbGV0IHZhbHVlO1xuICB0cnkge1xuICAgIHZhbHVlID0gSlNPTi5wYXJzZShqc29uKTtcbiAgfSBjYXRjaCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBKU09OOiBmYWlsZWQgdG8gcGFyc2Ugc3RyaW5nXCIpO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBhIEpTT04gb2JqZWN0IGF0IHRoZSB0b3AgbGV2ZWxcIik7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxudmFyIEp3dENsYWltc0ltcGwgPSBjbGFzcyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IEp3dENsYWltcyBpbnN0YW5jZS5cbiAgICogQHBhcmFtIHJhd1BheWxvYWQgVGhlIEpXVCBwYXlsb2FkIGFzIGEgcmF3IEpTT04gc3RyaW5nLlxuICAgKiBAcGFyYW0gaWRlbnRpdHkgVGhlIGlkZW50aXR5IGZvciB0aGlzIEpXVC4gV2UgYXJlIG9ubHkgdGFraW5nIHRoaXMgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIGEgYmxha2UzIGltcGxlbWVudGF0aW9uICh3aGljaCB3ZSBuZWVkIHRvIGNvbXB1dGUgaXQpLlxuICAgKi9cbiAgY29uc3RydWN0b3IocmF3UGF5bG9hZCwgaWRlbnRpdHkpIHtcbiAgICB0aGlzLnJhd1BheWxvYWQgPSByYXdQYXlsb2FkO1xuICAgIHRoaXMuZnVsbFBheWxvYWQgPSBwYXJzZUpzb25PYmplY3QocmF3UGF5bG9hZCk7XG4gICAgdGhpcy5faWRlbnRpdHkgPSBpZGVudGl0eTtcbiAgfVxuICBmdWxsUGF5bG9hZDtcbiAgX2lkZW50aXR5O1xuICBnZXQgaWRlbnRpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lkZW50aXR5O1xuICB9XG4gIGdldCBzdWJqZWN0KCkge1xuICAgIHJldHVybiB0aGlzLmZ1bGxQYXlsb2FkW1wic3ViXCJdO1xuICB9XG4gIGdldCBpc3N1ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnVsbFBheWxvYWRbXCJpc3NcIl07XG4gIH1cbiAgZ2V0IGF1ZGllbmNlKCkge1xuICAgIGNvbnN0IGF1ZCA9IHRoaXMuZnVsbFBheWxvYWRbXCJhdWRcIl07XG4gICAgaWYgKGF1ZCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgYXVkID09PSBcInN0cmluZ1wiID8gW2F1ZF0gOiBhdWQ7XG4gIH1cbn07XG52YXIgQXV0aEN0eEltcGwgPSBjbGFzcyBfQXV0aEN0eEltcGwge1xuICBpc0ludGVybmFsO1xuICAvLyBTb3VyY2Ugb2YgdGhlIEpXVCBwYXlsb2FkIHN0cmluZywgaWYgdGhlcmUgaXMgb25lLlxuICBfand0U291cmNlO1xuICAvLyBXaGV0aGVyIHdlIGhhdmUgaW5pdGlhbGl6ZWQgdGhlIEpXVCBjbGFpbXMuXG4gIF9pbml0aWFsaXplZEpXVCA9IGZhbHNlO1xuICBfand0Q2xhaW1zO1xuICBfc2VuZGVySWRlbnRpdHk7XG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICB0aGlzLmlzSW50ZXJuYWwgPSBvcHRzLmlzSW50ZXJuYWw7XG4gICAgdGhpcy5fand0U291cmNlID0gb3B0cy5qd3RTb3VyY2U7XG4gICAgdGhpcy5fc2VuZGVySWRlbnRpdHkgPSBvcHRzLnNlbmRlcklkZW50aXR5O1xuICB9XG4gIF9pbml0aWFsaXplSldUKCkge1xuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZEpXVCkgcmV0dXJuO1xuICAgIHRoaXMuX2luaXRpYWxpemVkSldUID0gdHJ1ZTtcbiAgICBjb25zdCB0b2tlbiA9IHRoaXMuX2p3dFNvdXJjZSgpO1xuICAgIGlmICghdG9rZW4pIHtcbiAgICAgIHRoaXMuX2p3dENsYWltcyA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2p3dENsYWltcyA9IG5ldyBKd3RDbGFpbXNJbXBsKHRva2VuLCB0aGlzLl9zZW5kZXJJZGVudGl0eSk7XG4gICAgfVxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbiAgLyoqIExhemlseSBjb21wdXRlIHdoZXRoZXIgYSBKV1QgZXhpc3RzIGFuZCBpcyBwYXJzZWFibGUuICovXG4gIGdldCBoYXNKV1QoKSB7XG4gICAgdGhpcy5faW5pdGlhbGl6ZUpXVCgpO1xuICAgIHJldHVybiB0aGlzLl9qd3RDbGFpbXMgIT09IG51bGw7XG4gIH1cbiAgLyoqIExhemlseSBwYXJzZSB0aGUgSnd0Q2xhaW1zIG9ubHkgd2hlbiBhY2Nlc3NlZC4gKi9cbiAgZ2V0IGp3dCgpIHtcbiAgICB0aGlzLl9pbml0aWFsaXplSldUKCk7XG4gICAgcmV0dXJuIHRoaXMuX2p3dENsYWltcztcbiAgfVxuICAvKiogQ3JlYXRlIGEgY29udGV4dCByZXByZXNlbnRpbmcgaW50ZXJuYWwgKG5vbi11c2VyKSByZXF1ZXN0cy4gKi9cbiAgc3RhdGljIGludGVybmFsKCkge1xuICAgIHJldHVybiBuZXcgX0F1dGhDdHhJbXBsKHtcbiAgICAgIGlzSW50ZXJuYWw6IHRydWUsXG4gICAgICBqd3RTb3VyY2U6ICgpID0+IG51bGwsXG4gICAgICBzZW5kZXJJZGVudGl0eTogSWRlbnRpdHkuemVybygpXG4gICAgfSk7XG4gIH1cbiAgLyoqIElmIHRoZXJlIGlzIGEgY29ubmVjdGlvbiBpZCwgbG9vayB1cCB0aGUgSldUIHBheWxvYWQgZnJvbSB0aGUgc3lzdGVtIHRhYmxlcy4gKi9cbiAgc3RhdGljIGZyb21TeXN0ZW1UYWJsZXMoY29ubmVjdGlvbklkLCBzZW5kZXIpIHtcbiAgICBpZiAoY29ubmVjdGlvbklkID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbmV3IF9BdXRoQ3R4SW1wbCh7XG4gICAgICAgIGlzSW50ZXJuYWw6IGZhbHNlLFxuICAgICAgICBqd3RTb3VyY2U6ICgpID0+IG51bGwsXG4gICAgICAgIHNlbmRlcklkZW50aXR5OiBzZW5kZXJcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IF9BdXRoQ3R4SW1wbCh7XG4gICAgICBpc0ludGVybmFsOiBmYWxzZSxcbiAgICAgIGp3dFNvdXJjZTogKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXlsb2FkQnVmID0gc3lzLmdldF9qd3RfcGF5bG9hZChjb25uZWN0aW9uSWQuX19jb25uZWN0aW9uX2lkX18pO1xuICAgICAgICBpZiAocGF5bG9hZEJ1Zi5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBwYXlsb2FkU3RyID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHBheWxvYWRCdWYpO1xuICAgICAgICByZXR1cm4gcGF5bG9hZFN0cjtcbiAgICAgIH0sXG4gICAgICBzZW5kZXJJZGVudGl0eTogc2VuZGVyXG4gICAgfSk7XG4gIH1cbn07XG52YXIgUmVkdWNlckN0eEltcGwgPSBjbGFzcyBSZWR1Y2VyQ3R4IHtcbiAgI2lkZW50aXR5O1xuICAjc2VuZGVyQXV0aDtcbiAgI3V1aWRDb3VudGVyO1xuICAjcmFuZG9tO1xuICBzZW5kZXI7XG4gIHRpbWVzdGFtcDtcbiAgY29ubmVjdGlvbklkO1xuICBkYjtcbiAgY29uc3RydWN0b3Ioc2VuZGVyLCB0aW1lc3RhbXAsIGNvbm5lY3Rpb25JZCwgZGJWaWV3KSB7XG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gICAgdGhpcy5zZW5kZXIgPSBzZW5kZXI7XG4gICAgdGhpcy50aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4gICAgdGhpcy5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XG4gICAgdGhpcy5kYiA9IGRiVmlldztcbiAgfVxuICAvKiogUmVzZXQgdGhlIGBSZWR1Y2VyQ3R4YCB0byBiZSB1c2VkIGZvciBhIG5ldyB0cmFuc2FjdGlvbiAqL1xuICBzdGF0aWMgcmVzZXQobWUsIHNlbmRlciwgdGltZXN0YW1wLCBjb25uZWN0aW9uSWQpIHtcbiAgICBtZS5zZW5kZXIgPSBzZW5kZXI7XG4gICAgbWUudGltZXN0YW1wID0gdGltZXN0YW1wO1xuICAgIG1lLmNvbm5lY3Rpb25JZCA9IGNvbm5lY3Rpb25JZDtcbiAgICBtZS4jdXVpZENvdW50ZXIgPSB2b2lkIDA7XG4gICAgbWUuI3NlbmRlckF1dGggPSB2b2lkIDA7XG4gIH1cbiAgZ2V0IGRhdGFiYXNlSWRlbnRpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2lkZW50aXR5ID8/PSBuZXcgSWRlbnRpdHkoc3lzLmlkZW50aXR5KCkpO1xuICB9XG4gIGdldCBpZGVudGl0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhYmFzZUlkZW50aXR5O1xuICB9XG4gIGdldCBzZW5kZXJBdXRoKCkge1xuICAgIHJldHVybiB0aGlzLiNzZW5kZXJBdXRoID8/PSBBdXRoQ3R4SW1wbC5mcm9tU3lzdGVtVGFibGVzKFxuICAgICAgdGhpcy5jb25uZWN0aW9uSWQsXG4gICAgICB0aGlzLnNlbmRlclxuICAgICk7XG4gIH1cbiAgZ2V0IHJhbmRvbSgpIHtcbiAgICByZXR1cm4gdGhpcy4jcmFuZG9tID8/PSBtYWtlUmFuZG9tKHRoaXMudGltZXN0YW1wKTtcbiAgfVxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IHJhbmRvbSB7QGxpbmsgVXVpZH0gYHY0YCB1c2luZyB0aGlzIGBSZWR1Y2VyQ3R4YCdzIFJORy5cbiAgICovXG4gIG5ld1V1aWRWNCgpIHtcbiAgICBjb25zdCBieXRlcyA9IHRoaXMucmFuZG9tLmZpbGwobmV3IFVpbnQ4QXJyYXkoMTYpKTtcbiAgICByZXR1cm4gVXVpZC5mcm9tUmFuZG9tQnl0ZXNWNChieXRlcyk7XG4gIH1cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBzb3J0YWJsZSB7QGxpbmsgVXVpZH0gYHY3YCB1c2luZyB0aGlzIGBSZWR1Y2VyQ3R4YCdzIFJORywgY291bnRlcixcbiAgICogYW5kIHRpbWVzdGFtcC5cbiAgICovXG4gIG5ld1V1aWRWNygpIHtcbiAgICBjb25zdCBieXRlcyA9IHRoaXMucmFuZG9tLmZpbGwobmV3IFVpbnQ4QXJyYXkoNCkpO1xuICAgIGNvbnN0IGNvdW50ZXIgPSB0aGlzLiN1dWlkQ291bnRlciA/Pz0geyB2YWx1ZTogMCB9O1xuICAgIHJldHVybiBVdWlkLmZyb21Db3VudGVyVjcoY291bnRlciwgdGhpcy50aW1lc3RhbXAsIGJ5dGVzKTtcbiAgfVxufTtcbnZhciBjYWxsVXNlckZ1bmN0aW9uID0gZnVuY3Rpb24gX19zcGFjZXRpbWVkYl9lbmRfc2hvcnRfYmFja3RyYWNlKGZuLCAuLi5hcmdzKSB7XG4gIHJldHVybiBmbiguLi5hcmdzKTtcbn07XG5mdW5jdGlvbiBydW5XaXRoVHgobWFrZUN0eCwgYm9keSkge1xuICBjb25zdCBydW4gPSAoKSA9PiB7XG4gICAgY29uc3QgdGltZXN0YW1wID0gc3lzLnByb2NlZHVyZV9zdGFydF9tdXRfdHgoKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGJvZHkobWFrZUN0eChuZXcgVGltZXN0YW1wKHRpbWVzdGFtcCkpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzeXMucHJvY2VkdXJlX2Fib3J0X211dF90eCgpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH07XG4gIGxldCByZXMgPSBydW4oKTtcbiAgdHJ5IHtcbiAgICBzeXMucHJvY2VkdXJlX2NvbW1pdF9tdXRfdHgoKTtcbiAgICByZXR1cm4gcmVzO1xuICB9IGNhdGNoIHtcbiAgfVxuICBjb25zb2xlLndhcm4oXCJjb21taXR0aW5nIGFub255bW91cyB0cmFuc2FjdGlvbiBmYWlsZWRcIik7XG4gIHJlcyA9IHJ1bigpO1xuICB0cnkge1xuICAgIHN5cy5wcm9jZWR1cmVfY29tbWl0X211dF90eCgpO1xuICAgIHJldHVybiByZXM7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cmFuc2FjdGlvbiByZXRyeSBmYWlsZWQgYWdhaW5cIiwgeyBjYXVzZTogZSB9KTtcbiAgfVxufVxudmFyIG1ha2VIb29rcyA9IChzY2hlbWEyKSA9PiBuZXcgTW9kdWxlSG9va3NJbXBsKHNjaGVtYTIpO1xudmFyIE1vZHVsZUhvb2tzSW1wbCA9IGNsYXNzIHtcbiAgI3NjaGVtYTtcbiAgI2RiVmlld187XG4gICNyZWR1Y2VyQXJnc0Rlc2VyaWFsaXplcnM7XG4gIC8qKiBDYWNoZSB0aGUgYFJlZHVjZXJDdHhgIG9iamVjdCB0byBhdm9pZCBhbGxvY2F0aW5nIGFuZXcgZm9yIGV2ZXIgcmVkdWNlciBjYWxsLiAqL1xuICAjcmVkdWNlckN0eF87XG4gIGNvbnN0cnVjdG9yKHNjaGVtYTIpIHtcbiAgICB0aGlzLiNzY2hlbWEgPSBzY2hlbWEyO1xuICAgIHRoaXMuI3JlZHVjZXJBcmdzRGVzZXJpYWxpemVycyA9IHNjaGVtYTIubW9kdWxlRGVmLnJlZHVjZXJzLm1hcChcbiAgICAgICh7IHBhcmFtcyB9KSA9PiBQcm9kdWN0VHlwZS5tYWtlRGVzZXJpYWxpemVyKHBhcmFtcywgc2NoZW1hMi50eXBlc3BhY2UpXG4gICAgKTtcbiAgfVxuICBnZXQgI2RiVmlldygpIHtcbiAgICByZXR1cm4gdGhpcy4jZGJWaWV3XyA/Pz0gZnJlZXplKFxuICAgICAgT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QudmFsdWVzKHRoaXMuI3NjaGVtYS5zY2hlbWFUeXBlLnRhYmxlcykubWFwKCh0YWJsZTIpID0+IFtcbiAgICAgICAgICB0YWJsZTIuYWNjZXNzb3JOYW1lLFxuICAgICAgICAgIG1ha2VUYWJsZVZpZXcodGhpcy4jc2NoZW1hLnR5cGVzcGFjZSwgdGFibGUyLnRhYmxlRGVmKVxuICAgICAgICBdKVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgZ2V0ICNyZWR1Y2VyQ3R4KCkge1xuICAgIHJldHVybiB0aGlzLiNyZWR1Y2VyQ3R4XyA/Pz0gbmV3IFJlZHVjZXJDdHhJbXBsKFxuICAgICAgSWRlbnRpdHkuemVybygpLFxuICAgICAgVGltZXN0YW1wLlVOSVhfRVBPQ0gsXG4gICAgICBudWxsLFxuICAgICAgdGhpcy4jZGJWaWV3XG4gICAgKTtcbiAgfVxuICBfX2Rlc2NyaWJlX21vZHVsZV9fKCkge1xuICAgIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTI4KTtcbiAgICBSYXdNb2R1bGVEZWYuc2VyaWFsaXplKFxuICAgICAgd3JpdGVyLFxuICAgICAgUmF3TW9kdWxlRGVmLlYxMCh0aGlzLiNzY2hlbWEucmF3TW9kdWxlRGVmVjEwKCkpXG4gICAgKTtcbiAgICByZXR1cm4gd3JpdGVyLmdldEJ1ZmZlcigpO1xuICB9XG4gIF9fZ2V0X2Vycm9yX2NvbnN0cnVjdG9yX18oY29kZSkge1xuICAgIHJldHVybiBnZXRFcnJvckNvbnN0cnVjdG9yKGNvZGUpO1xuICB9XG4gIGdldCBfX3NlbmRlcl9lcnJvcl9jbGFzc19fKCkge1xuICAgIHJldHVybiBTZW5kZXJFcnJvcjtcbiAgfVxuICBfX2NhbGxfcmVkdWNlcl9fKHJlZHVjZXJJZCwgc2VuZGVyLCBjb25uSWQsIHRpbWVzdGFtcCwgYXJnc0J1Zikge1xuICAgIGNvbnN0IG1vZHVsZUN0eCA9IHRoaXMuI3NjaGVtYTtcbiAgICBjb25zdCBkZXNlcmlhbGl6ZUFyZ3MgPSB0aGlzLiNyZWR1Y2VyQXJnc0Rlc2VyaWFsaXplcnNbcmVkdWNlcklkXTtcbiAgICBCSU5BUllfUkVBREVSLnJlc2V0KGFyZ3NCdWYpO1xuICAgIGNvbnN0IGFyZ3MgPSBkZXNlcmlhbGl6ZUFyZ3MoQklOQVJZX1JFQURFUik7XG4gICAgY29uc3Qgc2VuZGVySWRlbnRpdHkgPSBuZXcgSWRlbnRpdHkoc2VuZGVyKTtcbiAgICBjb25zdCBjdHggPSB0aGlzLiNyZWR1Y2VyQ3R4O1xuICAgIFJlZHVjZXJDdHhJbXBsLnJlc2V0KFxuICAgICAgY3R4LFxuICAgICAgc2VuZGVySWRlbnRpdHksXG4gICAgICBuZXcgVGltZXN0YW1wKHRpbWVzdGFtcCksXG4gICAgICBDb25uZWN0aW9uSWQubnVsbElmWmVybyhuZXcgQ29ubmVjdGlvbklkKGNvbm5JZCkpXG4gICAgKTtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKG1vZHVsZUN0eC5yZWR1Y2Vyc1tyZWR1Y2VySWRdLCBjdHgsIGFyZ3MpO1xuICB9XG4gIF9fY2FsbF92aWV3X18oaWQsIHNlbmRlciwgYXJnc0J1Zikge1xuICAgIGNvbnN0IG1vZHVsZUN0eCA9IHRoaXMuI3NjaGVtYTtcbiAgICBjb25zdCB7IGZuLCBkZXNlcmlhbGl6ZVBhcmFtcywgc2VyaWFsaXplUmV0dXJuLCByZXR1cm5UeXBlQmFzZVNpemUgfSA9IG1vZHVsZUN0eC52aWV3c1tpZF07XG4gICAgY29uc3QgY3R4ID0gZnJlZXplKHtcbiAgICAgIHNlbmRlcjogbmV3IElkZW50aXR5KHNlbmRlciksXG4gICAgICAvLyB0aGlzIGlzIHRoZSBub24tcmVhZG9ubHkgRGJWaWV3LCBidXQgdGhlIHR5cGluZyBmb3IgdGhlIHVzZXIgd2lsbCBiZVxuICAgICAgLy8gdGhlIHJlYWRvbmx5IG9uZSwgYW5kIGlmIHRoZXkgZG8gY2FsbCBtdXRhdGluZyBmdW5jdGlvbnMgaXQgd2lsbCBmYWlsXG4gICAgICAvLyBhdCBydW50aW1lXG4gICAgICBkYjogdGhpcy4jZGJWaWV3LFxuICAgICAgZnJvbTogbWFrZVF1ZXJ5QnVpbGRlcihtb2R1bGVDdHguc2NoZW1hVHlwZSlcbiAgICB9KTtcbiAgICBjb25zdCBhcmdzID0gZGVzZXJpYWxpemVQYXJhbXMobmV3IEJpbmFyeVJlYWRlcihhcmdzQnVmKSk7XG4gICAgY29uc3QgcmV0ID0gY2FsbFVzZXJGdW5jdGlvbihmbiwgY3R4LCBhcmdzKTtcbiAgICBjb25zdCByZXRCdWYgPSBuZXcgQmluYXJ5V3JpdGVyKHJldHVyblR5cGVCYXNlU2l6ZSk7XG4gICAgaWYgKGlzUm93VHlwZWRRdWVyeShyZXQpKSB7XG4gICAgICBjb25zdCBxdWVyeSA9IHRvU3FsKHJldCk7XG4gICAgICBWaWV3UmVzdWx0SGVhZGVyLnNlcmlhbGl6ZShyZXRCdWYsIFZpZXdSZXN1bHRIZWFkZXIuUmF3U3FsKHF1ZXJ5KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIFZpZXdSZXN1bHRIZWFkZXIuc2VyaWFsaXplKHJldEJ1ZiwgVmlld1Jlc3VsdEhlYWRlci5Sb3dEYXRhKTtcbiAgICAgIHNlcmlhbGl6ZVJldHVybihyZXRCdWYsIHJldCk7XG4gICAgfVxuICAgIHJldHVybiB7IGRhdGE6IHJldEJ1Zi5nZXRCdWZmZXIoKSB9O1xuICB9XG4gIF9fY2FsbF92aWV3X2Fub25fXyhpZCwgYXJnc0J1Zikge1xuICAgIGNvbnN0IG1vZHVsZUN0eCA9IHRoaXMuI3NjaGVtYTtcbiAgICBjb25zdCB7IGZuLCBkZXNlcmlhbGl6ZVBhcmFtcywgc2VyaWFsaXplUmV0dXJuLCByZXR1cm5UeXBlQmFzZVNpemUgfSA9IG1vZHVsZUN0eC5hbm9uVmlld3NbaWRdO1xuICAgIGNvbnN0IGN0eCA9IGZyZWV6ZSh7XG4gICAgICAvLyB0aGlzIGlzIHRoZSBub24tcmVhZG9ubHkgRGJWaWV3LCBidXQgdGhlIHR5cGluZyBmb3IgdGhlIHVzZXIgd2lsbCBiZVxuICAgICAgLy8gdGhlIHJlYWRvbmx5IG9uZSwgYW5kIGlmIHRoZXkgZG8gY2FsbCBtdXRhdGluZyBmdW5jdGlvbnMgaXQgd2lsbCBmYWlsXG4gICAgICAvLyBhdCBydW50aW1lXG4gICAgICBkYjogdGhpcy4jZGJWaWV3LFxuICAgICAgZnJvbTogbWFrZVF1ZXJ5QnVpbGRlcihtb2R1bGVDdHguc2NoZW1hVHlwZSlcbiAgICB9KTtcbiAgICBjb25zdCBhcmdzID0gZGVzZXJpYWxpemVQYXJhbXMobmV3IEJpbmFyeVJlYWRlcihhcmdzQnVmKSk7XG4gICAgY29uc3QgcmV0ID0gY2FsbFVzZXJGdW5jdGlvbihmbiwgY3R4LCBhcmdzKTtcbiAgICBjb25zdCByZXRCdWYgPSBuZXcgQmluYXJ5V3JpdGVyKHJldHVyblR5cGVCYXNlU2l6ZSk7XG4gICAgaWYgKGlzUm93VHlwZWRRdWVyeShyZXQpKSB7XG4gICAgICBjb25zdCBxdWVyeSA9IHRvU3FsKHJldCk7XG4gICAgICBWaWV3UmVzdWx0SGVhZGVyLnNlcmlhbGl6ZShyZXRCdWYsIFZpZXdSZXN1bHRIZWFkZXIuUmF3U3FsKHF1ZXJ5KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIFZpZXdSZXN1bHRIZWFkZXIuc2VyaWFsaXplKHJldEJ1ZiwgVmlld1Jlc3VsdEhlYWRlci5Sb3dEYXRhKTtcbiAgICAgIHNlcmlhbGl6ZVJldHVybihyZXRCdWYsIHJldCk7XG4gICAgfVxuICAgIHJldHVybiB7IGRhdGE6IHJldEJ1Zi5nZXRCdWZmZXIoKSB9O1xuICB9XG4gIF9fY2FsbF9wcm9jZWR1cmVfXyhpZCwgc2VuZGVyLCBjb25uZWN0aW9uX2lkLCB0aW1lc3RhbXAsIGFyZ3MpIHtcbiAgICByZXR1cm4gY2FsbFByb2NlZHVyZShcbiAgICAgIHRoaXMuI3NjaGVtYSxcbiAgICAgIGlkLFxuICAgICAgbmV3IElkZW50aXR5KHNlbmRlciksXG4gICAgICBDb25uZWN0aW9uSWQubnVsbElmWmVybyhuZXcgQ29ubmVjdGlvbklkKGNvbm5lY3Rpb25faWQpKSxcbiAgICAgIG5ldyBUaW1lc3RhbXAodGltZXN0YW1wKSxcbiAgICAgIGFyZ3MsXG4gICAgICAoKSA9PiB0aGlzLiNkYlZpZXdcbiAgICApO1xuICB9XG4gIF9fY2FsbF9odHRwX2hhbmRsZXJfXyhpZCwgdGltZXN0YW1wLCByZXF1ZXN0LCBib2R5KSB7XG4gICAgY29uc3QgbW9kdWxlQ3R4ID0gdGhpcy4jc2NoZW1hO1xuICAgIGNvbnN0IGhhbmRsZXIgPSBtb2R1bGVDdHguaHR0cEhhbmRsZXJzW2lkXTtcbiAgICBjb25zdCBjdHggPSBuZXcgSGFuZGxlckNvbnRleHRJbXBsKFxuICAgICAgbmV3IFRpbWVzdGFtcCh0aW1lc3RhbXApLFxuICAgICAgKCkgPT4gdGhpcy4jZGJWaWV3XG4gICAgKTtcbiAgICBjb25zdCByZXF1ZXN0TWV0YWRhdGEgPSBIdHRwUmVxdWVzdC5kZXNlcmlhbGl6ZShuZXcgQmluYXJ5UmVhZGVyKHJlcXVlc3QpKTtcbiAgICBjb25zdCByZXNwb25zZSA9IGNhbGxVc2VyRnVuY3Rpb24oXG4gICAgICBoYW5kbGVyLFxuICAgICAgY3R4LFxuICAgICAgcmVxdWVzdEZyb21XaXJlKHJlcXVlc3RNZXRhZGF0YSwgYm9keSlcbiAgICApO1xuICAgIGNvbnN0IFtyZXNwb25zZU1ldGFkYXRhLCByZXNwb25zZUJvZHldID0gcmVzcG9uc2VJbnRvV2lyZShyZXNwb25zZSk7XG4gICAgY29uc3QgcmVzcG9uc2VCdWYgPSBuZXcgQmluYXJ5V3JpdGVyKFxuICAgICAgYnNhdG5CYXNlU2l6ZShtb2R1bGVDdHgudHlwZXNwYWNlLCBIdHRwUmVzcG9uc2UuYWxnZWJyYWljVHlwZSlcbiAgICApO1xuICAgIEh0dHBSZXNwb25zZS5zZXJpYWxpemUocmVzcG9uc2VCdWYsIHJlc3BvbnNlTWV0YWRhdGEpO1xuICAgIHJldHVybiBbcmVzcG9uc2VCdWYuZ2V0QnVmZmVyKCksIHJlc3BvbnNlQm9keV07XG4gIH1cbn07XG52YXIgQklOQVJZX1dSSVRFUiA9IG5ldyBCaW5hcnlXcml0ZXIoMCk7XG52YXIgQklOQVJZX1JFQURFUiA9IG5ldyBCaW5hcnlSZWFkZXIobmV3IFVpbnQ4QXJyYXkoKSk7XG52YXIgSGFuZGxlckNvbnRleHRJbXBsID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih0aW1lc3RhbXAsIGRiVmlldykge1xuICAgIHRoaXMudGltZXN0YW1wID0gdGltZXN0YW1wO1xuICAgIHRoaXMuI2RiVmlldyA9IGRiVmlldztcbiAgfVxuICAjaWRlbnRpdHk7XG4gICN1dWlkQ291bnRlcjtcbiAgI3JhbmRvbTtcbiAgI2RiVmlldztcbiAgaHR0cCA9IGh0dHBDbGllbnQ7XG4gIGdldCBpZGVudGl0eSgpIHtcbiAgICByZXR1cm4gdGhpcy4jaWRlbnRpdHkgPz89IG5ldyBJZGVudGl0eShzeXMuaWRlbnRpdHkoKSk7XG4gIH1cbiAgZ2V0IHJhbmRvbSgpIHtcbiAgICByZXR1cm4gdGhpcy4jcmFuZG9tID8/PSBtYWtlUmFuZG9tKHRoaXMudGltZXN0YW1wKTtcbiAgfVxuICB3aXRoVHgoYm9keSkge1xuICAgIHJldHVybiBydW5XaXRoVHgoXG4gICAgICAodGltZXN0YW1wKSA9PiBuZXcgUmVkdWNlckN0eEltcGwoSWRlbnRpdHkuemVybygpLCB0aW1lc3RhbXAsIG51bGwsIHRoaXMuI2RiVmlldygpKSxcbiAgICAgIGJvZHlcbiAgICApO1xuICB9XG4gIG5ld1V1aWRWNCgpIHtcbiAgICBjb25zdCBieXRlcyA9IHRoaXMucmFuZG9tLmZpbGwobmV3IFVpbnQ4QXJyYXkoMTYpKTtcbiAgICByZXR1cm4gVXVpZC5mcm9tUmFuZG9tQnl0ZXNWNChieXRlcyk7XG4gIH1cbiAgbmV3VXVpZFY3KCkge1xuICAgIGNvbnN0IGJ5dGVzID0gdGhpcy5yYW5kb20uZmlsbChuZXcgVWludDhBcnJheSg0KSk7XG4gICAgY29uc3QgY291bnRlciA9IHRoaXMuI3V1aWRDb3VudGVyID8/PSB7IHZhbHVlOiAwIH07XG4gICAgcmV0dXJuIFV1aWQuZnJvbUNvdW50ZXJWNyhjb3VudGVyLCB0aGlzLnRpbWVzdGFtcCwgYnl0ZXMpO1xuICB9XG59O1xuZnVuY3Rpb24gbWFrZVRhYmxlVmlldyh0eXBlc3BhY2UsIHRhYmxlMikge1xuICBjb25zdCB0YWJsZV9pZCA9IHN5cy50YWJsZV9pZF9mcm9tX25hbWUodGFibGUyLnNvdXJjZU5hbWUpO1xuICBjb25zdCByb3dUeXBlID0gdHlwZXNwYWNlLnR5cGVzW3RhYmxlMi5wcm9kdWN0VHlwZVJlZl07XG4gIGlmIChyb3dUeXBlLnRhZyAhPT0gXCJQcm9kdWN0XCIpIHtcbiAgICB0aHJvdyBcImltcG9zc2libGVcIjtcbiAgfVxuICBjb25zdCBzZXJpYWxpemVSb3cgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHJvd1R5cGUsIHR5cGVzcGFjZSk7XG4gIGNvbnN0IGRlc2VyaWFsaXplUm93ID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKHJvd1R5cGUsIHR5cGVzcGFjZSk7XG4gIGNvbnN0IHNlcXVlbmNlcyA9IHRhYmxlMi5zZXF1ZW5jZXMubWFwKChzZXEpID0+IHtcbiAgICBjb25zdCBjb2wgPSByb3dUeXBlLnZhbHVlLmVsZW1lbnRzW3NlcS5jb2x1bW5dO1xuICAgIGNvbnN0IGNvbFR5cGUgPSBjb2wuYWxnZWJyYWljVHlwZTtcbiAgICBsZXQgc2VxdWVuY2VUcmlnZ2VyO1xuICAgIHN3aXRjaCAoY29sVHlwZS50YWcpIHtcbiAgICAgIGNhc2UgXCJVOFwiOlxuICAgICAgY2FzZSBcIkk4XCI6XG4gICAgICBjYXNlIFwiVTE2XCI6XG4gICAgICBjYXNlIFwiSTE2XCI6XG4gICAgICBjYXNlIFwiVTMyXCI6XG4gICAgICBjYXNlIFwiSTMyXCI6XG4gICAgICAgIHNlcXVlbmNlVHJpZ2dlciA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlU2NFwiOlxuICAgICAgY2FzZSBcIkk2NFwiOlxuICAgICAgY2FzZSBcIlUxMjhcIjpcbiAgICAgIGNhc2UgXCJJMTI4XCI6XG4gICAgICBjYXNlIFwiVTI1NlwiOlxuICAgICAgY2FzZSBcIkkyNTZcIjpcbiAgICAgICAgc2VxdWVuY2VUcmlnZ2VyID0gMG47XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImludmFsaWQgc2VxdWVuY2UgdHlwZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbE5hbWU6IGNvbC5uYW1lLFxuICAgICAgc2VxdWVuY2VUcmlnZ2VyLFxuICAgICAgZGVzZXJpYWxpemU6IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihjb2xUeXBlLCB0eXBlc3BhY2UpXG4gICAgfTtcbiAgfSk7XG4gIGNvbnN0IGhhc0F1dG9JbmNyZW1lbnQgPSBzZXF1ZW5jZXMubGVuZ3RoID4gMDtcbiAgY29uc3QgaXRlciA9ICgpID0+IHRhYmxlSXRlcmF0b3Ioc3lzLmRhdGFzdG9yZV90YWJsZV9zY2FuX2JzYXRuKHRhYmxlX2lkKSwgZGVzZXJpYWxpemVSb3cpO1xuICBjb25zdCBpbnRlZ3JhdGVHZW5lcmF0ZWRDb2x1bW5zID0gaGFzQXV0b0luY3JlbWVudCA/IChyb3csIHJldF9idWYpID0+IHtcbiAgICBCSU5BUllfUkVBREVSLnJlc2V0KHJldF9idWYpO1xuICAgIGZvciAoY29uc3QgeyBjb2xOYW1lLCBkZXNlcmlhbGl6ZSwgc2VxdWVuY2VUcmlnZ2VyIH0gb2Ygc2VxdWVuY2VzKSB7XG4gICAgICBpZiAocm93W2NvbE5hbWVdID09PSBzZXF1ZW5jZVRyaWdnZXIpIHtcbiAgICAgICAgcm93W2NvbE5hbWVdID0gZGVzZXJpYWxpemUoQklOQVJZX1JFQURFUik7XG4gICAgICB9XG4gICAgfVxuICB9IDogbnVsbDtcbiAgY29uc3QgdGFibGVNZXRob2RzID0ge1xuICAgIGNvdW50OiAoKSA9PiBzeXMuZGF0YXN0b3JlX3RhYmxlX3Jvd19jb3VudCh0YWJsZV9pZCksXG4gICAgaXRlcixcbiAgICBbU3ltYm9sLml0ZXJhdG9yXTogKCkgPT4gaXRlcigpLFxuICAgIGluc2VydDogKHJvdykgPT4ge1xuICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1Zik7XG4gICAgICBzZXJpYWxpemVSb3coQklOQVJZX1dSSVRFUiwgcm93KTtcbiAgICAgIHN5cy5kYXRhc3RvcmVfaW5zZXJ0X2JzYXRuKHRhYmxlX2lkLCBidWYuYnVmZmVyLCBCSU5BUllfV1JJVEVSLm9mZnNldCk7XG4gICAgICBjb25zdCByZXQgPSB7IC4uLnJvdyB9O1xuICAgICAgaW50ZWdyYXRlR2VuZXJhdGVkQ29sdW1ucz8uKHJldCwgYnVmLnZpZXcpO1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9LFxuICAgIGRlbGV0ZTogKHJvdykgPT4ge1xuICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1Zik7XG4gICAgICBCSU5BUllfV1JJVEVSLndyaXRlVTMyKDEpO1xuICAgICAgc2VyaWFsaXplUm93KEJJTkFSWV9XUklURVIsIHJvdyk7XG4gICAgICBjb25zdCBjb3VudCA9IHN5cy5kYXRhc3RvcmVfZGVsZXRlX2FsbF9ieV9lcV9ic2F0bihcbiAgICAgICAgdGFibGVfaWQsXG4gICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgIEJJTkFSWV9XUklURVIub2Zmc2V0XG4gICAgICApO1xuICAgICAgcmV0dXJuIGNvdW50ID4gMDtcbiAgICB9LFxuICAgIGNsZWFyOiAoKSA9PiBzeXMuZGF0YXN0b3JlX2NsZWFyKHRhYmxlX2lkKVxuICB9O1xuICBjb25zdCB0YWJsZVZpZXcgPSBPYmplY3QuYXNzaWduKFxuICAgIC8qIEBfX1BVUkVfXyAqLyBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgIHRhYmxlTWV0aG9kc1xuICApO1xuICBmb3IgKGNvbnN0IGluZGV4RGVmIG9mIHRhYmxlMi5pbmRleGVzKSB7XG4gICAgY29uc3QgYWNjZXNzb3JOYW1lID0gaW5kZXhEZWYuYWNjZXNzb3JOYW1lO1xuICAgIGNvbnN0IGluZGV4X2lkID0gc3lzLmluZGV4X2lkX2Zyb21fbmFtZShpbmRleERlZi5zb3VyY2VOYW1lKTtcbiAgICBsZXQgY29sdW1uX2lkcztcbiAgICBsZXQgaXNIYXNoSW5kZXggPSBmYWxzZTtcbiAgICBzd2l0Y2ggKGluZGV4RGVmLmFsZ29yaXRobS50YWcpIHtcbiAgICAgIGNhc2UgXCJIYXNoXCI6XG4gICAgICAgIGlzSGFzaEluZGV4ID0gdHJ1ZTtcbiAgICAgICAgY29sdW1uX2lkcyA9IGluZGV4RGVmLmFsZ29yaXRobS52YWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQlRyZWVcIjpcbiAgICAgICAgY29sdW1uX2lkcyA9IGluZGV4RGVmLmFsZ29yaXRobS52YWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiRGlyZWN0XCI6XG4gICAgICAgIGNvbHVtbl9pZHMgPSBbaW5kZXhEZWYuYWxnb3JpdGhtLnZhbHVlXTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNvbnN0IG51bUNvbHVtbnMgPSBjb2x1bW5faWRzLmxlbmd0aDtcbiAgICBjb25zdCBjb2x1bW5TZXQgPSBuZXcgU2V0KGNvbHVtbl9pZHMpO1xuICAgIGNvbnN0IGlzVW5pcXVlID0gdGFibGUyLmNvbnN0cmFpbnRzLmZpbHRlcigoeCkgPT4geC5kYXRhLnRhZyA9PT0gXCJVbmlxdWVcIikuc29tZSgoeCkgPT4gY29sdW1uU2V0LmlzU3Vic2V0T2YobmV3IFNldCh4LmRhdGEudmFsdWUuY29sdW1ucykpKTtcbiAgICBjb25zdCBpc1ByaW1hcnlLZXkgPSBpc1VuaXF1ZSAmJiBjb2x1bW5faWRzLmxlbmd0aCA9PT0gdGFibGUyLnByaW1hcnlLZXkubGVuZ3RoICYmIGNvbHVtbl9pZHMuZXZlcnkoKGlkLCBpKSA9PiB0YWJsZTIucHJpbWFyeUtleVtpXSA9PT0gaWQpO1xuICAgIGNvbnN0IGluZGV4U2VyaWFsaXplcnMgPSBjb2x1bW5faWRzLm1hcChcbiAgICAgIChpZCkgPT4gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcbiAgICAgICAgcm93VHlwZS52YWx1ZS5lbGVtZW50c1tpZF0uYWxnZWJyYWljVHlwZSxcbiAgICAgICAgdHlwZXNwYWNlXG4gICAgICApXG4gICAgKTtcbiAgICBjb25zdCBzZXJpYWxpemVQb2ludCA9IChidWZmZXIsIGNvbFZhbCkgPT4ge1xuICAgICAgQklOQVJZX1dSSVRFUi5yZXNldChidWZmZXIpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Db2x1bW5zOyBpKyspIHtcbiAgICAgICAgaW5kZXhTZXJpYWxpemVyc1tpXShCSU5BUllfV1JJVEVSLCBjb2xWYWxbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIEJJTkFSWV9XUklURVIub2Zmc2V0O1xuICAgIH07XG4gICAgY29uc3Qgc2VyaWFsaXplU2luZ2xlRWxlbWVudCA9IG51bUNvbHVtbnMgPT09IDEgPyBpbmRleFNlcmlhbGl6ZXJzWzBdIDogbnVsbDtcbiAgICBjb25zdCBzZXJpYWxpemVTaW5nbGVQb2ludCA9IHNlcmlhbGl6ZVNpbmdsZUVsZW1lbnQgJiYgKChidWZmZXIsIGNvbFZhbCkgPT4ge1xuICAgICAgQklOQVJZX1dSSVRFUi5yZXNldChidWZmZXIpO1xuICAgICAgc2VyaWFsaXplU2luZ2xlRWxlbWVudChCSU5BUllfV1JJVEVSLCBjb2xWYWwpO1xuICAgICAgcmV0dXJuIEJJTkFSWV9XUklURVIub2Zmc2V0O1xuICAgIH0pO1xuICAgIGxldCBpbmRleDtcbiAgICBpZiAoaXNVbmlxdWUgJiYgc2VyaWFsaXplU2luZ2xlUG9pbnQpIHtcbiAgICAgIGNvbnN0IGJhc2UgPSB7XG4gICAgICAgIGZpbmQ6IChjb2xWYWwpID0+IHtcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVTaW5nbGVQb2ludChidWYsIGNvbFZhbCk7XG4gICAgICAgICAgY29uc3QgaXRlcl9pZCA9IHN5cy5kYXRhc3RvcmVfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcbiAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHRhYmxlSXRlcmF0ZU9uZShpdGVyX2lkLCBkZXNlcmlhbGl6ZVJvdyk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZTogKGNvbFZhbCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVNpbmdsZVBvaW50KGJ1ZiwgY29sVmFsKTtcbiAgICAgICAgICBjb25zdCBudW0gPSBzeXMuZGF0YXN0b3JlX2RlbGV0ZV9ieV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxuICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgcG9pbnRfbGVuXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gbnVtID4gMDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGlmIChpc1ByaW1hcnlLZXkpIHtcbiAgICAgICAgYmFzZS51cGRhdGUgPSAocm93KSA9PiB7XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgQklOQVJZX1dSSVRFUi5yZXNldChidWYpO1xuICAgICAgICAgIHNlcmlhbGl6ZVJvdyhCSU5BUllfV1JJVEVSLCByb3cpO1xuICAgICAgICAgIHN5cy5kYXRhc3RvcmVfdXBkYXRlX2JzYXRuKFxuICAgICAgICAgICAgdGFibGVfaWQsXG4gICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICBCSU5BUllfV1JJVEVSLm9mZnNldFxuICAgICAgICAgICk7XG4gICAgICAgICAgaW50ZWdyYXRlR2VuZXJhdGVkQ29sdW1ucz8uKHJvdywgYnVmLnZpZXcpO1xuICAgICAgICAgIHJldHVybiByb3c7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpbmRleCA9IGJhc2U7XG4gICAgfSBlbHNlIGlmIChpc1VuaXF1ZSkge1xuICAgICAgY29uc3QgYmFzZSA9IHtcbiAgICAgICAgZmluZDogKGNvbFZhbCkgPT4ge1xuICAgICAgICAgIGlmIChjb2xWYWwubGVuZ3RoICE9PSBudW1Db2x1bW5zKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwid3JvbmcgbnVtYmVyIG9mIGVsZW1lbnRzXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVQb2ludChidWYsIGNvbFZhbCk7XG4gICAgICAgICAgY29uc3QgaXRlcl9pZCA9IHN5cy5kYXRhc3RvcmVfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcbiAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHRhYmxlSXRlcmF0ZU9uZShpdGVyX2lkLCBkZXNlcmlhbGl6ZVJvdyk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZTogKGNvbFZhbCkgPT4ge1xuICAgICAgICAgIGlmIChjb2xWYWwubGVuZ3RoICE9PSBudW1Db2x1bW5zKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIndyb25nIG51bWJlciBvZiBlbGVtZW50c1wiKTtcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVQb2ludChidWYsIGNvbFZhbCk7XG4gICAgICAgICAgY29uc3QgbnVtID0gc3lzLmRhdGFzdG9yZV9kZWxldGVfYnlfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcbiAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIG51bSA+IDA7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBpZiAoaXNQcmltYXJ5S2V5KSB7XG4gICAgICAgIGJhc2UudXBkYXRlID0gKHJvdykgPT4ge1xuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmKTtcbiAgICAgICAgICBzZXJpYWxpemVSb3coQklOQVJZX1dSSVRFUiwgcm93KTtcbiAgICAgICAgICBzeXMuZGF0YXN0b3JlX3VwZGF0ZV9ic2F0bihcbiAgICAgICAgICAgIHRhYmxlX2lkLFxuICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgQklOQVJZX1dSSVRFUi5vZmZzZXRcbiAgICAgICAgICApO1xuICAgICAgICAgIGludGVncmF0ZUdlbmVyYXRlZENvbHVtbnM/Lihyb3csIGJ1Zi52aWV3KTtcbiAgICAgICAgICByZXR1cm4gcm93O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaW5kZXggPSBiYXNlO1xuICAgIH0gZWxzZSBpZiAoc2VyaWFsaXplU2luZ2xlUG9pbnQpIHtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZVNpbmdsZVJhbmdlID0gIWlzSGFzaEluZGV4ID8gKGJ1ZmZlciwgcmFuZ2UpID0+IHtcbiAgICAgICAgQklOQVJZX1dSSVRFUi5yZXNldChidWZmZXIpO1xuICAgICAgICBjb25zdCB3cml0ZXIgPSBCSU5BUllfV1JJVEVSO1xuICAgICAgICBjb25zdCB3cml0ZUJvdW5kID0gKGJvdW5kKSA9PiB7XG4gICAgICAgICAgY29uc3QgdGFncyA9IHsgaW5jbHVkZWQ6IDAsIGV4Y2x1ZGVkOiAxLCB1bmJvdW5kZWQ6IDIgfTtcbiAgICAgICAgICB3cml0ZXIud3JpdGVVOCh0YWdzW2JvdW5kLnRhZ10pO1xuICAgICAgICAgIGlmIChib3VuZC50YWcgIT09IFwidW5ib3VuZGVkXCIpXG4gICAgICAgICAgICBzZXJpYWxpemVTaW5nbGVFbGVtZW50KHdyaXRlciwgYm91bmQudmFsdWUpO1xuICAgICAgICB9O1xuICAgICAgICB3cml0ZUJvdW5kKHJhbmdlLmZyb20pO1xuICAgICAgICBjb25zdCByc3RhcnRMZW4gPSB3cml0ZXIub2Zmc2V0O1xuICAgICAgICB3cml0ZUJvdW5kKHJhbmdlLnRvKTtcbiAgICAgICAgY29uc3QgcmVuZExlbiA9IHdyaXRlci5vZmZzZXQgLSByc3RhcnRMZW47XG4gICAgICAgIHJldHVybiBbMCwgMCwgcnN0YXJ0TGVuLCByZW5kTGVuXTtcbiAgICAgIH0gOiBudWxsO1xuICAgICAgY29uc3QgcmF3SW5kZXggPSB7XG4gICAgICAgIGZpbHRlcjogKHJhbmdlKSA9PiB7XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgaWYgKHNlcmlhbGl6ZVNpbmdsZVJhbmdlICYmIHJhbmdlIGluc3RhbmNlb2YgUmFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBzZXJpYWxpemVTaW5nbGVSYW5nZShidWYsIHJhbmdlKTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZXJfaWQyID0gc3lzLmRhdGFzdG9yZV9pbmRleF9zY2FuX3JhbmdlX2JzYXRuKFxuICAgICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgICAgLi4uYXJnc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdG9yKGl0ZXJfaWQyLCBkZXNlcmlhbGl6ZVJvdyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVNpbmdsZVBvaW50KGJ1ZiwgcmFuZ2UpO1xuICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXG4gICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICBwb2ludF9sZW5cbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdG9yKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVsZXRlOiAocmFuZ2UpID0+IHtcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICBpZiAoc2VyaWFsaXplU2luZ2xlUmFuZ2UgJiYgcmFuZ2UgaW5zdGFuY2VvZiBSYW5nZSkge1xuICAgICAgICAgICAgY29uc3QgYXJncyA9IHNlcmlhbGl6ZVNpbmdsZVJhbmdlKGJ1ZiwgcmFuZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcmFuZ2VfYnNhdG4oXG4gICAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgICAuLi5hcmdzXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVTaW5nbGVQb2ludChidWYsIHJhbmdlKTtcbiAgICAgICAgICByZXR1cm4gc3lzLmRhdGFzdG9yZV9kZWxldGVfYnlfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcbiAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBpZiAoaXNIYXNoSW5kZXgpIHtcbiAgICAgICAgaW5kZXggPSByYXdJbmRleDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGV4ID0gcmF3SW5kZXg7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0hhc2hJbmRleCkge1xuICAgICAgaW5kZXggPSB7XG4gICAgICAgIGZpbHRlcjogKHJhbmdlKSA9PiB7XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCByYW5nZSk7XG4gICAgICAgICAgY29uc3QgaXRlcl9pZCA9IHN5cy5kYXRhc3RvcmVfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcbiAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHRhYmxlSXRlcmF0b3IoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3cpO1xuICAgICAgICB9LFxuICAgICAgICBkZWxldGU6IChyYW5nZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgcmFuZ2UpO1xuICAgICAgICAgIHJldHVybiBzeXMuZGF0YXN0b3JlX2RlbGV0ZV9ieV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxuICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgcG9pbnRfbGVuXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2VyaWFsaXplUmFuZ2UgPSAoYnVmZmVyLCByYW5nZSkgPT4ge1xuICAgICAgICBpZiAocmFuZ2UubGVuZ3RoID4gbnVtQ29sdW1ucykgdGhyb3cgbmV3IFR5cGVFcnJvcihcInRvbyBtYW55IGVsZW1lbnRzXCIpO1xuICAgICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1ZmZlcik7XG4gICAgICAgIGNvbnN0IHdyaXRlciA9IEJJTkFSWV9XUklURVI7XG4gICAgICAgIGNvbnN0IHByZWZpeF9lbGVtcyA9IHJhbmdlLmxlbmd0aCAtIDE7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlZml4X2VsZW1zOyBpKyspIHtcbiAgICAgICAgICBpbmRleFNlcmlhbGl6ZXJzW2ldKHdyaXRlciwgcmFuZ2VbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJzdGFydE9mZnNldCA9IHdyaXRlci5vZmZzZXQ7XG4gICAgICAgIGNvbnN0IHRlcm0gPSByYW5nZVtyYW5nZS5sZW5ndGggLSAxXTtcbiAgICAgICAgY29uc3Qgc2VyaWFsaXplVGVybSA9IGluZGV4U2VyaWFsaXplcnNbcmFuZ2UubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0ZXJtIGluc3RhbmNlb2YgUmFuZ2UpIHtcbiAgICAgICAgICBjb25zdCB3cml0ZUJvdW5kID0gKGJvdW5kKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0YWdzID0geyBpbmNsdWRlZDogMCwgZXhjbHVkZWQ6IDEsIHVuYm91bmRlZDogMiB9O1xuICAgICAgICAgICAgd3JpdGVyLndyaXRlVTgodGFnc1tib3VuZC50YWddKTtcbiAgICAgICAgICAgIGlmIChib3VuZC50YWcgIT09IFwidW5ib3VuZGVkXCIpIHNlcmlhbGl6ZVRlcm0od3JpdGVyLCBib3VuZC52YWx1ZSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICB3cml0ZUJvdW5kKHRlcm0uZnJvbSk7XG4gICAgICAgICAgY29uc3QgcnN0YXJ0TGVuID0gd3JpdGVyLm9mZnNldCAtIHJzdGFydE9mZnNldDtcbiAgICAgICAgICB3cml0ZUJvdW5kKHRlcm0udG8pO1xuICAgICAgICAgIGNvbnN0IHJlbmRMZW4gPSB3cml0ZXIub2Zmc2V0IC0gcnN0YXJ0TGVuO1xuICAgICAgICAgIHJldHVybiBbcnN0YXJ0T2Zmc2V0LCBwcmVmaXhfZWxlbXMsIHJzdGFydExlbiwgcmVuZExlbl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd3JpdGVyLndyaXRlVTgoMCk7XG4gICAgICAgICAgc2VyaWFsaXplVGVybSh3cml0ZXIsIHRlcm0pO1xuICAgICAgICAgIGNvbnN0IHJzdGFydExlbiA9IHdyaXRlci5vZmZzZXQ7XG4gICAgICAgICAgY29uc3QgcmVuZExlbiA9IDA7XG4gICAgICAgICAgcmV0dXJuIFtyc3RhcnRPZmZzZXQsIHByZWZpeF9lbGVtcywgcnN0YXJ0TGVuLCByZW5kTGVuXTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGluZGV4ID0ge1xuICAgICAgICBmaWx0ZXI6IChyYW5nZSkgPT4ge1xuICAgICAgICAgIGlmIChyYW5nZS5sZW5ndGggPT09IG51bUNvbHVtbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCByYW5nZSk7XG4gICAgICAgICAgICBjb25zdCBpdGVyX2lkID0gc3lzLmRhdGFzdG9yZV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxuICAgICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgICAgcG9pbnRfbGVuXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIHRhYmxlSXRlcmF0b3IoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3cpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBzZXJpYWxpemVSYW5nZShidWYsIHJhbmdlKTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcmFuZ2VfYnNhdG4oXG4gICAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgICAuLi5hcmdzXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIHRhYmxlSXRlcmF0b3IoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZGVsZXRlOiAocmFuZ2UpID0+IHtcbiAgICAgICAgICBpZiAocmFuZ2UubGVuZ3RoID09PSBudW1Db2x1bW5zKSB7XG4gICAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgcmFuZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXG4gICAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgICBwb2ludF9sZW5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgICAgY29uc3QgYXJncyA9IHNlcmlhbGl6ZVJhbmdlKGJ1ZiwgcmFuZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcmFuZ2VfYnNhdG4oXG4gICAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgICAuLi5hcmdzXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5oYXNPd24odGFibGVWaWV3LCBhY2Nlc3Nvck5hbWUpKSB7XG4gICAgICBmcmVlemUoT2JqZWN0LmFzc2lnbih0YWJsZVZpZXdbYWNjZXNzb3JOYW1lXSwgaW5kZXgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFibGVWaWV3W2FjY2Vzc29yTmFtZV0gPSBmcmVlemUoaW5kZXgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZnJlZXplKHRhYmxlVmlldyk7XG59XG5mdW5jdGlvbiogdGFibGVJdGVyYXRvcihpZCwgZGVzZXJpYWxpemUpIHtcbiAgdXNpbmcgaXRlciA9IG5ldyBJdGVyYXRvckhhbmRsZShpZCk7XG4gIGNvbnN0IGl0ZXJCdWYgPSB0YWtlQnVmKCk7XG4gIHRyeSB7XG4gICAgbGV0IGFtdDtcbiAgICB3aGlsZSAoYW10ID0gaXRlci5hZHZhbmNlKGl0ZXJCdWYpKSB7XG4gICAgICBjb25zdCByZWFkZXIgPSBuZXcgQmluYXJ5UmVhZGVyKGl0ZXJCdWYudmlldyk7XG4gICAgICB3aGlsZSAocmVhZGVyLm9mZnNldCA8IGFtdCkge1xuICAgICAgICB5aWVsZCBkZXNlcmlhbGl6ZShyZWFkZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfSBmaW5hbGx5IHtcbiAgICByZXR1cm5CdWYoaXRlckJ1Zik7XG4gIH1cbn1cbmZ1bmN0aW9uIHRhYmxlSXRlcmF0ZU9uZShpZCwgZGVzZXJpYWxpemUpIHtcbiAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gIGNvbnN0IHJldCA9IGFkdmFuY2VJdGVyUmF3KGlkLCBidWYpO1xuICBpZiAocmV0ICE9PSAwKSB7XG4gICAgQklOQVJZX1JFQURFUi5yZXNldChidWYudmlldyk7XG4gICAgcmV0dXJuIGRlc2VyaWFsaXplKEJJTkFSWV9SRUFERVIpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuZnVuY3Rpb24gYWR2YW5jZUl0ZXJSYXcoaWQsIGJ1Zikge1xuICB3aGlsZSAodHJ1ZSkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gMCB8IHN5cy5yb3dfaXRlcl9ic2F0bl9hZHZhbmNlKGlkLCBidWYuYnVmZmVyKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSAmJiB0eXBlb2YgZSA9PT0gXCJvYmplY3RcIiAmJiBoYXNPd24oZSwgXCJfX2J1ZmZlcl90b29fc21hbGxfX1wiKSkge1xuICAgICAgICBidWYuZ3JvdyhlLl9fYnVmZmVyX3Rvb19zbWFsbF9fKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxufVxudmFyIERFRkFVTFRfQlVGRkVSX0NBUEFDSVRZID0gMzIgKiAxMDI0ICogMjtcbnZhciBJVEVSX0JVRlMgPSBbXG4gIG5ldyBSZXNpemFibGVCdWZmZXIoREVGQVVMVF9CVUZGRVJfQ0FQQUNJVFkpXG5dO1xudmFyIElURVJfQlVGX0NPVU5UID0gMTtcbmZ1bmN0aW9uIHRha2VCdWYoKSB7XG4gIHJldHVybiBJVEVSX0JVRl9DT1VOVCA/IElURVJfQlVGU1stLUlURVJfQlVGX0NPVU5UXSA6IG5ldyBSZXNpemFibGVCdWZmZXIoREVGQVVMVF9CVUZGRVJfQ0FQQUNJVFkpO1xufVxuZnVuY3Rpb24gcmV0dXJuQnVmKGJ1Zikge1xuICBJVEVSX0JVRlNbSVRFUl9CVUZfQ09VTlQrK10gPSBidWY7XG59XG52YXIgTEVBRl9CVUYgPSBuZXcgUmVzaXphYmxlQnVmZmVyKERFRkFVTFRfQlVGRkVSX0NBUEFDSVRZKTtcbnZhciBJdGVyYXRvckhhbmRsZSA9IGNsYXNzIF9JdGVyYXRvckhhbmRsZSB7XG4gICNpZDtcbiAgc3RhdGljICNmaW5hbGl6YXRpb25SZWdpc3RyeSA9IG5ldyBGaW5hbGl6YXRpb25SZWdpc3RyeShcbiAgICBzeXMucm93X2l0ZXJfYnNhdG5fY2xvc2VcbiAgKTtcbiAgY29uc3RydWN0b3IoaWQpIHtcbiAgICB0aGlzLiNpZCA9IGlkO1xuICAgIF9JdGVyYXRvckhhbmRsZS4jZmluYWxpemF0aW9uUmVnaXN0cnkucmVnaXN0ZXIodGhpcywgaWQsIHRoaXMpO1xuICB9XG4gIC8qKiBVbnJlZ2lzdGVyIHRoaXMgb2JqZWN0IHdpdGggdGhlIGZpbmFsaXphdGlvbiByZWdpc3RyeSBhbmQgcmV0dXJuIHRoZSBpZCAqL1xuICAjZGV0YWNoKCkge1xuICAgIGNvbnN0IGlkID0gdGhpcy4jaWQ7XG4gICAgdGhpcy4jaWQgPSAtMTtcbiAgICBfSXRlcmF0b3JIYW5kbGUuI2ZpbmFsaXphdGlvblJlZ2lzdHJ5LnVucmVnaXN0ZXIodGhpcyk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIC8qKiBDYWxsIGByb3dfaXRlcl9ic2F0bl9hZHZhbmNlYCwgcmV0dXJuaW5nIDAgaWYgdGhpcyBpdGVyYXRvciBoYXMgYmVlbiBleGhhdXN0ZWQuICovXG4gIGFkdmFuY2UoYnVmKSB7XG4gICAgaWYgKHRoaXMuI2lkID09PSAtMSkgcmV0dXJuIDA7XG4gICAgY29uc3QgcmV0ID0gYWR2YW5jZUl0ZXJSYXcodGhpcy4jaWQsIGJ1Zik7XG4gICAgaWYgKHJldCA8PSAwKSB0aGlzLiNkZXRhY2goKTtcbiAgICByZXR1cm4gcmV0IDwgMCA/IC1yZXQgOiByZXQ7XG4gIH1cbiAgW1N5bWJvbC5kaXNwb3NlXSgpIHtcbiAgICBpZiAodGhpcy4jaWQgPj0gMCkge1xuICAgICAgY29uc3QgaWQgPSB0aGlzLiNkZXRhY2goKTtcbiAgICAgIHN5cy5yb3dfaXRlcl9ic2F0bl9jbG9zZShpZCk7XG4gICAgfVxuICB9XG59O1xuXG4vLyBzcmMvc2VydmVyL2h0dHBfaW50ZXJuYWwudHNcbnZhciB7IGZyZWV6ZTogZnJlZXplMiB9ID0gT2JqZWN0O1xudmFyIHJlcXVlc3RCYXNlU2l6ZSA9IGJzYXRuQmFzZVNpemUoeyB0eXBlczogW10gfSwgSHR0cFJlcXVlc3QuYWxnZWJyYWljVHlwZSk7XG5mdW5jdGlvbiBmZXRjaCh1cmwsIGluaXQgPSB7fSkge1xuICBjb25zdCBtZXRob2QgPSBzZXJpYWxpemVNZXRob2QoaW5pdC5tZXRob2QpO1xuICBjb25zdCBoZWFkZXJzID0gc2VyaWFsaXplSGVhZGVycyhuZXcgSGVhZGVycyhpbml0LmhlYWRlcnMpKTtcbiAgY29uc3QgdXJpID0gXCJcIiArIHVybDtcbiAgY29uc3QgcmVxdWVzdCA9IGZyZWV6ZTIoe1xuICAgIG1ldGhvZCxcbiAgICBoZWFkZXJzLFxuICAgIHRpbWVvdXQ6IGluaXQudGltZW91dCxcbiAgICB1cmksXG4gICAgdmVyc2lvbjogeyB0YWc6IFwiSHR0cDExXCIgfVxuICB9KTtcbiAgY29uc3QgcmVxdWVzdEJ1ZiA9IG5ldyBCaW5hcnlXcml0ZXIocmVxdWVzdEJhc2VTaXplKTtcbiAgSHR0cFJlcXVlc3Quc2VyaWFsaXplKHJlcXVlc3RCdWYsIHJlcXVlc3QpO1xuICBjb25zdCBib2R5ID0gaW5pdC5ib2R5ID09IG51bGwgPyBuZXcgVWludDhBcnJheSgpIDogdHlwZW9mIGluaXQuYm9keSA9PT0gXCJzdHJpbmdcIiA/IGluaXQuYm9keSA6IG5ldyBVaW50OEFycmF5KGluaXQuYm9keSk7XG4gIGNvbnN0IFtyZXNwb25zZUJ1ZiwgcmVzcG9uc2VCb2R5XSA9IHN5cy5wcm9jZWR1cmVfaHR0cF9yZXF1ZXN0KFxuICAgIHJlcXVlc3RCdWYuZ2V0QnVmZmVyKCksXG4gICAgYm9keVxuICApO1xuICBjb25zdCByZXNwb25zZSA9IEh0dHBSZXNwb25zZS5kZXNlcmlhbGl6ZShuZXcgQmluYXJ5UmVhZGVyKHJlc3BvbnNlQnVmKSk7XG4gIHJldHVybiBTeW5jUmVzcG9uc2VbbWFrZVJlc3BvbnNlXShyZXNwb25zZUJvZHksIHtcbiAgICB0eXBlOiBcImJhc2ljXCIsXG4gICAgdXJsOiB1cmksXG4gICAgc3RhdHVzOiByZXNwb25zZS5jb2RlLFxuICAgIHN0YXR1c1RleHQ6ICgwLCBpbXBvcnRfc3RhdHVzZXMuZGVmYXVsdCkocmVzcG9uc2UuY29kZSksXG4gICAgaGVhZGVyczogZGVzZXJpYWxpemVIZWFkZXJzKHJlc3BvbnNlLmhlYWRlcnMpLFxuICAgIGFib3J0ZWQ6IGZhbHNlLFxuICAgIHZlcnNpb246IHJlc3BvbnNlLnZlcnNpb25cbiAgfSk7XG59XG5mcmVlemUyKGZldGNoKTtcbnZhciBodHRwQ2xpZW50ID0gZnJlZXplMih7IGZldGNoIH0pO1xuXG4vLyBzcmMvc2VydmVyL3Byb2NlZHVyZXMudHNcbmZ1bmN0aW9uIG1ha2VQcm9jZWR1cmVFeHBvcnQoY3R4LCBvcHRzLCBwYXJhbXMsIHJldCwgZm4pIHtcbiAgY29uc3QgbmFtZSA9IG9wdHM/Lm5hbWU7XG4gIGNvbnN0IHByb2NlZHVyZUV4cG9ydCA9ICguLi5hcmdzKSA9PiBmbiguLi5hcmdzKTtcbiAgcHJvY2VkdXJlRXhwb3J0W2V4cG9ydENvbnRleHRdID0gY3R4O1xuICBwcm9jZWR1cmVFeHBvcnRbcmVnaXN0ZXJFeHBvcnRdID0gKGN0eDIsIGV4cG9ydE5hbWUpID0+IHtcbiAgICByZWdpc3RlclByb2NlZHVyZShjdHgyLCBuYW1lID8/IGV4cG9ydE5hbWUsIHBhcmFtcywgcmV0LCBmbik7XG4gICAgY3R4Mi5mdW5jdGlvbkV4cG9ydHMuc2V0KFxuICAgICAgcHJvY2VkdXJlRXhwb3J0LFxuICAgICAgbmFtZSA/PyBleHBvcnROYW1lXG4gICAgKTtcbiAgfTtcbiAgcmV0dXJuIHByb2NlZHVyZUV4cG9ydDtcbn1cbnZhciBUcmFuc2FjdGlvbkN0eEltcGwgPSBjbGFzcyBUcmFuc2FjdGlvbkN0eCBleHRlbmRzIFJlZHVjZXJDdHhJbXBsIHtcbn07XG5mdW5jdGlvbiByZWdpc3RlclByb2NlZHVyZShjdHgsIGV4cG9ydE5hbWUsIHBhcmFtcywgcmV0LCBmbiwgb3B0cykge1xuICBjdHguZGVmaW5lRnVuY3Rpb24oZXhwb3J0TmFtZSk7XG4gIGNvbnN0IHBhcmFtc1R5cGUgPSB7XG4gICAgZWxlbWVudHM6IE9iamVjdC5lbnRyaWVzKHBhcmFtcykubWFwKChbbiwgY10pID0+ICh7XG4gICAgICBuYW1lOiBuLFxuICAgICAgYWxnZWJyYWljVHlwZTogY3R4LnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseShcbiAgICAgICAgXCJ0eXBlQnVpbGRlclwiIGluIGMgPyBjLnR5cGVCdWlsZGVyIDogY1xuICAgICAgKS5hbGdlYnJhaWNUeXBlXG4gICAgfSkpXG4gIH07XG4gIGNvbnN0IHJldHVyblR5cGUgPSBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHJldCkuYWxnZWJyYWljVHlwZTtcbiAgY3R4Lm1vZHVsZURlZi5wcm9jZWR1cmVzLnB1c2goe1xuICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXG4gICAgcGFyYW1zOiBwYXJhbXNUeXBlLFxuICAgIHJldHVyblR5cGUsXG4gICAgdmlzaWJpbGl0eTogRnVuY3Rpb25WaXNpYmlsaXR5LkNsaWVudENhbGxhYmxlXG4gIH0pO1xuICBjb25zdCB7IHR5cGVzcGFjZSB9ID0gY3R4O1xuICBjdHgucHJvY2VkdXJlcy5wdXNoKHtcbiAgICBmbixcbiAgICBkZXNlcmlhbGl6ZUFyZ3M6IFByb2R1Y3RUeXBlLm1ha2VEZXNlcmlhbGl6ZXIocGFyYW1zVHlwZSwgdHlwZXNwYWNlKSxcbiAgICBzZXJpYWxpemVSZXR1cm46IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIocmV0dXJuVHlwZSwgdHlwZXNwYWNlKSxcbiAgICByZXR1cm5UeXBlQmFzZVNpemU6IGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCByZXR1cm5UeXBlKVxuICB9KTtcbn1cbmZ1bmN0aW9uIGNhbGxQcm9jZWR1cmUobW9kdWxlQ3R4LCBpZCwgc2VuZGVyLCBjb25uZWN0aW9uSWQsIHRpbWVzdGFtcCwgYXJnc0J1ZiwgZGJWaWV3KSB7XG4gIGNvbnN0IHsgZm4sIGRlc2VyaWFsaXplQXJncywgc2VyaWFsaXplUmV0dXJuLCByZXR1cm5UeXBlQmFzZVNpemUgfSA9IG1vZHVsZUN0eC5wcm9jZWR1cmVzW2lkXTtcbiAgY29uc3QgYXJncyA9IGRlc2VyaWFsaXplQXJncyhuZXcgQmluYXJ5UmVhZGVyKGFyZ3NCdWYpKTtcbiAgY29uc3QgY3R4ID0gbmV3IFByb2NlZHVyZUN0eEltcGwoXG4gICAgc2VuZGVyLFxuICAgIHRpbWVzdGFtcCxcbiAgICBjb25uZWN0aW9uSWQsXG4gICAgZGJWaWV3XG4gICk7XG4gIGNvbnN0IHJldCA9IGNhbGxVc2VyRnVuY3Rpb24oZm4sIGN0eCwgYXJncyk7XG4gIGNvbnN0IHJldEJ1ZiA9IG5ldyBCaW5hcnlXcml0ZXIocmV0dXJuVHlwZUJhc2VTaXplKTtcbiAgc2VyaWFsaXplUmV0dXJuKHJldEJ1ZiwgcmV0KTtcbiAgcmV0dXJuIHJldEJ1Zi5nZXRCdWZmZXIoKTtcbn1cbnZhciBQcm9jZWR1cmVDdHhJbXBsID0gY2xhc3MgUHJvY2VkdXJlQ3R4IHtcbiAgY29uc3RydWN0b3Ioc2VuZGVyLCB0aW1lc3RhbXAsIGNvbm5lY3Rpb25JZCwgZGJWaWV3KSB7XG4gICAgdGhpcy5zZW5kZXIgPSBzZW5kZXI7XG4gICAgdGhpcy50aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4gICAgdGhpcy5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XG4gICAgdGhpcy4jZGJWaWV3ID0gZGJWaWV3O1xuICB9XG4gICNpZGVudGl0eTtcbiAgI3V1aWRDb3VudGVyO1xuICAjcmFuZG9tO1xuICAjZGJWaWV3O1xuICBnZXQgZGF0YWJhc2VJZGVudGl0eSgpIHtcbiAgICByZXR1cm4gdGhpcy4jaWRlbnRpdHkgPz89IG5ldyBJZGVudGl0eShzeXMuaWRlbnRpdHkoKSk7XG4gIH1cbiAgZ2V0IGlkZW50aXR5KCkge1xuICAgIHJldHVybiB0aGlzLmRhdGFiYXNlSWRlbnRpdHk7XG4gIH1cbiAgZ2V0IHJhbmRvbSgpIHtcbiAgICByZXR1cm4gdGhpcy4jcmFuZG9tID8/PSBtYWtlUmFuZG9tKHRoaXMudGltZXN0YW1wKTtcbiAgfVxuICBnZXQgaHR0cCgpIHtcbiAgICByZXR1cm4gaHR0cENsaWVudDtcbiAgfVxuICB3aXRoVHgoYm9keSkge1xuICAgIHJldHVybiBydW5XaXRoVHgoXG4gICAgICAodGltZXN0YW1wKSA9PiBuZXcgVHJhbnNhY3Rpb25DdHhJbXBsKFxuICAgICAgICB0aGlzLnNlbmRlcixcbiAgICAgICAgdGltZXN0YW1wLFxuICAgICAgICB0aGlzLmNvbm5lY3Rpb25JZCxcbiAgICAgICAgdGhpcy4jZGJWaWV3KClcbiAgICAgICksXG4gICAgICBib2R5XG4gICAgKTtcbiAgfVxuICBuZXdVdWlkVjQoKSB7XG4gICAgY29uc3QgYnl0ZXMgPSB0aGlzLnJhbmRvbS5maWxsKG5ldyBVaW50OEFycmF5KDE2KSk7XG4gICAgcmV0dXJuIFV1aWQuZnJvbVJhbmRvbUJ5dGVzVjQoYnl0ZXMpO1xuICB9XG4gIG5ld1V1aWRWNygpIHtcbiAgICBjb25zdCBieXRlcyA9IHRoaXMucmFuZG9tLmZpbGwobmV3IFVpbnQ4QXJyYXkoNCkpO1xuICAgIGNvbnN0IGNvdW50ZXIgPSB0aGlzLiN1dWlkQ291bnRlciA/Pz0geyB2YWx1ZTogMCB9O1xuICAgIHJldHVybiBVdWlkLmZyb21Db3VudGVyVjcoY291bnRlciwgdGhpcy50aW1lc3RhbXAsIGJ5dGVzKTtcbiAgfVxufTtcblxuLy8gc3JjL3NlcnZlci9yZWR1Y2Vycy50c1xuZnVuY3Rpb24gbWFrZVJlZHVjZXJFeHBvcnQoY3R4LCBvcHRzLCBwYXJhbXMsIGZuLCBsaWZlY3ljbGUpIHtcbiAgY29uc3QgcmVkdWNlckV4cG9ydCA9ICguLi5hcmdzKSA9PiBmbiguLi5hcmdzKTtcbiAgcmVkdWNlckV4cG9ydFtleHBvcnRDb250ZXh0XSA9IGN0eDtcbiAgcmVkdWNlckV4cG9ydFtyZWdpc3RlckV4cG9ydF0gPSAoY3R4MiwgZXhwb3J0TmFtZSkgPT4ge1xuICAgIHJlZ2lzdGVyUmVkdWNlcihjdHgyLCBleHBvcnROYW1lLCBwYXJhbXMsIGZuLCBvcHRzLCBsaWZlY3ljbGUpO1xuICAgIGN0eDIuZnVuY3Rpb25FeHBvcnRzLnNldChcbiAgICAgIHJlZHVjZXJFeHBvcnQsXG4gICAgICBleHBvcnROYW1lXG4gICAgKTtcbiAgfTtcbiAgcmV0dXJuIHJlZHVjZXJFeHBvcnQ7XG59XG5mdW5jdGlvbiByZWdpc3RlclJlZHVjZXIoY3R4LCBleHBvcnROYW1lLCBwYXJhbXMsIGZuLCBvcHRzLCBsaWZlY3ljbGUpIHtcbiAgY3R4LmRlZmluZUZ1bmN0aW9uKGV4cG9ydE5hbWUpO1xuICBpZiAoIShwYXJhbXMgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSkge1xuICAgIHBhcmFtcyA9IG5ldyBSb3dCdWlsZGVyKHBhcmFtcyk7XG4gIH1cbiAgaWYgKHBhcmFtcy50eXBlTmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgcGFyYW1zLnR5cGVOYW1lID0gdG9QYXNjYWxDYXNlKGV4cG9ydE5hbWUpO1xuICB9XG4gIGNvbnN0IHJlZiA9IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocGFyYW1zKTtcbiAgY29uc3QgcGFyYW1zVHlwZSA9IGN0eC5yZXNvbHZlVHlwZShyZWYpLnZhbHVlO1xuICBjb25zdCBpc0xpZmVjeWNsZSA9IGxpZmVjeWNsZSAhPSBudWxsO1xuICBjdHgubW9kdWxlRGVmLnJlZHVjZXJzLnB1c2goe1xuICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXG4gICAgcGFyYW1zOiBwYXJhbXNUeXBlLFxuICAgIC8vTW9kdWxlRGVmIHZhbGlkYXRpb24gY29kZSBpcyByZXNwb25zaWJsZSB0byBtYXJrIHByaXZhdGUgcmVkdWNlcnNcbiAgICB2aXNpYmlsaXR5OiBGdW5jdGlvblZpc2liaWxpdHkuQ2xpZW50Q2FsbGFibGUsXG4gICAgLy9IYXJkY29kZWQgZm9yIG5vdyAtIHJlZHVjZXJzIGRvIG5vdCByZXR1cm4gdmFsdWVzIHlldFxuICAgIG9rUmV0dXJuVHlwZTogQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHsgZWxlbWVudHM6IFtdIH0pLFxuICAgIGVyclJldHVyblR5cGU6IEFsZ2VicmFpY1R5cGUuU3RyaW5nXG4gIH0pO1xuICBpZiAob3B0cz8ubmFtZSAhPSBudWxsKSB7XG4gICAgY3R4Lm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaCh7XG4gICAgICB0YWc6IFwiRnVuY3Rpb25cIixcbiAgICAgIHZhbHVlOiB7XG4gICAgICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXG4gICAgICAgIGNhbm9uaWNhbE5hbWU6IG9wdHMubmFtZVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGlmIChpc0xpZmVjeWNsZSkge1xuICAgIGN0eC5tb2R1bGVEZWYubGlmZUN5Y2xlUmVkdWNlcnMucHVzaCh7XG4gICAgICBsaWZlY3ljbGVTcGVjOiBsaWZlY3ljbGUsXG4gICAgICBmdW5jdGlvbk5hbWU6IGV4cG9ydE5hbWVcbiAgICB9KTtcbiAgfVxuICBpZiAoIWZuLm5hbWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIFwibmFtZVwiLCB7IHZhbHVlOiBleHBvcnROYW1lLCB3cml0YWJsZTogZmFsc2UgfSk7XG4gIH1cbiAgY3R4LnJlZHVjZXJzLnB1c2goZm4pO1xufVxuXG4vLyBzcmMvc2VydmVyL3NjaGVtYS50c1xudmFyIFNjaGVtYUlubmVyID0gY2xhc3MgZXh0ZW5kcyBNb2R1bGVDb250ZXh0IHtcbiAgc2NoZW1hVHlwZTtcbiAgZXhpc3RpbmdGdW5jdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICBleGlzdGluZ0h0dHBIYW5kbGVycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIHJlZHVjZXJzID0gW107XG4gIHByb2NlZHVyZXMgPSBbXTtcbiAgdmlld3MgPSBbXTtcbiAgYW5vblZpZXdzID0gW107XG4gIGh0dHBIYW5kbGVycyA9IFtdO1xuICAvKipcbiAgICogTWFwcyBSZWR1Y2VyRXhwb3J0IG9iamVjdHMgdG8gdGhlIG5hbWUgb2YgdGhlIHJlZHVjZXIuXG4gICAqIFVzZWQgZm9yIHJlc29sdmluZyB0aGUgcmVkdWNlcnMgb2Ygc2NoZWR1bGVkIHRhYmxlcy5cbiAgICovXG4gIGZ1bmN0aW9uRXhwb3J0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIGh0dHBIYW5kbGVyRXhwb3J0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIHBlbmRpbmdTY2hlZHVsZXMgPSBbXTtcbiAgcGVuZGluZ0h0dHBSb3V0ZXMgPSBbXTtcbiAgY29uc3RydWN0b3IoZ2V0U2NoZW1hVHlwZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zY2hlbWFUeXBlID0gZ2V0U2NoZW1hVHlwZSh0aGlzKTtcbiAgfVxuICBkZWZpbmVGdW5jdGlvbihuYW1lKSB7XG4gICAgaWYgKHRoaXMuZXhpc3RpbmdGdW5jdGlvbnMuaGFzKG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBgVGhlcmUgaXMgYWxyZWFkeSBhIHJlZHVjZXIsIHByb2NlZHVyZSwgb3IgdmlldyB3aXRoIHRoZSBuYW1lICcke25hbWV9J2BcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuZXhpc3RpbmdGdW5jdGlvbnMuYWRkKG5hbWUpO1xuICB9XG4gIGRlZmluZUh0dHBIYW5kbGVyKG5hbWUpIHtcbiAgICBpZiAodGhpcy5leGlzdGluZ0h0dHBIYW5kbGVycy5oYXMobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgIGBUaGVyZSBpcyBhbHJlYWR5IGFuIEhUVFAgaGFuZGxlciB3aXRoIHRoZSBuYW1lICcke25hbWV9J2BcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuZXhpc3RpbmdIdHRwSGFuZGxlcnMuYWRkKG5hbWUpO1xuICB9XG4gIHJlc29sdmVTY2hlZHVsZXMoKSB7XG4gICAgZm9yIChjb25zdCB7IHJlZHVjZXIsIHNjaGVkdWxlQXRDb2wsIHRhYmxlTmFtZSB9IG9mIHRoaXMucGVuZGluZ1NjaGVkdWxlcykge1xuICAgICAgY29uc3QgZnVuY3Rpb25OYW1lID0gdGhpcy5mdW5jdGlvbkV4cG9ydHMuZ2V0KHJlZHVjZXIoKSk7XG4gICAgICBpZiAoZnVuY3Rpb25OYW1lID09PSB2b2lkIDApIHtcbiAgICAgICAgY29uc3QgbXNnID0gYFRhYmxlICR7dGFibGVOYW1lfSBkZWZpbmVzIGEgc2NoZWR1bGUsIGJ1dCBpdCBzZWVtcyBsaWtlIHRoZSBhc3NvY2lhdGVkIGZ1bmN0aW9uIHdhcyBub3QgZXhwb3J0ZWQuYDtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgdGhpcy5tb2R1bGVEZWYuc2NoZWR1bGVzLnB1c2goe1xuICAgICAgICBzb3VyY2VOYW1lOiB2b2lkIDAsXG4gICAgICAgIHRhYmxlTmFtZSxcbiAgICAgICAgc2NoZWR1bGVBdENvbCxcbiAgICAgICAgZnVuY3Rpb25OYW1lXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgcmVzb2x2ZUh0dHBSb3V0ZXMoKSB7XG4gICAgZm9yIChjb25zdCByb3V0ZSBvZiB0aGlzLnBlbmRpbmdIdHRwUm91dGVzKSB7XG4gICAgICBjb25zdCBoYW5kbGVyRnVuY3Rpb24gPSB0aGlzLmh0dHBIYW5kbGVyRXhwb3J0cy5nZXQocm91dGUuaGFuZGxlcik7XG4gICAgICBpZiAoaGFuZGxlckZ1bmN0aW9uID09PSB2b2lkIDApIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBgSFRUUCByb3V0ZSBmb3IgcGF0aCAnJHtyb3V0ZS5wYXRofScgcmVmZXJzIHRvIGEgaGFuZGxlciB0aGF0IHdhcyBub3QgZXhwb3J0ZWQuYFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy5tb2R1bGVEZWYuaHR0cFJvdXRlcy5wdXNoKHtcbiAgICAgICAgaGFuZGxlckZ1bmN0aW9uLFxuICAgICAgICBtZXRob2Q6IHJvdXRlLm1ldGhvZCxcbiAgICAgICAgcGF0aDogcm91dGUucGF0aFxuICAgICAgfSk7XG4gICAgfVxuICB9XG59O1xudmFyIFNjaGVtYSA9IGNsYXNzIHtcbiAgI2N0eDtcbiAgY29uc3RydWN0b3IoY3R4KSB7XG4gICAgdGhpcy4jY3R4ID0gY3R4O1xuICB9XG4gIFttb2R1bGVIb29rc10oZXhwb3J0cykge1xuICAgIGNvbnN0IHJlZ2lzdGVyZWRTY2hlbWEgPSB0aGlzLiNjdHg7XG4gICAgZm9yIChjb25zdCBbbmFtZSwgbW9kdWxlRXhwb3J0XSBvZiBPYmplY3QuZW50cmllcyhleHBvcnRzKSkge1xuICAgICAgaWYgKG5hbWUgPT09IFwiZGVmYXVsdFwiKSBjb250aW51ZTtcbiAgICAgIGlmICghaXNNb2R1bGVFeHBvcnQobW9kdWxlRXhwb3J0KSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiZXhwb3J0aW5nIHNvbWV0aGluZyB0aGF0IGlzIG5vdCBhIHNwYWNldGltZSBleHBvcnRcIlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgY2hlY2tFeHBvcnRDb250ZXh0KG1vZHVsZUV4cG9ydCwgcmVnaXN0ZXJlZFNjaGVtYSk7XG4gICAgICBtb2R1bGVFeHBvcnRbcmVnaXN0ZXJFeHBvcnRdKHJlZ2lzdGVyZWRTY2hlbWEsIG5hbWUpO1xuICAgIH1cbiAgICByZWdpc3RlcmVkU2NoZW1hLnJlc29sdmVTY2hlZHVsZXMoKTtcbiAgICByZWdpc3RlcmVkU2NoZW1hLnJlc29sdmVIdHRwUm91dGVzKCk7XG4gICAgcmV0dXJuIG1ha2VIb29rcyhyZWdpc3RlcmVkU2NoZW1hKTtcbiAgfVxuICBnZXQgc2NoZW1hVHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy4jY3R4LnNjaGVtYVR5cGU7XG4gIH1cbiAgZ2V0IG1vZHVsZURlZigpIHtcbiAgICByZXR1cm4gdGhpcy4jY3R4Lm1vZHVsZURlZjtcbiAgfVxuICBnZXQgdHlwZXNwYWNlKCkge1xuICAgIHJldHVybiB0aGlzLiNjdHgudHlwZXNwYWNlO1xuICB9XG4gIHJlZHVjZXIoLi4uYXJncykge1xuICAgIGxldCBvcHRzLCBwYXJhbXMgPSB7fSwgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBbZm5dID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6IHtcbiAgICAgICAgbGV0IGFyZzE7XG4gICAgICAgIFthcmcxLCBmbl0gPSBhcmdzO1xuICAgICAgICBpZiAodHlwZW9mIGFyZzEubmFtZSA9PT0gXCJzdHJpbmdcIikgb3B0cyA9IGFyZzE7XG4gICAgICAgIGVsc2UgcGFyYW1zID0gYXJnMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIDM6XG4gICAgICAgIFtvcHRzLCBwYXJhbXMsIGZuXSA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZVJlZHVjZXJFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCBwYXJhbXMsIGZuKTtcbiAgfVxuICBpbml0KC4uLmFyZ3MpIHtcbiAgICBsZXQgb3B0cywgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBbZm5dID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIFtvcHRzLCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG1ha2VSZWR1Y2VyRXhwb3J0KHRoaXMuI2N0eCwgb3B0cywge30sIGZuLCBMaWZlY3ljbGUuSW5pdCk7XG4gIH1cbiAgY2xpZW50Q29ubmVjdGVkKC4uLmFyZ3MpIHtcbiAgICBsZXQgb3B0cywgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBbZm5dID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIFtvcHRzLCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG1ha2VSZWR1Y2VyRXhwb3J0KHRoaXMuI2N0eCwgb3B0cywge30sIGZuLCBMaWZlY3ljbGUuT25Db25uZWN0KTtcbiAgfVxuICBjbGllbnREaXNjb25uZWN0ZWQoLi4uYXJncykge1xuICAgIGxldCBvcHRzLCBmbjtcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIFtmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgW29wdHMsIGZuXSA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZVJlZHVjZXJFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCB7fSwgZm4sIExpZmVjeWNsZS5PbkRpc2Nvbm5lY3QpO1xuICB9XG4gIHZpZXcob3B0cywgcmV0LCBmbikge1xuICAgIHJldHVybiBtYWtlVmlld0V4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHt9LCByZXQsIGZuKTtcbiAgfVxuICAvLyBUT0RPOiByZS1lbmFibGUgb25jZSBwYXJhbWV0ZXJpemVkIHZpZXdzIGFyZSBzdXBwb3J0ZWQgaW4gU1FMXG4gIC8vIHZpZXc8UmV0IGV4dGVuZHMgVmlld1JldHVyblR5cGVCdWlsZGVyPihcbiAgLy8gICBvcHRzOiBWaWV3T3B0cyxcbiAgLy8gICByZXQ6IFJldCxcbiAgLy8gICBmbjogVmlld0ZuPFMsIHt9LCBSZXQ+XG4gIC8vICk6IHZvaWQ7XG4gIC8vIHZpZXc8UGFyYW1zIGV4dGVuZHMgUGFyYW1zT2JqLCBSZXQgZXh0ZW5kcyBWaWV3UmV0dXJuVHlwZUJ1aWxkZXI+KFxuICAvLyAgIG9wdHM6IFZpZXdPcHRzLFxuICAvLyAgIHBhcmFtczogUGFyYW1zLFxuICAvLyAgIHJldDogUmV0LFxuICAvLyAgIGZuOiBWaWV3Rm48Uywge30sIFJldD5cbiAgLy8gKTogdm9pZDtcbiAgLy8gdmlldzxQYXJhbXMgZXh0ZW5kcyBQYXJhbXNPYmosIFJldCBleHRlbmRzIFZpZXdSZXR1cm5UeXBlQnVpbGRlcj4oXG4gIC8vICAgb3B0czogVmlld09wdHMsXG4gIC8vICAgcGFyYW1zT3JSZXQ6IFJldCB8IFBhcmFtcyxcbiAgLy8gICByZXRPckZuOiBWaWV3Rm48Uywge30sIFJldD4gfCBSZXQsXG4gIC8vICAgbWF5YmVGbj86IFZpZXdGbjxTLCBQYXJhbXMsIFJldD5cbiAgLy8gKTogdm9pZCB7XG4gIC8vICAgaWYgKHR5cGVvZiByZXRPckZuID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vICAgICBkZWZpbmVWaWV3KG5hbWUsIGZhbHNlLCB7fSwgcGFyYW1zT3JSZXQgYXMgUmV0LCByZXRPckZuKTtcbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgZGVmaW5lVmlldyhuYW1lLCBmYWxzZSwgcGFyYW1zT3JSZXQgYXMgUGFyYW1zLCByZXRPckZuLCBtYXliZUZuISk7XG4gIC8vICAgfVxuICAvLyB9XG4gIGFub255bW91c1ZpZXcob3B0cywgcmV0LCBmbikge1xuICAgIHJldHVybiBtYWtlQW5vblZpZXdFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCB7fSwgcmV0LCBmbik7XG4gIH1cbiAgcHJvY2VkdXJlKC4uLmFyZ3MpIHtcbiAgICBsZXQgb3B0cywgcGFyYW1zID0ge30sIHJldCwgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAyOlxuICAgICAgICBbcmV0LCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzoge1xuICAgICAgICBsZXQgYXJnMTtcbiAgICAgICAgW2FyZzEsIHJldCwgZm5dID0gYXJncztcbiAgICAgICAgaWYgKHR5cGVvZiBhcmcxLm5hbWUgPT09IFwic3RyaW5nXCIpIG9wdHMgPSBhcmcxO1xuICAgICAgICBlbHNlIHBhcmFtcyA9IGFyZzE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSA0OlxuICAgICAgICBbb3B0cywgcGFyYW1zLCByZXQsIGZuXSA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZVByb2NlZHVyZUV4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHBhcmFtcywgcmV0LCBmbik7XG4gIH1cbiAgaHR0cEhhbmRsZXIoLi4uYXJncykge1xuICAgIGxldCBvcHRzLCBmbjtcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIFtmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgW29wdHMsIGZuXSA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZUh0dHBIYW5kbGVyRXhwb3J0KHRoaXMuI2N0eCwgb3B0cywgZm4pO1xuICB9XG4gIGh0dHBSb3V0ZXIocm91dGVyKSB7XG4gICAgcmV0dXJuIG1ha2VIdHRwUm91dGVyRXhwb3J0KHRoaXMuI2N0eCwgcm91dGVyKTtcbiAgfVxuICAvKipcbiAgICogQnVuZGxlIG11bHRpcGxlIHJlZHVjZXJzLCBwcm9jZWR1cmVzLCBldGMgaW50byBvbmUgdmFsdWUgdG8gZXhwb3J0LlxuICAgKiBUaGUgbmFtZSB0aGV5IHdpbGwgYmUgZXhwb3J0ZWQgd2l0aCBpcyB0aGVpciBjb3JyZXNwb25kaW5nIGtleSBpbiB0aGUgYGV4cG9ydHNgIGFyZ3VtZW50LlxuICAgKi9cbiAgZXhwb3J0R3JvdXAoZXhwb3J0cykge1xuICAgIHJldHVybiB7XG4gICAgICBbZXhwb3J0Q29udGV4dF06IHRoaXMuI2N0eCxcbiAgICAgIFtyZWdpc3RlckV4cG9ydF0oY3R4LCBfZXhwb3J0TmFtZSkge1xuICAgICAgICBmb3IgKGNvbnN0IFtleHBvcnROYW1lLCBtb2R1bGVFeHBvcnRdIG9mIE9iamVjdC5lbnRyaWVzKGV4cG9ydHMpKSB7XG4gICAgICAgICAgY2hlY2tFeHBvcnRDb250ZXh0KG1vZHVsZUV4cG9ydCwgY3R4KTtcbiAgICAgICAgICBtb2R1bGVFeHBvcnRbcmVnaXN0ZXJFeHBvcnRdKGN0eCwgZXhwb3J0TmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIGNsaWVudFZpc2liaWxpdHlGaWx0ZXIgPSB7XG4gICAgc3FsOiAoZmlsdGVyKSA9PiAoe1xuICAgICAgW2V4cG9ydENvbnRleHRdOiB0aGlzLiNjdHgsXG4gICAgICBbcmVnaXN0ZXJFeHBvcnRdKGN0eCwgX2V4cG9ydE5hbWUpIHtcbiAgICAgICAgY3R4Lm1vZHVsZURlZi5yb3dMZXZlbFNlY3VyaXR5LnB1c2goeyBzcWw6IGZpbHRlciB9KTtcbiAgICAgIH1cbiAgICB9KVxuICB9O1xufTtcbnZhciByZWdpc3RlckV4cG9ydCA9IFN5bWJvbChcIlNwYWNldGltZURCLnJlZ2lzdGVyRXhwb3J0XCIpO1xudmFyIGV4cG9ydENvbnRleHQgPSBTeW1ib2woXCJTcGFjZXRpbWVEQi5leHBvcnRDb250ZXh0XCIpO1xuZnVuY3Rpb24gaXNNb2R1bGVFeHBvcnQoeCkge1xuICByZXR1cm4gKHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHggPT09IFwib2JqZWN0XCIpICYmIHggIT09IG51bGwgJiYgcmVnaXN0ZXJFeHBvcnQgaW4geDtcbn1cbmZ1bmN0aW9uIGNoZWNrRXhwb3J0Q29udGV4dChleHAsIHNjaGVtYTIpIHtcbiAgaWYgKGV4cFtleHBvcnRDb250ZXh0XSAhPSBudWxsICYmIGV4cFtleHBvcnRDb250ZXh0XSAhPT0gc2NoZW1hMikge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJtdWx0aXBsZSBzY2hlbWFzIGFyZSBub3Qgc3VwcG9ydGVkXCIpO1xuICB9XG59XG5mdW5jdGlvbiBzY2hlbWEodGFibGVzLCBtb2R1bGVTZXR0aW5ncykge1xuICBjb25zdCBjdHggPSBuZXcgU2NoZW1hSW5uZXIoKGN0eDIpID0+IHtcbiAgICBpZiAobW9kdWxlU2V0dGluZ3M/LkNBU0VfQ09OVkVSU0lPTl9QT0xJQ1kgIT0gbnVsbCkge1xuICAgICAgY3R4Mi5zZXRDYXNlQ29udmVyc2lvblBvbGljeShtb2R1bGVTZXR0aW5ncy5DQVNFX0NPTlZFUlNJT05fUE9MSUNZKTtcbiAgICB9XG4gICAgY29uc3QgdGFibGVTY2hlbWFzID0ge307XG4gICAgZm9yIChjb25zdCBbYWNjTmFtZSwgdGFibGUyXSBvZiBPYmplY3QuZW50cmllcyh0YWJsZXMpKSB7XG4gICAgICBjb25zdCB0YWJsZURlZiA9IHRhYmxlMi50YWJsZURlZihjdHgyLCBhY2NOYW1lKTtcbiAgICAgIHRhYmxlU2NoZW1hc1thY2NOYW1lXSA9IHRhYmxlVG9TY2hlbWEoYWNjTmFtZSwgdGFibGUyLCB0YWJsZURlZik7XG4gICAgICBjdHgyLm1vZHVsZURlZi50YWJsZXMucHVzaCh0YWJsZURlZik7XG4gICAgICBpZiAodGFibGUyLnNjaGVkdWxlKSB7XG4gICAgICAgIGN0eDIucGVuZGluZ1NjaGVkdWxlcy5wdXNoKHtcbiAgICAgICAgICAuLi50YWJsZTIuc2NoZWR1bGUsXG4gICAgICAgICAgdGFibGVOYW1lOiB0YWJsZURlZi5zb3VyY2VOYW1lXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKHRhYmxlMi50YWJsZU5hbWUpIHtcbiAgICAgICAgY3R4Mi5tb2R1bGVEZWYuZXhwbGljaXROYW1lcy5lbnRyaWVzLnB1c2goe1xuICAgICAgICAgIHRhZzogXCJUYWJsZVwiLFxuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBzb3VyY2VOYW1lOiBhY2NOYW1lLFxuICAgICAgICAgICAgY2Fub25pY2FsTmFtZTogdGFibGUyLnRhYmxlTmFtZVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IHRhYmxlczogdGFibGVTY2hlbWFzIH07XG4gIH0pO1xuICByZXR1cm4gbmV3IFNjaGVtYShjdHgpO1xufVxuXG4vLyBzcmMvc2VydmVyL2NvbnNvbGUudHNcbnZhciBpbXBvcnRfb2JqZWN0X2luc3BlY3QgPSBfX3RvRVNNKHJlcXVpcmVfb2JqZWN0X2luc3BlY3QoKSk7XG52YXIgZm10TG9nID0gKC4uLmRhdGEpID0+IGRhdGEubWFwKCh4KSA9PiB0eXBlb2YgeCA9PT0gXCJzdHJpbmdcIiA/IHggOiAoMCwgaW1wb3J0X29iamVjdF9pbnNwZWN0LmRlZmF1bHQpKHgpKS5qb2luKFwiIFwiKTtcbnZhciBjb25zb2xlX2xldmVsX2Vycm9yID0gMDtcbnZhciBjb25zb2xlX2xldmVsX3dhcm4gPSAxO1xudmFyIGNvbnNvbGVfbGV2ZWxfaW5mbyA9IDI7XG52YXIgY29uc29sZV9sZXZlbF9kZWJ1ZyA9IDM7XG52YXIgY29uc29sZV9sZXZlbF90cmFjZSA9IDQ7XG52YXIgdGltZXJNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xudmFyIGNvbnNvbGUyID0ge1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIHdlIHdhbnQgYSBibGFuayBwcm90b3R5cGUsIGJ1dCB0eXBlc2NyaXB0IGNvbXBsYWluc1xuICBfX3Byb3RvX186IHt9LFxuICBbU3ltYm9sLnRvU3RyaW5nVGFnXTogXCJjb25zb2xlXCIsXG4gIGFzc2VydDogKGNvbmRpdGlvbiA9IGZhbHNlLCAuLi5kYXRhKSA9PiB7XG4gICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2Vycm9yLCBmbXRMb2coLi4uZGF0YSkpO1xuICAgIH1cbiAgfSxcbiAgY2xlYXI6ICgpID0+IHtcbiAgfSxcbiAgZGVidWc6ICguLi5kYXRhKSA9PiB7XG4gICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfZGVidWcsIGZtdExvZyguLi5kYXRhKSk7XG4gIH0sXG4gIGVycm9yOiAoLi4uZGF0YSkgPT4ge1xuICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2Vycm9yLCBmbXRMb2coLi4uZGF0YSkpO1xuICB9LFxuICBpbmZvOiAoLi4uZGF0YSkgPT4ge1xuICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2luZm8sIGZtdExvZyguLi5kYXRhKSk7XG4gIH0sXG4gIGxvZzogKC4uLmRhdGEpID0+IHtcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2coLi4uZGF0YSkpO1xuICB9LFxuICB0YWJsZTogKHRhYnVsYXJEYXRhLCBfcHJvcGVydGllcykgPT4ge1xuICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2luZm8sIGZtdExvZyh0YWJ1bGFyRGF0YSkpO1xuICB9LFxuICB0cmFjZTogKC4uLmRhdGEpID0+IHtcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF90cmFjZSwgZm10TG9nKC4uLmRhdGEpKTtcbiAgfSxcbiAgd2FybjogKC4uLmRhdGEpID0+IHtcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF93YXJuLCBmbXRMb2coLi4uZGF0YSkpO1xuICB9LFxuICBkaXI6IChfaXRlbSwgX29wdGlvbnMpID0+IHtcbiAgfSxcbiAgZGlyeG1sOiAoLi4uX2RhdGEpID0+IHtcbiAgfSxcbiAgLy8gQ291bnRpbmdcbiAgY291bnQ6IChfbGFiZWwgPSBcImRlZmF1bHRcIikgPT4ge1xuICB9LFxuICBjb3VudFJlc2V0OiAoX2xhYmVsID0gXCJkZWZhdWx0XCIpID0+IHtcbiAgfSxcbiAgLy8gR3JvdXBpbmdcbiAgZ3JvdXA6ICguLi5fZGF0YSkgPT4ge1xuICB9LFxuICBncm91cENvbGxhcHNlZDogKC4uLl9kYXRhKSA9PiB7XG4gIH0sXG4gIGdyb3VwRW5kOiAoKSA9PiB7XG4gIH0sXG4gIC8vIFRpbWluZ1xuICB0aW1lOiAobGFiZWwgPSBcImRlZmF1bHRcIikgPT4ge1xuICAgIGlmICh0aW1lck1hcC5oYXMobGFiZWwpKSB7XG4gICAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF93YXJuLCBgVGltZXIgJyR7bGFiZWx9JyBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGltZXJNYXAuc2V0KGxhYmVsLCBzeXMuY29uc29sZV90aW1lcl9zdGFydChsYWJlbCkpO1xuICB9LFxuICB0aW1lTG9nOiAobGFiZWwgPSBcImRlZmF1bHRcIiwgLi4uZGF0YSkgPT4ge1xuICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2luZm8sIGZtdExvZyhsYWJlbCwgLi4uZGF0YSkpO1xuICB9LFxuICB0aW1lRW5kOiAobGFiZWwgPSBcImRlZmF1bHRcIikgPT4ge1xuICAgIGNvbnN0IHNwYW5JZCA9IHRpbWVyTWFwLmdldChsYWJlbCk7XG4gICAgaWYgKHNwYW5JZCA9PT0gdm9pZCAwKSB7XG4gICAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF93YXJuLCBgVGltZXIgJyR7bGFiZWx9JyBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3lzLmNvbnNvbGVfdGltZXJfZW5kKHNwYW5JZCk7XG4gICAgdGltZXJNYXAuZGVsZXRlKGxhYmVsKTtcbiAgfSxcbiAgLy8gQWRkaXRpb25hbCBjb25zb2xlIG1ldGhvZHMgdG8gc2F0aXNmeSB0aGUgQ29uc29sZSBpbnRlcmZhY2VcbiAgdGltZVN0YW1wOiAoKSA9PiB7XG4gIH0sXG4gIHByb2ZpbGU6ICgpID0+IHtcbiAgfSxcbiAgcHJvZmlsZUVuZDogKCkgPT4ge1xuICB9XG59O1xuXG4vLyBzcmMvc2VydmVyL3BvbHlmaWxscy50c1xuZ2xvYmFsVGhpcy5jb25zb2xlID0gY29uc29sZTI7XG4vKiEgQnVuZGxlZCBsaWNlbnNlIGluZm9ybWF0aW9uOlxuXG5zdGF0dXNlcy9pbmRleC5qczpcbiAgKCohXG4gICAqIHN0YXR1c2VzXG4gICAqIENvcHlyaWdodChjKSAyMDE0IEpvbmF0aGFuIE9uZ1xuICAgKiBDb3B5cmlnaHQoYykgMjAxNiBEb3VnbGFzIENocmlzdG9waGVyIFdpbHNvblxuICAgKiBNSVQgTGljZW5zZWRcbiAgICopXG4qL1xuXG5leHBvcnQgeyBBcnJheUJ1aWxkZXIsIEFycmF5Q29sdW1uQnVpbGRlciwgQm9vbEJ1aWxkZXIsIEJvb2xDb2x1bW5CdWlsZGVyLCBCb29sZWFuRXhwciwgQnl0ZUFycmF5QnVpbGRlciwgQnl0ZUFycmF5Q29sdW1uQnVpbGRlciwgQ2FzZUNvbnZlcnNpb25Qb2xpY3ksIENvbHVtbkJ1aWxkZXIsIENvbHVtbkV4cHJlc3Npb24sIENvbm5lY3Rpb25JZEJ1aWxkZXIsIENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIsIEYzMkJ1aWxkZXIsIEYzMkNvbHVtbkJ1aWxkZXIsIEY2NEJ1aWxkZXIsIEY2NENvbHVtbkJ1aWxkZXIsIEkxMjhCdWlsZGVyLCBJMTI4Q29sdW1uQnVpbGRlciwgSTE2QnVpbGRlciwgSTE2Q29sdW1uQnVpbGRlciwgSTI1NkJ1aWxkZXIsIEkyNTZDb2x1bW5CdWlsZGVyLCBJMzJCdWlsZGVyLCBJMzJDb2x1bW5CdWlsZGVyLCBJNjRCdWlsZGVyLCBJNjRDb2x1bW5CdWlsZGVyLCBJOEJ1aWxkZXIsIEk4Q29sdW1uQnVpbGRlciwgSWRlbnRpdHlCdWlsZGVyLCBJZGVudGl0eUNvbHVtbkJ1aWxkZXIsIE9wdGlvbkJ1aWxkZXIsIE9wdGlvbkNvbHVtbkJ1aWxkZXIsIFByb2R1Y3RCdWlsZGVyLCBQcm9kdWN0Q29sdW1uQnVpbGRlciwgUmFuZ2UsIFJlZkJ1aWxkZXIsIFJlcXVlc3QsIFJlc3VsdEJ1aWxkZXIsIFJlc3VsdENvbHVtbkJ1aWxkZXIsIFJvdXRlciwgUm93QnVpbGRlciwgU2NoZWR1bGVBdEJ1aWxkZXIsIFNjaGVkdWxlQXRDb2x1bW5CdWlsZGVyLCBTZW5kZXJFcnJvciwgU2ltcGxlU3VtQnVpbGRlciwgU2ltcGxlU3VtQ29sdW1uQnVpbGRlciwgU3BhY2V0aW1lSG9zdEVycm9yLCBTdHJpbmdCdWlsZGVyLCBTdHJpbmdDb2x1bW5CdWlsZGVyLCBTdW1CdWlsZGVyLCBTdW1Db2x1bW5CdWlsZGVyLCBTeW5jUmVzcG9uc2UsIFRpbWVEdXJhdGlvbkJ1aWxkZXIsIFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIsIFRpbWVzdGFtcEJ1aWxkZXIsIFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIsIFR5cGVCdWlsZGVyLCBVMTI4QnVpbGRlciwgVTEyOENvbHVtbkJ1aWxkZXIsIFUxNkJ1aWxkZXIsIFUxNkNvbHVtbkJ1aWxkZXIsIFUyNTZCdWlsZGVyLCBVMjU2Q29sdW1uQnVpbGRlciwgVTMyQnVpbGRlciwgVTMyQ29sdW1uQnVpbGRlciwgVTY0QnVpbGRlciwgVTY0Q29sdW1uQnVpbGRlciwgVThCdWlsZGVyLCBVOENvbHVtbkJ1aWxkZXIsIFV1aWRCdWlsZGVyLCBVdWlkQ29sdW1uQnVpbGRlciwgYW5kLCBjcmVhdGVUYWJsZVJlZkZyb21EZWYsIGVycm9ycywgZXZhbHVhdGVCb29sZWFuRXhwciwgZ2V0UXVlcnlBY2Nlc3Nvck5hbWUsIGdldFF1ZXJ5VGFibGVOYW1lLCBnZXRRdWVyeVdoZXJlQ2xhdXNlLCBpc1Jvd1R5cGVkUXVlcnksIGlzVHlwZWRRdWVyeSwgbGl0ZXJhbCwgbWFrZVF1ZXJ5QnVpbGRlciwgbm90LCBvciwgc2NoZW1hLCB0LCB0YWJsZSwgdG9DYW1lbENhc2UsIHRvQ29tcGFyYWJsZVZhbHVlLCB0b1NxbCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcFxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcCIsImltcG9ydCB7XG4gIHNjaGVtYSxcbiAgdGFibGUsXG4gIHQsXG4gIHR5cGUgSW5mZXIsXG4gIHR5cGUgSW5mZXJTY2hlbWEsXG59IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XG5cbi8vIGNpcmNsZXM6XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCB2ZWN0b3IyID0gdC5vYmplY3QoJ1ZlY3RvcjInLCB7XG4gIHg6IHQuZjMyKCksXG4gIHk6IHQuZjMyKCksXG59KTtcbmV4cG9ydCB0eXBlIFZlY3RvcjIgPSBJbmZlcjx0eXBlb2YgdmVjdG9yMj47XG5cbmNvbnN0IGVudGl0eVJvdyA9IHQucm93KHtcbiAgaWQ6IHQudTMyKCkucHJpbWFyeUtleSgpLmF1dG9JbmMoKSxcbiAgcG9zaXRpb246IHZlY3RvcjIsXG4gIG1hc3M6IHQudTMyKCksXG59KTtcbmV4cG9ydCB0eXBlIEVudGl0eSA9IEluZmVyPHR5cGVvZiBlbnRpdHlSb3c+O1xuXG5jb25zdCBjaXJjbGVSb3cgPSB0LnJvdyh7XG4gIGVudGl0eV9pZDogdC51MzIoKS5wcmltYXJ5S2V5KCksXG4gIHBsYXllcl9pZDogdC51MzIoKS5pbmRleCgnYnRyZWUnKSxcbiAgZGlyZWN0aW9uOiB2ZWN0b3IyLFxuICBtYWduaXR1ZGU6IHQuZjMyKCksXG4gIGxhc3Rfc3BsaXRfdGltZTogdC50aW1lc3RhbXAoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2lyY2xlID0gSW5mZXI8dHlwZW9mIGNpcmNsZVJvdz47XG5cbmNvbnN0IGZvb2RSb3cgPSB0LnJvdyh7XG4gIGVudGl0eV9pZDogdC51MzIoKS5wcmltYXJ5S2V5KCksXG59KTtcbmV4cG9ydCB0eXBlIEZvb2QgPSBJbmZlcjx0eXBlb2YgZm9vZFJvdz47XG5cbmNvbnN0IGVudGl0eSA9IHRhYmxlKHsgbmFtZTogJ2VudGl0eScgfSwgZW50aXR5Um93KTtcbmNvbnN0IGNpcmNsZSA9IHRhYmxlKHsgbmFtZTogJ2NpcmNsZScgfSwgY2lyY2xlUm93KTtcbmNvbnN0IGZvb2QgPSB0YWJsZSh7IG5hbWU6ICdmb29kJyB9LCBmb29kUm93KTtcblxuLy8gc3ludGhldGljOlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGNvbnN0IHVuaXF1ZV8wX3UzMl91NjRfc3RyX3RSb3cgPSB0LnJvdyh7XG4gIGlkOiB0LnUzMigpLnByaW1hcnlLZXkoKSxcbiAgYWdlOiB0LnU2NCgpLFxuICBuYW1lOiB0LnN0cmluZygpLFxufSk7XG5cbmV4cG9ydCBjb25zdCBub19pbmRleF91MzJfdTY0X3N0cl90Um93ID0gdC5yb3coe1xuICBpZDogdC51MzIoKSxcbiAgYWdlOiB0LnU2NCgpLFxuICBuYW1lOiB0LnN0cmluZygpLFxufSk7XG5cbmV4cG9ydCBjb25zdCBidHJlZV9lYWNoX2NvbHVtbl91MzJfdTY0X3N0cl90Um93ID0gdC5yb3coe1xuICBpZDogdC51MzIoKS5pbmRleCgnYnRyZWUnKSxcbiAgYWdlOiB0LnU2NCgpLmluZGV4KCdidHJlZScpLFxuICBuYW1lOiB0LnN0cmluZygpLmluZGV4KCdidHJlZScpLFxufSk7XG5cbmV4cG9ydCBjb25zdCB1bmlxdWVfMF91MzJfdTY0X3U2NF90Um93ID0gdC5yb3coe1xuICBpZDogdC51MzIoKS5wcmltYXJ5S2V5KCksXG4gIHg6IHQudTY0KCksXG4gIHk6IHQudTY0KCksXG59KTtcblxuZXhwb3J0IGNvbnN0IG5vX2luZGV4X3UzMl91NjRfdTY0X3RSb3cgPSB0LnJvdyh7XG4gIGlkOiB0LnUzMigpLFxuICB4OiB0LnU2NCgpLFxuICB5OiB0LnU2NCgpLFxufSk7XG5cbmV4cG9ydCBjb25zdCBidHJlZV9lYWNoX2NvbHVtbl91MzJfdTY0X3U2NF90Um93ID0gdC5yb3coe1xuICBpZDogdC51MzIoKS5pbmRleCgnYnRyZWUnKSxcbiAgeDogdC51NjQoKS5pbmRleCgnYnRyZWUnKSxcbiAgeTogdC51NjQoKS5pbmRleCgnYnRyZWUnKSxcbn0pO1xuXG5jb25zdCB1bmlxdWVfMF91MzJfdTY0X3N0ciA9IHRhYmxlKHt9LFxuICB1bmlxdWVfMF91MzJfdTY0X3N0cl90Um93XG4pO1xuY29uc3Qgbm9faW5kZXhfdTMyX3U2NF9zdHIgPSB0YWJsZSh7fSxcbiAgbm9faW5kZXhfdTMyX3U2NF9zdHJfdFJvd1xuKTtcbmNvbnN0IGJ0cmVlX2VhY2hfY29sdW1uX3UzMl91NjRfc3RyID0gdGFibGUoXG4gIHt9LFxuICBidHJlZV9lYWNoX2NvbHVtbl91MzJfdTY0X3N0cl90Um93XG4pO1xuY29uc3QgdW5pcXVlXzBfdTMyX3U2NF91NjQgPSB0YWJsZShcbiAge30sXG4gIHVuaXF1ZV8wX3UzMl91NjRfdTY0X3RSb3dcbik7XG5jb25zdCBub19pbmRleF91MzJfdTY0X3U2NCA9IHRhYmxlKFxuICB7IH0sXG4gIG5vX2luZGV4X3UzMl91NjRfdTY0X3RSb3dcbik7XG5jb25zdCBidHJlZV9lYWNoX2NvbHVtbl91MzJfdTY0X3U2NCA9IHRhYmxlKFxuICB7fSxcbiAgYnRyZWVfZWFjaF9jb2x1bW5fdTMyX3U2NF91NjRfdFJvd1xuKTtcblxuLy8gaWFfbG9vcDpcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IHZlbG9jaXR5Um93ID0gdC5yb3coe1xuICBlbnRpdHlfaWQ6IHQudTMyKCkucHJpbWFyeUtleSgpLFxuICB4OiB0LmYzMigpLFxuICB5OiB0LmYzMigpLFxuICB6OiB0LmYzMigpLFxufSk7XG5leHBvcnQgdHlwZSBWZWxvY2l0eSA9IEluZmVyPHR5cGVvZiB2ZWxvY2l0eVJvdz47XG5cbmNvbnN0IHBvc2l0aW9uUm93ID0gdC5yb3coe1xuICBlbnRpdHlfaWQ6IHQudTMyKCkucHJpbWFyeUtleSgpLFxuICB4OiB0LmYzMigpLFxuICB5OiB0LmYzMigpLFxuICB6OiB0LmYzMigpLFxuICB2eDogdC5mMzIoKSxcbiAgdnk6IHQuZjMyKCksXG4gIHZ6OiB0LmYzMigpLFxufSk7XG5leHBvcnQgdHlwZSBQb3NpdGlvbiA9IEluZmVyPHR5cGVvZiBwb3NpdGlvblJvdz47XG5cbmNvbnN0IGFnZW50QWN0aW9uID0gdC5lbnVtKCdBZ2VudEFjdGlvbicsIHtcbiAgSW5hY3RpdmU6IHQudW5pdCgpLFxuICBJZGxlOiB0LnVuaXQoKSxcbiAgRXZhZGluZzogdC51bml0KCksXG4gIEludmVzdGlnYXRpbmc6IHQudW5pdCgpLFxuICBSZXRyZWF0aW5nOiB0LnVuaXQoKSxcbiAgRmlnaHRpbmc6IHQudW5pdCgpLFxufSk7XG5leHBvcnQgdHlwZSBBZ2VudEFjdGlvbiA9IEluZmVyPHR5cGVvZiBhZ2VudEFjdGlvbj47XG5cbmNvbnN0IGdhbWVFbmVteUFpQWdlbnRTdGF0ZVJvdyA9IHQucm93KHtcbiAgZW50aXR5X2lkOiB0LnU2NCgpLnByaW1hcnlLZXkoKSxcbiAgbGFzdF9tb3ZlX3RpbWVzdGFtcHM6IHQuYXJyYXkodC51NjQoKSksXG4gIG5leHRfYWN0aW9uX3RpbWVzdGFtcDogdC51NjQoKSxcbiAgYWN0aW9uOiBhZ2VudEFjdGlvbixcbn0pO1xuZXhwb3J0IHR5cGUgR2FtZUVuZW15QWlBZ2VudFN0YXRlID0gSW5mZXI8dHlwZW9mIGdhbWVFbmVteUFpQWdlbnRTdGF0ZVJvdz47XG5cbmNvbnN0IGdhbWVUYXJnZXRhYmxlU3RhdGVSb3cgPSB0LnJvdyh7XG4gIGVudGl0eV9pZDogdC51NjQoKS5wcmltYXJ5S2V5KCksXG4gIHF1YWQ6IHQuaTY0KCksXG59KTtcbmV4cG9ydCB0eXBlIEdhbWVUYXJnZXRhYmxlU3RhdGUgPSBJbmZlcjx0eXBlb2YgZ2FtZVRhcmdldGFibGVTdGF0ZVJvdz47XG5cbmNvbnN0IGdhbWVMaXZlVGFyZ2V0YWJsZVN0YXRlUm93ID0gdC5yb3coe1xuICBlbnRpdHlfaWQ6IHQudTY0KCkudW5pcXVlKCksXG4gIHF1YWQ6IHQuaTY0KCkuaW5kZXgoJ2J0cmVlJyksXG59KTtcbmV4cG9ydCB0eXBlIEdhbWVMaXZlVGFyZ2V0YWJsZVN0YXRlID0gSW5mZXI8dHlwZW9mIGdhbWVMaXZlVGFyZ2V0YWJsZVN0YXRlUm93PjtcblxuY29uc3QgZ2FtZU1vYmlsZUVudGl0eVN0YXRlID0gdC5yb3coe1xuICBlbnRpdHlfaWQ6IHQudTY0KCkucHJpbWFyeUtleSgpLFxuICBsb2NhdGlvbl94OiB0LmkzMigpLmluZGV4KCdidHJlZScpLFxuICBsb2NhdGlvbl95OiB0LmkzMigpLFxuICB0aW1lc3RhbXA6IHQudTY0KCksXG59KTtcbmV4cG9ydCB0eXBlIEdhbWVNb2JpbGVFbnRpdHlTdGF0ZSA9IEluZmVyPHR5cGVvZiBnYW1lTW9iaWxlRW50aXR5U3RhdGU+O1xuXG5jb25zdCBnYW1lRW5lbXlTdGF0ZVJvdyA9IHQucm93KHtcbiAgZW50aXR5X2lkOiB0LnU2NCgpLnByaW1hcnlLZXkoKSxcbiAgaGVyZF9pZDogdC5pMzIoKSxcbn0pO1xuZXhwb3J0IHR5cGUgR2FtZUVuZW15U3RhdGUgPSBJbmZlcjx0eXBlb2YgZ2FtZUVuZW15U3RhdGVSb3c+O1xuXG5jb25zdCBzbWFsbEhleFRpbGUgPSB0Lm9iamVjdCgnU21hbGxIZXhUaWxlJywge1xuICB4OiB0LmkzMigpLFxuICB6OiB0LmkzMigpLFxuICBkaW1lbnNpb246IHQudTMyKCksXG59KTtcbmV4cG9ydCB0eXBlIFNtYWxsSGV4VGlsZSA9IEluZmVyPHR5cGVvZiBzbWFsbEhleFRpbGU+O1xuXG5jb25zdCBnYW1lSGVyZENhY2hlUm93ID0gdC5yb3coe1xuICBpZDogdC5pMzIoKS5wcmltYXJ5S2V5KCksXG4gIGRpbWVuc2lvbl9pZDogdC51MzIoKSxcbiAgY3VycmVudF9wb3B1bGF0aW9uOiB0LmkzMigpLFxuICBsb2NhdGlvbjogc21hbGxIZXhUaWxlLFxuICBtYXhfcG9wdWxhdGlvbjogdC5pMzIoKSxcbiAgc3Bhd25fZWFnZXJuZXNzOiB0LmYzMigpLFxuICByb2FtaW5nX2Rpc3RhbmNlOiB0LmkzMigpLFxufSk7XG5leHBvcnQgdHlwZSBHYW1lSGVyZENhY2hlID0gSW5mZXI8dHlwZW9mIGdhbWVIZXJkQ2FjaGVSb3c+O1xuXG5jb25zdCB2ZWxvY2l0eSA9IHRhYmxlKHsgbmFtZTogJ3ZlbG9jaXR5JyB9LCB2ZWxvY2l0eVJvdyk7XG5jb25zdCBwb3NpdGlvbiA9IHRhYmxlKHsgbmFtZTogJ3Bvc2l0aW9uJyB9LCBwb3NpdGlvblJvdyk7XG5jb25zdCBnYW1lRW5lbXlBaUFnZW50U3RhdGUgPSB0YWJsZShcbiAge1xuICAgIG5hbWU6ICdnYW1lX2VuZW15X2FpX2FnZW50X3N0YXRlJyxcbiAgfSxcbiAgZ2FtZUVuZW15QWlBZ2VudFN0YXRlUm93XG4pO1xuY29uc3QgZ2FtZVRhcmdldGFibGVTdGF0ZSA9IHRhYmxlKFxuICB7XG4gICAgbmFtZTogJ2dhbWVfdGFyZ2V0YWJsZV9zdGF0ZScsXG4gIH0sXG4gIGdhbWVUYXJnZXRhYmxlU3RhdGVSb3dcbik7XG5jb25zdCBnYW1lTGl2ZVRhcmdldGFibGVTdGF0ZSA9IHRhYmxlKFxuICB7XG4gICAgbmFtZTogJ2dhbWVfbGl2ZV90YXJnZXRhYmxlX3N0YXRlJyxcbiAgfSxcbiAgZ2FtZUxpdmVUYXJnZXRhYmxlU3RhdGVSb3dcbik7XG5jb25zdCBnYW1lRW5lbXlTdGF0ZSA9IHRhYmxlKFxuICB7XG4gICAgbmFtZTogJ2dhbWVfZW5lbXlfc3RhdGUnLFxuICB9LFxuICBnYW1lRW5lbXlTdGF0ZVJvd1xuKTtcbmNvbnN0IGdhbWVIZXJkQ2FjaGUgPSB0YWJsZShcbiAge1xuICAgIG5hbWU6ICdnYW1lX2hlcmRfY2FjaGUnLFxuICB9LFxuICBnYW1lSGVyZENhY2hlUm93XG4pO1xuXG5leHBvcnQgY29uc3Qgc3BhY2V0aW1lZGIgPSBzY2hlbWEoe1xuICBjaXJjbGUsXG4gIGVudGl0eSxcbiAgZm9vZCxcbiAgdW5pcXVlXzBfdTMyX3U2NF9zdHIsXG4gIG5vX2luZGV4X3UzMl91NjRfc3RyLFxuICBidHJlZV9lYWNoX2NvbHVtbl91MzJfdTY0X3N0cixcbiAgdW5pcXVlXzBfdTMyX3U2NF91NjQsXG4gIG5vX2luZGV4X3UzMl91NjRfdTY0LFxuICBidHJlZV9lYWNoX2NvbHVtbl91MzJfdTY0X3U2NCxcbiAgdmVsb2NpdHksXG4gIHBvc2l0aW9uLFxuICBnYW1lRW5lbXlBaUFnZW50U3RhdGUsXG4gIGdhbWVUYXJnZXRhYmxlU3RhdGUsXG4gIGdhbWVMaXZlVGFyZ2V0YWJsZVN0YXRlLFxuICBnYW1lRW5lbXlTdGF0ZSxcbiAgZ2FtZUhlcmRDYWNoZSxcbiAgZ2FtZU1vYmlsZUVudGl0eVN0YXRlOiB0YWJsZShcbiAgICB7IG5hbWU6ICdnYW1lX21vYmlsZV9lbnRpdHlfc3RhdGUnIH0sXG4gICAgZ2FtZU1vYmlsZUVudGl0eVN0YXRlXG4gICksXG59KTtcblxuZXhwb3J0IHR5cGUgUyA9IEluZmVyU2NoZW1hPHR5cGVvZiBzcGFjZXRpbWVkYj47XG4iLCJleHBvcnQgdHlwZSBMb2FkID0ge1xuICBpbml0aWFsTG9hZDogbnVtYmVyO1xuICBzbWFsbFRhYmxlOiBudW1iZXI7XG4gIG51bVBsYXllcnM6IGJpZ2ludDtcbiAgYmlnVGFibGU6IG51bWJlcjtcbiAgYmlnZ2VzdFRhYmxlOiBudW1iZXI7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gbmV3TG9hZChpbml0aWFsTG9hZDogbnVtYmVyKTogTG9hZCB7XG4gIHJldHVybiB7XG4gICAgaW5pdGlhbExvYWQsXG4gICAgc21hbGxUYWJsZTogaW5pdGlhbExvYWQsXG4gICAgbnVtUGxheWVyczogQmlnSW50KGluaXRpYWxMb2FkKSxcbiAgICBiaWdUYWJsZTogaW5pdGlhbExvYWQgKiA1MCxcbiAgICBiaWdnZXN0VGFibGU6IGluaXRpYWxMb2FkICogMTAwLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmxhY2tCb3goX3g6IGFueSkge1xuICAvLyBUT0RPOiBhY3R1YWxseSBkbyBzb21ldGhpbmcgdG8gZGVmZWF0IG9wdGltaXphdGlvbnM/XG59XG4iLCIvLyEgU1REQiBtb2R1bGUgdXNlZCBmb3IgYmVuY2htYXJrcyBiYXNlZCBvbiBcInJlYWxpc3RpY1wiIHdvcmtsb2FkcyB3ZSBhcmUgZm9jdXNpbmcgaW4gaW1wcm92aW5nLlxuXG5pbXBvcnQgeyBuZXdMb2FkLCBibGFja0JveCB9IGZyb20gJy4vbG9hZCc7XG5pbXBvcnQgeyBzcGFjZXRpbWVkYiwgdHlwZSBFbnRpdHksIHR5cGUgQ2lyY2xlLCB0eXBlIEZvb2QgfSBmcm9tICcuL3NjaGVtYSc7XG5pbXBvcnQgeyBUaW1lc3RhbXAgfSBmcm9tICdzcGFjZXRpbWVkYic7XG5pbXBvcnQgeyB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcblxuZnVuY3Rpb24gbmV3RW50aXR5KGlkOiBudW1iZXIsIHg6IG51bWJlciwgeTogbnVtYmVyLCBtYXNzOiBudW1iZXIpOiBFbnRpdHkge1xuICByZXR1cm4ge1xuICAgIGlkLFxuICAgIHBvc2l0aW9uOiB7IHgsIHkgfSxcbiAgICBtYXNzLFxuICB9O1xufVxuXG5mdW5jdGlvbiBuZXdDaXJjbGUoXG4gIGVudGl0eV9pZDogbnVtYmVyLFxuICBwbGF5ZXJfaWQ6IG51bWJlcixcbiAgeDogbnVtYmVyLFxuICB5OiBudW1iZXIsXG4gIG1hZ25pdHVkZTogbnVtYmVyLFxuICBsYXN0X3NwbGl0X3RpbWU6IFRpbWVzdGFtcFxuKTogQ2lyY2xlIHtcbiAgcmV0dXJuIHtcbiAgICBlbnRpdHlfaWQsXG4gICAgcGxheWVyX2lkLFxuICAgIGRpcmVjdGlvbjogeyB4LCB5IH0sXG4gICAgbWFnbml0dWRlLFxuICAgIGxhc3Rfc3BsaXRfdGltZSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gbmV3Rm9vZChlbnRpdHlfaWQ6IG51bWJlcik6IEZvb2Qge1xuICByZXR1cm4ge1xuICAgIGVudGl0eV9pZCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gbWFzc1RvUmFkaXVzKG1hc3M6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLnNxcnQobWFzcyk7XG59XG5cbmZ1bmN0aW9uIGlzT3ZlcmxhcHBpbmcoZW50aXR5MTogRW50aXR5LCBlbnRpdHkyOiBFbnRpdHkpOiBib29sZWFuIHtcbiAgY29uc3QgZW50aXR5MVJhZGl1cyA9IG1hc3NUb1JhZGl1cyhlbnRpdHkxLm1hc3MpO1xuICBjb25zdCBlbnRpdHkyUmFkaXVzID0gbWFzc1RvUmFkaXVzKGVudGl0eTIubWFzcyk7XG4gIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KFxuICAgIChlbnRpdHkxLnBvc2l0aW9uLnggLSBlbnRpdHkyLnBvc2l0aW9uLngpICoqIDIgK1xuICAgICAgKGVudGl0eTEucG9zaXRpb24ueSAtIGVudGl0eTIucG9zaXRpb24ueSkgKiogMlxuICApO1xuICByZXR1cm4gZGlzdGFuY2UgPCBNYXRoLm1heChlbnRpdHkxUmFkaXVzLCBlbnRpdHkyUmFkaXVzKTtcbn1cblxuLy8gLS0tLS0tLS0tLSBpbnNlcnQgYnVsayAtLS0tLS0tLS0tXG5cbmV4cG9ydCBjb25zdCBpbnNlcnRCdWxrRW50aXR5ID0gc3BhY2V0aW1lZGIucmVkdWNlcihcbiAgeyBuYW1lOiAnaW5zZXJ0X2J1bGtfZW50aXR5JyB9LFxuICB7IGNvdW50OiB0LnUzMigpIH0sXG4gIChjdHgsIHsgY291bnQgfSkgPT4ge1xuICAgIGZvciAobGV0IGlkID0gMDsgaWQgPCBjb3VudDsgaWQrKykge1xuICAgICAgY3R4LmRiLmVudGl0eS5pbnNlcnQobmV3RW50aXR5KDAsIGlkLCBpZCArIDUsIGlkICogNSkpO1xuICAgIH1cbiAgICBjb25zb2xlLmluZm8oYElOU0VSVCBFTlRJVFk6ICR7Y291bnR9YCk7XG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCBpbnNlcnRCdWxrQ2lyY2xlID0gc3BhY2V0aW1lZGIucmVkdWNlcihcbiAgeyBuYW1lOiAnaW5zZXJ0X2J1bGtfY2lyY2xlJyB9LFxuICB7IGNvdW50OiB0LnUzMigpIH0sXG4gIChjdHgsIHsgY291bnQgfSkgPT4ge1xuICAgIGZvciAobGV0IGlkID0gMDsgaWQgPCBjb3VudDsgaWQrKykge1xuICAgICAgY3R4LmRiLmNpcmNsZS5pbnNlcnQoXG4gICAgICAgIG5ld0NpcmNsZShpZCwgaWQsIGlkLCBpZCArIDUsIGlkICogNSwgY3R4LnRpbWVzdGFtcClcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbnNvbGUuaW5mbyhgSU5TRVJUIENJUkNMRTogJHtjb3VudH1gKTtcbiAgfVxuKTtcblxuZXhwb3J0IGNvbnN0IGluc2VydEJ1bGtGb29kID0gc3BhY2V0aW1lZGIucmVkdWNlcihcbiAgeyBuYW1lOiAnaW5zZXJ0X2J1bGtfZm9vZCcgfSxcbiAgeyBjb3VudDogdC51MzIoKSB9LFxuICAoY3R4LCB7IGNvdW50IH0pID0+IHtcbiAgICBmb3IgKGxldCBpZCA9IDE7IGlkIDw9IGNvdW50OyBpZCsrKSB7XG4gICAgICBjdHguZGIuZm9vZC5pbnNlcnQobmV3Rm9vZChpZCkpO1xuICAgIH1cbiAgICBjb25zb2xlLmluZm8oYElOU0VSVCBGT09EOiAke2NvdW50fWApO1xuICB9XG4pO1xuXG4vLyBTaW11bGF0ZVxuLy8gYGBgXG4vLyBTRUxFQ1QgKiBGUk9NIENpcmNsZSwgRW50aXR5LCBGb29kXG4vLyBgYGBcbmV4cG9ydCBjb25zdCBjcm9zc0pvaW5BbGwgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IG5hbWU6ICdjcm9zc19qb2luX2FsbCcgfSxcbiAgeyBleHBlY3RlZDogdC51MzIoKSB9LFxuICAoY3R4LCB7IGV4cGVjdGVkIH0pID0+IHtcbiAgICBsZXQgY291bnQ6IG51bWJlciA9IDA7XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgZm9yIChjb25zdCBjaXJjbGUgb2YgY3R4LmRiLmNpcmNsZS5pdGVyKCkpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICAgIGZvciAoY29uc3QgZW50aXR5IG9mIGN0eC5kYi5lbnRpdHkuaXRlcigpKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICAgICAgZm9yIChjb25zdCBmb29kIG9mIGN0eC5kYi5mb29kLml0ZXIoKSkge1xuICAgICAgICAgIGNvdW50ICs9IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zb2xlLmluZm8oYENST1NTIEpPSU4gQUxMOiAke2V4cGVjdGVkfSwgcHJvY2Vzc2VkOiAke2NvdW50fWApO1xuICB9XG4pO1xuXG4vLyBTaW11bGF0ZVxuLy8gYGBgXG4vLyBTRUxFQ1QgKiBGUk9NIENpcmNsZSBKT0lOIEVOVElUWSBVU0lORyhlbnRpdHlfaWQpLCBGb29kIEpPSU4gRU5USVRZIFVTSU5HKGVudGl0eV9pZClcbi8vIGBgYFxuZXhwb3J0IGNvbnN0IGNyb3NzSm9pbkNpcmNsZUZvb2QgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IG5hbWU6ICdjcm9zc19qb2luX2NpcmNsZV9mb29kJyB9LFxuICB7IGV4cGVjdGVkOiB0LnUzMigpIH0sXG4gIChjdHgsIHsgZXhwZWN0ZWQgfSkgPT4ge1xuICAgIGxldCBjb3VudDogbnVtYmVyID0gMDtcblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICBmb3IgKGNvbnN0IGNpcmNsZSBvZiBjdHguZGIuY2lyY2xlLml0ZXIoKSkge1xuICAgICAgY29uc3QgZW50aXR5SWQgPSBjdHguZGIuZW50aXR5LmlkO1xuICAgICAgY29uc3QgY2lyY2xlRW50aXR5ID0gZW50aXR5SWQuZmluZChjaXJjbGUuZW50aXR5X2lkKTtcbiAgICAgIGlmIChjaXJjbGVFbnRpdHkgPT0gbnVsbCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBmb29kIG9mIGN0eC5kYi5mb29kLml0ZXIoKSkge1xuICAgICAgICBjb3VudCArPSAxO1xuXG4gICAgICAgIGNvbnN0IGZvb2RFbnRpdHkgPSBlbnRpdHlJZC5maW5kKGZvb2QuZW50aXR5X2lkKTtcbiAgICAgICAgaWYgKGZvb2RFbnRpdHkgPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnN0IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KGNpcmNsZUVudGl0eSk7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbnRpdHkgbm90IGZvdW5kOiAke2Zvb2QuZW50aXR5X2lkfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgYmxhY2tCb3goaXNPdmVybGFwcGluZyhjaXJjbGVFbnRpdHksIGZvb2RFbnRpdHkpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zb2xlLmluZm8oYENST1NTIEpPSU4gQ0lSQ0xFIEZPT0Q6ICR7ZXhwZWN0ZWR9LCBwcm9jZXNzZWQ6ICR7Y291bnR9YCk7XG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCBpbml0R2FtZUNpcmNsZXMgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IG5hbWU6ICdpbml0X2dhbWVfY2lyY2xlcycgfSxcbiAgeyBpbml0aWFsX2xvYWQ6IHQudTMyKCkgfSxcbiAgKGN0eCwgeyBpbml0aWFsX2xvYWQgfSkgPT4ge1xuICAgIGNvbnN0IGxvYWQgPSBuZXdMb2FkKGluaXRpYWxfbG9hZCk7XG5cbiAgICBpbnNlcnRCdWxrRm9vZChjdHgsIHsgY291bnQ6IGxvYWQuaW5pdGlhbExvYWQgfSk7XG4gICAgaW5zZXJ0QnVsa0VudGl0eShjdHgsIHsgY291bnQ6IGxvYWQuaW5pdGlhbExvYWQgfSk7XG4gICAgaW5zZXJ0QnVsa0NpcmNsZShjdHgsIHsgY291bnQ6IGxvYWQuc21hbGxUYWJsZSB9KTtcbiAgfVxuKTtcblxuZXhwb3J0IGNvbnN0IHJ1bkdhbWVDaXJjbGVzID0gc3BhY2V0aW1lZGIucmVkdWNlcihcbiAgeyBuYW1lOiAncnVuX2dhbWVfY2lyY2xlcycgfSxcbiAgeyBpbml0aWFsX2xvYWQ6IHQudTMyKCkgfSxcbiAgKGN0eCwgeyBpbml0aWFsX2xvYWQgfSkgPT4ge1xuICAgIGNvbnN0IGxvYWQgPSBuZXdMb2FkKGluaXRpYWxfbG9hZCk7XG5cbiAgICBjcm9zc0pvaW5DaXJjbGVGb29kKGN0eCwgeyBleHBlY3RlZDogaW5pdGlhbF9sb2FkICogbG9hZC5zbWFsbFRhYmxlIH0pO1xuICAgIGNyb3NzSm9pbkFsbChjdHgsIHtcbiAgICAgIGV4cGVjdGVkOiBpbml0aWFsX2xvYWQgKiBpbml0aWFsX2xvYWQgKiBsb2FkLnNtYWxsVGFibGUsXG4gICAgfSk7XG4gIH1cbik7XG4iLCIvLyBTVERCIG1vZHVsZSB1c2VkIGZvciBiZW5jaG1hcmtzIGJhc2VkIG9uIFwicmVhbGlzdGljXCIgd29ya2xvYWRzIHdlIGFyZSBmb2N1c2luZyBpbiBpbXByb3ZpbmcuXG5cbmltcG9ydCB7IG5ld0xvYWQgfSBmcm9tICcuL2xvYWQnO1xuaW1wb3J0IHtcbiAgdHlwZSBHYW1lRW5lbXlBaUFnZW50U3RhdGUsXG4gIHR5cGUgR2FtZVRhcmdldGFibGVTdGF0ZSxcbiAgdHlwZSBTLFxuICB0eXBlIFNtYWxsSGV4VGlsZSxcbiAgc3BhY2V0aW1lZGIsXG4gIHR5cGUgUG9zaXRpb24sXG4gIHR5cGUgVmVsb2NpdHksXG59IGZyb20gJy4vc2NoZW1hJztcbmltcG9ydCB7IHQsIHR5cGUgUmVkdWNlckN0eCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XG5cbmZ1bmN0aW9uIG5ld1Bvc2l0aW9uKFxuICBlbnRpdHlfaWQ6IG51bWJlcixcbiAgeDogbnVtYmVyLFxuICB5OiBudW1iZXIsXG4gIHo6IG51bWJlclxuKTogUG9zaXRpb24ge1xuICByZXR1cm4ge1xuICAgIGVudGl0eV9pZCxcbiAgICB4LFxuICAgIHksXG4gICAgeixcbiAgICB2eDogeCArIDEwLjAsXG4gICAgdnk6IHkgKyAyMC4wLFxuICAgIHZ6OiB6ICsgMzAuMCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gbmV3VmVsb2NpdHkoXG4gIGVudGl0eV9pZDogbnVtYmVyLFxuICB4OiBudW1iZXIsXG4gIHk6IG51bWJlcixcbiAgejogbnVtYmVyXG4pOiBWZWxvY2l0eSB7XG4gIHJldHVybiB7XG4gICAgZW50aXR5X2lkLFxuICAgIHgsXG4gICAgeSxcbiAgICB6LFxuICB9O1xufVxuXG5mdW5jdGlvbiBtb21lbnRNaWxsaXNlY29uZHMoKTogYmlnaW50IHtcbiAgcmV0dXJuIDFuO1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVIYXNoKHQ6IGJpZ2ludCk6IGJpZ2ludCB7XG4gIC8vIFdoYXRldmVyLCBoZXJlJ3MgYSBoYXNoIGZ1bmN0aW9uIEkgZ3Vlc3MuXG4gIHJldHVybiAodCA+PiAxNm4pIF4gdDtcbn1cblxuZXhwb3J0IGNvbnN0IGluc2VydEJ1bGtQb3NpdGlvbiA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHsgbmFtZTogJ2luc2VydF9idWxrX3Bvc2l0aW9uJyB9LFxuICB7IGNvdW50OiB0LnUzMigpIH0sXG4gIChjdHgsIHsgY291bnQgfSkgPT4ge1xuICAgIGZvciAobGV0IGlkID0gMDsgaWQgPCBjb3VudDsgaWQrKykge1xuICAgICAgY3R4LmRiLnBvc2l0aW9uLmluc2VydChuZXdQb3NpdGlvbihpZCwgaWQsIGlkICsgNSwgaWQgKiA1KSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGBJTlNFUlQgUE9TSVRJT046ICR7Y291bnR9YCk7XG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCBpbnNlcnRCdWxrVmVsb2NpdHkgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IG5hbWU6ICdpbnNlcnRfYnVsa192ZWxvY2l0eScgfSxcbiAgeyBjb3VudDogdC51MzIoKSB9LFxuICAoY3R4LCB7IGNvdW50IH0pID0+IHtcbiAgICBmb3IgKGxldCBpZCA9IDA7IGlkIDwgY291bnQ7IGlkKyspIHtcbiAgICAgIGN0eC5kYi52ZWxvY2l0eS5pbnNlcnQobmV3VmVsb2NpdHkoaWQsIGlkLCBpZCArIDUsIGlkICogNSkpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhgSU5TRVJUIFZFTE9DSVRZOiAke2NvdW50fWApO1xuICB9XG4pO1xuXG5leHBvcnQgY29uc3QgdXBkYXRlUG9zaXRpb25BbGwgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IG5hbWU6ICd1cGRhdGVfcG9zaXRpb25fYWxsJyB9LFxuICB7IGV4cGVjdGVkOiB0LnUzMigpIH0sXG4gIChjdHgsIHsgZXhwZWN0ZWQgfSkgPT4ge1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgZm9yIChjb25zdCBwb3NpdGlvbiBvZiBjdHguZGIucG9zaXRpb24uaXRlcigpKSB7XG4gICAgICBwb3NpdGlvbi54ICs9IHBvc2l0aW9uLnZ4O1xuICAgICAgcG9zaXRpb24ueSArPSBwb3NpdGlvbi52eTtcbiAgICAgIHBvc2l0aW9uLnogKz0gcG9zaXRpb24udno7XG5cbiAgICAgIGN0eC5kYi5wb3NpdGlvbi5lbnRpdHlfaWQudXBkYXRlKHBvc2l0aW9uKTtcbiAgICAgIGNvdW50ICs9IDE7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGBVUERBVEUgUE9TSVRJT04gQUxMOiAke2V4cGVjdGVkfSwgcHJvY2Vzc2VkOiAke2NvdW50fWApO1xuICB9XG4pO1xuXG5leHBvcnQgY29uc3QgdXBkYXRlUG9zaXRpb25XaXRoVmVsb2NpdHkgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IG5hbWU6ICd1cGRhdGVfcG9zaXRpb25fd2l0aF92ZWxvY2l0eScgfSxcbiAgeyBleHBlY3RlZDogdC51MzIoKSB9LFxuICAoY3R4LCB7IGV4cGVjdGVkIH0pID0+IHtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGZvciAoY29uc3QgdmVsb2NpdHkgb2YgY3R4LmRiLnZlbG9jaXR5Lml0ZXIoKSkge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBjdHguZGIucG9zaXRpb24uZW50aXR5X2lkLmZpbmQodmVsb2NpdHkuZW50aXR5X2lkKTtcbiAgICAgIGlmIChwb3NpdGlvbiA9PSBudWxsKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBwb3NpdGlvbi54ICs9IHZlbG9jaXR5Lng7XG4gICAgICBwb3NpdGlvbi55ICs9IHZlbG9jaXR5Lnk7XG4gICAgICBwb3NpdGlvbi56ICs9IHZlbG9jaXR5Lno7XG5cbiAgICAgIGN0eC5kYi5wb3NpdGlvbi5lbnRpdHlfaWQudXBkYXRlKHBvc2l0aW9uKTtcbiAgICAgIGNvdW50ICs9IDE7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKFxuICAgICAgYFVQREFURSBQT1NJVElPTiBCWSBWRUxPQ0lUWTogJHtleHBlY3RlZH0sIHByb2Nlc3NlZDogJHtjb3VudH1gXG4gICAgKTtcbiAgfVxuKTtcblxuZXhwb3J0IGNvbnN0IGluc2VydFdvcmxkID0gc3BhY2V0aW1lZGIucmVkdWNlcihcbiAgeyBuYW1lOiAnaW5zZXJ0X3dvcmxkJyB9LFxuICB7IHBsYXllcnM6IHQudTY0KCkgfSxcbiAgKGN0eCwgeyBwbGF5ZXJzIH0pID0+IHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYXllcnM7IGkrKykge1xuICAgICAgY29uc3QgaWQgPSBpO1xuICAgICAgY29uc3QgaWRfbiA9IEJpZ0ludChpZCk7XG4gICAgICBjb25zdCBuZXh0QWN0aW9uVGltZXN0YW1wID1cbiAgICAgICAgKGkgJiAyKSA9PSAyID8gbW9tZW50TWlsbGlzZWNvbmRzKCkgKyAyMDAwbiA6IG1vbWVudE1pbGxpc2Vjb25kcygpO1xuXG4gICAgICBjdHguZGIuZ2FtZUVuZW15QWlBZ2VudFN0YXRlLmluc2VydCh7XG4gICAgICAgIGVudGl0eV9pZDogaWRfbixcbiAgICAgICAgbmV4dF9hY3Rpb25fdGltZXN0YW1wOiBuZXh0QWN0aW9uVGltZXN0YW1wLFxuICAgICAgICBsYXN0X21vdmVfdGltZXN0YW1wczogW2lkX24sIDBuLCBpZF9uICogMm5dLFxuICAgICAgICBhY3Rpb246IHsgdGFnOiAnSWRsZScgfSxcbiAgICAgIH0pO1xuXG4gICAgICBjdHguZGIuZ2FtZUxpdmVUYXJnZXRhYmxlU3RhdGUuaW5zZXJ0KHtcbiAgICAgICAgZW50aXR5X2lkOiBpZF9uLFxuICAgICAgICBxdWFkOiBpZF9uLFxuICAgICAgfSk7XG5cbiAgICAgIGN0eC5kYi5nYW1lVGFyZ2V0YWJsZVN0YXRlLmluc2VydCh7XG4gICAgICAgIGVudGl0eV9pZDogaWRfbixcbiAgICAgICAgcXVhZDogaWRfbixcbiAgICAgIH0pO1xuXG4gICAgICBjdHguZGIuZ2FtZU1vYmlsZUVudGl0eVN0YXRlLmluc2VydCh7XG4gICAgICAgIGVudGl0eV9pZDogaWRfbixcbiAgICAgICAgbG9jYXRpb25feDogaWQsXG4gICAgICAgIGxvY2F0aW9uX3k6IGlkLFxuICAgICAgICB0aW1lc3RhbXA6IG5leHRBY3Rpb25UaW1lc3RhbXAsXG4gICAgICB9KTtcblxuICAgICAgY3R4LmRiLmdhbWVFbmVteVN0YXRlLmluc2VydCh7XG4gICAgICAgIGVudGl0eV9pZDogaWRfbixcbiAgICAgICAgaGVyZF9pZDogaWQsXG4gICAgICB9KTtcblxuICAgICAgY3R4LmRiLmdhbWVIZXJkQ2FjaGUuaW5zZXJ0KHtcbiAgICAgICAgaWQsXG4gICAgICAgIGRpbWVuc2lvbl9pZDogaWQsXG4gICAgICAgIG1heF9wb3B1bGF0aW9uOiBpZCAqIDQsXG4gICAgICAgIHNwYXduX2VhZ2VybmVzczogaWQsXG4gICAgICAgIHJvYW1pbmdfZGlzdGFuY2U6IGlkLFxuICAgICAgICBsb2NhdGlvbjoge1xuICAgICAgICAgIHg6IGlkLFxuICAgICAgICAgIHo6IGlkLFxuICAgICAgICAgIGRpbWVuc2lvbjogaWQgKiAyLFxuICAgICAgICB9LFxuICAgICAgICBjdXJyZW50X3BvcHVsYXRpb246IDAsXG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coYElOU0VSVCBXT1JMRCBQTEFZRVJTOiAke3BsYXllcnN9YCk7XG4gIH1cbik7XG5cbmZ1bmN0aW9uIGdldFRhcmdldGFibGVzTmVhclF1YWQoXG4gIGN0eDogUmVkdWNlckN0eDxTPixcbiAgZW50aXR5SWQ6IGJpZ2ludCxcbiAgbnVtUGxheWVyczogYmlnaW50XG4pOiBHYW1lVGFyZ2V0YWJsZVN0YXRlW10ge1xuICBjb25zdCByZXN1bHQgPSBbXTtcbiAgZm9yIChsZXQgaWQgPSBlbnRpdHlJZDsgaWQgPCBudW1QbGF5ZXJzOyBpZCsrKSB7XG4gICAgZm9yIChjb25zdCBsaXZlVGFyZ2V0YWJsZSBvZiBjdHguZGIuZ2FtZUxpdmVUYXJnZXRhYmxlU3RhdGUucXVhZC5maWx0ZXIoXG4gICAgICBpZFxuICAgICkpIHtcbiAgICAgIGNvbnN0IHRhcmdldGFibGUgPSBjdHguZGIuZ2FtZVRhcmdldGFibGVTdGF0ZS5lbnRpdHlfaWQuZmluZChcbiAgICAgICAgbGl2ZVRhcmdldGFibGUuZW50aXR5X2lkXG4gICAgICApO1xuICAgICAgaWYgKHRhcmdldGFibGUgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lkZW50aXR5IG5vdCBmb3VuZCcpO1xuICAgICAgfVxuICAgICAgcmVzdWx0LnB1c2godGFyZ2V0YWJsZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmNvbnN0IE1BWF9NT1ZFX1RJTUVTVEFNUFMgPSAyMDtcblxuZnVuY3Rpb24gbW92ZUFnZW50KFxuICBjdHg6IFJlZHVjZXJDdHg8Uz4sXG4gIGFnZW50OiBHYW1lRW5lbXlBaUFnZW50U3RhdGUsXG4gIGFnZW50Q29vcmQ6IFNtYWxsSGV4VGlsZSxcbiAgY3VycmVudFRpbWVNczogYmlnaW50XG4pIHtcbiAgY29uc3QgZW50aXR5SWQgPSBhZ2VudC5lbnRpdHlfaWQ7XG5cbiAgY29uc3QgZW5lbXkgPSBjdHguZGIuZ2FtZUVuZW15U3RhdGUuZW50aXR5X2lkLmZpbmQoZW50aXR5SWQpO1xuICBpZiAoZW5lbXkgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignR2FtZUVuZW15U3RhdGUgRW50aXR5IElEIG5vdCBmb3VuZCcpO1xuICB9XG4gIGN0eC5kYi5nYW1lRW5lbXlTdGF0ZS5lbnRpdHlfaWQudXBkYXRlKGVuZW15KTtcblxuICBhZ2VudC5uZXh0X2FjdGlvbl90aW1lc3RhbXAgPSBjdXJyZW50VGltZU1zICsgMjAwMG47XG5cbiAgYWdlbnQubGFzdF9tb3ZlX3RpbWVzdGFtcHMucHVzaChjdXJyZW50VGltZU1zKTtcbiAgaWYgKGFnZW50Lmxhc3RfbW92ZV90aW1lc3RhbXBzLmxlbmd0aCA+IE1BWF9NT1ZFX1RJTUVTVEFNUFMpIHtcbiAgICBhZ2VudC5sYXN0X21vdmVfdGltZXN0YW1wcy5zcGxpY2UoMCwgMSk7XG4gIH1cblxuICBjb25zdCB0YXJnZXRhYmxlID0gY3R4LmRiLmdhbWVUYXJnZXRhYmxlU3RhdGUuZW50aXR5X2lkLmZpbmQoZW50aXR5SWQpO1xuICBpZiAodGFyZ2V0YWJsZSA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdHYW1lVGFyZ2V0YWJsZVN0YXRlIEVudGl0eSBJRCBub3QgZm91bmQnKTtcbiAgfVxuICBjb25zdCBuZXdIYXNoID0gY2FsY3VsYXRlSGFzaCh0YXJnZXRhYmxlLnF1YWQpO1xuICB0YXJnZXRhYmxlLnF1YWQgPSBuZXdIYXNoO1xuICBjdHguZGIuZ2FtZVRhcmdldGFibGVTdGF0ZS5lbnRpdHlfaWQudXBkYXRlKHRhcmdldGFibGUpO1xuXG4gIGlmIChjdHguZGIuZ2FtZUxpdmVUYXJnZXRhYmxlU3RhdGUuZW50aXR5X2lkLmZpbmQoZW50aXR5SWQpICE9IG51bGwpIHtcbiAgICBjdHguZGIuZ2FtZUxpdmVUYXJnZXRhYmxlU3RhdGUuZW50aXR5X2lkLmRlbGV0ZShlbnRpdHlJZCk7XG4gICAgY3R4LmRiLmdhbWVMaXZlVGFyZ2V0YWJsZVN0YXRlLmluc2VydCh7XG4gICAgICBlbnRpdHlfaWQ6IGVudGl0eUlkLFxuICAgICAgcXVhZDogbmV3SGFzaCxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0IG1vYmlsZUVudGl0eVJlcyA9IGN0eC5kYi5nYW1lTW9iaWxlRW50aXR5U3RhdGUuZW50aXR5X2lkLmZpbmQoZW50aXR5SWQpO1xuICBpZiAobW9iaWxlRW50aXR5UmVzID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0dhbWVNb2JpbGVFbnRpdHlTdGF0ZSBFbnRpdHkgSUQgbm90IGZvdW5kJyk7XG4gIH1cbiAgY29uc3QgbW9iaWxlRW50aXR5ID0ge1xuICAgIGVudGl0eV9pZDogZW50aXR5SWQsXG4gICAgbG9jYXRpb25feDogbW9iaWxlRW50aXR5UmVzLmxvY2F0aW9uX3ggKyAxLFxuICAgIGxvY2F0aW9uX3k6IG1vYmlsZUVudGl0eVJlcy5sb2NhdGlvbl95ICsgMSxcbiAgICB0aW1lc3RhbXA6IGFnZW50Lm5leHRfYWN0aW9uX3RpbWVzdGFtcCxcbiAgfTtcblxuICBjdHguZGIuZ2FtZUVuZW15QWlBZ2VudFN0YXRlLmVudGl0eV9pZC51cGRhdGUoYWdlbnQpO1xuXG4gIGN0eC5kYi5nYW1lTW9iaWxlRW50aXR5U3RhdGUuZW50aXR5X2lkLnVwZGF0ZShtb2JpbGVFbnRpdHkpO1xufVxuXG5mdW5jdGlvbiBhZ2VudExvb3AoXG4gIGN0eDogUmVkdWNlckN0eDxTPixcbiAgYWdlbnQ6IEdhbWVFbmVteUFpQWdlbnRTdGF0ZSxcbiAgYWdlbnRUYXJnZXRhYmxlOiBHYW1lVGFyZ2V0YWJsZVN0YXRlLFxuICBzdXJyb3VuZGluZ0FnZW50czogR2FtZVRhcmdldGFibGVTdGF0ZVtdLFxuICBjdXJyZW50VGltZU1zOiBiaWdpbnRcbikge1xuICBjb25zdCBlbnRpdHlJZCA9IGFnZW50LmVudGl0eV9pZDtcblxuICBjb25zdCBjb29yZGluYXRlcyA9IGN0eC5kYi5nYW1lTW9iaWxlRW50aXR5U3RhdGUuZW50aXR5X2lkLmZpbmQoZW50aXR5SWQpO1xuICBpZiAoY29vcmRpbmF0ZXMgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignR2FtZU1vYmlsZUVudGl0eVN0YXRlIEVudGl0eSBJRCBub3QgZm91bmQnKTtcbiAgfVxuXG4gIGNvbnN0IGFnZW50RW50aXR5ID0gY3R4LmRiLmdhbWVFbmVteVN0YXRlLmVudGl0eV9pZC5maW5kKGVudGl0eUlkKTtcbiAgaWYgKGFnZW50RW50aXR5ID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0dhbWVFbmVteVN0YXRlIEVudGl0eSBJRCBub3QgZm91bmQnKTtcbiAgfVxuXG4gIGNvbnN0IGFnZW50SGVyZCA9IGN0eC5kYi5nYW1lSGVyZENhY2hlLmlkLmZpbmQoYWdlbnRFbnRpdHkuaGVyZF9pZCk7XG4gIGlmIChhZ2VudEhlcmQgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignR2FtZUhlcmRDYWNoZSBFbnRpdHkgSUQgbm90IGZvdW5kJyk7XG4gIH1cblxuICBjb25zdCBhZ2VudEhlcmRDb29yZGluYXRlcyA9IGFnZW50SGVyZC5sb2NhdGlvbjtcblxuICBtb3ZlQWdlbnQoY3R4LCBhZ2VudCwgYWdlbnRIZXJkQ29vcmRpbmF0ZXMsIGN1cnJlbnRUaW1lTXMpO1xufVxuXG5leHBvcnQgY29uc3QgZ2FtZUxvb3BFbmVteUlhID0gc3BhY2V0aW1lZGIucmVkdWNlcihcbiAgeyBuYW1lOiAnZ2FtZV9sb29wX2VuZW15X2lhJyB9LFxuICB7IHBsYXllcnM6IHQudTY0KCkgfSxcbiAgKGN0eDogUmVkdWNlckN0eDxTPiwgeyBwbGF5ZXJzIH0pID0+IHtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGNvbnN0IGN1cnJlbnRUaW1lTXMgPSBtb21lbnRNaWxsaXNlY29uZHMoKTtcblxuICAgIGZvciAoY29uc3QgYWdlbnQgb2YgY3R4LmRiLmdhbWVFbmVteUFpQWdlbnRTdGF0ZS5pdGVyKCkpIHtcbiAgICAgIGNvbnN0IGFnZW50VGFyZ2V0YWJsZSA9IGN0eC5kYi5nYW1lVGFyZ2V0YWJsZVN0YXRlLmVudGl0eV9pZC5maW5kKFxuICAgICAgICBhZ2VudC5lbnRpdHlfaWRcbiAgICAgICk7XG4gICAgICBpZiAoYWdlbnRUYXJnZXRhYmxlID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBUYXJnZXRhYmxlU3RhdGUgZm9yIEFnZW50U3RhdGUgZW50aXR5Jyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN1cnJvdW5kaW5nQWdlbnRzID0gZ2V0VGFyZ2V0YWJsZXNOZWFyUXVhZChcbiAgICAgICAgY3R4LFxuICAgICAgICBhZ2VudFRhcmdldGFibGUuZW50aXR5X2lkLFxuICAgICAgICBwbGF5ZXJzXG4gICAgICApO1xuXG4gICAgICBhZ2VudC5hY3Rpb24gPSB7IHRhZzogJ0ZpZ2h0aW5nJyB9O1xuXG4gICAgICBhZ2VudExvb3AoY3R4LCBhZ2VudCwgYWdlbnRUYXJnZXRhYmxlLCBzdXJyb3VuZGluZ0FnZW50cywgY3VycmVudFRpbWVNcyk7XG5cbiAgICAgIGNvdW50ICs9IDE7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coYEVORU1ZIElBIExPT1AgUExBWUVSUzogJHtwbGF5ZXJzfSwgcHJvY2Vzc2VkOiAke2NvdW50fWApO1xuICB9XG4pO1xuXG5leHBvcnQgY29uc3QgaW5pdEdhbWVJYUxvb3AgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IG5hbWU6ICdpbml0X2dhbWVfaWFfbG9vcCcgfSxcbiAgeyBpbml0aWFsX2xvYWQ6IHQudTMyKCkgfSxcbiAgKGN0eCwgeyBpbml0aWFsX2xvYWQgfSkgPT4ge1xuICAgIGNvbnN0IGxvYWQgPSBuZXdMb2FkKGluaXRpYWxfbG9hZCk7XG5cbiAgICBpbnNlcnRCdWxrUG9zaXRpb24oY3R4LCB7IGNvdW50OiBsb2FkLmJpZ2dlc3RUYWJsZSB9KTtcbiAgICBpbnNlcnRCdWxrVmVsb2NpdHkoY3R4LCB7IGNvdW50OiBsb2FkLmJpZ1RhYmxlIH0pO1xuICAgIHVwZGF0ZVBvc2l0aW9uQWxsKGN0eCwgeyBleHBlY3RlZDogbG9hZC5iaWdnZXN0VGFibGUgfSk7XG4gICAgdXBkYXRlUG9zaXRpb25XaXRoVmVsb2NpdHkoY3R4LCB7IGV4cGVjdGVkOiBsb2FkLmJpZ1RhYmxlIH0pO1xuXG4gICAgaW5zZXJ0V29ybGQoY3R4LCB7IHBsYXllcnM6IGxvYWQubnVtUGxheWVycyB9KTtcbiAgfVxuKTtcblxuZXhwb3J0IGNvbnN0IHJ1bkdhbWVJYUxvb3AgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IG5hbWU6ICdydW5fZ2FtZV9pYV9sb29wJyB9LFxuICB7IGluaXRpYWxfbG9hZDogdC51MzIoKSB9LFxuICAoY3R4LCB7IGluaXRpYWxfbG9hZCB9KSA9PiB7XG4gICAgY29uc3QgbG9hZCA9IG5ld0xvYWQoaW5pdGlhbF9sb2FkKTtcblxuICAgIGdhbWVMb29wRW5lbXlJYShjdHgsIHsgcGxheWVyczogbG9hZC5udW1QbGF5ZXJzIH0pO1xuICB9XG4pO1xuIiwiLy8gU1REQiBtb2R1bGUgdXNlZCBmb3IgYmVuY2htYXJrcy5cbi8vXG4vLyBUaGlzIGZpbGUgaXMgdGlnaHRseSBib3VuZCB0byB0aGUgYGJlbmNobWFya3NgIGNyYXRlIChgY3JhdGVzL2JlbmNoYCkuXG4vL1xuLy8gVGhlIHZhcmlvdXMgdGFibGVzIGluIHRoaXMgZmlsZSBuZWVkIHRvIHJlbWFpbiBzeW5jZWQgd2l0aCBgY3JhdGVzL2JlbmNoL3NyYy9zY2hlbWFzLnJzYFxuLy8gRmllbGQgb3JkZXJzLCBuYW1lcywgYW5kIHR5cGVzIHNob3VsZCBiZSB0aGUgc2FtZS5cbi8vXG4vLyBXZSBpbnN0YW50aWF0ZSBtdWx0aXBsZSBjb3BpZXMgb2YgZWFjaCB0YWJsZS4gVGhlc2Ugc2hvdWxkIGJlIGlkZW50aWNhbFxuLy8gYXNpZGUgZnJvbSBpbmRleGluZyBzdHJhdGVneS4gVGFibGUgbmFtZXMgbXVzdCBtYXRjaCB0aGUgdGVtcGxhdGU6XG4vL1xuLy8gYHtJbmRleFN0cmF0ZWd5fXtUYWJsZU5hbWV9YCwgaW4gUGFzY2FsQ2FzZS5cbi8vXG4vLyBUaGUgcmVkdWNlcnMgbmVlZCB0byByZW1haW4gc3luY2VkIHdpdGggYGNyYXRlcy9iZW5jaC9zcmMvc3BhY2V0aW1lX21vZHVsZS5yc2Bcbi8vIFJlZHVjZXIgbmFtZXMgbXVzdCBtYXRjaCB0aGUgdGVtcGxhdGU6XG4vL1xuLy8gYHtvcGVyYXRpb259X3tpbmRleF9zdHJhdGVneX1fe3RhYmxlX25hbWV9YCwgaW4gc25ha2VfY2FzZS5cbi8vXG4vLyBUaGUgdGhyZWUgaW5kZXggc3RyYXRlZ2llcyBhcmU6XG4vLyAtIGB1bmlxdWVgOiBhIHNpbmdsZSB1bmlxdWUga2V5LCBkZWNsYXJlZCBmaXJzdCBpbiB0aGUgc3RydWN0LlxuLy8gLSBgbm9faW5kZXhgOiBubyBpbmRleGVzLlxuLy8gLSBgYnRyZWVfZWFjaF9jb2x1bW5gOiBvbmUgaW5kZXggZm9yIGVhY2ggY29sdW1uLlxuLy9cbi8vIE9idmlvdXNseSBtb3JlIGNvdWxkIGJlIGFkZGVkLi4uXG5cbmltcG9ydCB7IGJsYWNrQm94IH0gZnJvbSAnLi9sb2FkJztcbmltcG9ydCB7XG4gIHNwYWNldGltZWRiLFxuICB1bmlxdWVfMF91MzJfdTY0X3U2NF90Um93LFxuICBub19pbmRleF91MzJfdTY0X3U2NF90Um93LFxuICBidHJlZV9lYWNoX2NvbHVtbl91MzJfdTY0X3U2NF90Um93LFxuICB1bmlxdWVfMF91MzJfdTY0X3N0cl90Um93LFxuICBub19pbmRleF91MzJfdTY0X3N0cl90Um93LFxuICBidHJlZV9lYWNoX2NvbHVtbl91MzJfdTY0X3N0cl90Um93LFxufSBmcm9tICcuL3NjaGVtYSc7XG5pbXBvcnQgeyB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcblxuLy8gLS0tLS0tLS0tLSBlbXB0eSAtLS0tLS0tLS0tXG5cbmV4cG9ydCBjb25zdCBlbXB0eSA9IHNwYWNldGltZWRiLnJlZHVjZXIoKCkgPT4ge30pO1xuXG4vLyAtLS0tLS0tLS0tIGNwdV9oZWF2eSAtLS0tLS0tLS0tXG4vLyBSUEcgc3RhdCBjb21wdXRhdGlvbiBrZXJuZWw6IDEwMGsgaXRlcmF0aW9ucyBvZiB4b3JzaGlmdDMyICsgZGFtYWdlIGZvcm11bGFzLlxuLy8gTWF0Y2hlcyB0aGUgUGVycnkgQU9UIGJlbmNoIGtlcm5lbCBmb3IgYXBwbGVzLXRvLWFwcGxlcyBjb21wYXJpc29uLlxuXG5leHBvcnQgY29uc3QgY3B1X2hlYXZ5ID0gc3BhY2V0aW1lZGIucmVkdWNlcigoKSA9PiB7XG4gIGxldCB4ID0gMHg5ZTM3NzliOSB8IDA7IC8vIGdvbGRlbiByYXRpbyBiaXRzLCAzMi1iaXQgc2VlZFxuICBsZXQgYWNjID0gMC4wO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDEwMDAwMDsgaSsrKSB7XG4gICAgLy8geG9yc2hpZnQzMiBQUk5HXG4gICAgeCA9IHggXiAoeCA8PCAxMyk7XG4gICAgeCA9IHggXiAoeCA+PiAxNyk7XG4gICAgeCA9IHggXiAoeCA8PCA1KTtcblxuICAgIC8vIFJQRyBzdGF0IGNvbXB1dGF0aW9uIHVzaW5nIFBSTkcgb3V0cHV0IGFzIHNlZWRcbiAgICBjb25zdCBiYXNlX2F0dGFjayA9ICh4ICYgMHhmZikgKyAxMDsgLy8gMTAtMjY1XG4gICAgY29uc3QgYmFzZV9kZWZlbnNlID0gKCh4ID4+IDgpICYgMHhmZikgKyA1OyAvLyA1LTI2MFxuICAgIGNvbnN0IGxldmVsID0gKCh4ID4+IDE2KSAmIDB4M2YpICsgMTsgLy8gMS02NFxuXG4gICAgLy8gRGFtYWdlIGZvcm11bGE6IGF0dGFjayAqIGxldmVsX211bHRpcGxpZXIgLSBkZWZlbnNlICogcmVzaXN0YW5jZVxuICAgIGNvbnN0IGxldmVsX211bHQgPSAxLjAgKyBsZXZlbCAqIDAuMDU7XG4gICAgY29uc3QgZWZmZWN0aXZlX2F0dGFjayA9IGJhc2VfYXR0YWNrICogbGV2ZWxfbXVsdDtcbiAgICBjb25zdCByZXNpc3RhbmNlID0gMC4zICsgYmFzZV9kZWZlbnNlIC8gMTAwMC4wO1xuICAgIGNvbnN0IGRhbWFnZSA9IGVmZmVjdGl2ZV9hdHRhY2sgLSBiYXNlX2RlZmVuc2UgKiByZXNpc3RhbmNlO1xuXG4gICAgYWNjID0gYWNjICsgKGRhbWFnZSA+IDAgPyBkYW1hZ2UgOiAwKTtcbiAgfVxufSk7XG5cbi8vIC0tLS0tLS0tLS0gaW5zZXJ0IC0tLS0tLS0tLS1cblxuZXhwb3J0IGNvbnN0IGluc2VydF91bmlxdWVfMF91MzJfdTY0X3N0ciA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHsgaWQ6IHQudTMyKCksIGFnZTogdC51NjQoKSwgbmFtZTogdC5zdHJpbmcoKSB9LFxuICAoY3R4LCB7IGlkLCBhZ2UsIG5hbWUgfSkgPT4ge1xuICAgIGN0eC5kYi51bmlxdWUwVTMyVTY0U3RyLmluc2VydCh7IGlkLCBuYW1lLCBhZ2UgfSk7XG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCBpbnNlcnRfbm9faW5kZXhfdTMyX3U2NF9zdHIgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IGlkOiB0LnUzMigpLCBhZ2U6IHQudTY0KCksIG5hbWU6IHQuc3RyaW5nKCkgfSxcbiAgKGN0eCwgeyBpZCwgYWdlLCBuYW1lIH0pID0+IHtcbiAgICBjdHguZGIubm9JbmRleFUzMlU2NFN0ci5pbnNlcnQoeyBpZCwgbmFtZSwgYWdlIH0pO1xuICB9XG4pO1xuXG5leHBvcnQgY29uc3QgaW5zZXJ0X2J0cmVlX2VhY2hfY29sdW1uX3UzMl91NjRfc3RyID0gc3BhY2V0aW1lZGIucmVkdWNlcihcbiAgeyBpZDogdC51MzIoKSwgYWdlOiB0LnU2NCgpLCBuYW1lOiB0LnN0cmluZygpIH0sXG4gIChjdHgsIHsgaWQsIGFnZSwgbmFtZSB9KSA9PiB7XG4gICAgY3R4LmRiLmJ0cmVlRWFjaENvbHVtblUzMlU2NFN0ci5pbnNlcnQoeyBpZCwgbmFtZSwgYWdlIH0pO1xuICB9XG4pO1xuXG5leHBvcnQgY29uc3QgaW5zZXJ0X3VuaXF1ZV8wX3UzMl91NjRfdTY0ID0gc3BhY2V0aW1lZGIucmVkdWNlcihcbiAgeyBpZDogdC51MzIoKSwgeDogdC51NjQoKSwgeTogdC51NjQoKSB9LFxuICAoY3R4LCB7IGlkLCB4LCB5IH0pID0+IHtcbiAgICBjdHguZGIudW5pcXVlMFUzMlU2NFU2NC5pbnNlcnQoeyBpZCwgeCwgeSB9KTtcbiAgfVxuKTtcblxuZXhwb3J0IGNvbnN0IGluc2VydF9ub19pbmRleF91MzJfdTY0X3U2NCA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHsgaWQ6IHQudTMyKCksIHg6IHQudTY0KCksIHk6IHQudTY0KCkgfSxcbiAgKGN0eCwgeyBpZCwgeCwgeSB9KSA9PiB7XG4gICAgY3R4LmRiLm5vSW5kZXhVMzJVNjRVNjQuaW5zZXJ0KHsgaWQsIHgsIHkgfSk7XG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCBpbnNlcnRfYnRyZWVfZWFjaF9jb2x1bW5fdTMyX3U2NF91NjQgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IGlkOiB0LnUzMigpLCB4OiB0LnU2NCgpLCB5OiB0LnU2NCgpIH0sXG4gIChjdHgsIHsgaWQsIHgsIHkgfSkgPT4ge1xuICAgIGN0eC5kYi5idHJlZUVhY2hDb2x1bW5VMzJVNjRVNjQuaW5zZXJ0KHsgaWQsIHgsIHkgfSk7XG4gIH1cbik7XG5cbi8vIC0tLS0tLS0tLS0gaW5zZXJ0IGJ1bGsgLS0tLS0tLS0tLVxuXG5leHBvcnQgY29uc3QgaW5zZXJ0X2J1bGtfdW5pcXVlXzBfdTMyX3U2NF91NjQgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IGxvY3M6IHQuYXJyYXkodW5pcXVlXzBfdTMyX3U2NF91NjRfdFJvdykgfSxcbiAgKGN0eCwgeyBsb2NzIH0pID0+IHtcbiAgICBmb3IgKGNvbnN0IGxvYyBvZiBsb2NzKSB7XG4gICAgICBjdHguZGIudW5pcXVlMFUzMlU2NFU2NC5pbnNlcnQobG9jKTtcbiAgICB9XG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCBpbnNlcnRfYnVsa19ub19pbmRleF91MzJfdTY0X3U2NCA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHsgbG9jczogdC5hcnJheShub19pbmRleF91MzJfdTY0X3U2NF90Um93KSB9LFxuICAoY3R4LCB7IGxvY3MgfSkgPT4ge1xuICAgIGZvciAoY29uc3QgbG9jIG9mIGxvY3MpIHtcbiAgICAgIGN0eC5kYi5ub0luZGV4VTMyVTY0VTY0Lmluc2VydChsb2MpO1xuICAgIH1cbiAgfVxuKTtcblxuZXhwb3J0IGNvbnN0IGluc2VydF9idWxrX2J0cmVlX2VhY2hfY29sdW1uX3UzMl91NjRfdTY0ID0gc3BhY2V0aW1lZGIucmVkdWNlcihcbiAgeyBsb2NzOiB0LmFycmF5KGJ0cmVlX2VhY2hfY29sdW1uX3UzMl91NjRfdTY0X3RSb3cpIH0sXG4gIChjdHgsIHsgbG9jcyB9KSA9PiB7XG4gICAgZm9yIChjb25zdCBsb2Mgb2YgbG9jcykge1xuICAgICAgY3R4LmRiLmJ0cmVlRWFjaENvbHVtblUzMlU2NFU2NC5pbnNlcnQobG9jKTtcbiAgICB9XG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCBpbnNlcnRfYnVsa191bmlxdWVfMF91MzJfdTY0X3N0ciA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHsgcGVvcGxlOiB0LmFycmF5KHVuaXF1ZV8wX3UzMl91NjRfc3RyX3RSb3cpIH0sXG4gIChjdHgsIHsgcGVvcGxlIH0pID0+IHtcbiAgICBmb3IgKGNvbnN0IHAgb2YgcGVvcGxlKSB7XG4gICAgICBjdHguZGIudW5pcXVlMFUzMlU2NFN0ci5pbnNlcnQocCk7XG4gICAgfVxuICB9XG4pO1xuXG5leHBvcnQgY29uc3QgaW5zZXJ0X2J1bGtfbm9faW5kZXhfdTMyX3U2NF9zdHIgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IHBlb3BsZTogdC5hcnJheShub19pbmRleF91MzJfdTY0X3N0cl90Um93KSB9LFxuICAoY3R4LCB7IHBlb3BsZSB9KSA9PiB7XG4gICAgZm9yIChjb25zdCBwIG9mIHBlb3BsZSkge1xuICAgICAgY3R4LmRiLm5vSW5kZXhVMzJVNjRTdHIuaW5zZXJ0KHApO1xuICAgIH1cbiAgfVxuKTtcblxuZXhwb3J0IGNvbnN0IGluc2VydF9idWxrX2J0cmVlX2VhY2hfY29sdW1uX3UzMl91NjRfc3RyID0gc3BhY2V0aW1lZGIucmVkdWNlcihcbiAgeyBwZW9wbGU6IHQuYXJyYXkoYnRyZWVfZWFjaF9jb2x1bW5fdTMyX3U2NF9zdHJfdFJvdykgfSxcbiAgKGN0eCwgeyBwZW9wbGUgfSkgPT4ge1xuICAgIGZvciAoY29uc3QgcCBvZiBwZW9wbGUpIHtcbiAgICAgIGN0eC5kYi5idHJlZUVhY2hDb2x1bW5VMzJVNjRTdHIuaW5zZXJ0KHApO1xuICAgIH1cbiAgfVxuKTtcblxuLy8gLS0tLS0tLS0tLSB1cGRhdGUgLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBhc3NlcnQoY29uZDogYm9vbGVhbikge1xuICBpZiAoIWNvbmQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Fzc2VydGlvbiBmYWlsZWQnKTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgdXBkYXRlX2J1bGtfdW5pcXVlXzBfdTMyX3U2NF91NjQgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IHJvd19jb3VudDogdC51MzIoKSB9LFxuICAoY3R4LCB7IHJvd19jb3VudCB9KSA9PiB7XG4gICAgbGV0IGhpdCA9IDA7XG4gICAgZm9yIChjb25zdCBsb2Mgb2YgY3R4LmRiLnVuaXF1ZTBVMzJVNjRVNjQuaXRlcigpKSB7XG4gICAgICBpZiAoaGl0ID09IHJvd19jb3VudCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaGl0ICs9IDE7XG4gICAgICBjdHguZGIudW5pcXVlMFUzMlU2NFU2NC5pZD8udXBkYXRlKHtcbiAgICAgICAgaWQ6IGxvYy5pZCxcbiAgICAgICAgeDogbG9jLnggKyAxbixcbiAgICAgICAgeTogbG9jLnksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3NlcnQoaGl0ID09IHJvd19jb3VudCk7XG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCB1cGRhdGVfYnVsa191bmlxdWVfMF91MzJfdTY0X3N0ciA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHsgcm93X2NvdW50OiB0LnUzMigpIH0sXG4gIChjdHgsIHsgcm93X2NvdW50IH0pID0+IHtcbiAgICBsZXQgaGl0ID0gMDtcbiAgICBmb3IgKGNvbnN0IHAgb2YgY3R4LmRiLnVuaXF1ZTBVMzJVNjRTdHIuaXRlcigpKSB7XG4gICAgICBpZiAoaGl0ID09IHJvd19jb3VudCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaGl0ICs9IDE7XG4gICAgICBjdHguZGIudW5pcXVlMFUzMlU2NFN0ci5pZD8udXBkYXRlKHtcbiAgICAgICAgaWQ6IHAuaWQsXG4gICAgICAgIGFnZTogcC5hZ2UgKyAxbixcbiAgICAgICAgbmFtZTogcC5uYW1lLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXNzZXJ0KGhpdCA9PSByb3dfY291bnQpO1xuICB9XG4pO1xuXG4vLyAtLS0tLS0tLS0tIGl0ZXJhdGUgLS0tLS0tLS0tLVxuXG5leHBvcnQgY29uc3QgaXRlcmF0ZV91bmlxdWVfMF91MzJfdTY0X3N0ciA9IHNwYWNldGltZWRiLnJlZHVjZXIoY3R4ID0+IHtcbiAgZm9yIChjb25zdCB4IG9mIGN0eC5kYi51bmlxdWUwVTMyVTY0U3RyLml0ZXIoKSkge1xuICAgIGJsYWNrQm94KHgpO1xuICB9XG59KTtcblxuZXhwb3J0IGNvbnN0IGl0ZXJhdGVfdW5pcXVlXzBfdTMyX3U2NF91NjQgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKGN0eCA9PiB7XG4gIGZvciAoY29uc3QgeCBvZiBjdHguZGIudW5pcXVlMFUzMlU2NFU2NC5pdGVyKCkpIHtcbiAgICBibGFja0JveCh4KTtcbiAgfVxufSk7XG5cbi8vIC0tLS0tLS0tLS0gZmlsdGVyaW5nIC0tLS0tLS0tLS1cblxuZXhwb3J0IGNvbnN0IGZpbHRlcl91bmlxdWVfMF91MzJfdTY0X3N0cl9ieV9pZCA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHsgaWQ6IHQudTMyKCkgfSxcbiAgKGN0eCwgeyBpZCB9KSA9PiB7XG4gICAgYmxhY2tCb3goY3R4LmRiLnVuaXF1ZTBVMzJVNjRTdHIuaWQ/LmZpbmQoaWQpKTtcbiAgfVxuKTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlcl9ub19pbmRleF91MzJfdTY0X3N0cl9ieV9pZCA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHsgaWQ6IHQudTMyKCkgfSxcbiAgKGN0eCwgeyBpZCB9KSA9PiB7XG4gICAgZm9yIChjb25zdCByIG9mIGN0eC5kYi5ub0luZGV4VTMyVTY0U3RyLml0ZXIoKSkge1xuICAgICAgaWYgKHIuaWQgPT0gaWQpIHtcbiAgICAgICAgYmxhY2tCb3gocik7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5leHBvcnQgY29uc3QgZmlsdGVyX2J0cmVlX2VhY2hfY29sdW1uX3UzMl91NjRfc3RyX2J5X2lkID0gc3BhY2V0aW1lZGIucmVkdWNlcihcbiAgeyBpZDogdC51MzIoKSB9LFxuICAoY3R4LCB7IGlkIH0pID0+IHtcbiAgICBjb25zdCBpZEluZGV4ID0gY3R4LmRiLmJ0cmVlRWFjaENvbHVtblUzMlU2NFN0ci5pZDtcbiAgICBpZiAoaWRJbmRleCkge1xuICAgICAgZm9yIChjb25zdCByIG9mIGlkSW5kZXguZmlsdGVyKGlkKSkge1xuICAgICAgICBibGFja0JveChyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJfdW5pcXVlXzBfdTMyX3U2NF9zdHJfYnlfbmFtZSA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHsgbmFtZTogdC5zdHJpbmcoKSB9LFxuICAoY3R4LCB7IG5hbWUgfSkgPT4ge1xuICAgIGZvciAoY29uc3QgciBvZiBjdHguZGIudW5pcXVlMFUzMlU2NFN0ci5pdGVyKCkpIHtcbiAgICAgIGlmIChyLm5hbWUgPT0gbmFtZSkge1xuICAgICAgICBibGFja0JveChyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJfbm9faW5kZXhfdTMyX3U2NF9zdHJfYnlfbmFtZSA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHsgbmFtZTogdC5zdHJpbmcoKSB9LFxuICAoY3R4LCB7IG5hbWUgfSkgPT4ge1xuICAgIGZvciAoY29uc3QgciBvZiBjdHguZGIubm9JbmRleFUzMlU2NFN0ci5pdGVyKCkpIHtcbiAgICAgIGlmIChyLm5hbWUgPT0gbmFtZSkge1xuICAgICAgICBibGFja0JveChyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJfYnRyZWVfZWFjaF9jb2x1bW5fdTMyX3U2NF9zdHJfYnlfbmFtZSA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHsgbmFtZTogdC5zdHJpbmcoKSB9LFxuICAoY3R4LCB7IG5hbWUgfSkgPT4ge1xuICAgIGNvbnN0IG5hbWVJbmRleCA9IGN0eC5kYi5idHJlZUVhY2hDb2x1bW5VMzJVNjRTdHIubmFtZTtcbiAgICBpZiAobmFtZUluZGV4KSB7XG4gICAgICBmb3IgKGNvbnN0IHIgb2YgbmFtZUluZGV4LmZpbHRlcihuYW1lKSkge1xuICAgICAgICBibGFja0JveChyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJfdW5pcXVlXzBfdTMyX3U2NF91NjRfYnlfaWQgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IGlkOiB0LnUzMigpIH0sXG4gIChjdHgsIHsgaWQgfSkgPT4ge1xuICAgIGJsYWNrQm94KGN0eC5kYi51bmlxdWUwVTMyVTY0VTY0LmlkPy5maW5kKGlkKSk7XG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJfbm9faW5kZXhfdTMyX3U2NF91NjRfYnlfaWQgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IGlkOiB0LnUzMigpIH0sXG4gIChjdHgsIHsgaWQgfSkgPT4ge1xuICAgIGZvciAoY29uc3QgciBvZiBjdHguZGIubm9JbmRleFUzMlU2NFU2NC5pdGVyKCkpIHtcbiAgICAgIGlmIChyLmlkID09IGlkKSB7XG4gICAgICAgIGJsYWNrQm94KHIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuKTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlcl9idHJlZV9lYWNoX2NvbHVtbl91MzJfdTY0X3U2NF9ieV9pZCA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHsgaWQ6IHQudTMyKCkgfSxcbiAgKGN0eCwgeyBpZCB9KSA9PiB7XG4gICAgY29uc3QgaWRJbmRleCA9IGN0eC5kYi5idHJlZUVhY2hDb2x1bW5VMzJVNjRVNjQuaWQ7XG4gICAgaWYgKGlkSW5kZXgpIHtcbiAgICAgIGZvciAoY29uc3QgciBvZiBpZEluZGV4LmZpbHRlcihpZCkpIHtcbiAgICAgICAgYmxhY2tCb3gocik7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5leHBvcnQgY29uc3QgZmlsdGVyX3VuaXF1ZV8wX3UzMl91NjRfdTY0X2J5X3ggPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IHg6IHQudTY0KCkgfSxcbiAgKGN0eCwgeyB4IH0pID0+IHtcbiAgICBmb3IgKGNvbnN0IHIgb2YgY3R4LmRiLnVuaXF1ZTBVMzJVNjRVNjQuaXRlcigpKSB7XG4gICAgICBpZiAoci54ID09IHgpIHtcbiAgICAgICAgYmxhY2tCb3gocik7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5leHBvcnQgY29uc3QgZmlsdGVyX25vX2luZGV4X3UzMl91NjRfdTY0X2J5X3ggPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IHg6IHQudTY0KCkgfSxcbiAgKGN0eCwgeyB4IH0pID0+IHtcbiAgICBmb3IgKGNvbnN0IHIgb2YgY3R4LmRiLm5vSW5kZXhVMzJVNjRVNjQuaXRlcigpKSB7XG4gICAgICBpZiAoci54ID09IHgpIHtcbiAgICAgICAgYmxhY2tCb3gocik7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5leHBvcnQgY29uc3QgZmlsdGVyX2J0cmVlX2VhY2hfY29sdW1uX3UzMl91NjRfdTY0X2J5X3ggPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IHg6IHQudTY0KCkgfSxcbiAgKGN0eCwgeyB4IH0pID0+IHtcbiAgICBjb25zdCB4SW5kZXggPSBjdHguZGIuYnRyZWVFYWNoQ29sdW1uVTMyVTY0VTY0Lng7XG4gICAgaWYgKHhJbmRleCkge1xuICAgICAgZm9yIChjb25zdCByIG9mIHhJbmRleC5maWx0ZXIoeCkpIHtcbiAgICAgICAgYmxhY2tCb3gocik7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5leHBvcnQgY29uc3QgZmlsdGVyX3VuaXF1ZV8wX3UzMl91NjRfdTY0X2J5X3kgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IHk6IHQudTY0KCkgfSxcbiAgKGN0eCwgeyB5IH0pID0+IHtcbiAgICBmb3IgKGNvbnN0IHIgb2YgY3R4LmRiLnVuaXF1ZTBVMzJVNjRVNjQuaXRlcigpKSB7XG4gICAgICBpZiAoci55ID09IHkpIHtcbiAgICAgICAgYmxhY2tCb3gocik7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5leHBvcnQgY29uc3QgZmlsdGVyX25vX2luZGV4X3UzMl91NjRfdTY0X2J5X3kgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IHk6IHQudTY0KCkgfSxcbiAgKGN0eCwgeyB5IH0pID0+IHtcbiAgICBmb3IgKGNvbnN0IHIgb2YgY3R4LmRiLm5vSW5kZXhVMzJVNjRVNjQuaXRlcigpKSB7XG4gICAgICBpZiAoci55ID09IHkpIHtcbiAgICAgICAgYmxhY2tCb3gocik7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5leHBvcnQgY29uc3QgZmlsdGVyX2J0cmVlX2VhY2hfY29sdW1uX3UzMl91NjRfdTY0X2J5X3kgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IHk6IHQudTY0KCkgfSxcbiAgKGN0eCwgeyB5IH0pID0+IHtcbiAgICBjb25zdCB5SW5kZXggPSBjdHguZGIuYnRyZWVFYWNoQ29sdW1uVTMyVTY0VTY0Lnk7XG4gICAgaWYgKHlJbmRleCkge1xuICAgICAgZm9yIChjb25zdCByIG9mIHlJbmRleC5maWx0ZXIoeSkpIHtcbiAgICAgICAgYmxhY2tCb3gocik7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG4vLyAtLS0tLS0tLS0tIGRlbGV0ZSAtLS0tLS0tLS0tXG5cbi8vIEZJWE1FOiBjdXJyZW50IG5vbnVuaXF1ZSBkZWxldGUgaW50ZXJmYWNlIGlzIFVOVVNBQkxFISEhIVxuXG5leHBvcnQgY29uc3QgZGVsZXRlX3VuaXF1ZV8wX3UzMl91NjRfc3RyX2J5X2lkID0gc3BhY2V0aW1lZGIucmVkdWNlcihcbiAgeyBpZDogdC51MzIoKSB9LFxuICAoY3R4LCB7IGlkIH0pID0+IHtcbiAgICBjdHguZGIudW5pcXVlMFUzMlU2NFN0ci5pZD8uZGVsZXRlKGlkKTtcbiAgfVxuKTtcblxuZXhwb3J0IGNvbnN0IGRlbGV0ZV91bmlxdWVfMF91MzJfdTY0X3U2NF9ieV9pZCA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHsgaWQ6IHQudTMyKCkgfSxcbiAgKGN0eCwgeyBpZCB9KSA9PiB7XG4gICAgY3R4LmRiLnVuaXF1ZTBVMzJVNjRVNjQuaWQ/LmRlbGV0ZShpZCk7XG4gIH1cbik7XG5cbi8vIC0tLS0tLS0tLS0gY2xlYXIgdGFibGUgLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiB1bmltcGxlbWVudGVkKCkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ01vZHVsZXMgY3VycmVudGx5IGhhdmUgbm8gaW50ZXJmYWNlIHRvIGNsZWFyIGEgdGFibGUnKTtcbn1cblxuZXhwb3J0IGNvbnN0IGNsZWFyX3RhYmxlX3VuaXF1ZV8wX3UzMl91NjRfc3RyID1cbiAgc3BhY2V0aW1lZGIucmVkdWNlcih1bmltcGxlbWVudGVkKTtcblxuZXhwb3J0IGNvbnN0IGNsZWFyX3RhYmxlX25vX2luZGV4X3UzMl91NjRfc3RyID1cbiAgc3BhY2V0aW1lZGIucmVkdWNlcih1bmltcGxlbWVudGVkKTtcblxuZXhwb3J0IGNvbnN0IGNsZWFyX3RhYmxlX2J0cmVlX2VhY2hfY29sdW1uX3UzMl91NjRfc3RyID1cbiAgc3BhY2V0aW1lZGIucmVkdWNlcih1bmltcGxlbWVudGVkKTtcblxuZXhwb3J0IGNvbnN0IGNsZWFyX3RhYmxlX3VuaXF1ZV8wX3UzMl91NjRfdTY0ID1cbiAgc3BhY2V0aW1lZGIucmVkdWNlcih1bmltcGxlbWVudGVkKTtcblxuZXhwb3J0IGNvbnN0IGNsZWFyX3RhYmxlX25vX2luZGV4X3UzMl91NjRfdTY0ID1cbiAgc3BhY2V0aW1lZGIucmVkdWNlcih1bmltcGxlbWVudGVkKTtcblxuZXhwb3J0IGNvbnN0IGNsZWFyX3RhYmxlX2J0cmVlX2VhY2hfY29sdW1uX3UzMl91NjRfdTY0ID1cbiAgc3BhY2V0aW1lZGIucmVkdWNlcih1bmltcGxlbWVudGVkKTtcblxuLy8gLS0tLS0tLS0tLSBjb3VudCAtLS0tLS0tLS0tXG5cbi8vIFlvdSBuZWVkIHRvIGluc3BlY3QgdGhlIG1vZHVsZSBvdXRwdXRzIHRvIGFjdHVhbGx5IHJlYWQgdGhlIHJlc3VsdCBmcm9tIHRoZXNlLlxuXG5leHBvcnQgY29uc3QgY291bnRfdW5pcXVlXzBfdTMyX3U2NF9zdHIgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKGN0eCA9PiB7XG4gIGNvbnN0IGNvdW50ID0gY3R4LmRiLnVuaXF1ZTBVMzJVNjRTdHIuY291bnQoKTtcbiAgY29uc29sZS5pbmZvIShgQ09VTlQ6ICR7Y291bnR9YCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IGNvdW50X25vX2luZGV4X3UzMl91NjRfc3RyID0gc3BhY2V0aW1lZGIucmVkdWNlcihjdHggPT4ge1xuICBjb25zdCBjb3VudCA9IGN0eC5kYi5ub0luZGV4VTMyVTY0U3RyLmNvdW50KCk7XG4gIGNvbnNvbGUuaW5mbyEoYENPVU5UOiAke2NvdW50fWApO1xufSk7XG5cbmV4cG9ydCBjb25zdCBjb3VudF9idHJlZV9lYWNoX2NvbHVtbl91MzJfdTY0X3N0ciA9IHNwYWNldGltZWRiLnJlZHVjZXIoY3R4ID0+IHtcbiAgY29uc3QgY291bnQgPSBjdHguZGIuYnRyZWVFYWNoQ29sdW1uVTMyVTY0U3RyLmNvdW50KCk7XG4gIGNvbnNvbGUuaW5mbyEoYENPVU5UOiAke2NvdW50fWApO1xufSk7XG5cbmV4cG9ydCBjb25zdCBjb3VudF91bmlxdWVfMF91MzJfdTY0X3U2NCA9IHNwYWNldGltZWRiLnJlZHVjZXIoY3R4ID0+IHtcbiAgY29uc3QgY291bnQgPSBjdHguZGIudW5pcXVlMFUzMlU2NFU2NC5jb3VudCgpO1xuICBjb25zb2xlLmluZm8hKGBDT1VOVDogJHtjb3VudH1gKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgY291bnRfbm9faW5kZXhfdTMyX3U2NF91NjQgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKGN0eCA9PiB7XG4gIGNvbnN0IGNvdW50ID0gY3R4LmRiLm5vSW5kZXhVMzJVNjRVNjQuY291bnQoKTtcbiAgY29uc29sZS5pbmZvIShgQ09VTlQ6ICR7Y291bnR9YCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IGNvdW50X2J0cmVlX2VhY2hfY29sdW1uX3UzMl91NjRfdTY0ID0gc3BhY2V0aW1lZGIucmVkdWNlcihjdHggPT4ge1xuICBjb25zdCBjb3VudCA9IGN0eC5kYi5idHJlZUVhY2hDb2x1bW5VMzJVNjRVNjQuY291bnQoKTtcbiAgY29uc29sZS5pbmZvIShgQ09VTlQ6ICR7Y291bnR9YCk7XG59KTtcblxuLy8gLS0tLS0tLS0tLSBtb2R1bGUtc3BlY2lmaWMgc3R1ZmYgLS0tLS0tLS0tLVxuXG5leHBvcnQgY29uc3QgZm5fd2l0aF8xX2FyZ3MgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxuICB7IF9hcmc6IHQuc3RyaW5nKCkgfSxcbiAgKGN0eCwgeyBfYXJnIH0pID0+IHtcbiAgICBibGFja0JveChfYXJnKTtcbiAgfVxuKTtcblxuZXhwb3J0IGNvbnN0IGZuX3dpdGhfMzJfYXJncyA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHtcbiAgICBfYXJnMTogdC5zdHJpbmcoKSxcbiAgICBfYXJnMjogdC5zdHJpbmcoKSxcbiAgICBfYXJnMzogdC5zdHJpbmcoKSxcbiAgICBfYXJnNDogdC5zdHJpbmcoKSxcbiAgICBfYXJnNTogdC5zdHJpbmcoKSxcbiAgICBfYXJnNjogdC5zdHJpbmcoKSxcbiAgICBfYXJnNzogdC5zdHJpbmcoKSxcbiAgICBfYXJnODogdC5zdHJpbmcoKSxcbiAgICBfYXJnOTogdC5zdHJpbmcoKSxcbiAgICBfYXJnMTA6IHQuc3RyaW5nKCksXG4gICAgX2FyZzExOiB0LnN0cmluZygpLFxuICAgIF9hcmcxMjogdC5zdHJpbmcoKSxcbiAgICBfYXJnMTM6IHQuc3RyaW5nKCksXG4gICAgX2FyZzE0OiB0LnN0cmluZygpLFxuICAgIF9hcmcxNTogdC5zdHJpbmcoKSxcbiAgICBfYXJnMTY6IHQuc3RyaW5nKCksXG4gICAgX2FyZzE3OiB0LnN0cmluZygpLFxuICAgIF9hcmcxODogdC5zdHJpbmcoKSxcbiAgICBfYXJnMTk6IHQuc3RyaW5nKCksXG4gICAgX2FyZzIwOiB0LnN0cmluZygpLFxuICAgIF9hcmcyMTogdC5zdHJpbmcoKSxcbiAgICBfYXJnMjI6IHQuc3RyaW5nKCksXG4gICAgX2FyZzIzOiB0LnN0cmluZygpLFxuICAgIF9hcmcyNDogdC5zdHJpbmcoKSxcbiAgICBfYXJnMjU6IHQuc3RyaW5nKCksXG4gICAgX2FyZzI2OiB0LnN0cmluZygpLFxuICAgIF9hcmcyNzogdC5zdHJpbmcoKSxcbiAgICBfYXJnMjg6IHQuc3RyaW5nKCksXG4gICAgX2FyZzI5OiB0LnN0cmluZygpLFxuICAgIF9hcmczMDogdC5zdHJpbmcoKSxcbiAgICBfYXJnMzE6IHQuc3RyaW5nKCksXG4gICAgX2FyZzMyOiB0LnN0cmluZygpLFxuICB9LFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gIChcbiAgICBjdHgsXG4gICAge1xuICAgICAgX2FyZzEsXG4gICAgICBfYXJnMixcbiAgICAgIF9hcmczLFxuICAgICAgX2FyZzQsXG4gICAgICBfYXJnNSxcbiAgICAgIF9hcmc2LFxuICAgICAgX2FyZzcsXG4gICAgICBfYXJnOCxcbiAgICAgIF9hcmc5LFxuICAgICAgX2FyZzEwLFxuICAgICAgX2FyZzExLFxuICAgICAgX2FyZzEyLFxuICAgICAgX2FyZzEzLFxuICAgICAgX2FyZzE0LFxuICAgICAgX2FyZzE1LFxuICAgICAgX2FyZzE2LFxuICAgICAgX2FyZzE3LFxuICAgICAgX2FyZzE4LFxuICAgICAgX2FyZzE5LFxuICAgICAgX2FyZzIwLFxuICAgICAgX2FyZzIxLFxuICAgICAgX2FyZzIyLFxuICAgICAgX2FyZzIzLFxuICAgICAgX2FyZzI0LFxuICAgICAgX2FyZzI1LFxuICAgICAgX2FyZzI2LFxuICAgICAgX2FyZzI3LFxuICAgICAgX2FyZzI4LFxuICAgICAgX2FyZzI5LFxuICAgICAgX2FyZzMwLFxuICAgICAgX2FyZzMxLFxuICAgICAgX2FyZzMyLFxuICAgIH1cbiAgKSA9PiB7fVxuKTtcblxuZXhwb3J0IGNvbnN0IHByaW50X21hbnlfdGhpbmdzID0gc3BhY2V0aW1lZGIucmVkdWNlcihcbiAgeyBuOiB0LnUzMigpIH0sXG4gIChjdHgsIHsgbiB9KSA9PiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIGNvbnNvbGUubG9nKCdoZWxsbyBhZ2FpbiEnKTtcbiAgICB9XG4gIH1cbik7XG4iXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsSUFBSUEsYUFBVyxPQUFPO0FBQ3RCLElBQUlDLGNBQVksT0FBTztBQUN2QixJQUFJQyxxQkFBbUIsT0FBTztBQUM5QixJQUFJQyxzQkFBb0IsT0FBTztBQUMv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QUUsR0FDbkIsS0FBSyxFQUFFLFdBQVc7QUFDakIsMEJBQVMsS0FBSztFQUVqQjtBQUVELE1BQWEsa0JBQWtCLFlBQVksUUFDekM7Q0FDRSxPQUFPLEVBQUUsUUFBUTtDQUNqQixPQUFPLEVBQUUsUUFBUTtDQUNqQixPQUFPLEVBQUUsUUFBUTtDQUNqQixPQUFPLEVBQUUsUUFBUTtDQUNqQixPQUFPLEVBQUUsUUFBUTtDQUNqQixPQUFPLEVBQUUsUUFBUTtDQUNqQixPQUFPLEVBQUUsUUFBUTtDQUNqQixPQUFPLEVBQUUsUUFBUTtDQUNqQixPQUFPLEVBQUUsUUFBUTtDQUNqQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNuQixHQUdDLEtBQ0EsRUFDRSxPQUNBLE9BQ0EsT0FDQSxPQUNBLE9BQ0EsT0FDQSxPQUNBLE9BQ0EsT0FDQSxRQUNBLFFBQ0EsUUFDQSxRQUNBLFFBQ0EsUUFDQSxRQUNBLFFBQ0EsUUFDQSxRQUNBLFFBQ0EsUUFDQSxRQUNBLFFBQ0EsUUFDQSxRQUNBLFFBQ0EsUUFDQSxRQUNBLFFBQ0EsUUFDQSxRQUNBLGFBRUMsR0FDTjtBQUVELE1BQWEsb0JBQW9CLFlBQVksUUFDM0MsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQ2IsS0FBSyxFQUFFLFFBQVE7QUFDZCxNQUFLLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUNyQixTQUFRLElBQUksZUFBZTtFQUdoQyIsImRlYnVnSWQiOiIyNGUwZDM1Ni1jYTk2LTQzNTItODkzNy1kNmU4YTJiYzQ5MzAifQ==