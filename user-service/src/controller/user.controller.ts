import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { userService } from "../service/db/user.service";

export class userController {
  static async register(req: Request, res: Response): Promise<Response | void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;

    try {
      const token = await userService.register(
        email,
        password,
        firstName,
        lastName
      );
      res.status(201).json({ token });
    } catch (error) {
      const e = error as Error;
      res.status(400).json({ message: e.message });
    }
  }

  static async login(req: Request, res: Response): Promise<Response | void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const token = await userService.login(email, password);
      res.json({ token });
    } catch (error) {
      const e = error as Error;
      res.status(401).json({ message: e.message });
    }
  }
}
