import { config } from "@/config/index.js";
import mongoose from "mongoose";
import logger from "./logger.js";
export const connectMongoDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        logger.info("Connected to MongoDB:", config.MONGO_URI);
    }
    catch (error) {
        logger.error("Failed to connect to MongoDB:", error);
        throw error;
    }
};
