// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../types/error.types';
import { UserRole } from '../interfaces/models/user.interface';
import { AuthPayload } from '../types/auth.types';
import { AuthService } from '../services/auth/auth.service';

type RoleChecker = (role: string) => boolean;

interface AuthOptions {
  roles?: UserRole[] | RoleChecker;
  checkOwnership?: boolean;
  ownershipParamName?: string;
}

const authService = new AuthService();

export const authMiddleware = (options: AuthOptions = {}) => {
  const { roles, checkOwnership = false, ownershipParamName = 'userId' } = options;

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        throw new NotAuthorizedError('Authentication required');
      }

      const decoded = authService.verifyToken(token);

      // Check roles if specified
      if (roles) {
        const hasRequiredRole = Array.isArray(roles)
          ? roles.includes(decoded.role as UserRole) || decoded.role === UserRole.SUPER_ADMIN
          : roles(decoded.role) || decoded.role === UserRole.SUPER_ADMIN;

        if (!hasRequiredRole) {
          throw new NotAuthorizedError('Insufficient privileges');
        }
      }

      // Attach the decoded payload to the request
      req.user = decoded;

      // Check ownership if required
      if (checkOwnership && decoded.role !== UserRole.ADMIN && decoded.role !== UserRole.SUPER_ADMIN) {
        const resourceUserId = getResourceUserId(req, ownershipParamName);

        if (decoded.userId !== resourceUserId) {
          throw new NotAuthorizedError('Not authorized to access this resource');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

function getResourceUserId(req: Request, paramName: string): string {
  return req.params[paramName] || (req.user as AuthPayload).userId;
}

export const requireAuth = authMiddleware();
export const requireAdmin = authMiddleware({ roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] });
export const requireSuperAdmin = authMiddleware({ roles: [UserRole.SUPER_ADMIN] });
export const requireOwnership = authMiddleware({ checkOwnership: true });
