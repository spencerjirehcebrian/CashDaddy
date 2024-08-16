import app from './app';
import { config } from './config';
import { connectKafka, disconnectKafka } from './utils/kafka-client';
import { connectMongoDB } from './utils/mongo-client';
import { redisClient } from './utils/redis-client';

config.validateConfig();

const start = async () => {
  try {
    await connectMongoDB();
    await redisClient.connect();
    await connectKafka();

    app.listen(parseInt(config.PORT!), () => {
      console.log(`User microservice listening on port ${config.PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect:', err);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Closing HTTP server.');
  await disconnectKafka();
  // Close other connections...
  process.exit(0);
})
