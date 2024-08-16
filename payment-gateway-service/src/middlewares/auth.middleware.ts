/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../types/error.types';
import { sessionService } from '../services/session/session.service';
import { UserRole } from '../interfaces/user.interface';
import { AuthPayload } from '../types/auth.types';
import logger from '../utils/logger';

type RoleChecker = (role: string) => boolean;

interface AuthOptions {
  roles?: UserRole[] | RoleChecker;
  checkOwnership?: boolean;
  ownershipParamName?: string;
}

export const authMiddleware = (options: AuthOptions = {}) => {
  const { roles, checkOwnership = false, ownershipParamName = 'userId' } = options;

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const sessionId = req.cookies['sessionId'];

      if (!sessionId) {
        throw new NotAuthorizedError('Authentication required');
      }

      const authPayload = await sessionService.getAuthPayload(sessionId);

      if (!authPayload) {
        throw new NotAuthorizedError('Invalid session');
      }

      // Check roles if specified
      if (roles) {
        const hasRequiredRole = Array.isArray(roles) ? roles.includes(authPayload.role as UserRole) : roles(authPayload.role);

        if (!hasRequiredRole) {
          throw new NotAuthorizedError('Insufficient privileges');
        }
      }

      // Attach the authPayload to the request
      req.user = authPayload;

      // Check ownership if required
      if (checkOwnership && authPayload.role !== UserRole.ADMIN) {
        const resourceUserId = getResourceUserId(req, ownershipParamName);
        logger.info(ownershipParamName + ' ' + req);
        logger.info(`Ownership check: ${authPayload.userId} ${resourceUserId}`);

        if (authPayload.userId !== resourceUserId) {
          throw new NotAuthorizedError('Not authorized to access this resource ' + resourceUserId + ' ' + authPayload.userId);
        }
      }

      // Refresh the session
      await sessionService.refreshSession(sessionId);

      next();
    } catch (error) {
      next(error);
    }
  };
};

function getResourceUserId(req: Request, paramName: string): string {
  return req.params[paramName] || (req.user as AuthPayload).userId;
}

// Helper functions for common auth scenarios
export const requireAuth = authMiddleware();
export const requireAdmin = authMiddleware({ roles: [UserRole.ADMIN] });
export const requireOwnership = authMiddleware({ checkOwnership: true });
