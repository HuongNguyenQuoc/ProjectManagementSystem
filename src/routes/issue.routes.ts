import { Router } from "express";
import { createIssueController, listIssuesByProjectController } from "../controllers/issue.controller.js";

const issueRouter = Router({ mergeParams: true });

issueRouter.post("/", createIssueController);
issueRouter.get("/", listIssuesByProjectController);

export default issueRouter;