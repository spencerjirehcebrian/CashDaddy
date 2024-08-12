import mongoose from 'mongoose';
import { config } from '../config';

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI!);
    console.log('Connected to MongoDB:', config.MONGO_URI);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};
