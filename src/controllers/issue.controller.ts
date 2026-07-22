import type { Response } from "express";
import type { AuthRequest } from "../middlewares/requireAuth.js";
import { createIssueService, listIssuesByProjectService, updateIssueService } from "../services/issue.services.js";

export const createIssueController = async (req: AuthRequest, res: Response) => {
  const issue = await createIssueService(req.params.projectId as string, req.body, req.userId as string);
  res.status(201).json({
    success: true,
    message: "Issue created successfully",
    data: issue,
  }); 
};

export const listIssuesByProjectController = async (req: AuthRequest, res: Response) => {
  const issues = await listIssuesByProjectService(req.params.projectId as string, req.userId as string);
  res.status(200).json({
    success: true,
    message: "Issues retrieved successfully",
    data: issues,
  });
};  

export const updateIssueController = async (req: AuthRequest, res: Response) => {
  const issue = await updateIssueService(
    req.params.projectId as string,
    req.params.issueId as string,
    req.body,
    req.userId as string
  );
  res.status(200).json({
    success: true,
    message: "Issue updated successfully",
    data: issue,
  });
};