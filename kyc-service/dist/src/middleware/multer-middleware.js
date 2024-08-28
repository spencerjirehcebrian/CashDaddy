import multer from 'multer';
import { z } from 'zod';
import { kycSchema } from '../validators/kyc.validator.js';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const storage = multer.memoryStorage(); // Use memory storage instead of disk storage
const fileFilter = (_req, file, cb) => {
    if (ACCEPTED_FILE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only .jpg, .jpeg, .png and .pdf files are accepted.'));
    }
};
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});
export const kycUploadMiddleware = (fieldName) => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: `File size should be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` });
                }
                return res.status(400).json({ error: err.message });
            }
            else if (err) {
                return res.status(400).json({ error: err.message });
            }
            // If file is uploaded successfully, add it to the request body
            if (req.file) {
                req.body.addressProofDocument = req.file;
            }
            // Validate the entire request body (including file) using Zod
            try {
                const validatedData = kycSchema.parse(req.body);
                req.body = validatedData; // Replace req.body with the validated data
                return next(); // Ensure we return after calling next()
            }
            catch (error) {
                if (error instanceof z.ZodError) {
                    return res.status(400).json({ errors: error.errors });
                }
                return next(error); // Ensure we return after calling next(error)
            }
        });
    };
};
