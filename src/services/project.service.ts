import { AppError } from "../errors/appError.js";
import { MemberPosition, ProjectType } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import {
  addProjectMember,
  createProject,
  findAllProjectsWithStats,
} from "../repositories/project.repository.js";

interface CreateProjectInput {
  name: string;
  position: string;
  projectType: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export const createProjectService = async (
  input: CreateProjectInput,
  creatorId: string,
) => {
  if (!input.name) throw new AppError(400, "Project name is required");
  if (
    !input.position ||
    !Object.values(MemberPosition).includes(input.position as MemberPosition)
  ) {
    throw new AppError(400, "Invalid position");
  }
  if (
    !input.projectType ||
    !Object.values(ProjectType).includes(input.projectType as ProjectType)
  ) {
    throw new AppError(400, "Invalid project type");
  }

  return prisma.$transaction(async (tx) => {
    const project = await createProject(
      {
        name: input.name,
        description: input.description ?? null,
        projectType: input.projectType as ProjectType,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        createdBy: creatorId,
      },
      tx,
    );

    await   addProjectMember(
      {
        projectId: project.id,
        userId: creatorId,
        projectRole: "PROJECT_LEADER",
        position: input.position as MemberPosition,
      },
      tx,
    );
    return project;
  });
};

export const listProjectsService = async () => {
  const projects = await findAllProjectsWithStats();

  return projects.map((project) => {
    const totalTask = project.tasks.length;
    const completedTask = project.tasks.filter(
      (task) => task.status === "DONE",
    ).length;
    const progress =
      totalTask === 0 ? 0 : Math.round((completedTask / totalTask) * 100);
    const leader = project.members[0]?.user;

    return {
      id: project.id,
      name: project.name,
      projectType: project.projectType,
      leaderName: leader?.fullName ?? null,
      totalTask,
      completedTask,
      progress,
      startDate: project.startDate,
      deadline: project.endDate,
      status: project.status,
    };
  });
};
