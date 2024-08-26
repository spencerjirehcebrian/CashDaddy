import jwt from "jsonwebtoken";
import { IAuthService } from "../../interfaces/services/auth-service.interface.js";
import { AuthPayload } from "../../types/auth.types.js";
import { NotAuthorizedError } from "../../types/error.types.js";

export class AuthService implements IAuthService {
  generateToken(payload: AuthPayload, JWT_SECRET: string): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  }
  verifyToken(token: string, JWT_SECRET?: string): AuthPayload {
    try {
      if (!JWT_SECRET) {
        const decoded = jwt.verify(token, "1234") as AuthPayload;
        return decoded;
      } else {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
        return decoded;
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new NotAuthorizedError("Token has expired");
      }
      throw new NotAuthorizedError("Invalid token");
    }
  }
}
