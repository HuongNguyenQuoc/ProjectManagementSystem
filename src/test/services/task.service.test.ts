import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../../errors/appError.js";
import * as projectRepository from "../../repositories/project.repository.js";
import * as taskRepository from "../../repositories/task.repository.js";
import {
  createTaskService,
  listTasksByProjectService,
  updateTaskService,
} from "../../services/task.service.js";

vi.mock("../../repositories/project.repository.js");
vi.mock("../../repositories/task.repository.js");
vi.mock("../../lib/prisma.js", () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) => fn(undefined),
  },
}));

const leaderMembership = { projectId: "p1", userId: "leader-1", projectRole: "PROJECT_LEADER" };
const memberMembership = { projectId: "p1", userId: "member-1", projectRole: "MEMBER" };

describe("task.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTaskService", () => {
    it("throws 403 when requester is not the project leader", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);

      await expect(
        createTaskService("p1", { title: "Task 1" }, "member-1"),
      ).rejects.toThrow(AppError);
    });

    it("throws 400 when assignee is not a member of the project", async () => {
      vi.mocked(projectRepository.findProjectMember)
        .mockResolvedValueOnce(leaderMembership as never) // requester check
        .mockResolvedValueOnce(null as never); // assignee check -> not found

      await expect(
        createTaskService("p1", { title: "Task A", assigneeId: "outsider" }, "leader-1"),
      ).rejects.toThrow(/not a member/);
    });

    it("creates task and assigns to member when assigneeId is valid", async () => {
      vi.mocked(projectRepository.findProjectMember)
        .mockResolvedValueOnce(leaderMembership as never) // requester check
        .mockResolvedValueOnce(memberMembership as never); // assignee check
      vi.mocked(taskRepository.createTask).mockResolvedValue({ id: "task-1" } as never);
      vi.mocked(taskRepository.addTaskAssignee).mockResolvedValue({} as never);

      await createTaskService("p1", { title: "Task A", assigneeId: "member-1" }, "leader-1");

      expect(taskRepository.createTask).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: "p1", title: "Task A", createdBy: "leader-1" }),
        undefined,
      );
      expect(taskRepository.addTaskAssignee).toHaveBeenCalledWith(
        expect.objectContaining({ taskId: "task-1", userId: "member-1", assignedBy: "leader-1" }),
        undefined,
      );
    });

    it("does not call addTaskAssignee when no assigneeId is given", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValueOnce(leaderMembership as never);
      vi.mocked(taskRepository.createTask).mockResolvedValue({ id: "task-1" } as never);

      await createTaskService("p1", { title: "Task A" }, "leader-1");

      expect(taskRepository.addTaskAssignee).not.toHaveBeenCalled();
    });
  });

  describe("listTasksByProjectService", () => {
    it("throws 403 when requester is not a project member", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(null as never);

      await expect(listTasksByProjectService("p1", "outsider")).rejects.toThrow(AppError);
    });

    it("returns mapped task list with assigneeName", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);
      vi.mocked(taskRepository.findTasksByProjectId).mockResolvedValue([
        {
          id: "task-1",
          title: "Task A",
          description: null,
          priority: "MEDIUM",
          status: "TODO",
          startDate: null,
          dueDate: null,
          createdBy: "leader-1",
          createdAt: new Date(),
          updatedAt: new Date(),
          assignees: [{ user: { fullName: "Member One" } }],
        } as never,
      ]);

      const result = await listTasksByProjectService("p1", "member-1");

      expect(result[0].assigneeName).toBe("Member One");
    });

    it("returns null assigneeName when task has no assignee", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);
      vi.mocked(taskRepository.findTasksByProjectId).mockResolvedValue([
        {
          id: "task-1",
          title: "Task A",
          description: null,
          priority: "MEDIUM",
          status: "TODO",
          startDate: null,
          dueDate: null,
          createdBy: "leader-1",
          createdAt: new Date(),
          updatedAt: new Date(),
          assignees: [],
        } as never,
      ]);

      const result = await listTasksByProjectService("p1", "member-1");

      expect(result[0].assigneeName).toBeNull();
    });
  });

  describe("updateTaskService", () => {
    const existingTask = { id: "task-1", projectId: "p1", assignees: [{ userId: "member-1" }] };

    it("throws 403 when requester is neither leader nor assignee", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);
      vi.mocked(taskRepository.findTaskById).mockResolvedValue({
        ...existingTask,
        assignees: [{ userId: "someone-else" }],
      } as never);

      await expect(
        updateTaskService("task-1", { progress: 50 }, "member-1", "p1"),
      ).rejects.toThrow(AppError);
    });

    it("throws 404 when task belongs to a different project", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(leaderMembership as never);
      vi.mocked(taskRepository.findTaskById).mockResolvedValue({
        ...existingTask,
        projectId: "other-project",
      } as never);

      await expect(
        updateTaskService("task-1", { status: "DONE" }, "leader-1", "p1"),
      ).rejects.toThrow(AppError);
    });

    it("throws 400 when progress is out of range", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);
      vi.mocked(taskRepository.findTaskById).mockResolvedValue(existingTask as never);

      await expect(
        updateTaskService("task-1", { progress: 150 }, "member-1", "p1"),
      ).rejects.toThrow(AppError);
    });

    it("allows assignee to update progress", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);
      vi.mocked(taskRepository.findTaskById).mockResolvedValue(existingTask as never);
      vi.mocked(taskRepository.updateTask).mockResolvedValue({} as never);

      await updateTaskService("task-1", { progress: 50 }, "member-1", "p1");

      const savedData = vi.mocked(taskRepository.updateTask).mock.calls[0][1];
      expect(savedData.progress).toBe(50);
    });

    it("lets leader set status DONE and sets completedAt", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(leaderMembership as never);
      vi.mocked(taskRepository.findTaskById).mockResolvedValue(existingTask as never);
      vi.mocked(taskRepository.updateTask).mockResolvedValue({} as never);

      await updateTaskService("task-1", { status: "DONE" }, "leader-1", "p1");

      const savedData = vi.mocked(taskRepository.updateTask).mock.calls[0][1];
      expect(savedData.status).toBe("DONE");
      expect(savedData.completedAt).toBeInstanceOf(Date);
    });

    it("clears completedAt when leader moves status away from DONE", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(leaderMembership as never);
      vi.mocked(taskRepository.findTaskById).mockResolvedValue(existingTask as never);
      vi.mocked(taskRepository.updateTask).mockResolvedValue({} as never);

      await updateTaskService("task-1", { status: "IN_PROGRESS" }, "leader-1", "p1");

      const savedData = vi.mocked(taskRepository.updateTask).mock.calls[0][1];
      expect(savedData.completedAt).toBeNull();
    });

    it("lets leader update startDate", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(leaderMembership as never);
      vi.mocked(taskRepository.findTaskById).mockResolvedValue(existingTask as never);
      vi.mocked(taskRepository.updateTask).mockResolvedValue({} as never);

      await updateTaskService("task-1", { startDate: "2026-08-01" }, "leader-1", "p1");

      const savedData = vi.mocked(taskRepository.updateTask).mock.calls[0][1];
      expect(savedData.startDate).toEqual(new Date("2026-08-01"));
    });

    it("ignores status/startDate changes coming from a Member (only progress applies)", async () => {
      vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);
      vi.mocked(taskRepository.findTaskById).mockResolvedValue(existingTask as never);
      vi.mocked(taskRepository.updateTask).mockResolvedValue({} as never);

      await updateTaskService(
        "task-1",
        { progress: 50, status: "DONE", startDate: "2026-08-01" },
        "member-1",
        "p1",
      );

      const savedData = vi.mocked(taskRepository.updateTask).mock.calls[0][1];
      expect(savedData).toEqual({ progress: 50 });
    });
  });
});
