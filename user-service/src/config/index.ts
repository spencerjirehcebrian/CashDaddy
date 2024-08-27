import dotenv from 'dotenv';

dotenv.config({});

class Config {
  public MONGO_URI: string | undefined;
  public JWT_SECRET: string | undefined;
  public JWT_EXPIRATION: string | undefined;
  public REDIS_URL: string | undefined;
  public PORT: string | undefined;
  public KAFKA_BROKERS: string | undefined;
  public NODE_ENV: string | undefined;
  public KAFKA_CLIENT_ID: string | undefined;
  public KAFKA_GROUP_ID: string | undefined;
  public KAFKA_TOPIC: string | undefined;
  public MINIO_URL: string | undefined;
  public MINIO_ACCESS_KEY: string | undefined;
  public MINIO_SECRET_KEY: string | undefined;
  public MAILHOG_URL: string | undefined;
  public EMAIL_HOST: string | undefined;
  public EMAIL_PORT: string | undefined;
  public EMAIL_USERNAME: string | undefined;
  public EMAIL_PASSWORD: string | undefined;
  public EMAIL_FROM: string | undefined;
  public APP_URL_USER: string | undefined;
  public APP_URL_KYC: string | undefined;
  public APP_URL_WALLET: string | undefined;
  public APP_URL_PAYMENT: string | undefined;
  private readonly DEFAULT_MONGO_URI = 'mongodb://localhost:27017/cashdaddy_user_dev';

  constructor() {
    this.MONGO_URI = process.env.MONGO_URI || this.DEFAULT_MONGO_URI;
    this.JWT_SECRET = process.env.JWT_TOKEN || '1234';
    this.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
    this.PORT = process.env.PORT || '3000';
    this.KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'localhost:29092';
    this.KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'cashdaddy-consumer';
    this.KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'cashdaddy-service-group';
    this.KAFKA_TOPIC = process.env.KAFKA_TOPIC || 'service-messages';
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
    this.MINIO_URL = process.env.MINIO_URL || 'http://localhost:9000';
    this.MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    this.MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
    this.MAILHOG_URL = process.env.MAILHOG_URL || 'http://localhost:8025';
    this.EMAIL_HOST = process.env.EMAIL_HOST || 'localhost';
    this.EMAIL_PORT = process.env.EMAIL_PORT || '1025';
    this.EMAIL_USERNAME = process.env.EMAIL_USERNAME || 'minioadmin';
    this.EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || 'minioadmin';
    this.EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@cashdaddy.com';
    this.APP_URL_USER = process.env.APP_URL_USER || 'http://localhost:3000';
    this.APP_URL_KYC = process.env.APP_URL_KYC || 'http://localhost:3001';
    this.APP_URL_WALLET = process.env.APP_URL_WALLET || 'http://localhost:3002';
    this.APP_URL_PAYMENT = process.env.APP_URL_PAYMENT || 'http://localhost:3003';
  }

  public validateConfig(): void {
    // console.log(this);
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} is undefined.`);
      }
    }
  }
}

export const config: Config = new Config();
