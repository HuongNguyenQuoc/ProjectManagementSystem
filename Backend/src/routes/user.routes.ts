import { Router } from "express";
import { lookupUserByEmailController } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get("/lookup", lookupUserByEmailController);

export default userRouter;
