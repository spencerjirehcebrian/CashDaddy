import { AuthPayload } from "../../types/auth.types";
import { IAuthService } from "../../interfaces/services/auth-service.interface";
export declare class AuthService implements IAuthService {
    generateToken(payload: AuthPayload): string;
    verifyToken(token: string): AuthPayload;
}
export * from "./auth.service";
