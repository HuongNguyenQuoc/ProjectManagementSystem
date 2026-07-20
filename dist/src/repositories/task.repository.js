import { prisma } from "../lib/prisma.js";
export const createTask = (data, client = prisma) => {
    return client.task.create({ data });
};
export const addTaskAssignee = (data, client = prisma) => {
    return client.taskAssignee.create({ data });
};
export const findTasksByProjectId = (projectId) => {
    return prisma.task.findMany({
        where: { projectId },
        include: {
            assignees: {
                include: {
                    user: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });
};
//# sourceMappingURL=task.repository.js.map