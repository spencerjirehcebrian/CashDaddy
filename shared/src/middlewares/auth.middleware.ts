// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from "express";
import { UserRole } from "../interfaces/models/user.interface.js";
import { IAuthService } from "../interfaces/services/auth-service.interface.js";
import { IRedisService } from "../interfaces/services/redis.service.interface.js";
import { NotAuthorizedError } from "../types/error.types.js";
import { AuthPayload } from "../types/auth.types.js";

type RoleChecker = (role: string) => boolean;

interface AuthOptions {
  roles?: UserRole[] | RoleChecker;
  checkOwnership?: boolean;
  ownershipParamName?: string;
}

export class AuthMiddleware {
  constructor(
    private authService: IAuthService,
    private redisService: IRedisService
  ) {}

  private createMiddleware(options: AuthOptions = {}) {
    const {
      roles,
      checkOwnership = false,
      ownershipParamName = "userId",
    } = options;

    return async (req: Request, _res: Response, next: NextFunction) => {
      try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
          throw new NotAuthorizedError("Authentication required");
        }

        const decoded = this.authService.verifyToken(token);

        // Check if token is blacklisted
        const isBlacklisted = await this.redisService.isBlacklisted(token);
        if (isBlacklisted) {
          throw new NotAuthorizedError("User is logged out");
        }

        // Check roles if specified
        if (roles) {
          const hasRequiredRole = Array.isArray(roles)
            ? roles.includes(decoded.role as UserRole) ||
              decoded.role === UserRole.SUPER_ADMIN
            : roles(decoded.role) || decoded.role === UserRole.SUPER_ADMIN;

          if (!hasRequiredRole) {
            throw new NotAuthorizedError("Insufficient privileges");
          }
        }

        // Attach the decoded payload to the request
        req.user = decoded;

        // Check ownership if required
        if (
          checkOwnership &&
          decoded.role !== UserRole.ADMIN &&
          decoded.role !== UserRole.SUPER_ADMIN
        ) {
          const resourceUserId = this.getResourceUserId(
            req,
            ownershipParamName
          );

          if (decoded.userId !== resourceUserId) {
            throw new NotAuthorizedError(
              "Not authorized to access this resource"
            );
          }
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  private getResourceUserId(req: Request, paramName: string): string {
    return req.params[paramName] || (req.user as AuthPayload).userId;
  }

  public requireAuth = this.createMiddleware();
  public requireAdmin = this.createMiddleware({
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  });
  public requireSuperAdmin = this.createMiddleware({
    roles: [UserRole.SUPER_ADMIN],
  });
  public requireOwnership = this.createMiddleware({ checkOwnership: true });
}
