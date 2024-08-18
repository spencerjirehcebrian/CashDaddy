import logger from './logger.js';
export const sendResponse = (res, statusCode, success, message, data) => {
    const response = {
        success,
        message,
        data
    };
    logger.info(`Response: ${statusCode} ${message}`);
    return res.status(statusCode).json(response);
};
