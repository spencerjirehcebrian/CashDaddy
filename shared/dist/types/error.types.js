import HTTP_STATUS from "http-status-codes";
export class CustomError extends Error {
    constructor(message) {
        super(message);
    }
    serializeErrors() {
        return {
            message: this.message,
            statusCode: this.statusCode,
        };
    }
}
export class JoiRequestValidationError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = HTTP_STATUS.BAD_REQUEST;
    }
}
export class BadRequestError extends CustomError {
    constructor(message, errors) {
        super(message);
        this.statusCode = HTTP_STATUS.BAD_REQUEST;
        this.errors = errors;
    }
    serializeErrors() {
        return {
            message: this.message,
            statusCode: this.statusCode,
            errors: this.errors,
        };
    }
}
export class NotFoundError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = HTTP_STATUS.NOT_FOUND;
    }
}
export class NotAuthorizedError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = HTTP_STATUS.UNAUTHORIZED;
    }
}
export class FileTooLargeError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = HTTP_STATUS.REQUEST_TOO_LONG;
    }
}
export class ServerError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
    }
}
export class InvalidObjectIdError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = HTTP_STATUS.BAD_REQUEST;
    }
    serializeErrors() {
        return {
            message: this.message,
            statusCode: this.statusCode,
            errors: ["Invalid ObjectId format"],
        };
    }
}
//# sourceMappingURL=error.types.js.map