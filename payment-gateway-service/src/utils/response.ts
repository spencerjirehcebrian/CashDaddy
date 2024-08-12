import { Response } from 'express';
import logger from './logger';

export interface StandardResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
export const sendResponse = <T>(res: Response, statusCode: number, success: boolean, message: string, data?: T): Response => {
  const response: StandardResponse<T> = {
    success,
    message,
    data
  };

  logger.info(`Response: ${statusCode} ${message}`);
  return res.status(statusCode).json(response);
};
