import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

export const RequestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  logger.info(`${req.method} ${req.url}`, {
    body: req.body,
    params: req.params,
    query: req.query,
    ip: req.ip,
  });
  next();
};
