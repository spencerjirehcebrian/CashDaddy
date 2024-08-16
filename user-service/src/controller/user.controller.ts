import { Request, Response, NextFunction } from 'express';
import { IUserService } from '../interfaces/services/user-service.interface';
import { IAuthService } from '../interfaces/services/auth-service.interface';
import { sendResponse } from '../utils/response';
import { BadRequestError, NotFoundError } from '../types/error.types';
import { AuthPayload } from '../types/auth.types';
import { IRedisService } from '@/interfaces/services/redis.service.interface';

export class UserController {
  constructor(
    private userService: IUserService,
    private authService: IAuthService,
    private redisService: IRedisService
  ) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;
      const user = await this.userService.register(email, password, firstName, lastName);
      sendResponse(res, 201, true, 'User registered successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const authPayload = await this.userService.login(email, password);

      const token = this.authService.generateToken(authPayload);
      sendResponse(res, 200, true, 'Login successful', { token, user: authPayload });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        await this.redisService.addToBlacklist(token);
      }
      sendResponse(res, 200, true, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async getOwnUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as AuthPayload).userId;
      const user = await this.userService.getUserById(userId);
      sendResponse(res, 200, true, 'User retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async updateOwnUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as AuthPayload).userId;
      const updateData = req.body;
      const updatedUser = await this.userService.updateUser(userId, updateData);
      sendResponse(res, 200, true, 'User updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      sendResponse(res, 200, true, 'Users retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const user = await this.userService.getUserById(userId);
      sendResponse(res, 200, true, 'User retrieved successfully', user);
    } catch (error) {
      if (error instanceof NotFoundError) {
        sendResponse(res, 404, false, error.message);
      } else {
        next(error);
      }
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const updateData = req.body;
      const updatedUser = await this.userService.updateUser(userId, updateData);
      sendResponse(res, 200, true, 'User updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const deactivatedUser = await this.userService.deactivateUser(userId);
      sendResponse(res, 200, true, 'User deactivated successfully', { user: deactivatedUser });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        sendResponse(res, 400, false, error.message);
      } else {
        next(error);
      }
    }
  }

  async reactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const reactivatedUser = await this.userService.reactivateUser(userId);
      sendResponse(res, 200, true, 'User reactivated successfully', { user: reactivatedUser });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        sendResponse(res, 400, false, error.message);
      } else {
        next(error);
      }
    }
  }

  async promoteUserToAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const promotedUser = await this.userService.promoteUserToAdmin(userId);
      sendResponse(res, 200, true, 'User promoted successfully', { user: promotedUser });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        sendResponse(res, 400, false, error.message);
      } else {
        next(error);
      }
    }
  }
}
