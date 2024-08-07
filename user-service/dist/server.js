"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const user_routes_1 = require("./routes/user.routes");
const mongoose_1 = __importDefault(require("mongoose"));
const redis_1 = require("redis");
const kafkajs_1 = require("kafkajs");
const config_1 = require("./config");
const error_middleware_1 = __importDefault(require("./middleware/error.middleware"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, body_parser_1.json)());
app.use(error_middleware_1.default);
app.use('/api/users', user_routes_1.userRouter);
const corsOptions = {
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
config_1.config.validateConfig();
const redisClient = (0, redis_1.createClient)({
    url: config_1.config.REDIS_URL
});
const kafka = new kafkajs_1.Kafka({
    clientId: 'cashdaddy',
    brokers: config_1.config.KAFKA_BROKERS ? config_1.config.KAFKA_BROKERS.split(',') : []
});
const producer = kafka.producer();
const start = async () => {
    try {
        await mongoose_1.default.connect(config_1.config.MONGO_URI);
        console.log('Connected to MongoDB:', config_1.config.MONGO_URI);
        await redisClient.connect();
        console.log('Connected to Redis:', config_1.config.REDIS_URL);
        await producer.connect();
        console.log('Connected to Kafka:', config_1.config.KAFKA_BROKERS);
        app.listen(parseInt(config_1.config.PORT), () => {
            console.log(`User microservice listening on port ${config_1.config.PORT}`);
        });
    }
    catch (err) {
        console.error('Failed to connect:', err);
    }
};
start();
