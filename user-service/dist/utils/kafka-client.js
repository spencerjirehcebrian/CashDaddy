"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKafkaProducer = exports.produceMessage = exports.disconnectKafka = exports.connectKafka = void 0;
const kafkajs_1 = require("kafkajs");
const config_1 = require("../config");
let producer;
const connectKafka = async () => {
    try {
        const kafka = new kafkajs_1.Kafka({
            clientId: 'cashdaddy',
            brokers: config_1.config.KAFKA_BROKERS ? config_1.config.KAFKA_BROKERS.split(',') : []
        });
        producer = kafka.producer();
        await producer.connect();
        console.log('Connected to Kafka:', config_1.config.KAFKA_BROKERS);
        return producer;
    }
    catch (error) {
        console.error('Failed to connect to Kafka:', error);
        throw error;
    }
};
exports.connectKafka = connectKafka;
const disconnectKafka = async () => {
    await producer.disconnect();
};
exports.disconnectKafka = disconnectKafka;
const produceMessage = async (topic, message) => {
    await producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }]
    });
};
exports.produceMessage = produceMessage;
const getKafkaProducer = () => {
    if (!producer) {
        throw new Error('Kafka producer is not connected. Please call connect Kafka first.');
    }
    return producer;
};
exports.getKafkaProducer = getKafkaProducer;
