import { CustomError } from "../types/error.types.js";
import { Request, Response, NextFunction } from "express";
interface MongooseError extends Error {
    errors?: {
        [key: string]: {
            message: string;
        };
    };
    code?: number;
    keyValue?: {
        [key: string]: string;
    };
}
declare const errorHandler: (err: Error | CustomError | MongooseError, _req: Request, res: Response, _next: NextFunction) => Response | void;
export default errorHandler;
