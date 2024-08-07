import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../models/user.model";
import { UserProfile } from "../../models/user_profile.model";
import { KnowYourCustomer } from "../../models/know_your_customer.model";
import { UserPayload } from "../../types";
import dotenv from "dotenv";

dotenv.config();

export class userService {
  private static JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

  static async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    await user.save();

    const userProfile = new UserProfile({ user: user._id });
    await userProfile.save();

    const kyc = new KnowYourCustomer({ user: user._id });
    await kyc.save();

    user.userProfile = userProfile._id;
    user.kyc = kyc._id;
    await user.save();

    return this.generateToken(user);
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    return this.generateToken(user);
  }

  private static generateToken(user: any): string {
    const payload: UserPayload = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: "1h" });
  }
}
