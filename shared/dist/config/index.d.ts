declare class Config {
    MONGO_URI: string | undefined;
    JWT_SECRET: string | undefined;
    JWT_EXPIRATION: string | undefined;
    REDIS_URL: string | undefined;
    PORT: string | undefined;
    KAFKA_BROKERS: string | undefined;
    NODE_ENV: string | undefined;
    private readonly DEFAULT_MONGO_URI;
    constructor();
    validateConfig(): void;
}
export declare const config: Config;
export {};
