import { Kafka } from 'kafkajs';
import { config } from './index.js';
import { CustomLogger } from '@cash-daddy/shared';
let consumer;
export const connectConsumer = async () => {
    try {
        const kafka = new Kafka({
            clientId: 'user-consumer',
            brokers: config.KAFKA_BROKERS ? config.KAFKA_BROKERS.split(',') : []
        });
        consumer = kafka.consumer({ groupId: 'user-group' });
        await consumer.connect();
        CustomLogger.info('Connected Kafka Consumer');
        return consumer;
    }
    catch (error) {
        CustomLogger.error('Failed to connect Kafka Consumer:', error);
        throw error;
    }
};
export const subscribeToTopic = async (topic) => {
    await consumer.subscribe({ topic, fromBeginning: true });
};
export const startConsuming = async (messageHandler) => {
    await consumer.run({
        eachMessage: async (payload) => {
            try {
                await messageHandler(payload);
            }
            catch (error) {
                CustomLogger.error('Error processing message:', error);
            }
        }
    });
};
export const disconnectConsumer = async () => {
    await consumer.disconnect();
};
