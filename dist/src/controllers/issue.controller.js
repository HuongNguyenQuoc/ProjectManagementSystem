import { createIssueService, listIssuesByProjectService } from "../services/issue.services.js";
export const createIssueController = async (req, res) => {
    const issue = await createIssueService(req.params.projectId, req.body, req.userId);
    res.status(201).json({
        success: true,
        message: "Issue created successfully",
        data: issue,
    });
};
export const listIssuesByProjectController = async (req, res) => {
    const issues = await listIssuesByProjectService(req.params.projectId, req.userId);
    res.status(200).json({
        success: true,
        message: "Issues retrieved successfully",
        data: issues,
    });
};
//# sourceMappingURL=issue.controller.js.map