import { IAuthService } from "../../interfaces/services/auth-service.interface.js";
import { AuthPayload } from "../../types/auth.types.js";
export declare class AuthService implements IAuthService {
    generateToken(payload: AuthPayload, JWT_SECRET: string): string;
    verifyToken(token: string, JWT_SECRET?: string): AuthPayload;
}
