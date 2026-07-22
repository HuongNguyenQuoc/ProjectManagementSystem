import { prisma } from "../lib/prisma.js";
export const createProject = (data, client = prisma) => {
    return client.project.create({ data });
};
export const addProjectMember = (data, client = prisma) => {
    return client.projectMember.create({ data });
};
export const findProjectById = (projectId) => {
    return prisma.project.findUnique({
        where: { id: projectId },
        include: {
            members: { include: { user: true } },
            tasks: true,
        }
    });
};
export const findAllProjectsWithStats = () => {
    return prisma.project.findMany({
        include: {
            members: {
                where: { projectRole: "PROJECT_LEADER" },
                include: {
                    user: true,
                }
            },
            tasks: {
                select: { status: true },
            },
        },
        orderBy: {
            createdAt: "desc"
        },
    });
};
export const findProjectMember = (projectId, userId) => {
    return prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId,
            },
        },
    });
};
export const updateProject = (projectId, data) => {
    return prisma.project.update({
        where: { id: projectId },
        data,
    });
};
//# sourceMappingURL=project.repository.js.map