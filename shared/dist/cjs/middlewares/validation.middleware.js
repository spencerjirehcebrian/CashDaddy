"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodValidation = void 0;
const error_types_js_1 = require("../types/error.types.js");
const ZodValidation = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errorMessages = result.error.issues.map((issue) => issue.message);
            throw new error_types_js_1.BadRequestError("Validation failed", errorMessages);
        }
        next();
    };
};
exports.ZodValidation = ZodValidation;
