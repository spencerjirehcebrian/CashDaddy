"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const user_controller_1 = require("../controller/user.controller");
const router = express_1.default.Router();
exports.userRouter = router;
router.post("/register", [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email must be valid"),
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage("Password must be between 4 and 20 characters"),
    (0, express_validator_1.body)("firstName").trim().notEmpty().withMessage("First name is required"),
    (0, express_validator_1.body)("lastName").trim().notEmpty().withMessage("Last name is required"),
], user_controller_1.userController.register);
router.post("/login", [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email must be valid"),
    (0, express_validator_1.body)("password")
        .trim()
        .notEmpty()
        .withMessage("You must supply a password"),
], user_controller_1.userController.login);
