import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { AppError } from "../../errors/appError.js";
import * as userRepository from "../../repositories/user.repository.js";
import { registerUser, loginUser } from "../../services/auth.service.js";

vi.mock("../../repositories/user.repository.js");

const fakeUser = {
  id: "user-1",
  fullName: "John Doe",
  email: "a@test.com",
  password: bcrypt.hashSync("correct-password", 10), 
  status: "ACTIVE" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerUser", () => {
    it("throws 400 when required fields are missing", async () => {
      await expect(
        registerUser({ fullName: "", email: "", password: ""}),
      ).rejects.toThrow(AppError);
    });

    it("throws 400 when email already exists", async () => {
      vi.mocked(userRepository.findUserByEmail).mockResolvedValue(fakeUser);

      await expect(
        registerUser({ fullName: "A", email: "a@test.com", password: "123456" }),
      ).rejects.toThrow("Email already exists");
    });

    it("hashes the password before saving and strips it from the result", async () => {
      vi.mocked(userRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(userRepository.createUser).mockResolvedValue({
        ...fakeUser,
        fullName: "A",
        email: "a@test.com",
      } as Awaited<ReturnType<typeof userRepository.createUser>>);

      const result = await registerUser({
        fullName: "A",
        email: "a@test.com",
        password: "123456",
      });

      expect(result).not.toHaveProperty("password");

      const savedData = vi.mocked(userRepository.createUser).mock.calls[0][0];
      expect(savedData.password).not.toBe("1234456");
    });
  });

  describe("loginUser", () => {
    it("throws 401 when user not found", async () => {
      vi.mocked(userRepository.findUserByEmail).mockResolvedValue(null);

      await expect(
        loginUser({ email: "notfound@test.com", password: "123456" }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("throws 403 when account status is not ACTIVE", async () => {
      vi.mocked(userRepository.findUserByEmail).mockResolvedValue({
        ...fakeUser,
        status: "BLOCKED",
      });

      await expect(
        loginUser({ email: "a@test.com", password: "correct-password" }),
      ).rejects.toThrow("User account is not active");
    });

    it("throws 401 when password is wrong", async () => {
      vi.mocked(userRepository.findUserByEmail).mockResolvedValue(fakeUser);

      await expect(
        loginUser({ email: "a@test.com", password: "wrong-password"}),
      ).rejects.toThrow("Invalid email or password");
    });

    it("returns user + token on success", async () => {
      vi.mocked(userRepository.findUserByEmail).mockResolvedValue(fakeUser);

      const result = await loginUser({
        email: "a@test.com",
        password: "correct-password",
      });

      expect(result.token).toBeTypeOf("string");
      expect(result.user).not.toHaveProperty("password");
    });
  });
});


