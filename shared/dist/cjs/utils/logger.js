"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const index_js_1 = require("../config/index.js");
// Define custom log levels
const customLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
    success: 7,
};
// Define colors for each log level
const customColors = {
    error: "red",
    warn: "yellow",
    info: "cyan",
    http: "magenta",
    verbose: "blue",
    debug: "white",
    silly: "gray",
    success: "green",
};
// Add colors to winston
winston_1.default.addColors(customColors);
// Custom format for console output
const consoleFormat = winston_1.default.format.printf((_a) => {
    var { level, message, timestamp } = _a, metadata = __rest(_a, ["level", "message", "timestamp"]);
    let msg = `${timestamp} [${level}]: ${message}`;
    // Include metadata in the same line, if present
    const metaEntries = Object.entries(metadata);
    if (metaEntries.length > 0) {
        const metaString = metaEntries
            .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
            .join(", ");
        msg += ` (${metaString})`;
    }
    return msg;
});
// Create DailyRotateFile transports
const errorRotateTransport = new winston_daily_rotate_file_1.default({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: "error",
});
const combinedRotateTransport = new winston_daily_rotate_file_1.default({
    filename: "logs/combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
});
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || "info",
    levels: customLevels,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json()),
    defaultMeta: { service: "shared" },
    transports: [errorRotateTransport, combinedRotateTransport],
});
if (index_js_1.config.NODE_ENV !== "production") {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), winston_1.default.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }), consoleFormat),
    }));
}
// Helper function to process log arguments
function processLogArgs(args) {
    let message = "";
    let meta = {};
    args.forEach((arg) => {
        if (typeof arg === "string") {
            message += (message ? " " : "") + arg;
        }
        else if (typeof arg === "object" && arg !== null) {
            meta = Object.assign(Object.assign({}, meta), arg);
        }
        else {
            message += (message ? " " : "") + String(arg);
        }
    });
    return { message, meta };
}
// Extend the logger with a custom log method
const customLogger = logger;
Object.keys(customLevels).forEach((level) => {
    customLogger[level] = (...args) => {
        const { message, meta } = processLogArgs(args);
        const combinedMeta = Object.assign(Object.assign({}, logger.defaultMeta), meta);
        logger.log(level, message, combinedMeta);
    };
});
exports.default = customLogger;
