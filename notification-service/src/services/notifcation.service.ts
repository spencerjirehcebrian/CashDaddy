import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import Handlebars from 'handlebars';
import path from 'path';
import { config } from '../config/index.js';
import { CustomLogger, IUser } from '@cash-daddy/shared';
import { fileURLToPath } from 'url';
import { Producer } from 'kafkajs';

interface EmailTemplate {
  (context: unknown): string;
}

interface EmailTemplates {
  [key: string]: EmailTemplate;
}

interface SmtpConfig {
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USERNAME: string;
  EMAIL_PASSWORD: string;
}

export class NotificationService {
  private transporter: nodemailer.Transporter;
  private templates: EmailTemplates = {};
  private baseTemplate!: EmailTemplate;
  private kafkaDataPromiseResolve: ((value: unknown) => void) | null = null;

  constructor(private kafkaProducer: Producer) {
    this.transporter = this.createTransporter();
    this.loadEmailTemplates();
    Handlebars.registerHelper('eq', function (a: unknown, b: unknown) {
      return a === b;
    });
  }

  private createTransporter(): nodemailer.Transporter {
    const useMailHog = process.env.USE_MAILHOG === 'true';
    if (useMailHog) {
      CustomLogger.info('Using MailHog for email testing');
      return nodemailer.createTransport({
        host: 'mailhog',
        port: 1025,
        ignoreTLS: true
      } as nodemailer.TransportOptions);
    } else {
      CustomLogger.info('Using configured SMTP server for emails');
      const smtpConfig = config as unknown as SmtpConfig;
      return nodemailer.createTransport({
        host: smtpConfig.EMAIL_HOST,
        port: smtpConfig.EMAIL_PORT,
        auth: {
          user: smtpConfig.EMAIL_USERNAME,
          pass: smtpConfig.EMAIL_PASSWORD
        }
      } as nodemailer.TransportOptions);
    }
  }

  private async loadEmailTemplates(): Promise<void> {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const templateDir = path.join(__dirname, '..', 'templates');

      const baseTemplate = await fs.readFile(path.join(templateDir, 'base-email-template.html'), 'utf-8');
      this.baseTemplate = Handlebars.compile(baseTemplate);

      const templateFiles = [
        'verification',
        'login',
        'deposit',
        'kyc-verification',
        'qr-payment',
        'transfer',
        'withdrawal',
        'wallet-creation',
        'payment-method-added'
      ];

      for (const file of templateFiles) {
        const templatePath = path.join(templateDir, `${file}-email-template.html`);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        this.templates[file] = Handlebars.compile(templateContent);
      }
      CustomLogger.info('Email templates loaded successfully');
      CustomLogger.debug('Loaded templates:', Object.keys(this.templates));
    } catch (error) {
      CustomLogger.error('Error loading email templates:', error);
      throw new Error(`Failed to load email templates: ${error}`);
    }
  }

  async sendEmail(to: string, subject: string, templateName: string, context: unknown): Promise<void> {
    try {
      if (!this.templates[templateName]) {
        CustomLogger.error(`Template '${templateName}' not found. Available templates:`, Object.keys(this.templates));
        throw new Error(`Email template '${templateName}' not found`);
      }

      CustomLogger.debug(`Rendering template: ${templateName}`);
      CustomLogger.debug('Template context:', context);

      const template = this.templates[templateName];
      const content = template(context);
      const html = this.baseTemplate({ content, subject, ...(context as object) });

      const mailOptions: nodemailer.SendMailOptions = {
        from: 'Your E-Wallet <noreply@cashdaddy.com>',
        to,
        subject,
        html
      };

      CustomLogger.debug('Mail options:', mailOptions);

      await this.transporter.sendMail(mailOptions);
      CustomLogger.info(`Email sent to ${to} using template ${templateName}`);

      if (process.env.USE_MAILHOG === 'true') {
        CustomLogger.info('MailHog Web Interface: http://localhost:8025');
        CustomLogger.info('Check MailHog to view the sent email.');
      }
    } catch (error) {
      CustomLogger.error('Error sending email:', error);
      CustomLogger.error('Template name:', templateName);
      CustomLogger.error('Context:', context);
      throw new Error(`Failed to send email notification: ${(error as Error).message}`);
    }
  }

  handleReturnKafkaData(kafkaData: unknown): void {
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

      const userData: IUser | null = await new Promise((resolve) => {
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
      await this.sendEmail(userData!.email, 'Verify Your E-Wallet Email', 'verification', {
        firstName: userData!.firstName,
        verificationLink
      });
      CustomLogger.info(`Verification email sent successfully to ${userData!.email}`);
      return true;
    } catch (error) {
      CustomLogger.error(`Error sending verification email to ${userData!.email}:`, error);
      return false;
    }
  }

  async notifyLogin(userId: string): Promise<void> {
    const userData: IUser = await this.getUserData(userId);
    try {
      const loginTime = new Date().toLocaleString();
      const loginLocation = 'Unknown';
      await this.sendEmail(userData.email, 'New Login to Your E-Wallet Account', 'login', {
        firstName: userData.firstName,
        loginTime,
        loginLocation
      });
    } catch (error) {
      CustomLogger.error('Error in notifyLogin:', error);
    }
  }

  async notifyDeposit(userId: string, amount: number, transactionId: string): Promise<void> {
    try {
      const userData: IUser = await this.getUserData(userId);
      await this.sendEmail(userData.email, 'Deposit Successful', 'deposit', {
        firstName: userData.firstName,
        amount,
        transactionId,
        transactionDate: new Date().toLocaleString(),
        viewBalanceLink: `${config.APP_URL_WALLET}/wallet/balance`
      });
    } catch (error) {
      CustomLogger.error('Error in notifyDeposit:', error);
      throw new Error(`Failed to send deposit notification: ${(error as Error).message}`);
    }
  }

  async notifyKYCUpdate(userId: string, kycStatus: string, rejectionReason: string | null = null): Promise<void> {
    try {
      const userData: IUser = await this.getUserData(userId);
      await this.sendEmail(userData.email, 'KYC Verification Update', 'kyc-verification', {
        firstName: userData.firstName,
        kycStatus,
        rejectionReason
      });
    } catch (error) {
      CustomLogger.error('Error in notifyKYCUpdate:', error);
      throw new Error(`Failed to send KYC update notification: ${(error as Error).message}`);
    }
  }

  async notifyQRPayment(payerId: string, recipientId: string, amount: number, transactionId: string): Promise<void> {
    try {
      const payerUserData: IUser = await this.getUserData(payerId);
      const recipientUserData: IUser = await this.getUserData(recipientId);
      CustomLogger.info(`Notifying QR payment. Payer: ${payerId}, Recipient: ${recipientId}`);

      const [payer, recipient] = await Promise.all([payerUserData, recipientUserData]);

      if (!payer) {
        CustomLogger.error(`Payer not found. ID: ${payerId}`);
        throw new Error(`Payer not found. ID: ${payerId}`);
      }
      if (!recipient) {
        CustomLogger.error(`Recipient not found. ID: ${recipientId}`);
        throw new Error(`Recipient not found. ID: ${recipientId}`);
      }

      await Promise.all([
        this.sendEmail(payer.email, 'QR Payment Sent', 'qr-payment', {
          firstName: payer.firstName,
          paymentStatus: 'sent',
          amount,
          transactionId,
          transactionDate: new Date().toLocaleString(),
          transactionDetailsLink: `${config.APP_URL_WALLET}api/transactions/${transactionId}`
        }),
        this.sendEmail(recipient.email, 'QR Payment Received', 'qr-payment', {
          firstName: recipient.firstName,
          paymentStatus: 'received',
          amount,
          transactionId,
          transactionDate: new Date().toLocaleString(),
          transactionDetailsLink: `${config.APP_URL_WALLET}api/transactions/${transactionId}`
        })
      ]);

      CustomLogger.info(`QR payment notifications sent successfully for transaction ${transactionId}`);
    } catch (error) {
      CustomLogger.error('Error in notifyQRPayment:', error);
      throw new Error(`Failed to send QR payment notifications: ${(error as Error).message}`);
    }
  }

  async notifyTransfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    transactionId: string,
    fromBalance: number,
    toBalance: number
  ): Promise<void> {
    try {
      const fromUserData: IUser = await this.getUserData(fromUserId);
      const toUserData: IUser = await this.getUserData(toUserId);
      const [fromUser, toUser] = await Promise.all([fromUserData, toUserData]);

      if (!fromUser || !toUser) throw new Error('One or both users not found');

      await Promise.all([
        this.sendEmail(fromUser.email, 'Transfer Sent', 'transfer', {
          firstName: fromUser.firstName,
          transferStatus: 'sent',
          amount,
          otherPartyName: toUser.email,
          transactionId,
          transactionDate: new Date().toLocaleString(),
          transactionDetailsLink: `${config.APP_URL_WALLET}api/transactions/${transactionId}`,
          newBalance: fromBalance
        }),
        this.sendEmail(toUser.email, 'Transfer Received', 'transfer', {
          firstName: toUser.firstName,
          transferStatus: 'received',
          amount,
          otherPartyName: fromUser.email,
          transactionId,
          transactionDate: new Date().toLocaleString(),
          transactionDetailsLink: `${config.APP_URL_WALLET}api/transactions/${transactionId}`,
          newBalance: toBalance
        })
      ]);
    } catch (error) {
      CustomLogger.error('Error in notifyTransfer:', error);
      throw new Error(`Failed to send transfer notifications: ${(error as Error).message}`);
    }
  }

  async notifyWithdrawal(
    userId: string,
    amount: number,
    transactionId: string,
    withdrawalStatus: string,
    withdrawalMethod: string,
    newBalance: number,
    failureReason: string | null = null
  ): Promise<void> {
    try {
      const userData: IUser = await this.getUserData(userId);

      await this.sendEmail(userData.email, 'Withdrawal Update', 'withdrawal', {
        firstName: userData.firstName,
        amount,
        withdrawalStatus,
        transactionId,
        transactionDate: new Date().toLocaleString(),
        withdrawalMethod,
        failureReason,
        transactionDetailsLink: `${config.APP_URL_WALLET}api/transactions/${transactionId}`,
        newBalance
      });
    } catch (error) {
      CustomLogger.error('Error in notifyWithdrawal:', error);
      throw new Error(`Failed to send withdrawal notification: ${(error as Error).message}`);
    }
  }

  async notifyWalletCreation(userId: string, initialBalance: number): Promise<void> {
    try {
      const userData: IUser = await this.getUserData(userId);

      await this.sendEmail(userData.email, 'Wallet Created Successfully', 'wallet-creation', {
        firstName: userData.firstName,
        initialBalance,
        walletLink: `${config.APP_URL_WALLET}/api/wallet/balance`
      });
      CustomLogger.info(`Wallet creation notification sent to user ${userId}`);
    } catch (error) {
      CustomLogger.error('Error in notifyWalletCreation:', error);
    }
  }

  async notifyPaymentMethodAdded(userId: string, type: string, paymentMethodId: string): Promise<void> {
    try {
      const userData: IUser = await this.getUserData(userId);
      await this.sendEmail(userData.email, 'New Payment Method Added', 'payment-method-added', {
        firstName: userData.firstName,
        type,
        paymentMethodId,
        managePaymentMethodsLink: `${config.APP_URL_PAYMENT}/payment/payment-methods`
      });
      CustomLogger.info(`Payment method added notification sent to user ${userId}`);
    } catch (error) {
      CustomLogger.error('Error in notifyPaymentMethodAdded:', error);
    }
  }
}
