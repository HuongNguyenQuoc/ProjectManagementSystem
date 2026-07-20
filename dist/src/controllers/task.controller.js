import { createTaskService, listTasksByProjectService } from "../services/task.service.js";
export const createTaskController = async (req, res) => {
    const task = await createTaskService(req.params.projectId, req.body, req.userId);
    res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
    });
};
export const listTasksByProjectController = async (req, res) => {
    const tasks = await listTasksByProjectService(req.params.projectId, req.userId);
    res.status(200).json({
        success: true,
        message: "Tasks retrieved successfully",
        data: tasks,
    });
};
//# sourceMappingURL=task.controller.js.map