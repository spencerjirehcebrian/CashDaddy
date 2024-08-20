import { BadRequestError } from "../types/error.types.js";
export const zodValidation = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errorMessages = result.error.issues.map((issue) => issue.message);
            throw new BadRequestError("Validation failed", errorMessages);
        }
        next();
    };
};
