import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import Handlebars from 'handlebars';
import path from 'path';
import { config } from '../config/index.js';
import { CustomLogger } from '@cash-daddy/shared';
import { fileURLToPath } from 'url';

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

  constructor() {
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
        from: 'Your E-Wallet <noreply@coderstudio.co>',
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

  async notifyEmailVerification(user: string, verificationLink: string): Promise<boolean> {
    try {
      await this.sendEmail(user, 'Verify Your E-Wallet Email', 'verification', {
        firstName: user,
        verificationLink
      });
      CustomLogger.info(`Verification email sent successfully to ${user}`);
      return true;
    } catch (error) {
      CustomLogger.error(`Error sending verification email to ${user}:`, error);
      return false;
    }
  }

  //   async notifyLogin(user: IUser, loginTime: string, loginLocation: string): Promise<void> {
  //     try {
  //       await this.sendEmail(user.email, 'New Login to Your E-Wallet Account', 'login', {
  //         firstName: user.firstName,
  //         loginTime,
  //         loginLocation,
  //         secureAccountLink: `${config.APP_URL}/secure-account`
  //       });
  //     } catch (error) {
  //       CustomLogger.error('Error in notifyLogin:', error);
  //     }
  //   }

  //   async notifyDeposit(userId: string, amount: number, transactionId: string): Promise<void> {
  //     try {
  //       const user = await User.findById(userId);
  //       if (!user) throw new Error('User not found');

  //       await this.sendEmail(user.email, 'Deposit Successful', 'deposit', {
  //         firstName: user.firstName,
  //         amount,
  //         transactionId,
  //         transactionDate: new Date().toLocaleString(),
  //         viewBalanceLink: `${config.APP_URL}/wallet/balance`
  //       });
  //     } catch (error) {
  //       CustomLogger.error('Error in notifyDeposit:', error);
  //       throw new Error(`Failed to send deposit notification: ${(error as Error).message}`);
  //     }
  //   }

  //   async notifyKYCUpdate(userId: string, kycStatus: string, rejectionReason: string | null = null): Promise<void> {
  //     try {
  //       const user = await User.findById(userId);
  //       if (!user) throw new Error('User not found');

  //       await this.sendEmail(user.email, 'KYC Verification Update', 'kyc-verification', {
  //         firstName: user.firstName,
  //         kycStatus,
  //         rejectionReason,
  //         accountLink: `${config.APP_URL}/account`,
  //         resubmitLink: `${config.APP_URL}/kyc/resubmit`
  //       });
  //     } catch (error) {
  //       CustomLogger.error('Error in notifyKYCUpdate:', error);
  //       throw new Error(`Failed to send KYC update notification: ${(error as Error).message}`);
  //     }
  //   }

  //   async notifyQRPayment(payerId: string, recipientId: string, amount: number, transactionId: string, paymentStatus: string): Promise<void> {
  //     try {
  //       CustomLogger.info(`Notifying QR payment. Payer: ${payerId}, Recipient: ${recipientId}`);

  //       const [payer, recipient] = await Promise.all([User.findById(payerId), User.findById(recipientId)]);

  //       if (!payer) {
  //         CustomLogger.error(`Payer not found. ID: ${payerId}`);
  //         throw new Error(`Payer not found. ID: ${payerId}`);
  //       }
  //       if (!recipient) {
  //         CustomLogger.error(`Recipient not found. ID: ${recipientId}`);
  //         throw new Error(`Recipient not found. ID: ${recipientId}`);
  //       }

  //       await Promise.all([
  //         this.sendEmail(payer.email, 'QR Payment Sent', 'qr-payment', {
  //           firstName: payer.firstName,
  //           paymentStatus: 'sent',
  //           amount,
  //           transactionId,
  //           transactionDate: new Date().toLocaleString(),
  //           transactionDetailsLink: `${config.APP_URL}/transactions/${transactionId}`
  //         }),
  //         this.sendEmail(recipient.email, 'QR Payment Received', 'qr-payment', {
  //           firstName: recipient.firstName,
  //           paymentStatus: 'received',
  //           amount,
  //           transactionId,
  //           transactionDate: new Date().toLocaleString(),
  //           transactionDetailsLink: `${config.APP_URL}/transactions/${transactionId}`
  //         })
  //       ]);

  //       CustomLogger.info(`QR payment notifications sent successfully for transaction ${transactionId}`);
  //     } catch (error) {
  //       CustomLogger.error('Error in notifyQRPayment:', error);
  //       throw new Error(`Failed to send QR payment notifications: ${(error as Error).message}`);
  //     }
  //   }

  //   async notifyTransfer(
  //     fromUserId: string,
  //     toUserId: string,
  //     amount: number,
  //     transactionId: string,
  //     fromBalance: number,
  //     toBalance: number
  //   ): Promise<void> {
  //     try {
  //       const [fromUser, toUser] = await Promise.all([User.findById(fromUserId), User.findById(toUserId)]);

  //       if (!fromUser || !toUser) throw new Error('One or both users not found');

  //       await Promise.all([
  //         this.sendEmail(fromUser.email, 'Transfer Sent', 'transfer', {
  //           firstName: fromUser.firstName,
  //           transferStatus: 'sent',
  //           amount,
  //           otherPartyName: toUser.email,
  //           transactionId,
  //           transactionDate: new Date().toLocaleString(),
  //           transactionDetailsLink: `${config.APP_URL}/transactions/${transactionId}`,
  //           newBalance: fromBalance
  //         }),
  //         this.sendEmail(toUser.email, 'Transfer Received', 'transfer', {
  //           firstName: toUser.firstName,
  //           transferStatus: 'received',
  //           amount,
  //           otherPartyName: fromUser.email,
  //           transactionId,
  //           transactionDate: new Date().toLocaleString(),
  //           transactionDetailsLink: `${config.APP_URL}/transactions/${transactionId}`,
  //           newBalance: toBalance
  //         })
  //       ]);
  //     } catch (error) {
  //       CustomLogger.error('Error in notifyTransfer:', error);
  //       throw new Error(`Failed to send transfer notifications: ${(error as Error).message}`);
  //     }
  //   }

  //   async notifyWithdrawal(
  //     userId: string,
  //     amount: number,
  //     transactionId: string,
  //     withdrawalStatus: string,
  //     withdrawalMethod: string,
  //     failureReason: string | null = null
  //   ): Promise<void> {
  //     try {
  //       const user = await User.findById(userId);
  //       if (!user) throw new Error('User not found');

  //       await this.sendEmail(user.email, 'Withdrawal Update', 'withdrawal', {
  //         firstName: user.firstName,
  //         amount,
  //         withdrawalStatus,
  //         transactionId,
  //         transactionDate: new Date().toLocaleString(),
  //         withdrawalMethod,
  //         failureReason,
  //         transactionDetailsLink: `${config.APP_URL}/transactions/${transactionId}`,
  //         newBalance: user.wallet.balance - amount
  //       });
  //     } catch (error) {
  //       CustomLogger.error('Error in notifyWithdrawal:', error);
  //       throw new Error(`Failed to send withdrawal notification: ${(error as Error).message}`);
  //     }
  //   }

  //   async notifyWalletCreation(userId: string, initialBalance: number): Promise<void> {
  //     try {
  //       const user = await User.findById(userId);
  //       if (!user) throw new Error('User not found');

  //       await this.sendEmail(user.email, 'Wallet Created Successfully', 'wallet-creation', {
  //         firstName: user.firstName,
  //         initialBalance,
  //         walletLink: `${config.APP_URL}/wallet`
  //       });
  //       CustomLogger.info(`Wallet creation notification sent to user ${userId}`);
  //     } catch (error) {
  //       CustomLogger.error('Error in notifyWalletCreation:', error);
  //     }
  //   }

  //   async notifyPaymentMethodAdded(userId: string, last4: string, cardBrand: string): Promise<void> {
  //     try {
  //       const user = await User.findById(userId);
  //       if (!user) throw new Error('User not found');

  //       await this.sendEmail(user.email, 'New Payment Method Added', 'payment-method-added', {
  //         firstName: user.firstName,
  //         last4: last4,
  //         cardBrand: cardBrand,
  //         managePaymentMethodsLink: `${config.APP_URL}/wallet/payment-methods`
  //       });
  //       CustomLogger.info(`Payment method added notification sent to user ${userId}`);
  //     } catch (error) {
  //       CustomLogger.error('Error in notifyPaymentMethodAdded:', error);
  //     }
  //   }
}
