import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { COOKIE_NAME, JWT_SECRET } from "../../../config/env.js";
import * as userRepository from "../../repositories/user.repository.js";
import { requireAuth } from "../../middlewares/requireAuth.js";
import type { AuthRequest } from "../../middlewares/requireAuth.js";

vi.mock("../../repositories/user.repository.js");

function makeReq(token?: string): AuthRequest {
  return { cookies: token ? { [COOKIE_NAME as string]: token } : {} } as AuthRequest;
}

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls next(401) when the cookie is missing", async () => {
    const next = vi.fn();

    await requireAuth(makeReq(), {} as never, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it("calls next(401) when the token is invalid", async () => {
    const next = vi.fn();

    await requireAuth(makeReq("not-a-real-token"), {} as never, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it("calls next(401) when the token is valid but the user no longer exists", async () => {
    const token = jwt.sign({ userId: "user-1" }, JWT_SECRET as string);
    vi.mocked(userRepository.findUserById).mockResolvedValue(null);
    const next = vi.fn();

    await requireAuth(makeReq(token), {} as never, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it("calls next(403) when the account is not ACTIVE", async () => {
    const token = jwt.sign({ userId: "user-1" }, JWT_SECRET as string);
    vi.mocked(userRepository.findUserById).mockResolvedValue({
      id: "user-1",
      status: "BLOCKED",
      role: "USER",
    } as never);
    const next = vi.fn();

    await requireAuth(makeReq(token), {} as never, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it("attaches userId and userRole and calls next() when the token and account are valid", async () => {
    const token = jwt.sign({ userId: "user-1" }, JWT_SECRET as string);
    vi.mocked(userRepository.findUserById).mockResolvedValue({
      id: "user-1",
      status: "ACTIVE",
      role: "ADMIN",
    } as never);
    const next = vi.fn();
    const req = makeReq(token);

    await requireAuth(req, {} as never, next);

    expect(req.userId).toBe("user-1");
    expect(req.userRole).toBe("ADMIN");
    expect(next).toHaveBeenCalledWith();
  });
});
