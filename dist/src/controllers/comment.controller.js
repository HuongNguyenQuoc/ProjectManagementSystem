import { createCommentService, listCommentsByTaskService } from "../services/comment.service.js";
export const createCommentController = async (req, res) => {
    const comment = await createCommentService(req.params.projectId, req.params.taskId, req.body, req.userId);
    res.status(201).json({
        success: true,
        message: "Comment created successfully",
        data: comment,
    });
};
export const listCommentsByTaskController = async (req, res) => {
    const comments = await listCommentsByTaskService(req.params.projectId, req.params.taskId, req.userId);
    res.status(200).json({
        success: true,
        message: "Comments retrieved successfully",
        data: comments,
    });
};
//# sourceMappingURL=comment.controller.js.map