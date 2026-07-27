import { describe, it, expect, vi } from "vitest";
import { AppError } from "../../errors/appError.js";
import { requireRole } from "../../middlewares/requireRole.js";
import type { AuthRequest } from "../../middlewares/requireAuth.js";

describe("requireRole", () => {
  it("calls next() when the requester has one of the allowed roles", () => {
    const req = { userRole: "ADMIN" } as AuthRequest;
    const next = vi.fn();

    requireRole("ADMIN")(req, {} as never, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("calls next(AppError(403)) when the requester's role is not allowed", () => {
    const req = { userRole: "USER" } as AuthRequest;
    const next = vi.fn();

    requireRole("ADMIN")(req, {} as never, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it("calls next(AppError(403)) when the requester has no role at all", () => {
    const req = {} as AuthRequest;
    const next = vi.fn();

    requireRole("ADMIN")(req, {} as never, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });
});
