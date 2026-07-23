import { AppError } from "../errors/appError.js";
import { findIssuesByProjectId } from "../repositories/issue.repositories.js";
import {
  findProjectById,
  findProjectMember,
} from "../repositories/project.repository.js";
import { findTasksByProjectId } from "../repositories/task.repository.js";

const countBy = <T, K extends string | number | symbol>(
  items: T[],
  keyFn: (item: T) => K,
): Record<K, number> => {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<K, number>,
  );
};

export const getProjectDashboardService = async (
  projectId: string,
  userId: string,
) => {
  const requesterMembership = await findProjectMember(projectId, userId);
  if (!requesterMembership || requesterMembership.projectRole !== "PROJECT_LEADER") {
    throw new AppError(403, "Only the project leader can view the dashboard");
  }

  const project = await findProjectById(projectId);
  if (!project) {
    throw new AppError(404, "Project not found");
  }

  const tasks = await findTasksByProjectId(projectId);
  const issues = await findIssuesByProjectId(projectId);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "DONE").length;
  const progress =
    totalTasks > 0
      ? Number(((completedTasks / totalTasks) * 100).toFixed(2))
      : 0;

  const now = new Date();
  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      task.status !== "DONE" &&
      task.dueDate < now &&
      task.status !== "CANCELLED",
  ).length;

  const openIssues = issues.filter((issue) => issue.status !== "CLOSED").length;

  const tasksByStatus = countBy(tasks, (task) => task.status);
  const issuesByStatus = countBy(issues, (issue) => issue.status);
  const tasksByPriority = countBy(tasks, (task) => task.priority);
  const issuesBySeverity = countBy(issues, (issue) => issue.severity);

  return {
    projectId: project.id,
    projectName: project.name,
    status: project.status,
    totalMembers: project.members.length,
    totalTasks,
    completedTasks,
    progress,
    overdueTasks,
    tasksByStatus,
    issuesByStatus,
    tasksByPriority,
    issuesBySeverity,
    totalIssues: issues.length,
    openIssues,
  };
};
