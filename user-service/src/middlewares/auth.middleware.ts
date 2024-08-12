/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../types/error.types';
import { UserRole } from '../interfaces/user.interface';
import { AuthPayload } from '../types/auth.types';
import logger from '../utils/logger';
import jwt from 'jsonwebtoken';
import { config } from '../config';

type RoleChecker = (role: string) => boolean;

interface AuthOptions {
  roles?: UserRole[] | RoleChecker;
  checkOwnership?: boolean;
  ownershipParamName?: string;
}

const JWT_SECRET = config.JWT_SECRET;

export const authMiddleware = (options: AuthOptions = {}) => {
  const { roles, checkOwnership = false, ownershipParamName = 'userId' } = options;

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        throw new NotAuthorizedError('Authentication required');
      }

      const decoded = jwt.verify(token, JWT_SECRET!) as AuthPayload;

      if (!decoded) {
        throw new NotAuthorizedError('Invalid token');
      }

      // Check roles if specified
      if (roles) {
        const hasRequiredRole = Array.isArray(roles) ? roles.includes(decoded.role as UserRole) : roles(decoded.role);

        if (!hasRequiredRole) {
          throw new NotAuthorizedError('Insufficient privileges');
        }
      }

      // Attach the decoded payload to the request
      req.user = decoded;

      // Check ownership if required
      if (checkOwnership && decoded.role !== UserRole.ADMIN) {
        const resourceUserId = getResourceUserId(req, ownershipParamName);
        logger.info(ownershipParamName + ' ' + req);
        logger.info(`Ownership check: ${decoded.userId} ${resourceUserId}`);

        if (decoded.userId !== resourceUserId) {
          throw new NotAuthorizedError('Not authorized to access this resource ' + resourceUserId + ' ' + decoded.userId);
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

// Helper functions for common auth scenarios
export const requireAuth = authMiddleware();
export const requireAdmin = authMiddleware({ roles: [UserRole.ADMIN] });
export const requireOwnership = authMiddleware({ checkOwnership: true });
