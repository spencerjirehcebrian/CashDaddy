import { Request, Response, NextFunction } from "express";
import { UserRole, UserStatus } from "../interfaces/models/user.interface.js";
import { IAuthService } from "../interfaces/services/auth-service.interface.js";
import { IRedisService } from "../interfaces/services/redis.service.interface.js";
import { NotAuthorizedError } from "../types/error.types.js";
import { AuthPayload } from "../types/auth.types.js";
import { VerificationStatus } from "../interfaces/models/kyc.interface.js";

type RoleChecker = (role: string) => boolean;

interface AuthOptions {
  roles?: UserRole[] | RoleChecker;
  checkOwnership?: boolean;
  ownershipParamName?: string;
  checkVerificationStatus?: boolean;
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
      checkVerificationStatus = false,
    } = options;

    return async (req: Request, _res: Response, next: NextFunction) => {
      try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
          throw new NotAuthorizedError("Authentication required");
        }

        const decoded = this.authService.verifyToken(token);

        if (decoded.status !== UserStatus.ACTIVE) {
          throw new NotAuthorizedError(
            "User is not active. Please verify your email address to activate your account."
          );
        }
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

        // Check verification status if required
        if (checkVerificationStatus) {
          if (decoded.verificationStatus !== VerificationStatus.APPROVED) {
            throw new NotAuthorizedError("User is not verified");
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
  public requireKYCVerified = this.createMiddleware({
    checkVerificationStatus: true,
  });
}
