import { createProjectService, listProjectsService } from "../services/project.service.js";
export const createProjectController = async (req, res) => {
    const project = await createProjectService(req.body, req.userId);
    res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: project,
    });
};
export const listProjectsController = async (_req, res) => {
    const projects = await listProjectsService();
    res.status(200).json({
        success: true,
        message: "Projects retrieved successfully",
        data: projects,
    });
};
//# sourceMappingURL=project.controller.js.map