import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
export declare const zodValidation: (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => void;
