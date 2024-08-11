"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const connectMongoDB = async () => {
    try {
        await mongoose_1.default.connect(config_1.config.MONGO_URI);
        console.log('Connected to MongoDB:', config_1.config.MONGO_URI);
    }
    catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
};
exports.connectMongoDB = connectMongoDB;
