import { CustomLogger } from "./logger";
export const sendResponse = (res, statusCode, success, message, data) => {
    const response = {
        success,
        message,
        data,
    };
    CustomLogger.info(`Response: ${statusCode} ${message}`);
    return res.status(statusCode).json(response);
};
