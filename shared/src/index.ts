// Interfaces
export {
  UserRole,
  UserStatus,
  IUser,
  UserDocument,
} from "./interfaces/models/user.interface.js";
export { IUserProfile } from "./interfaces/models/user-profile.interface.js";
export {
  IKYC,
  VerificationStatus,
  IdType,
  AddressProofType,
} from "./interfaces/models/kyc.interface.js";
export { IAuthService } from "./interfaces/services/auth-service.interface.js";
export { IRedisService } from "./interfaces/services/redis.service.interface.js";

// Middlewares
export { AuthMiddleware } from "./middlewares/auth.middleware.js";
export { ErrorHandler } from "./middlewares/error.middleware.js";
export { RequestLogger } from "./middlewares/logging.middleware.js";
export { CreateRateLimiter } from "./middlewares/rate-limit.middleware.js";
export { ZodValidation } from "./middlewares/validation.middleware.js";

// Services
export { AuthService } from "./services/auth/auth.service.js";

// Types
export { AuthPayload, SessionData } from "./types/auth.types.js";
export * from "./types/error.types.js";

// Utils
export { CustomLogger } from "./utils/logger.js";
export { sendResponse, StandardResponse } from "./utils/response.js";
