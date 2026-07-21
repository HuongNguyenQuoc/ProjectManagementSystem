import type { Response } from "express";
import type { AuthRequest } from "../middlewares/requireAuth.js";
import { createCommentService, listCommentsByTaskService } from "../services/comment.service.js";
import { REPLCommand } from "repl";

export const createCommentController = async (req: AuthRequest, res: Response) => {
  const comment = await createCommentService(req.params.projectId as string, req.params.taskId as string, req.body, req.userId as string);
  res.status(201).json({
    success: true,
    message: "Comment created successfully",
    data: comment,
  });
};

export const listCommentsByTaskController = async (req: AuthRequest, res: Response) => {
  const comments = await listCommentsByTaskService(req.params.projectId as string, req.params.taskId as string, req.userId as string);
  res.status(200).json({
    success: true,
    message: "Comments retrieved successfully",
    data: comments,
  });
};
