import mongoose from 'mongoose';
import { config } from '../config';
import logger from './logger';
export const connectMongoDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        logger.info('Connected to MongoDB:', config.MONGO_URI);
    }
    catch (error) {
        logger.error('Failed to connect to MongoDB:', error);
        throw error;
    }
};
//# sourceMappingURL=mongo-client.js.map