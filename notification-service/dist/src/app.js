import express from "express";
import cors from "cors";
import { CacheManager, ErrorHandler, RedisService, setCacheManager, } from "@cash-daddy/shared";
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Rejection at:", promise, "reason:", reason);
});
const app = express();
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use(cors(corsOptions));
const redisService = new RedisService();
const cacheManager = new CacheManager(redisService);
setCacheManager(cacheManager);
// Create AuthMiddleware instance
// Create instances of controllers with injected dependencies
// Set up routes
app.use(ErrorHandler);
export default app;
