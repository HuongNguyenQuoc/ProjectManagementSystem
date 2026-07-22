import { getProjectDetailService } from "../services/project.service.js";
import { getProjectDashboardService } from "../services/dashboard.service.js";
export const getProjectDetailController = async (req, res) => {
    const dashboardData = await getProjectDetailService(req.params.projectId, req.userId);
    res.status(200).json({
        success: true,
        message: "Project detail retrieved successfully",
        data: dashboardData
    });
};
export const getProjectDashboardController = async (req, res) => {
    const dashboard = await getProjectDashboardService(req.params.projectId, req.userId);
    res.status(200).json({
        success: true,
        message: "Project dashboard retrieved successfully",
        data: dashboard,
    });
};
//# sourceMappingURL=dashboard.controller.js.map