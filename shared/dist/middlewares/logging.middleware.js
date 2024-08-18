import logger from "../utils/logger";
const requestLogger = (req, _res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip,
    });
    next();
};
export default requestLogger;
//# sourceMappingURL=logging.middleware.js.map