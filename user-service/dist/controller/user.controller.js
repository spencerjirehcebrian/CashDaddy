"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/db/user.service");
const session_service_1 = require("../services/session/session.service");
const response_1 = require("../utils/response");
const config_1 = require("../config");
const error_types_1 = require("../types/error.types");
class UserController {
    static async register(req, res, next) {
        try {
            const { email, password, firstName, lastName } = req.body;
            const user = await user_service_1.UserService.register(email, password, firstName, lastName);
            (0, response_1.sendResponse)(res, 201, true, 'User registered successfully', { user });
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const authPayload = await user_service_1.UserService.login(email, password);
            const sessionId = await session_service_1.sessionService.createSession(authPayload);
            res.cookie('sessionId', sessionId, { httpOnly: true, secure: config_1.config.NODE_ENV === 'production' });
            (0, response_1.sendResponse)(res, 200, true, 'Login successful', { authPayload });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            const sessionId = req.cookies['sessionId'];
            if (sessionId) {
                await session_service_1.sessionService.deleteSession(sessionId);
            }
            res.clearCookie('sessionId');
            (0, response_1.sendResponse)(res, 200, true, 'Logout successful');
        }
        catch (error) {
            next(error);
        }
    }
    static async getOwnUser(req, res, next) {
        try {
            const userId = req.user.userId;
            const user = await user_service_1.UserService.getUserById(userId);
            (0, response_1.sendResponse)(res, 200, true, 'User retrieved successfully', user);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateOwnUser(req, res, next) {
        try {
            const userId = req.user.userId;
            const updateData = req.body;
            const updatedUser = await user_service_1.UserService.updateUser(userId, updateData);
            (0, response_1.sendResponse)(res, 200, true, 'User updated successfully', updatedUser);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllUsers(_req, res, next) {
        try {
            const users = await user_service_1.UserService.getAllUsers();
            (0, response_1.sendResponse)(res, 200, true, 'Users retrieved successfully', users);
        }
        catch (error) {
            next(error);
        }
    }
    static async getUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const user = await user_service_1.UserService.getUserById(userId);
            (0, response_1.sendResponse)(res, 200, true, 'User retrieved successfully', user);
        }
        catch (error) {
            if (error instanceof error_types_1.NotFoundError) {
                (0, response_1.sendResponse)(res, 404, false, error.message);
            }
            else {
                next(error);
            }
        }
    }
    static async updateUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const updateData = req.body;
            const updatedUser = await user_service_1.UserService.updateUser(userId, updateData);
            (0, response_1.sendResponse)(res, 200, true, 'User updated successfully', updatedUser);
        }
        catch (error) {
            next(error);
        }
    }
    static async deactivateUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const deactivatedUser = await user_service_1.UserService.deactivateUser(userId);
            (0, response_1.sendResponse)(res, 200, true, 'User deactivated successfully', { user: deactivatedUser });
        }
        catch (error) {
            if (error instanceof error_types_1.NotFoundError || error instanceof error_types_1.BadRequestError) {
                (0, response_1.sendResponse)(res, 400, false, error.message);
            }
            else {
                next(error);
            }
        }
    }
    static async reactivateUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const reactivatedUser = await user_service_1.UserService.reactivateUser(userId);
            (0, response_1.sendResponse)(res, 200, true, 'User reactivated successfully', { user: reactivatedUser });
        }
        catch (error) {
            if (error instanceof error_types_1.NotFoundError || error instanceof error_types_1.BadRequestError) {
                (0, response_1.sendResponse)(res, 400, false, error.message);
            }
            else {
                next(error);
            }
        }
    }
}
exports.UserController = UserController;
