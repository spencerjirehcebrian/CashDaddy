"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({});
class Config {
    constructor() {
        this.DEFAULT_MONGO_URI = 'mongodb://localhost:27017/cashdaddy_user_dev';
        this.MONGO_URI = process.env.MONGO_URI || this.DEFAULT_MONGO_URI;
        this.JWT_SECRET = process.env.JWT_TOKEN || '1234';
        this.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
        this.PORT = process.env.PORT || '3000';
        this.KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'localhost:9092';
        this.NODE_ENV = process.env.NODE_ENV || 'development';
    }
    validateConfig() {
        console.log(this);
        for (const [key, value] of Object.entries(this)) {
            if (value === undefined) {
                throw new Error(`Configuration ${key} is undefined.`);
            }
        }
    }
}
exports.config = new Config();
