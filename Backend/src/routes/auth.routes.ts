import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
  registerController,
  resendVerificationController,
  verifyEmailController,
  requestPasswordResetController,
  resetPasswordController,
} from "../controllers/auth.controller.js";
import {
  oauthCallbackController,
  oauthRedirectController,
} from "../controllers/oauth.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authRateLimiter } from "../middlewares/rateLimit.js";

const authRouter = Router();

authRouter.post("/register", authRateLimiter, registerController);
authRouter.post("/login", authRateLimiter, loginController);
authRouter.post("/verify-email", authRateLimiter, verifyEmailController);
authRouter.post("/resend-verification", authRateLimiter, resendVerificationController);
authRouter.post("/logout", logoutController);
authRouter.post("/forgot-password", authRateLimiter, requestPasswordResetController);
authRouter.post ("/reset-password", authRateLimiter, resetPasswordController);
// Must be registered before "/:provider" below, or Express matches provider = "me" first.
authRouter.get("/me", requireAuth, meController);

authRouter.get("/:provider", oauthRedirectController);
authRouter.get("/:provider/callback", oauthCallbackController); // google, facebook
authRouter.post("/apple/callback", oauthCallbackController); // apple only: response_mode=form_post

export default authRouter;
