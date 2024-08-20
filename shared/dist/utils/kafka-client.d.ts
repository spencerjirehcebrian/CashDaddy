import { Producer } from "kafkajs";
export declare const connectKafka: () => Promise<Producer>;
export declare const disconnectKafka: () => Promise<void>;
export declare const produceMessage: (topic: string, message: unknown) => Promise<void>;
export declare const getKafkaProducer: () => Producer;
