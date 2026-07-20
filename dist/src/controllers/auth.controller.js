import { COOKIE_NAME } from "../../config/env.js";
import { loginUser, registerUser } from "../services/auth.service.js";
export const registerController = async (req, res) => {
    const user = await registerUser(req.body);
    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
    });
};
export const loginController = async (req, res) => {
    const { user, token } = await loginUser(req.body);
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: { user }, // No return token more because it is stored in the cookie
    });
};
export const logoutController = (_req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.status(200).json({
        success: true,
        message: "User logged out successfully",
    });
};
//# sourceMappingURL=auth.controller.js.map