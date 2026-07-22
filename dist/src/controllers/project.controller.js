import { addMemberToProjectService, createProjectService, getProjectDetailService, listProjectsService, updateProjectService } from "../services/project.service.js";
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
export const addMemberToProjectController = async (req, res) => {
    const member = await addMemberToProjectService(req.params.projectId, req.body, req.userId);
    res.status(200).json({
        success: true,
        message: "Member added to project successfully",
        data: member,
    });
};
export const getProjectByIdController = async (req, res) => {
    const project = await getProjectDetailService(req.params.projectId, req.userId);
    res.status(200).json({
        success: true,
        message: "Project details retrieved successfully",
        data: project,
    });
};
export const updateProjectController = async (req, res) => {
    const updatedProject = await updateProjectService(req.params.projectId, req.body, req.userId);
    res.status(200).json({
        success: true,
        message: "Project updated successfully",
        data: updatedProject,
    });
};
//# sourceMappingURL=project.controller.js.map