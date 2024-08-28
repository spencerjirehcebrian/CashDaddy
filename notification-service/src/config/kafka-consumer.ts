import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { config } from './index.js';
import { CustomLogger } from '@cash-daddy/shared';

class KafkaConsumerManager {
  private consumers: Consumer[] = [];
  private kafka: Kafka;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'notification-consumer',
      brokers: config.KAFKA_BROKERS ? config.KAFKA_BROKERS.split(',') : []
    });
  }

  async createConsumer(groupId: string): Promise<Consumer> {
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();
    this.consumers.push(consumer);
    CustomLogger.info(`Connected Kafka Consumer for group ${groupId}`);
    return consumer;
  }

  async subscribeToTopic(consumer: Consumer, topic: string) {
    await consumer.subscribe({ topic, fromBeginning: true });
  }

  async startConsuming(consumer: Consumer, messageHandler: (message: EachMessagePayload) => Promise<void>) {
    await consumer.run({
      eachMessage: async (payload) => {
        try {
          await messageHandler(payload);
        } catch (error) {
          CustomLogger.error('Error processing message:', error);
        }
      }
    });
  }

  async disconnectAll() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
    this.consumers = [];
  }
}

export const kafkaConsumerManager = new KafkaConsumerManager();
