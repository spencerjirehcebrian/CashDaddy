import { CustomLogger } from '@cash-daddy/shared';
import { connectKafka, disconnectKafka, getKafkaProducer, KafkaMessage } from './config/kafka-client.js';
import { kafkaConsumerManager } from './config/kafka-consumer.js';
import { config } from './config/index.js';
import createApp from './app.js';
import { NotificationService } from './services/notifcation.service.js';

process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';

config.validateConfig();

const start = async () => {
  try {
    await connectKafka();

    const kafkaProducer = getKafkaProducer();
    const notificationService = new NotificationService(kafkaProducer);

    const app = createApp();

    // Set up Kafka consumer
    const consumer1 = await kafkaConsumerManager.createConsumer('notification-group-1');
    await kafkaConsumerManager.subscribeToTopic(consumer1, 'notification-events');
    await kafkaConsumerManager.startConsuming(consumer1, async ({ topic, partition, message }) => {
      CustomLogger.info('Received message:', {
        topic,
        partition,
        offset: message.offset,
        value: message.value?.toString()
      });

      try {
        const kafkaMessage = JSON.parse(message.value?.toString() || '{}') as KafkaMessage;
        switch (kafkaMessage.action) {
          // case 'returnUser': {
          //   CustomLogger.info('Received User data:', kafkaMessage);
          //   notificationService.handleReturnKafkaData(kafkaMessage.payload);
          //   break;
          // }
          case 'triggerNotificationEmailVerification': {
            const notification = kafkaMessage.payload;
            CustomLogger.info('Received notification:', notification);
            await notificationService.notifyEmailVerification(notification.userId as string, notification.verificationLink as string);
            break;
          }
          case 'triggerNotificationLogin': {
            const notification = kafkaMessage.payload;
            CustomLogger.info('Received notification:', notification);
            await notificationService.notifyLogin(notification.userId as string);
            break;
          }
          case 'triggerNotificationDeposit': {
            const notification = kafkaMessage.payload;
            CustomLogger.info('Received notification:', notification);
            await notificationService.notifyDeposit(
              notification.userId as string,
              notification.amount as number,
              notification.transactionId as string
            );
            break;
          }
          case 'triggerNotificationKYCUpdate': {
            const notification = kafkaMessage.payload;
            CustomLogger.info('Received notification:', notification);
            await notificationService.notifyKYCUpdate(
              notification.userId as string,
              notification.kycStatus as string,
              notification.rejectionReason as string | null
            );
            break;
          }
          case 'triggerNotificationQRPayment': {
            const notification = kafkaMessage.payload;
            CustomLogger.info('Received notification:', notification);
            await notificationService.notifyQRPayment(
              notification.payerId as string,
              notification.recipientId as string,
              notification.amount as number,
              notification.transactionId as string
            );
            break;
          }
          case 'triggerNotificationTransfer': {
            const notification = kafkaMessage.payload;
            CustomLogger.info('Received notification:', notification);
            await notificationService.notifyTransfer(
              notification.fromUserId as string,
              notification.toUserId as string,
              notification.amount as number,
              notification.transactionId as string,
              notification.fromBalance as number,
              notification.toBalance as number
            );
            break;
          }
          case 'triggerNotificationWithdrawal': {
            const notification = kafkaMessage.payload;
            CustomLogger.info('Received notification:', notification);
            await notificationService.notifyWithdrawal(
              notification.userId as string,
              notification.amount as number,
              notification.transactionId as string,
              notification.withdrawalStatus as string,
              notification.withdrawalMethod as string,
              notification.newBalance as number,
              notification.failureReason as string
            );
            break;
          }
          case 'triggerNotificationWalletCreation': {
            const notification = kafkaMessage.payload;
            CustomLogger.info('Received notification:', notification);
            await notificationService.notifyWalletCreation(notification.userId as string, notification.initialBalance as number);
            break;
          }
          case 'triggerNotificationPaymentMethodAdded': {
            const notification = kafkaMessage.payload;
            CustomLogger.info('Received notification:', notification);
            await notificationService.notifyPaymentMethodAdded(
              notification.userId as string,
              notification.type as string,
              notification.paymentMethodId as string
            );
            break;
          }
          default:
            CustomLogger.warn('Unknown action received:', kafkaMessage.action);
        }
      } catch (error) {
        CustomLogger.error('Error processing Kafka message:', error);
      }
    });

    const consumer2 = await kafkaConsumerManager.createConsumer('notification-group-2');
    await kafkaConsumerManager.subscribeToTopic(consumer2, 'user-fetch-topic');
    await kafkaConsumerManager.startConsuming(consumer2, async ({ topic, partition, message }) => {
      CustomLogger.info('Received message:', {
        topic,
        partition,
        offset: message.offset,
        value: message.value?.toString()
      });

      try {
        const kafkaMessage = JSON.parse(message.value?.toString() || '{}') as KafkaMessage;
        switch (kafkaMessage.action) {
          case 'returnUser': {
            CustomLogger.info('Received User data:', kafkaMessage);
            notificationService.handleReturnKafkaData(kafkaMessage.payload);
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
      CustomLogger.info(`Notification microservice listening on port ${config.PORT}`);
    });
  } catch (err) {
    CustomLogger.error('Failed to connect:', err);
  }
};

start();

process.on('SIGTERM', async () => {
  CustomLogger.info('SIGTERM signal received. Closing HTTP server.');
  await disconnectKafka();
  await kafkaConsumerManager.disconnectAll();
  // Close other connections...
  process.exit(0);
});
