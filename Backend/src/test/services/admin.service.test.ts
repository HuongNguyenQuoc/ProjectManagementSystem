import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../../errors/appError.js";
import * as userRepository from "../../repositories/user.repository.js";
import {
  listUsersService,
  updateUserRoleService,
  updateUserStatusService,
} from "../../services/admin.service.js";

vi.mock("../../repositories/user.repository.js");

describe("admin.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listUsersService", () => {
    it("maps _count.projectMemberships to projectCount and strips it", async () => {
      vi.mocked(userRepository.listAllUsers).mockResolvedValue([
        {
          id: "u1",
          fullName: "A",
          email: "a@test.com",
          status: "ACTIVE",
          role: "USER",
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { projectMemberships: 3 },
        },
      ] as never);

      const result = await listUsersService();

      expect(result[0]).toMatchObject({ id: "u1", projectCount: 3 });
      expect(result[0]).not.toHaveProperty("_count");
    });
  });

  describe("updateUserStatusService", () => {
    it("throws 400 for an invalid status value", async () => {
      await expect(
        updateUserStatusService("u1", "NOT_A_STATUS", "admin-1"),
      ).rejects.toThrow(AppError);
    });

    it("throws 400 when an admin tries to change their own status", async () => {
      await expect(
        updateUserStatusService("admin-1", "BLOCKED", "admin-1"),
      ).rejects.toThrow("You cannot change your own status");
    });

    it("throws 404 when the target user does not exist", async () => {
      vi.mocked(userRepository.findUserById).mockResolvedValue(null);

      await expect(
        updateUserStatusService("u1", "BLOCKED", "admin-1"),
      ).rejects.toThrow(AppError);
    });

    it("updates status and strips the password on success", async () => {
      vi.mocked(userRepository.findUserById).mockResolvedValue({ id: "u1" } as never);
      vi.mocked(userRepository.updateUserStatus).mockResolvedValue({
        id: "u1",
        password: "hashed",
        status: "BLOCKED",
      } as never);

      const result = await updateUserStatusService("u1", "BLOCKED", "admin-1");

      expect(userRepository.updateUserStatus).toHaveBeenCalledWith("u1", "BLOCKED");
      expect(result).not.toHaveProperty("password");
    });
  });

  describe("updateUserRoleService", () => {
    it("throws 400 for an invalid role value", async () => {
      await expect(
        updateUserRoleService("u1", "SUPERADMIN", "admin-1"),
      ).rejects.toThrow(AppError);
    });

    it("throws 400 when an admin tries to change their own role", async () => {
      await expect(
        updateUserRoleService("admin-1", "USER", "admin-1"),
      ).rejects.toThrow("You cannot change your own role");
    });

    it("throws 404 when the target user does not exist", async () => {
      vi.mocked(userRepository.findUserById).mockResolvedValue(null);

      await expect(
        updateUserRoleService("u1", "ADMIN", "admin-1"),
      ).rejects.toThrow(AppError);
    });

    it("updates role and strips the password on success", async () => {
      vi.mocked(userRepository.findUserById).mockResolvedValue({ id: "u1" } as never);
      vi.mocked(userRepository.updateUserRole).mockResolvedValue({
        id: "u1",
        password: "hashed",
        role: "ADMIN",
      } as never);

      const result = await updateUserRoleService("u1", "ADMIN", "admin-1");

      expect(userRepository.updateUserRole).toHaveBeenCalledWith("u1", "ADMIN");
      expect(result).not.toHaveProperty("password");
    });
  });
});
