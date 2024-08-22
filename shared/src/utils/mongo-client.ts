import mongoose from "mongoose";
import { config } from "../config/index.js";
import { CustomLogger } from "./logger.js";

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI!);
    CustomLogger.info("Connected to MongoDB:", config.MONGO_URI);
  } catch (error) {
    CustomLogger.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};
