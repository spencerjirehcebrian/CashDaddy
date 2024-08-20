import { IAuthService } from "../../interfaces/services/auth-service.interface.js";
import { AuthPayload } from "../../types/auth.types.js";
export declare class AuthService implements IAuthService {
    generateToken(payload: AuthPayload): string;
    verifyToken(token: string): AuthPayload;
}
//# sourceMappingURL=auth.service.d.ts.map