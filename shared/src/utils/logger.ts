import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

import fs from "fs";
import path from "path";

// Get the project name from the package.json file
const packageJsonPath = path.join(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const projectName = packageJson.name || "Unknown Project";

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
winston.addColors(customColors);

// Custom format for console output
const consoleFormat = winston.format.printf(
  ({ level, message, timestamp, ...metadata }) => {
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
  }
);

// Create DailyRotateFile transports
const errorRotateTransport = new DailyRotateFile({
  filename: "logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "error",
});

const combinedRotateTransport = new DailyRotateFile({
  filename: "logs/combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels: customLevels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: projectName },
  transports: [errorRotateTransport, combinedRotateTransport],
});

logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      consoleFormat
    ),
  })
);

// Helper function to process log arguments
function processLogArgs(args: unknown[]): { message: string; meta: object } {
  let message = "";
  let meta = {};

  args.forEach((arg) => {
    if (typeof arg === "string") {
      message += (message ? " " : "") + arg;
    } else if (typeof arg === "object" && arg !== null) {
      meta = { ...meta, ...arg };
    } else {
      message += (message ? " " : "") + String(arg);
    }
  });

  return { message, meta };
}

// Extend the logger with a custom log method
export const CustomLogger = logger as winston.Logger & {
  [key: string]: unknown;
};

Object.keys(customLevels).forEach((level) => {
  CustomLogger[level] = (...args: unknown[]) => {
    const { message, meta } = processLogArgs(args);
    const combinedMeta = { ...logger.defaultMeta, ...meta };
    logger.log(level, message, combinedMeta);
  };
});
