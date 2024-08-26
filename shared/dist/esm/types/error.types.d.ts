export interface IErrorResponse {
    message: string;
    statusCode: number;
    serializeErrors(): IError;
}
export interface IError {
    message: string;
    statusCode: number;
    errors?: string[];
}
export declare abstract class CustomError extends Error {
    abstract statusCode: number;
    constructor(message: string);
    serializeErrors(): IError;
}
export declare class JoiRequestValidationError extends CustomError {
    statusCode: number;
    constructor(message: string);
}
export declare class BadRequestError extends CustomError {
    statusCode: number;
    errors?: string[];
    constructor(message: string, errors?: string[]);
    serializeErrors(): IError;
}
export declare class NotFoundError extends CustomError {
    statusCode: number;
    constructor(message: string);
}
export declare class NotAuthorizedError extends CustomError {
    statusCode: number;
    constructor(message: string);
}
export declare class FileTooLargeError extends CustomError {
    statusCode: number;
    constructor(message: string);
}
export declare class ServerError extends CustomError {
    statusCode: number;
    constructor(message: string);
}
export declare class InvalidObjectIdError extends CustomError {
    statusCode: number;
    constructor(message: string);
    serializeErrors(): IError;
}
//# sourceMappingURL=error.types.d.ts.map