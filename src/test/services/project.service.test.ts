import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../../errors/appError.js";
import * as projectRepository from "../../repositories/project.repository.js";
import * as userRepository from "../../repositories/user.repository.js";
import {
  createProjectService,
  addMemberToProjectService,
  updateProjectService,
  removeMemberFromProjectService,
} from "../../services/project.service.js";
import { prisma } from "../../lib/prisma.js";

vi.mock("../../repositories/project.repository.js");
vi.mock("../../repositories/user.repository.js");
vi.mock("../../lib/prisma.js", () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) => fn(undefined), 
  },
}));

const leaderMembership = { projectId: "p1", userId: "Leader-1", projectRole: "PROJECT_LEADER" };
const memberMembership = { projectId: "p1", userId: "member-1", projectRole: "MEMBER" };

describe("project.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createProjectService", () => {
    it("throws 400 when name is missing", async () => {
      await expect(
        createProjectService({ name: "", position: "BACKEND_DEVELOPER", projectType: "WEB" }, "leader-1"),
      ).rejects.toThrow(AppError);
    });

    it("throws 400 when position is invalid", async () => {
      await expect(
        createProjectService({ name: "P1", position: "CEO", projectType: "WEB" }, "leader-1"),
     ).rejects.toThrow("Invalid position");
    });

    it("creates project then adds creator as PROJECT_LEADER", async () => {
      vi.mocked(projectRepository.createProject).mockResolvedValue({ id: "p1" } as never);
      vi.mocked(projectRepository.addProjectMember).mockResolvedValue({} as never);

      await createProjectService(
        { name: "P1", position: "BACKEND_DEVELOPER", projectType: "WEB" },
        "leader-1",
      );

      expect(projectRepository.addProjectMember).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: "p1", userId: "leader-1", projectRole: "PROJECT_LEADER" }),
        undefined,
      );
    });
  });

  describe("removeMemberFromProjectService", () => {
    it ("throws 403 when requester is not the leader", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValueOnce(memberMembership as never);

      await expect(
        removeMemberFromProjectService("p1", "member-2", "member-1"),
      ).rejects.toThrow(AppError);
    });

    it("throws 404 when target is not a member of the project", async () => {
      vi.mocked(projectRepository.findProjectMember)
        .mockResolvedValueOnce(leaderMembership as never) // requester is leader
        .mockResolvedValueOnce(null as never); // target not a member

      await expect(
        removeMemberFromProjectService("p1", "outsider", "leader-1"),
      ).rejects.toThrow(AppError);
    });

    it ("throws 400 when trying to remove the PROJECT_LEADER", async () => {
      vi.mocked(projectRepository.findProjectMember)
        .mockResolvedValueOnce(leaderMembership as never) // requester is leader
        .mockResolvedValueOnce(leaderMembership as never); // target is leader

      await expect(
        removeMemberFromProjectService("p1", "leader-1", "leader-1"),
      ).rejects.toThrow("Cannot remove the project leader from the project");
    });

    it("removes a regular member successfully", async () => {
      vi.mocked(projectRepository.findProjectMember)
        .mockResolvedValueOnce(leaderMembership as never) // requester is leader
        .mockResolvedValueOnce(memberMembership as never); // target is a regular member
      vi.mocked(projectRepository.removeProjectMember).mockResolvedValue({} as never);

      await removeMemberFromProjectService("p1", "member-1", "leader-1");

      expect(projectRepository.removeProjectMember).toHaveBeenCalledWith("p1", "member-1");
    });
  });

  describe("addMemberToProjectService", () => {
    it("throws 403 when requester is not the leader", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValueOnce(memberMembership as never);

      await expect(
        addMemberToProjectService("p1", { userId: "new-user", position: "TESTER" }, "member-1"),
      ).rejects.toThrow(AppError);
    });

    it("throws 400 when position is invalid", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValueOnce(leaderMembership as never);

      await expect(
        addMemberToProjectService("p1", { userId: "new-user", position: "CEO" }, "leader-1"),
      ).rejects.toThrow("Invalid position");
    });

    it("throws 404 when target user does not exist", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValueOnce(leaderMembership as never);
      vi.mocked(userRepository.findUserById).mockResolvedValue(null);

      await expect(
        addMemberToProjectService("p1", { userId: "ghost", position: "TESTER" }, "leader-1"),
      ).rejects.toThrow("User not found");
    });

    it("throws 400 when user is already a member", async () => {
      vi.mocked(projectRepository.findProjectMember)
        .mockResolvedValueOnce(leaderMembership as never) // requester check
        .mockResolvedValueOnce(memberMembership as never); // already a member
      vi.mocked(userRepository.findUserById).mockResolvedValue({ id: "member-1" } as never);

      await expect(
        addMemberToProjectService("p1", { userId: "member-1", position: "TESTER" }, "leader-1"),
      ).rejects.toThrow("User is already a member of this project");
    });

    it("adds a new member successfully", async () => {
      vi.mocked(projectRepository.findProjectMember)
        .mockResolvedValueOnce(leaderMembership as never) // requester check
        .mockResolvedValueOnce(null as never); // not yet a member
      vi.mocked(userRepository.findUserById).mockResolvedValue({ id: "new-user" } as never);
      vi.mocked(projectRepository.addProjectMember).mockResolvedValue({} as never);

      await addMemberToProjectService("p1", { userId: "new-user", position: "TESTER" }, "leader-1");

      expect(projectRepository.addProjectMember).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: "p1", userId: "new-user", projectRole: "MEMBER", position: "TESTER" }),
      );
    });
  });

  describe("updateProjectService", () => {
    const currentProject = {
      id: "p1",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
    };

    it("throws 403 when requester is not the leader", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValueOnce(memberMembership as never);

      await expect(
        updateProjectService("p1", { status: "IN_PROGRESS" }, "member-1"),
      ).rejects.toThrow(AppError);
    });

    it("throws 400 when projectType is invalid", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValueOnce(leaderMembership as never);

      await expect(
        updateProjectService("p1", { projectType: "GAME" }, "leader-1"),
      ).rejects.toThrow("Invalid project type");
    });

    it("throws 400 when status is invalid", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValueOnce(leaderMembership as never);

      await expect(
        updateProjectService("p1", { status: "DONE" }, "leader-1"),
      ).rejects.toThrow("Invalid project status");
    });

    it("throws 400 when endDate is earlier than startDate", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValueOnce(leaderMembership as never);
      vi.mocked(projectRepository.findProjectById).mockResolvedValue(currentProject as never);

      await expect(
        updateProjectService("p1", { endDate: "2020-01-01" }, "leader-1"),
      ).rejects.toThrow("End date cannot be earlier than start date");
    });

    it("updates project successfully", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValueOnce(leaderMembership as never);
      vi.mocked(projectRepository.findProjectById).mockResolvedValue(currentProject as never);
      vi.mocked(projectRepository.updateProject).mockResolvedValue({} as never);

      await updateProjectService("p1", { status: "IN_PROGRESS" }, "leader-1");

      expect(projectRepository.updateProject).toHaveBeenCalledWith(
        "p1",
        expect.objectContaining({ status: "IN_PROGRESS" }),
      );
    });
  });
});
