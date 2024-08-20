import { createClient } from "redis";
import logger from "./logger.js";
import { config } from "../config/index.js";

export const redisClient = createClient({
  url: config.REDIS_URL,
});

redisClient.on("error", (err: Error) =>
  logger.error("Redis Client Error", err)
);
redisClient.on("connect", () =>
  logger.info("Connected to Redis:", config.REDIS_URL)
);
