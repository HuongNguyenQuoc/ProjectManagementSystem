import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../../errors/appError.js";
import * as projectRepository from "../../repositories/project.repository.js";
import * as taskRepository from "../../repositories/task.repository.js";
import * as issueRepository from "../../repositories/issue.repositories.js";
import { getProjectDashboardService } from "../../services/dashboard.service.js";

vi.mock("../../repositories/project.repository.js");
vi.mock("../../repositories/task.repository.js");
vi.mock("../../repositories/issue.repositories.js");

const leaderMembership = { projectId: "p1", userId: "leader-1", projectRole: "PROJECT_LEADER" };
const memberMembership = { projectId: "p1", userId: "member-1", projectRole: "MEMBER" };

describe("dashboard.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws 403 when requester is not a project member at all", async () => {
    vi.mocked(projectRepository.findProjectMember).mockResolvedValue(null as never);

    await expect(getProjectDashboardService("p1", "outsider")).rejects.toThrow(AppError);
  });

  it("throws 403 when requester is a Member (not Leader)", async () => {
    vi.mocked(projectRepository.findProjectMember).mockResolvedValue(memberMembership as never);

    await expect(getProjectDashboardService("p1", "member-1")).rejects.toThrow(
      /Only the project leader/,
    );
  });

  it("throws 404 when project does not exist", async () => {
    vi.mocked(projectRepository.findProjectMember).mockResolvedValue(leaderMembership as never);
    vi.mocked(projectRepository.findProjectById).mockResolvedValue(null as never);

    await expect(getProjectDashboardService("p1", "leader-1")).rejects.toThrow(AppError);
  });

  it("computes stats correctly for the Leader", async () => {
    vi.mocked(projectRepository.findProjectMember).mockResolvedValue(leaderMembership as never);
    vi.mocked(projectRepository.findProjectById).mockResolvedValue({
      id: "p1",
      name: "P1",
      status: "IN_PROGRESS",
      members: [{}, {}, {}],
    } as never);
    vi.mocked(taskRepository.findTasksByProjectId).mockResolvedValue([
      { status: "DONE", priority: "HIGH", dueDate: null },
      { status: "TODO", priority: "HIGH", dueDate: null },
      { status: "TODO", priority: "MEDIUM", dueDate: new Date("2020-01-01") }, // overdue
      { status: "CANCELLED", priority: "LOW", dueDate: new Date("2020-01-01") }, // not counted as overdue
    ] as never);
    vi.mocked(issueRepository.findIssuesByProjectId).mockResolvedValue([
      { status: "OPEN", severity: "HIGH" },
      { status: "RESOLVED", severity: "LOW" },
    ] as never);

    const result = await getProjectDashboardService("p1", "leader-1");

    expect(result.totalTasks).toBe(4);
    expect(result.completedTasks).toBe(1);
    expect(result.overdueTasks).toBe(1);
    expect(result.totalMembers).toBe(3);
    expect(result.tasksByStatus).toEqual({ DONE: 1, TODO: 2, CANCELLED: 1 });
    expect(result.totalIssues).toBe(2);
    // openIssues hiện tính là "mọi issue khác CLOSED" (kể cả RESOLVED) — khớp đúng logic thật trong dashboard.service.ts
    expect(result.openIssues).toBe(2);
  });
});
