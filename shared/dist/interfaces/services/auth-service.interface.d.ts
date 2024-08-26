import { AuthPayload } from "../../types/auth.types.js";
export interface IAuthService {
    generateToken(payload: AuthPayload, JWT_SECRET: string): string;
    verifyToken(token: string, JWT_SECRET?: string): AuthPayload;
}
