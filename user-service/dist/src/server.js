import { CustomLogger } from '@cash-daddy/shared';
import createApp from './app.js';
import { config } from './config/index.js';
import { connectKafka, disconnectKafka, getKafkaProducer } from './config/kafka-client.js';
import { connectConsumer, disconnectConsumer, startConsuming, subscribeToTopic } from './config/kafka-consumer.js';
import { connectMongoDB } from './config/mongo-client.js';
import { redisClient } from './config/redis-client.js';
import { UserProfileController } from './controller/user-profile.controller.js';
import { UserController } from './controller/user.controller.js';
import { AuthService } from './services/auth/auth.service.js';
import { UserProfileService } from './services/db/user-profile.service.js';
import { UserService } from './services/db/user.service.js';
import { RedisService } from './services/redis/redis.service.js';
process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';
config.validateConfig();
const start = async () => {
    try {
        await connectMongoDB();
        await redisClient.connect();
        await connectKafka();
        // Create instances of services
        const userService = new UserService();
        const authService = new AuthService();
        const userProfileService = new UserProfileService();
        const redisService = new RedisService();
        const kafkaProducer = getKafkaProducer();
        // Create instances of controllers with injected dependencies
        const userController = new UserController(userService, authService, redisService, kafkaProducer);
        const userProfileController = new UserProfileController(userProfileService, kafkaProducer);
        const app = createApp(redisService, userController, userProfileController, authService);
        // Set up Kafka consumer
        await connectConsumer();
        await subscribeToTopic('user-events');
        await startConsuming(async ({ topic, partition, message }) => {
            CustomLogger.info('Received message:', {
                topic,
                partition,
                offset: message.offset,
                value: message.value?.toString()
            });
            try {
                const kafkaMessage = JSON.parse(message.value?.toString() || '{}');
                switch (kafkaMessage.action) {
                    case 'getUser': {
                        const userId = kafkaMessage.payload.userId;
                        await userController.handleGetUser(userId);
                        break;
                    }
                    case 'getUserWallet': {
                        const userId = kafkaMessage.payload.userId;
                        await userController.handleGetUserWallet(userId);
                        break;
                    }
                    case 'getUserNotification': {
                        const userId = kafkaMessage.payload.userId;
                        await userController.handleGetUserNotification(userId);
                        break;
                    }
                    case 'updateUserKYC': {
                        const userId = kafkaMessage.payload.userId;
                        const kycId = kafkaMessage.payload.kycId;
                        await userController.handleUpdateUserKYC(userId, kycId);
                        break;
                    }
                    case 'updateUserStripeCustomer': {
                        const userId = kafkaMessage.payload.userId;
                        const stripeCustomerId = kafkaMessage.payload.stripeCustomerId;
                        await userController.handleUpdateUserStripeCustomer(userId, stripeCustomerId);
                        break;
                    }
                    case 'returnKYCData': {
                        const kycData = kafkaMessage.payload;
                        await userController.handleReturnKafkaData(kycData);
                        break;
                    }
                    default:
                        CustomLogger.warn('Unknown action received:', kafkaMessage.action);
                }
            }
            catch (error) {
                console.log('Error processing Kafka message:', error);
            }
        });
        app.listen(config.PORT, () => {
            CustomLogger.info(`User microservice listening on port ${config.PORT}`);
        });
    }
    catch (err) {
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
