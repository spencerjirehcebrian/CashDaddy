import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { BadRequestError } from '../types/error.types';

export const joiValidation = (schema: ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error?.details) {
      const errorMessages = error.details.map((detail) => detail.message);
      throw new BadRequestError('Validation failed', errorMessages);
    }

    next();
  };
};
