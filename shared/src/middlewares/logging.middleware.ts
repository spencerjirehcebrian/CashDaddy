import logger from "@/utils/logger.js";
import { Request, Response, NextFunction } from "express";

const requestLogger = (
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

export default requestLogger;
