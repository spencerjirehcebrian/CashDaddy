import { Request, Response, NextFunction } from "express";
declare const requestLogger: (req: Request, _res: Response, next: NextFunction) => void;
export default requestLogger;
