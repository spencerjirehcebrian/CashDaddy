import mongoose from 'mongoose';
import { config } from './index.js';
import { CustomLogger } from '@cash-daddy/shared';
export const connectMongoDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        CustomLogger.info('Connected to MongoDB:', config.MONGO_URI);
    }
    catch (error) {
        CustomLogger.error('Failed to connect to MongoDB:', error);
        throw error;
    }
};
