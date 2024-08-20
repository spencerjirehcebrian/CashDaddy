import winston from "winston";
declare const customLogger: winston.Logger & {
    [key: string]: unknown;
};
export default customLogger;
