import { Request, Response, NextFunction } from 'express';
import { BadRequestError, NotAuthorizedError, ServerError, CustomError } from '../utils/CustomErrors';
import logger from '../utils/logger';
interface MongooseError extends Error {
  errors?: { [key: string]: { message: string } };
  code?: number;
  keyValue?: { [key: string]: string };
}

const errorHandler = (err: Error | CustomError | MongooseError, _req: Request, res: Response, _next: NextFunction): Response | void => {
  logger.error(err.stack);

  if (err instanceof CustomError) {
    const serializedError = err.serializeErrors();
    return res.status(serializedError.statusCode).json({ error: serializedError.message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && 'errors' in err && err.errors !== undefined) {
    const errors = Object.values(err.errors).map((error) => error.message);
    const customError = new BadRequestError(errors.join(', '));
    const serializedError = customError.serializeErrors();
    return res.status(serializedError.statusCode).json({ error: serializedError.message });
  }

  // Mongoose duplicate key error
  if ('code' in err && err.code === 11000 && 'keyValue' in err && err.keyValue !== undefined) {
    const field = Object.keys(err.keyValue)[0];
    const customError = new BadRequestError(`${field} already exists.`);
    const serializedError = customError.serializeErrors();
    return res.status(serializedError.statusCode).json({ error: serializedError.message });
  }

  // JWT authentication error
  if (err.name === 'UnauthorizedError') {
    const customError = new NotAuthorizedError('Invalid token');
    const serializedError = customError.serializeErrors();
    return res.status(serializedError.statusCode).json({ error: serializedError.message });
  }

  // Default to 500 server error
  const serverError = new ServerError('Internal Server Error');
  const serializedError = serverError.serializeErrors();
  res.status(serializedError.statusCode).json({ error: serializedError.message });
};

export default errorHandler;
