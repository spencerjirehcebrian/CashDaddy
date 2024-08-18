import { AuthPayload } from "../../types/auth.types";
export interface IAuthService {
    generateToken(payload: AuthPayload): string;
    verifyToken(token: string): AuthPayload;
}
