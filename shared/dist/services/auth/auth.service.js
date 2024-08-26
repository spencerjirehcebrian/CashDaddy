import jwt from "jsonwebtoken";
import { NotAuthorizedError } from "../../types/error.types.js";
export class AuthService {
    generateToken(payload, JWT_SECRET) {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    }
    verifyToken(token, JWT_SECRET) {
        try {
            if (!JWT_SECRET) {
                const decoded = jwt.verify(token, "1234");
                return decoded;
            }
            else {
                const decoded = jwt.verify(token, JWT_SECRET);
                return decoded;
            }
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new NotAuthorizedError("Token has expired");
            }
            throw new NotAuthorizedError("Invalid token");
        }
    }
}
