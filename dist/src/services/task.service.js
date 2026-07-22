import { AppError } from "../errors/appError.js";
import { TaskStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { findProjectMember } from "../repositories/project.repository.js";
import { addTaskAssignee, createTask, findTasksByProjectId, findTaskById, updateTask } from "../repositories/task.repository.js";
export const createTaskService = async (projectId, input, creatorId) => {
    if (!input.title)
        throw new AppError(400, "Task title is required");
    const requesterMembership = await findProjectMember(projectId, creatorId);
    if (!requesterMembership ||
        requesterMembership.projectRole !== "PROJECT_LEADER") {
        throw new AppError(403, "You are not authorized to create tasks in this project");
    }
    if (input.assigneeId) {
        const assigneeMembership = await findProjectMember(projectId, input.assigneeId);
        if (!assigneeMembership) {
            throw new AppError(400, "Assignee is not a member of this project");
        }
    }
    return prisma.$transaction(async (tx) => {
        const task = await createTask({
            projectId,
            title: input.title,
            description: input.description ?? null,
            priority: input.priority,
            startDate: input.startDate ? new Date(input.startDate) : null,
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
            createdBy: creatorId,
        }, tx);
        if (input.assigneeId) {
            await addTaskAssignee({
                taskId: task.id,
                userId: input.assigneeId,
                assignedBy: creatorId,
            }, tx);
        }
        return task;
    });
};
export const listTasksByProjectService = async (projectId, requesterId) => {
    const requesterMembership = await findProjectMember(projectId, requesterId);
    if (!requesterMembership) {
        throw new AppError(403, "You are not authorized to view tasks in this project");
    }
    const tasks = await findTasksByProjectId(projectId);
    return tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assigneeName: task.assignees[0]?.user?.fullName ?? null,
        startDate: task.startDate,
        dueDate: task.dueDate,
        createdBy: task.createdBy,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
    }));
};
export const updateTaskService = async (taskId, input, requesterId, projectId) => {
    const requesterMembership = await findProjectMember(projectId, requesterId);
    if (!requesterMembership) {
        throw new AppError(403, "You are not authorized to update tasks in this project");
    }
    const task = await findTaskById(taskId);
    if (!task) {
        throw new AppError(404, "Task not found");
    }
    const isLeader = requesterMembership.projectRole === "PROJECT_LEADER";
    const isAssignee = task.assignees.some((a) => a.userId === requesterId);
    if (!isLeader && !isAssignee) {
        throw new AppError(403, "You are not authorized to update this task");
    }
    if (input.progress !== undefined &&
        (!Number.isInteger(input.progress) || input.progress < 0 || input.progress > 100)) {
        throw new AppError(400, "Progress must be an integer between 0 and 100");
    }
    const data = {};
    if (input.progress !== undefined) {
        data.progress = input.progress;
    }
    if (isLeader) {
        if (input.status !== undefined) {
            if (!Object.values(TaskStatus).includes(input.status)) {
                throw new AppError(400, "Invalid task status");
            }
            data.status = input.status;
            data.completedAt = input.status === "DONE" ? new Date() : null;
        }
        if (input.startDate !== undefined) {
            data.startDate = new Date(input.startDate);
        }
    }
    return updateTask(taskId, data);
};
//# sourceMappingURL=task.service.js.map