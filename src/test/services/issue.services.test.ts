import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../../errors/appError.js";
import * as projectRepository from "../../repositories/project.repository.js";
import * as taskRepository from "../../repositories/task.repository.js";
import * as issueRepository from "../../repositories/issue.repositories.js";
import {
  createIssueService,
  listIssuesByProjectService,
  updateIssueService,
} from "../../services/issue.services.js";

vi.mock("../../repositories/project.repository.js");
vi.mock("../../repositories/task.repository.js");
vi.mock("../../repositories/issue.repositories.js");

const leaderMembership = { projectId: "p1", userId: "leader-1", projectRole: "PROJECT_LEADER" };
const memberMembership = { projectId: "p1", userId: "member-1", projectRole: "MEMBER" };

describe("issue.services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createIssueService", () => {
    it("throws 403 when requester is not a project member", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(null as never);

      await expect(
        createIssueService("p1", { title: "Bug A", description: "desc" }, "outsider"),
      ).rejects.toThrow(AppError);
    });

    it("throws 400 when title or description is missing", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);

      await expect(
        createIssueService("p1", { title: "", description: "" }, "member-1"),
      ).rejects.toThrow(AppError);
    });

    it("throws 400 when severity is invalid", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);

      await expect(
        createIssueService(
          "p1",
          { title: "Bug A", description: "desc", severity: "SUPER_HIGH" },
          "member-1",
        ),
      ).rejects.toThrow(/severity/i);
    });

    it("throws 400 when linked task does not belong to the project", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);
      vi.mocked(taskRepository.findTaskById).mockResolvedValue({ id: "t1", projectId: "other" } as never);

      await expect(
        createIssueService(
          "p1",
          { title: "Bug A", description: "desc", taskId: "t1" },
          "member-1",
        ),
      ).rejects.toThrow(/does not belong/);
    });

    it("creates issue successfully", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);
      vi.mocked(issueRepository.createIssue).mockResolvedValue({ id: "i1" } as never);

      await createIssueService("p1", { title: "Bug A", description: "desc" }, "member-1");

      expect(issueRepository.createIssue).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: "p1", title: "Bug A", reportedBy: "member-1" }),
      );
    });
  });

  describe("listIssuesByProjectService", () => {
    it("throws 403 when requester is not a project member", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(null as never);

      await expect(listIssuesByProjectService("p1", "outsider")).rejects.toThrow(AppError);
    });

    it("returns issues mapped with reporterName/taskTitle", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);
      vi.mocked(issueRepository.findIssuesByProjectId).mockResolvedValue([
        {
          id: "i1",
          title: "Bug A",
          description: "desc",
          severity: "HIGH",
          status: "OPEN",
          taskId: "t1",
          task: { id: "t1", title: "Task A" },
          reporter: { fullName: "Member One" },
          assignee: null,
          resolvedAt: null,
          createdAt: new Date(),
        } as never,
      ]);

      const result = await listIssuesByProjectService("p1", "member-1");

      expect(result[0].reporterName).toBe("Member One");
      expect(result[0].taskTitle).toBe("Task A");
      expect(result[0].assigneeName).toBeNull();
    });
  });

  describe("updateIssueService", () => {
    it("throws 403 when requester is not the project leader", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);

      await expect(
        updateIssueService("p1", "i1", { status: "RESOLVED" }, "member-1"),
      ).rejects.toThrow(AppError);
    });

    it("throws 400 when status is invalid", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(leaderMembership as never);

      await expect(
        updateIssueService("p1", "i1", { status: "DONE" }, "leader-1"),
      ).rejects.toThrow(/status/i);
    });

    it("throws 404 when issue does not belong to the project", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(leaderMembership as never);
      vi.mocked(issueRepository.findIssueByIdRepository).mockResolvedValue({ id: "i1", projectId: "other" } as never);

      await expect(
        updateIssueService("p1", "i1", { status: "RESOLVED" }, "leader-1"),
      ).rejects.toThrow(AppError);
    });

    it("throws 400 when assignedTo is not a project member", async () => {
      vi.mocked(projectRepository.findProjectMember)
        .mockResolvedValueOnce(leaderMembership as never) // requester check
        .mockResolvedValueOnce(null as never); // assignedTo check
      vi.mocked(issueRepository.findIssueByIdRepository).mockResolvedValue({ id: "i1", projectId: "p1" } as never);

      await expect(
        updateIssueService("p1", "i1", { assignedTo: "outsider" }, "leader-1"),
      ).rejects.toThrow(/member/i);
    });

    it("sets resolvedAt when status changes to RESOLVED", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(leaderMembership as never);
      vi.mocked(issueRepository.findIssueByIdRepository).mockResolvedValue({ id: "i1", projectId: "p1" } as never);
      vi.mocked(issueRepository.updateIssueRepository).mockResolvedValue({} as never);

      await updateIssueService("p1", "i1", { status: "RESOLVED" }, "leader-1");

      const savedData = vi.mocked(issueRepository.updateIssueRepository).mock.calls[0][1];
      expect(savedData.status).toBe("RESOLVED");
      expect(savedData.resolvedAt).toBeInstanceOf(Date);
    });

    it("clears resolvedAt when status changes away from RESOLVED/CLOSED", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(leaderMembership as never);
      vi.mocked(issueRepository.findIssueByIdRepository).mockResolvedValue({ id: "i1", projectId: "p1" } as never);
      vi.mocked(issueRepository.updateIssueRepository).mockResolvedValue({} as never);

      await updateIssueService("p1", "i1", { status: "OPEN" }, "leader-1");

      const savedData = vi.mocked(issueRepository.updateIssueRepository).mock.calls[0][1];
      expect(savedData.resolvedAt).toBeNull();
    });
  });
});
