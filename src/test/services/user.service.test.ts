import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../../errors/appError.js";
import * as userRepository from "../../repositories/user.repository.js";
import { lookupUserByEmailService } from "../../services/user.service.js";

vi.mock("../../repositories/user.repository.js");

describe("user.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("lookupUserByEmailService", () => {
    it("throws 400 when email is missing", async () => {
      await expect(lookupUserByEmailService("")).rejects.toThrow(AppError);
    });

    it("throws 404 when no user matches the email", async () => {
      vi.mocked(userRepository.findUserByEmail).mockResolvedValue(null as never);

      await expect(lookupUserByEmailService("nobody@example.com")).rejects.toThrow(AppError);
    });

    it("returns a safe subset of the user when found", async () => {
      vi.mocked(userRepository.findUserByEmail).mockResolvedValue({
        id: "u1",
        fullName: "Minh Tran",
        email: "minh@example.com",
        password: "hashed",
        status: "ACTIVE",
      } as never);

      const result = await lookupUserByEmailService("minh@example.com");

      expect(result).toEqual({ id: "u1", fullName: "Minh Tran", email: "minh@example.com" });
      expect(result).not.toHaveProperty("password");
    });
  });
});
