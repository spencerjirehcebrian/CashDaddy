import { UserRole } from "../interfaces/models/user.interface.js";
import { NotAuthorizedError } from "../types/error.types.js";
export class AuthMiddleware {
    constructor(authService, redisService) {
        this.authService = authService;
        this.redisService = redisService;
        this.requireAuth = this.createMiddleware();
        this.requireAdmin = this.createMiddleware({
            roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
        });
        this.requireSuperAdmin = this.createMiddleware({
            roles: [UserRole.SUPER_ADMIN],
        });
        this.requireOwnership = this.createMiddleware({ checkOwnership: true });
    }
    createMiddleware(options = {}) {
        const { roles, checkOwnership = false, ownershipParamName = "userId", } = options;
        return async (req, _res, next) => {
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
                        ? roles.includes(decoded.role) ||
                            decoded.role === UserRole.SUPER_ADMIN
                        : roles(decoded.role) || decoded.role === UserRole.SUPER_ADMIN;
                    if (!hasRequiredRole) {
                        throw new NotAuthorizedError("Insufficient privileges");
                    }
                }
                // Attach the decoded payload to the request
                req.user = decoded;
                // Check ownership if required
                if (checkOwnership &&
                    decoded.role !== UserRole.ADMIN &&
                    decoded.role !== UserRole.SUPER_ADMIN) {
                    const resourceUserId = this.getResourceUserId(req, ownershipParamName);
                    if (decoded.userId !== resourceUserId) {
                        throw new NotAuthorizedError("Not authorized to access this resource");
                    }
                }
                next();
            }
            catch (error) {
                next(error);
            }
        };
    }
    getResourceUserId(req, paramName) {
        return req.params[paramName] || req.user.userId;
    }
}
