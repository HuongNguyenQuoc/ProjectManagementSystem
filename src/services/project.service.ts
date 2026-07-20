import { AppError } from "../errors/appError.js";
import { MemberPosition, ProjectType } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import {
  addProjectMember,
  createProject,
  findAllProjectsWithStats,
  findProjectById,
  findProjectMember,
} from "../repositories/project.repository.js";
import { findUserById } from "../repositories/user.repository.js";

interface CreateProjectInput {
  name: string;
  position: string;
  projectType: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface UpdateProjectInput {
  name?: string;
  description?: string;
  projectType?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export const addMemberToProjectService = async (
  projectId: string,
  input: { userId: string; position: string },
  requesterId: string,
) => {
  // Implementation for adding member to project
  const requesterMembership = await findProjectMember(projectId, requesterId);
  if (
    !requesterMembership ||
    requesterMembership.projectRole !== "PROJECT_LEADER"
  ) {
    throw new AppError(
      403,
      "You are not authorized to add members to this project",
    );
  }

  if (
    !input.position ||
    !Object.values(MemberPosition).includes(input.position as MemberPosition)
  ) {
    throw new AppError(400, "Invalid position");
  }

  const targetUser = await findUserById(input.userId);
  if (!targetUser) {
    throw new AppError(404, "User not found");
  }

  const existingMembership = await findProjectMember(projectId, input.userId);
  if (existingMembership) {
    throw new AppError(400, "User is already a member of this project");
  }

  return addProjectMember({
    projectId,
    userId: input.userId,
    projectRole: "MEMBER",
    position: input.position as MemberPosition,
  });
};

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

    await addProjectMember(
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

export const getProjectDetailService = async (
  projectId: string,
  requesterId: string,
) => {
  const requesterMembership = await findProjectMember(projectId, requesterId);
  if (!requesterMembership) {
    throw new AppError(403, "You are not authorized to view this project");
  }

  const project = await findProjectById(projectId);
  if (!project) {
    throw new AppError(404, "Project not found");
  }

  const totalTask = project.tasks.length;
  const completedTask = project.tasks.filter(
    (task) => task.status === "DONE",
  ).length;
  const progress =
    totalTask === 0 ? 0 : Math.round((completedTask / totalTask) * 100);

  return {
    id: project.id,
    name: project.name,
    ProjectType: project.projectType,
    description: project.description,
    startDate: project.startDate,
    endDate: project.endDate,
    status: project.status,
    totalTask,
    completedTask,
    progress,
    members: project.members.map((member) => ({
      userId: member.userId,
      fullName: member.user.fullName,
      email: member.user.email,
      position: member.position,
      projectRole: member.projectRole,
      joinedAt: member.joinedAt,
    })),
  };
};

export const updateProjectService = async (
  projectId: string,
  input: UpdateProjectInput,
  requesterId: string,
) 