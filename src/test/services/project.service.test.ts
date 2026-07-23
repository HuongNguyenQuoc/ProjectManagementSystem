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

    it ("throws 400 when trying to remove the PROJECT_LEADER", async () => {
      vi.mocked(projectRepository.findProjectMember)
        .mockResolvedValueOnce(leaderMembership as never) // requester is leader
        .mockResolvedValueOnce(leaderMembership as never); // target is leader
        
      await expect(
        removeMemberFromProjectService("p1", "leader-1", "leader-1"),
      ).rejects.toThrow("Cannot remove the project leader from the project");
    });
  });
});
