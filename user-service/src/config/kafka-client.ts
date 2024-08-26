import { Kafka, Producer } from 'kafkajs';
import { config } from './index.js';
import { CustomLogger } from '@cash-daddy/shared';

export interface KafkaMessage {
  action: string;
  payload: Record<string, unknown>;
}
let producer: Producer;
export const connectKafka = async () => {
  try {
    const kafka = new Kafka({
      clientId: 'user-producer',
      brokers: config.KAFKA_BROKERS ? config.KAFKA_BROKERS.split(',') : []
    });

    producer = kafka.producer();
    await producer.connect();
    CustomLogger.info('Connected to Kafka:', config.KAFKA_BROKERS);

    return producer;
  } catch (error) {
    CustomLogger.error('Failed to connect to Kafka:', error);
    throw error;
  }
};

export const disconnectKafka = async () => {
  await producer.disconnect();
};

export const produceMessage = async (topic: string, message: unknown) => {
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
