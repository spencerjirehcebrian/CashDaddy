import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/db/user.service';
import { sendResponse } from '../utils/response';
import { BadRequestError, NotFoundError } from '../types/error.types';
import { AuthPayload } from '../types/auth.types';
import { AuthService } from '../services/auth/auth.service';

export class UserController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;
      const user = await UserService.register(email, password, firstName, lastName);
      sendResponse(res, 201, true, 'User registered successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const authPayload = await UserService.login(email, password);
      const token = AuthService.generateToken(authPayload);
      sendResponse(res, 200, true, 'Login successful', { token, user: authPayload });
    } catch (error) {
      next(error);
    }
  }
  static async logout(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    // With JWT, we don't need to do anything server-side for logout
    // The client should discard the token
    sendResponse(res, 200, true, 'Logout successful');
  }

  static async getOwnUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as AuthPayload).userId;
      const user = await UserService.getUserById(userId);
      sendResponse(res, 200, true, 'User retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }

  static async updateOwnUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as AuthPayload).userId;
      const updateData = req.body;
      const updatedUser = await UserService.updateUser(userId, updateData);
      sendResponse(res, 200, true, 'User updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      sendResponse(res, 200, true, 'Users retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  }

  static async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const user = await UserService.getUserById(userId);
      sendResponse(res, 200, true, 'User retrieved successfully', user);
    } catch (error) {
      if (error instanceof NotFoundError) {
        sendResponse(res, 404, false, error.message);
      } else {
        next(error);
      }
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const updateData = req.body;
      const updatedUser = await UserService.updateUser(userId, updateData);
      sendResponse(res, 200, true, 'User updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }

  static async deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const deactivatedUser = await UserService.deactivateUser(userId);
      sendResponse(res, 200, true, 'User deactivated successfully', { user: deactivatedUser });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        sendResponse(res, 400, false, error.message);
      } else {
        next(error);
      }
    }
  }

  static async reactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const reactivatedUser = await UserService.reactivateUser(userId);
      sendResponse(res, 200, true, 'User reactivated successfully', { user: reactivatedUser });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        sendResponse(res, 400, false, error.message);
      } else {
        next(error);
      }
    }
  }
}
