import { Request, Response, NextFunction } from "express";
import { CustomLogger } from "../utils/logger.js";

export const RequestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  CustomLogger.info(`${req.method} ${req.url}`, {
    body: req.body,
    params: req.params,
    query: req.query,
    ip: req.ip,
  });
  next();
};
