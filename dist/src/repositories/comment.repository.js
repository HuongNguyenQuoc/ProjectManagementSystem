import { prisma } from "../lib/prisma.js";
export const createComment = (data) => {
    return prisma.comment.create({ data });
};
export const findCommentsByTaskId = (taskId) => {
    return prisma.comment.findMany({
        where: { taskId },
        include: { user: true },
        orderBy: { createdAt: "asc" },
    });
};
//# sourceMappingURL=comment.repository.js.map