import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../../errors/appError.js";
import * as projectRepository from "../../repositories/project.repository.js";
import * as taskRepository from "../../repositories/task.repository.js";
import * as commentRepository from "../../repositories/comment.repository.js";
import { createCommentService, listCommentsByTaskService } from "../../services/comment.service.js";

vi.mock("../../repositories/project.repository.js");
vi.mock("../../repositories/task.repository.js");
vi.mock("../../repositories/comment.repository.js");

const memberMembership = { projectId: "p1", userId: "member-1", projectRole: "MEMBER" };
const taskInProject = { id: "task-1", projectId: "p1" };

describe("comment.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCommentService", () => {
    it("throws 403 when requester is not a project member", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(null as never);

      await expect(
        createCommentService("p1", "task-1", { content: "hi" }, "outsider"),
      ).rejects.toThrow(AppError);
    });

    it("throws 404 when task does not belong to the project", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);
      vi.mocked(taskRepository.findTaskById).mockResolvedValue({ id: "task-1", projectId: "other" } as never);

      await expect(
        createCommentService("p1", "task-1", { content: "hi" }, "member-1"),
      ).rejects.toThrow(AppError);
    });

    it("throws 400 when content is empty/whitespace", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);
      vi.mocked(taskRepository.findTaskById).mockResolvedValue(taskInProject as never);

      await expect(
        createCommentService("p1", "task-1", { content: "   " }, "member-1"),
      ).rejects.toThrow(/empty/i);
    });

    it("trims content before saving", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);
      vi.mocked(taskRepository.findTaskById).mockResolvedValue(taskInProject as never);
      vi.mocked(commentRepository.createComment).mockResolvedValue({} as never);

      await createCommentService("p1", "task-1", { content: "  hello  " }, "member-1");

      expect(commentRepository.createComment).toHaveBeenCalledWith(
        expect.objectContaining({ taskId: "task-1", userId: "member-1", content: "hello" }),
      );
    });
  });

  describe("listCommentsByTaskService", () => {
    it("throws 403 when requester is not a project member", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(null as never);

      await expect(
        listCommentsByTaskService("p1", "task-1", "outsider"),
      ).rejects.toThrow(AppError);
    });

    it("throws 404 when task does not belong to the project", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);
      vi.mocked(taskRepository.findTaskById).mockResolvedValue({ id: "task-1", projectId: "other" } as never);

      await expect(
        listCommentsByTaskService("p1", "task-1", "member-1"),
      ).rejects.toThrow(AppError);
    });

    it("returns comments mapped with authorName", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);
      vi.mocked(taskRepository.findTaskById).mockResolvedValue(taskInProject as never);
      vi.mocked(commentRepository.findCommentsByTaskId).mockResolvedValue([
        {
          id: "c1",
          content: "hello",
          userId: "member-1",
          isEdited: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { fullName: "Member One" },
        } as never,
      ]);

      const result = await listCommentsByTaskService("p1", "task-1", "member-1");

      expect(result[0].authorName).toBe("Member One");
      expect(result[0].content).toBe("hello");
    });
  });
});
