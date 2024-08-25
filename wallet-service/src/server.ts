import { AuthService, CustomLogger } from '@cash-daddy/shared';
import { connectKafka, disconnectKafka, getKafkaProducer, KafkaMessage } from './config/kafka-client.js';
import { connectConsumer, subscribeToTopic, startConsuming, disconnectConsumer } from './config/kafka-consumer.js';
import { config } from './config/index.js';
import { connectMongoDB } from './config/mongo-client.js';
import { redisClient } from './config/redis-client.js';
import createApp from './app.js';
import { RedisService } from './services/redis/redis.service.js';
import { StripeService } from './services/stripe/stripe.service.js';
import { WalletService } from './services/db/wallet.service.js';
import { WalletController } from './controller/wallet.controller.js';

process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';

config.validateConfig();

const start = async () => {
  try {
    await connectMongoDB();
    await redisClient.connect();
    await connectKafka();

    const kafkaProducer = getKafkaProducer();
    const redisService = new RedisService();
    const authService = new AuthService();
    const stripeService = new StripeService(kafkaProducer);
    const walletService = new WalletService(stripeService);

    const walletController = new WalletController(walletService);

    const app = createApp(walletController, redisService, authService);

    // Set up Kafka consumer
    await connectConsumer();
    await subscribeToTopic('wallet-events');
    await startConsuming(async ({ topic, partition, message }) => {
      CustomLogger.info('Received message:', {
        topic,
        partition,
        offset: message.offset,
        value: message.value?.toString()
      });

      try {
        const kafkaMessage = JSON.parse(message.value?.toString() || '{}') as KafkaMessage;

        switch (kafkaMessage.action) {
          case 'getOwnKYC': {
            const userId = kafkaMessage.payload.userId as string;
            if (userId) {
              // await kycController.handleGetOwnKYCAction(userId);
              CustomLogger.warn('getOwnKYC action received without userId');
            } else {
              CustomLogger.warn('getOwnKYC action received without userId');
            }
            break;
          }
          default:
            CustomLogger.warn('Unknown action received:', kafkaMessage.action);
        }
      } catch (error) {
        CustomLogger.error('Error processing Kafka message:', error);
      }
    });

    app.listen(config.PORT, () => {
      CustomLogger.info(`Wallet microservice listening on port ${config.PORT}`);
    });
  } catch (err) {
    CustomLogger.error('Failed to connect:', err);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  CustomLogger.info('SIGTERM signal received. Closing HTTP server.');
  await disconnectKafka();
  await disconnectConsumer();
  process.exit(0);
});
