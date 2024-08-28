import { CustomLogger, IUser } from '@cash-daddy/shared';
import { Producer } from 'kafkajs';

export class SimulateService {
  private kafkaDataPromiseResolve: ((value: unknown) => void) | null = null;

  constructor(private kafkaProducer: Producer) {}

  handleReturnKafkaData(kafkaData: unknown): void {
    CustomLogger.info('Received data from Kafka:', kafkaData);

    if (this.kafkaDataPromiseResolve) {
      this.kafkaDataPromiseResolve(kafkaData);
      this.kafkaDataPromiseResolve = null;
    } else {
      CustomLogger.warn('Received data from Kafka but no promise was found');
    }
  }

  async getUserData(userId: string): Promise<IUser> {
    try {
      this.kafkaProducer.send({
        topic: 'user-events',
        messages: [
          {
            value: JSON.stringify({
              action: 'getUserNotification',
              payload: {
                userId
              }
            })
          }
        ]
      });
      CustomLogger.info('Requested User data');

      const userData: IUser | null = await new Promise((resolve) => {
        CustomLogger.info('Waiting for user data...');
        this.kafkaDataPromiseResolve = resolve as (value: unknown) => void;
        setTimeout(() => {
          if (this.kafkaDataPromiseResolve) {
            this.kafkaDataPromiseResolve(null);
            this.kafkaDataPromiseResolve = null;
          }
        }, 10000);
      });

      if (!userData) {
        throw new Error('User not found');
      }

      return userData;
    } catch (error) {
      CustomLogger.error('Error getting user data:', error);
      throw new Error(`Failed to get user data: ${(error as Error).message}`);
    }
  }

  async notifyEmailVerification(userId: string, verificationLink: string): Promise<boolean> {
    const userData: IUser = await this.getUserData(userId);
    try {
      CustomLogger.info(`Verification email sent successfully to ${userData!.email} + ${verificationLink}`);
      return true;
    } catch (error) {
      CustomLogger.error(`Error sending verification email to ${userData!.email}:`, error);
      return false;
    }
  }
}
