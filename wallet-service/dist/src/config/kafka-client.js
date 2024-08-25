import { Kafka } from 'kafkajs';
import { config } from './index.js';
import { CustomLogger } from '@cash-daddy/shared';
let producer;
export const connectKafka = async () => {
    try {
        const kafka = new Kafka({
            clientId: 'wallet-producer',
            brokers: config.KAFKA_BROKERS ? config.KAFKA_BROKERS.split(',') : []
        });
        producer = kafka.producer();
        await producer.connect();
        CustomLogger.info('Connected to Kafka:', config.KAFKA_BROKERS);
        return producer;
    }
    catch (error) {
        CustomLogger.error('Failed to connect to Kafka:', error);
        throw error;
    }
};
export const disconnectKafka = async () => {
    await producer.disconnect();
};
export const produceMessage = async (topic, message) => {
    await producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }]
    });
};
export const getKafkaProducer = () => {
    if (!producer) {
        throw new Error('Kafka producer is not connected. Please call connect Kafka first.');
    }
    return producer;
};
