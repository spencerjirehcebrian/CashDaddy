import { createClient } from "redis";
import { config } from "../config/index.js";
import { CustomLogger } from "./logger.js";

export const redisClient = createClient({
  url: config.REDIS_URL,
});

redisClient.on("error", (err: Error) =>
  CustomLogger.error("Redis Client Error", err)
);
redisClient.on("connect", () =>
  CustomLogger.info("Connected to Redis:", config.REDIS_URL)
);
