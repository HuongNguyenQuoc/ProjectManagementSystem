import rateLimit from "express-rate-limit";

/** Shared limiter for the auth routes prone to abuse (register, login,
 * verify-email, forgot/reset-password, resend-verification-email, etc.)
 * One shared bucket per IP for all of them - simple, not per-route. */

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});