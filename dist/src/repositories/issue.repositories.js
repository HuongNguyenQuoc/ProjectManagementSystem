import { prisma } from "../lib/prisma.js";
export const createIssue = async (data) => {
    return await prisma.issue.create({ data });
};
export const findIssuesByProjectId = async (projectId) => {
    return await prisma.issue.findMany({
        where: { projectId },
        include: {
            reporter: true,
            assignee: true,
            task: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};
//# sourceMappingURL=issue.repositories.js.map