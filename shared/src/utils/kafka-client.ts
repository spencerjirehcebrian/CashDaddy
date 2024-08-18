import { config } from "@/config/index.js";
import { Kafka, Producer } from "kafkajs";
import logger from "./logger.js";

let producer: Producer;
export const connectKafka = async () => {
  try {
    const kafka = new Kafka({
      clientId: "cashdaddy",
      brokers: config.KAFKA_BROKERS ? config.KAFKA_BROKERS.split(",") : [],
    });

    producer = kafka.producer();
    await producer.connect();
    logger.info("Connected to Kafka:", config.KAFKA_BROKERS);

    return producer;
  } catch (error) {
    logger.error("Failed to connect to Kafka:", error);
    throw error;
  }
};

export const disconnectKafka = async () => {
  await producer.disconnect();
};

export const produceMessage = async (topic: string, message: unknown) => {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
};
export const getKafkaProducer = () => {
  if (!producer) {
    throw new Error(
      "Kafka producer is not connected. Please call connect Kafka first."
    );
  }
  return producer;
};
