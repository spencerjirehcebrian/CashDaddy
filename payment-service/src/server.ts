import { AuthService, CustomLogger } from '@cash-daddy/shared';
import { connectKafka, disconnectKafka, getKafkaProducer, KafkaMessage } from './config/kafka-client.js';
import { connectConsumer, subscribeToTopic, startConsuming, disconnectConsumer } from './config/kafka-consumer.js';
import { config } from './config/index.js';
import { connectMongoDB } from './config/mongo-client.js';
import { redisClient } from './config/redis-client.js';
import createApp from './app.js';
import { RedisService } from './services/redis/redis.service.js';
import { PaymentController } from './controller/payment.controller.js';
import { StripeService } from './services/stripe/stripe.service.js';
import { PaymentMethodService } from './services/db/payment-method.service.js';

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
    const stripeService = new StripeService();
    const paymentMethodService = new PaymentMethodService();

    const paymentController = new PaymentController(paymentMethodService, kafkaProducer, stripeService);

    const app = createApp(paymentController, redisService, authService);

    // Set up Kafka consumer
    await connectConsumer();
    await subscribeToTopic('payment-events');
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
          case 'createPayout': {
            try {
              await paymentController.handleCreatePayout(kafkaMessage.payload.customerId as string, kafkaMessage.payload.amount as number);
            } catch (error) {
              CustomLogger.error('Error processing Kafka message:', error);
            }
            break;
          }
          case 'triggerPaymentIntentAuto': {
            try {
              await paymentController.handleCreatePaymentIntentAuto(
                kafkaMessage.payload.customerId as string,
                kafkaMessage.payload.currency as string,
                kafkaMessage.payload.paymentMethodId as string,
                kafkaMessage.payload.amount as number
              );
            } catch (error) {
              CustomLogger.error('Error processing Kafka message:', error);
            }
            break;
          }
          case 'getPaymentMethod': {
            try {
              await paymentController.handleGetPaymentMethod(
                kafkaMessage.payload.userId as string,
                kafkaMessage.payload.paymentMethodId as string
              );
            } catch (error) {
              CustomLogger.error('Error processing Kafka message:', error);
            }
            break;
          }
          case 'returnData': {
            paymentController.handleReturnUser(kafkaMessage.payload);
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
      CustomLogger.info(`Payment microservice listening on port ${config.PORT}`);
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
