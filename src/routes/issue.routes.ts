import { Router } from "express";
import { createIssueController, listIssuesByProjectController, updateIssueController } from "../controllers/issue.controller.js";

const issueRouter = Router({ mergeParams: true });

issueRouter.post("/", createIssueController);
issueRouter.get("/", listIssuesByProjectController);
issueRouter.patch("/:issueId", updateIssueController);

export default issueRouter;