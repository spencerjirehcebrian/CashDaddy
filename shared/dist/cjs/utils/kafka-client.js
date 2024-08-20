"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKafkaProducer = exports.produceMessage = exports.disconnectKafka = exports.connectKafka = void 0;
const kafkajs_1 = require("kafkajs");
const logger_js_1 = __importDefault(require("./logger.js"));
const index_js_1 = require("../config/index.js");
let producer;
const connectKafka = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const kafka = new kafkajs_1.Kafka({
            clientId: "cashdaddy",
            brokers: index_js_1.config.KAFKA_BROKERS ? index_js_1.config.KAFKA_BROKERS.split(",") : [],
        });
        producer = kafka.producer();
        yield producer.connect();
        logger_js_1.default.info("Connected to Kafka:", index_js_1.config.KAFKA_BROKERS);
        return producer;
    }
    catch (error) {
        logger_js_1.default.error("Failed to connect to Kafka:", error);
        throw error;
    }
});
exports.connectKafka = connectKafka;
const disconnectKafka = () => __awaiter(void 0, void 0, void 0, function* () {
    yield producer.disconnect();
});
exports.disconnectKafka = disconnectKafka;
const produceMessage = (topic, message) => __awaiter(void 0, void 0, void 0, function* () {
    yield producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
    });
});
exports.produceMessage = produceMessage;
const getKafkaProducer = () => {
    if (!producer) {
        throw new Error("Kafka producer is not connected. Please call connect Kafka first.");
    }
    return producer;
};
exports.getKafkaProducer = getKafkaProducer;
