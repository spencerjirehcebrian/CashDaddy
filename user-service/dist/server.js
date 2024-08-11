"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const kafka_client_1 = require("./utils/kafka-client");
const mongo_client_1 = require("./utils/mongo-client");
const redis_client_1 = require("./utils/redis-client");
config_1.config.validateConfig();
const start = async () => {
    try {
        await (0, mongo_client_1.connectMongoDB)();
        await redis_client_1.redisClient.connect();
        await (0, kafka_client_1.connectKafka)();
        app_1.default.listen(parseInt(config_1.config.PORT), () => {
            console.log(`User microservice listening on port ${config_1.config.PORT}`);
        });
    }
    catch (err) {
        console.error('Failed to connect:', err);
    }
};
start();
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received. Closing HTTP server.');
    await (0, kafka_client_1.disconnectKafka)();
    // Close other connections...
    process.exit(0);
});
