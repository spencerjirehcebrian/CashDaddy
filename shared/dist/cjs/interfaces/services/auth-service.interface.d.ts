import { AuthPayload } from "../../types/auth.types.js";
export interface IAuthService {
    generateToken(payload: AuthPayload): string;
    verifyToken(token: string): AuthPayload;
}
//# sourceMappingURL=auth-service.interface.d.ts.map