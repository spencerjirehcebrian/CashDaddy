"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const express_validator_1 = require("express-validator");
const user_service_1 = require("../service/db/user.service");
class userController {
    static async register(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, firstName, lastName } = req.body;
        try {
            const token = await user_service_1.userService.register(email, password, firstName, lastName);
            res.status(201).json({ token });
        }
        catch (error) {
            const e = error;
            res.status(400).json({ message: e.message });
        }
    }
    static async login(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            const token = await user_service_1.userService.login(email, password);
            res.json({ token });
        }
        catch (error) {
            const e = error;
            res.status(401).json({ message: e.message });
        }
    }
}
exports.userController = userController;
