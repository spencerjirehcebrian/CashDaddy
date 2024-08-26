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
  public STRIPE_SECRET_KEY: string | undefined;

  private readonly DEFAULT_MONGO_URI = 'mongodb://localhost:27017/cashdaddy_user_dev';

  constructor() {
    this.MONGO_URI = process.env.MONGO_URI || this.DEFAULT_MONGO_URI;
    this.JWT_SECRET = process.env.JWT_TOKEN || '1234';
    this.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
    this.PORT = process.env.PORT || '3003';
    this.KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'localhost:29092';
    this.KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'cashdaddy-consumer';
    this.KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'cashdaddy-service-group';
    this.KAFKA_TOPIC = process.env.KAFKA_TOPIC || 'service-messages';
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
    this.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
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
