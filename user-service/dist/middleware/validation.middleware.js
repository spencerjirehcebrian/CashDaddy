"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joiValidation = void 0;
const error_types_1 = require("../types/error.types");
const joiValidation = (schema) => {
    return (req, _res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error?.details) {
            const errorMessages = error.details.map((detail) => detail.message);
            throw new error_types_1.BadRequestError('Validation failed', errorMessages);
        }
        next();
    };
};
exports.joiValidation = joiValidation;
