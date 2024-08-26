import { CustomLogger } from '@cash-daddy/shared';
import { connectKafka, disconnectKafka, KafkaMessage } from './config/kafka-client.js';
import { connectConsumer, subscribeToTopic, startConsuming, disconnectConsumer } from './config/kafka-consumer.js';
import { config } from './config/index.js';
import createApp from './app.js';
import { NotificationService } from './services/notifcation.service.js';

process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';

config.validateConfig();

const start = async () => {
  try {
    await connectKafka();

    const notificationService = new NotificationService();

    const app = createApp();

    // Set up Kafka consumer
    await connectConsumer();
    await subscribeToTopic('notification-events');
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
          case 'triggerNotification': {
            const notification = kafkaMessage.payload;
            CustomLogger.info('Received notification:', notification);
            await notificationService.notifyEmailVerification(
              'spencercebrian123@gmail.com',
              'https://localhost:3000/verify-email?token=123456789'
            );
            break;
          }
          case 'returnUser': {
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
      CustomLogger.info(`KYC microservice listening on port ${config.PORT}`);
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
  // Close other connections...
  process.exit(0);
});
