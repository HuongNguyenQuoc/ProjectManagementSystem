import { Router } from "express";
import {
  listUsersController,
  updateUserRoleController,
  updateUserStatusController,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";

const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/users", listUsersController);
adminRouter.patch("/users/:userId/status", updateUserStatusController);
adminRouter.patch("/users/:userId/role", updateUserRoleController);

export default adminRouter;
