import { CustomLogger } from "../utils/logger.js";
export const RequestLogger = (req, _res, next) => {
    CustomLogger.info(`${req.method} ${req.url}`, {
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip,
    });
    next();
};
