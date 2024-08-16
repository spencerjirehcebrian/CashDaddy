import { Request, Response, NextFunction } from 'express';
import { BadRequestError, NotAuthorizedError, ServerError, CustomError, InvalidObjectIdError } from '../types/error.types';
import logger from '../utils/logger';
import { sendResponse } from '../utils/response';

interface MongooseError extends Error {
  errors?: { [key: string]: { message: string } };
  code?: number;
  keyValue?: { [key: string]: string };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: Error | CustomError | MongooseError, _req: Request, res: Response, _next: NextFunction): Response | void => {
  if (err.stack) {
    logger.error(err.stack);
  } else {
    logger.error('Error stack is undefined');
  }

  if (err instanceof CustomError) {
    const serializedError = err.serializeErrors();
    return sendResponse(res, serializedError.statusCode, false, 'An error occurred', serializedError);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && 'errors' in err && err.errors !== undefined) {
    const errors = Object.values(err.errors).map((error) => error.message);
    const customError = new BadRequestError(errors.join(', '));
    const serializedError = customError.serializeErrors();
    return sendResponse(res, serializedError.statusCode, false, 'Validation error', serializedError);
  }

  // Mongoose duplicate key error
  if ('code' in err && err.code === 11000 && 'keyValue' in err && err.keyValue !== undefined) {
    const field = Object.keys(err.keyValue)[0];
    const customError = new BadRequestError(`${field} already exists.`);
    const serializedError = customError.serializeErrors();
    return sendResponse(res, serializedError.statusCode, false, 'Duplicate key error', serializedError);
  }

  // JWT authentication error
  if (err.name === 'UnauthorizedError') {
    const customError = new NotAuthorizedError('Invalid token');
    const serializedError = customError.serializeErrors();
    return sendResponse(res, serializedError.statusCode, false, 'Authentication error', serializedError);
  }

  if (err.name === 'CastError' && 'kind' in err && err.kind === 'ObjectId') {
    const customError = new InvalidObjectIdError(`Invalid ObjectId format: A param is not a valid`);
    const serializedError = customError.serializeErrors();
    return sendResponse(res, serializedError.statusCode, false, 'Invalid ObjectId', serializedError);
  }

  // Default to 500 server error
  const serverError = new ServerError('Internal Server Error');
  const serializedError = serverError.serializeErrors();
  return sendResponse(res, serializedError.statusCode, false, 'Server error', serializedError);
};

export default errorHandler;
