import express from 'express';
import { json } from 'body-parser';
import { userRouter } from './routes/user.routes';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import { Kafka } from 'kafkajs';
import { config } from './config';
import errorHandler from './middleware/error.middleware';
import cors from 'cors';

const app = express();
app.use(json());
app.use(errorHandler);
app.use('/api/users', userRouter);

const corsOptions = {
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

config.validateConfig();

const redisClient = createClient({
  url: config.REDIS_URL
});

const kafka = new Kafka({
  clientId: 'cashdaddy',
  brokers: config.KAFKA_BROKERS ? config.KAFKA_BROKERS.split(',') : []
});
const producer = kafka.producer();

const start = async () => {
  try {
    await mongoose.connect(config.MONGO_URI!);
    console.log('Connected to MongoDB:', config.MONGO_URI);

    await redisClient.connect();
    console.log('Connected to Redis:', config.REDIS_URL);

    await producer.connect();
    console.log('Connected to Kafka:', config.KAFKA_BROKERS);

    app.listen(parseInt(config.PORT!), () => {
      console.log(`User microservice listening on port ${config.PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect:', err);
  }
};

start();
