import app from './app';
import { config } from './config';
import { connectKafka, disconnectKafka } from './utils/kafka-client';
import logger from './utils/logger';
import { connectMongoDB } from './utils/mongo-client';
import { redisClient } from './utils/redis-client';

config.validateConfig();

const start = async () => {
  try {
    await connectMongoDB();
    await redisClient.connect();
    await connectKafka();
    app.listen(parseInt(config.PORT!), () => {
      logger.info(`User microservice listening on port ${config.PORT}`);
    });
  } catch (err) {
    logger.error('Failed to connect:', err);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received. Closing HTTP server.');
  await disconnectKafka();
  // Close other connections...
  process.exit(0);
});
