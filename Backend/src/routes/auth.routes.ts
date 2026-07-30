import { Router } from "express";
import { loginController, logoutController, meController, registerController } from "../controllers/auth.controller.js";
import { oauthCallbackController, oauthRedirectController } from "../controllers/oauth.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
// Must be registered before "/:provider" below, or Express matches provider = "me" first.
authRouter.get("/me", requireAuth, meController);

authRouter.get("/:provider", oauthRedirectController);
authRouter.get("/:provider/callback", oauthCallbackController); // google, facebook
authRouter.post("/apple/callback", oauthCallbackController); // apple only: response_mode=form_post

export default authRouter;
