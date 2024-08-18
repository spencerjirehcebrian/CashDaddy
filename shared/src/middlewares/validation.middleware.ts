import { BadRequestError } from "@/types/error.types.js";
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const zodValidation = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestError("Validation failed", errorMessages);
    }

    next();
  };
};
