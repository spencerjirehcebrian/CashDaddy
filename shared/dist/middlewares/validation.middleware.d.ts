import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
export declare const ZodValidation: (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => void;
