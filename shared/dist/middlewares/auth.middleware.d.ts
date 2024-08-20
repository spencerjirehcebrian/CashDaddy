import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../interfaces/services/auth-service.interface.js";
import { IRedisService } from "../interfaces/services/redis.service.interface.js";
export declare class AuthMiddleware {
    private authService;
    private redisService;
    constructor(authService: IAuthService, redisService: IRedisService);
    private createMiddleware;
    private getResourceUserId;
    requireAuth: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
    requireAdmin: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
    requireSuperAdmin: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
    requireOwnership: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
}
