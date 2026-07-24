import type { Response } from "express";
import type { AuthRequest } from "../middlewares/requireAuth.js";
import { lookupUserByEmailService } from "../services/user.service.js";

export const lookupUserByEmailController = async (req: AuthRequest, res: Response) => {
  const user = await lookupUserByEmailService(req.query.email as string);
  res.status(200).json({
    success: true,
    message: "User found successfully",
    data: user,
  });
};
