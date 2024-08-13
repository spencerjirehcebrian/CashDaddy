"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const response_1 = require("../utils/response");
const error_types_1 = require("../types/error.types");
class UserController {
    constructor(userService, authService) {
        this.userService = userService;
        this.authService = authService;
    }
    async register(req, res, next) {
        try {
            const { email, password, firstName, lastName } = req.body;
            const user = await this.userService.register(email, password, firstName, lastName);
            (0, response_1.sendResponse)(res, 201, true, 'User registered successfully', { user });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const authPayload = await this.userService.login(email, password);
            const token = this.authService.generateToken(authPayload);
            (0, response_1.sendResponse)(res, 200, true, 'Login successful', { token, user: authPayload });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(_req, res) {
        (0, response_1.sendResponse)(res, 200, true, 'Logout successful');
    }
    async getOwnUser(req, res, next) {
        try {
            const userId = req.user.userId;
            const user = await this.userService.getUserById(userId);
            (0, response_1.sendResponse)(res, 200, true, 'User retrieved successfully', user);
        }
        catch (error) {
            next(error);
        }
    }
    async updateOwnUser(req, res, next) {
        try {
            const userId = req.user.userId;
            const updateData = req.body;
            const updatedUser = await this.userService.updateUser(userId, updateData);
            (0, response_1.sendResponse)(res, 200, true, 'User updated successfully', updatedUser);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllUsers(_req, res, next) {
        try {
            const users = await this.userService.getAllUsers();
            (0, response_1.sendResponse)(res, 200, true, 'Users retrieved successfully', users);
        }
        catch (error) {
            next(error);
        }
    }
    async getUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const user = await this.userService.getUserById(userId);
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
    async updateUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const updateData = req.body;
            const updatedUser = await this.userService.updateUser(userId, updateData);
            (0, response_1.sendResponse)(res, 200, true, 'User updated successfully', updatedUser);
        }
        catch (error) {
            next(error);
        }
    }
    async deactivateUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const deactivatedUser = await this.userService.deactivateUser(userId);
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
    async reactivateUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const reactivatedUser = await this.userService.reactivateUser(userId);
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
