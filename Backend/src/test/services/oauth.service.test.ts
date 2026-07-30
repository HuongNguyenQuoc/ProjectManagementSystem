import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import { AppError } from "../../errors/appError.js";
import type { UserStatus } from "../../generated/prisma/enums.js";
import * as userRepository from "../../repositories/user.repository.js";
import * as oauthAccountRepository from "../../repositories/oauthAccount.repository.js";
import {
  buildOAuthState,
  fetchOAuthProfile,
  loginOrRegisterWithOAuth,
  verifyOAuthState,
} from "../../services/oauth.service.js";

vi.mock("../../repositories/user.repository.js");
vi.mock("../../repositories/oauthAccount.repository.js");
vi.mock("../../lib/prisma.js", () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) => fn(undefined),
  },
}));

// Simulates Apple's own signing key (not something this app controls) — used
// to sign a fake id_token in tests, verified the same way the real
// appleid.apple.com JWKS would be.
const APPLE_JWKS_KEY_ID = "test-key-id";
const APPLE_RSA_PRIVATE_KEY =
  "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDG2zR33QAadVZJ\nrZ3+vUYKOnpYokFkDEY50R+y2h6GtRdeR1fjLQFtGUIrITjWglVLTeoU1AEE6G5e\nH4ZJV5HM2haZr1SgbMxnG7QQtfwnLrWWO4Id+tujfSBa88DHboIbDbNZScdGtKln\ngpZW18ikyaXUnrsZ5m1YYjoEuP+ypsvgSwqEjIRob+ymlbslrTdW8H8HkjhSzTbm\nxKgVlzS7SYEmLo6ycXsQJ76QZd63Tc+DCOg9HNXowih51IepWkoBxTX+ycfuyiCD\nAfhF8jD+KF5GyXnwf6qrJyKQmSDI+i7XIDdFmRDKYU6Am+Jq+HenMku3wCFK01zg\nNpRTQBJnAgMBAAECggEABeD+JJsGgUG9ytDUrm7HDs9axZsKZtxMCTKLBt0W8PGS\nnslqKj+u3pxUDfVd+k2BGwhTJsl7vDro5GR3Mlzh5RX/fAyoalO9GUFC6gmPSlNB\nsA7TUnKToro0xiuVo++67fTSPA4H06nMplBAhJG9j02c1vPYYTQkQGwq/e/AM3ZY\nkmqqxS10O0MBOs8z/l2BOu3W+lhKV4F/fv5rKU+rReZMYtQ85TUzZRzUov5grNw4\nGJevcLhaK/7nElzEshGkCLY4dx90aOOIKA/WkHzG5O3nEcq3Lezh1vplNDifSzgJ\nHs0acgPL4XHYEReOy/4zLoQWOINPJfaHEm70+oInOQKBgQDh+sxP6iqVcLWLIepn\nRroSGVYJhzAnquBCWYgR+wRf71bu67nipvvau1kWmGVd6rCbhl90KzbQ+GYbUZ67\nThXzpMq2zzG84WqtkUF4PfBtbLDingLnqq22iMdidvpa4b01IVnmMmIWtXE8PozS\nhZ5iwpvDHRyg3O67I3KRBabYmQKBgQDhRfvUlkHFphtuSxHiwmj98OSpZ2AO9xeR\nD0NN7lUukbw6elLiKKW1Ko/tjtNK7N4VjlzyRAC5P8JgXQRO6+de+JfF5Ugqt8LN\n1jQpk2yKMm0+Qnha03ROIfJS0GCroW42+TJuhjN9QQoIfSuM8wcU3UkTIM/PRjsr\n8xEfL9oi/wKBgFV/6qWh15LLHiUSI/oHTIdkhqT8PUAE6uyvq0gCTVlu2Nl03tPe\nkhPkJoTiDBhIn6F4ac0uPIM8OIXFj+UWWj/g7cHVCuCH+TDKcJbp+HmuUg6r8jVs\n4mTZw3aBxZ91IX1krPrnvS0SYVGF6QoN/Csprn1YGmjSrpCnjMVJ+iKhAoGBAJuf\nVxtDOeiqmaSV46M9Hn7fXXfR3EA6XmNtoddCYEItl1TmkD+ASQlgf9Fiq4DFJZ7K\nnFcYt09CRqt/VqyWt12aam7ht/sau06rPZnDKGZH88Pg83f7QAuB0/91yHKIsLT1\nbeuAdi1/Mskuf1l9wlSdkg/OyQCtyc7QufFLg2xNAoGBAJsmg0Tqd5ELg7X9RLAW\nREm5S87YWsF1u+CbXWqUowJgj9jKkBZpW2YLh0rG7Xc3vMV69dqlTkxkCMpkc0Lf\n0XjtxPiMr1fbg/jwsTx4DePholv9rbYb5b7r0kaoVH72te4K3pZkEK9nrFmuzfKZ\nF8BC/i2yQSpXZo6ky2RhQO5q\n-----END PRIVATE KEY-----\n";
const APPLE_JWK = {
  kty: "RSA",
  kid: APPLE_JWKS_KEY_ID,
  n: "xts0d90AGnVWSa2d_r1GCjp6WKJBZAxGOdEfstoehrUXXkdX4y0BbRlCKyE41oJVS03qFNQBBOhuXh-GSVeRzNoWma9UoGzMZxu0ELX8Jy61ljuCHfrbo30gWvPAx26CGw2zWUnHRrSpZ4KWVtfIpMml1J67GeZtWGI6BLj_sqbL4EsKhIyEaG_sppW7Ja03VvB_B5I4Us025sSoFZc0u0mBJi6OsnF7ECe-kGXet03PgwjoPRzV6MIoedSHqVpKAcU1_snH7soggwH4RfIw_iheRsl58H-qqycikJkgyPou1yA3RZkQymFOgJviavh3pzJLt8AhStNc4DaUU0ASZw",
  e: "AQAB",
};

const buildFakeAppleIdToken = (payload: { sub: string; email: string }) =>
  jwt.sign(payload, APPLE_RSA_PRIVATE_KEY, {
    algorithm: "RS256",
    keyid: APPLE_JWKS_KEY_ID,
    issuer: "https://appleid.apple.com",
    audience: "test-apple-client-id", // matches APPLE_CLIENT_ID in .env.test.local
    expiresIn: "10m",
  });

let fetchMock: ReturnType<typeof vi.fn>;

const fakeActiveUser = (overrides: Partial<{
  id: string; fullName: string; email: string; status: UserStatus;
}> = {}) => ({
  id: overrides.id ?? "user-1",
  fullName: overrides.fullName ?? "A",
  email: overrides.email ?? "a@test.com",
  password: null,
  status: overrides.status ?? "ACTIVE",
  role: "USER" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("oauth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("OAuth state (CSRF)", () => {
    it("verifies a token produced by buildOAuthState", () => {
      expect(verifyOAuthState(buildOAuthState())).toBe(true);
    });

    it("rejects a garbage state", () => {
      expect(verifyOAuthState("not-a-real-token")).toBe(false);
    });

    it("rejects an undefined state", () => {
      expect(verifyOAuthState(undefined)).toBe(false);
    });
  });

  describe("fetchOAuthProfile - google", () => {
    it("exchanges the code and normalizes the profile", async () => {
      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: "g-access-token" }) })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ sub: "google-sub-1", email: "a@gmail.com", name: "Alice" }),
        });

      const profile = await fetchOAuthProfile("google", "auth-code");

      expect(profile).toEqual({ providerAccountId: "google-sub-1", email: "a@gmail.com", fullName: "Alice" });
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "https://oauth2.googleapis.com/token",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("falls back to the email prefix when no name is returned", async () => {
      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: "g-access-token" }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ sub: "google-sub-1", email: "bob@gmail.com" }) });

      const profile = await fetchOAuthProfile("google", "auth-code");
      expect(profile.fullName).toBe("bob");
    });

    it("throws when the token exchange fails", async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
      await expect(fetchOAuthProfile("google", "bad-code")).rejects.toThrow(AppError);
    });

    it("throws when no email is returned", async () => {
      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: "g-access-token" }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ sub: "google-sub-1" }) });

      await expect(fetchOAuthProfile("google", "auth-code")).rejects.toThrow(
        "No email available from Google account",
      );
    });
  });

  describe("fetchOAuthProfile - facebook", () => {
    it("exchanges the code and normalizes the profile", async () => {
      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: "fb-access-token" }) })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "fb-id-1", email: "c@fb.com", name: "Carol" }),
        });

      const profile = await fetchOAuthProfile("facebook", "auth-code");
      expect(profile).toEqual({ providerAccountId: "fb-id-1", email: "c@fb.com", fullName: "Carol" });
    });

    it("throws when no email is returned", async () => {
      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: "fb-access-token" }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "fb-id-1" }) });

      await expect(fetchOAuthProfile("facebook", "auth-code")).rejects.toThrow(
        "No email available from Facebook account",
      );
    });
  });

  describe("fetchOAuthProfile - apple", () => {
    it("verifies the id_token against Apple's JWKS and uses the first-login name payload", async () => {
      const idToken = buildFakeAppleIdToken({ sub: "apple-sub-1", email: "user@privaterelay.appleid.com" });
      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id_token: idToken }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ keys: [APPLE_JWK] }) });

      const profile = await fetchOAuthProfile(
        "apple",
        "auth-code",
        JSON.stringify({ name: { firstName: "Ada", lastName: "Lovelace" } }),
      );

      expect(profile).toEqual({
        providerAccountId: "apple-sub-1",
        email: "user@privaterelay.appleid.com",
        fullName: "Ada Lovelace",
      });
    });

    it("falls back to the email prefix on repeat logins (no name payload)", async () => {
      const idToken = buildFakeAppleIdToken({ sub: "apple-sub-1", email: "carol@example.com" });
      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id_token: idToken }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ keys: [APPLE_JWK] }) });

      const profile = await fetchOAuthProfile("apple", "auth-code");
      expect(profile.fullName).toBe("carol");
    });

    it("rejects an id_token whose kid isn't in Apple's JWKS", async () => {
      const idToken = buildFakeAppleIdToken({ sub: "apple-sub-1", email: "carol@example.com" });
      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id_token: idToken }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ keys: [] }) });

      await expect(fetchOAuthProfile("apple", "auth-code")).rejects.toThrow(AppError);
    });
  });

  describe("loginOrRegisterWithOAuth", () => {
    const profile = { providerAccountId: "provider-acc-1", email: "a@test.com", fullName: "A" };

    it("logs in immediately when the OAuth account is already linked", async () => {
      vi.mocked(oauthAccountRepository.findOAuthAccount).mockResolvedValue({
        id: "acc-1",
        userId: "user-1",
        provider: "GOOGLE",
        providerAccountId: "provider-acc-1",
        createdAt: new Date(),
        user: fakeActiveUser({ id: "user-1" }),
      } as never);

      const result = await loginOrRegisterWithOAuth("google", profile);

      expect(result.token).toBeTypeOf("string");
      expect(result.user).not.toHaveProperty("password");
      expect(oauthAccountRepository.createOAuthAccount).not.toHaveBeenCalled();
    });

    it("throws 403 when the linked account's user is not ACTIVE", async () => {
      vi.mocked(oauthAccountRepository.findOAuthAccount).mockResolvedValue({
        user: fakeActiveUser({ status: "BLOCKED" }),
      } as never);

      await expect(loginOrRegisterWithOAuth("google", profile)).rejects.toThrow("User account is not active");
    });

    it("links to an existing user found by email instead of duplicating", async () => {
      vi.mocked(oauthAccountRepository.findOAuthAccount).mockResolvedValue(null);
      vi.mocked(userRepository.findUserByEmail).mockResolvedValue(fakeActiveUser({ id: "user-2" }));

      const result = await loginOrRegisterWithOAuth("google", profile);

      expect(oauthAccountRepository.createOAuthAccount).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-2", provider: "GOOGLE", providerAccountId: "provider-acc-1" }),
      );
      expect(result.user.id).toBe("user-2");
    });

    it("throws 403 when the user matched by email is not ACTIVE", async () => {
      vi.mocked(oauthAccountRepository.findOAuthAccount).mockResolvedValue(null);
      vi.mocked(userRepository.findUserByEmail).mockResolvedValue(fakeActiveUser({ status: "INACTIVE" }));

      await expect(loginOrRegisterWithOAuth("google", profile)).rejects.toThrow("User account is not active");
    });

    it("creates a new user and its OAuth account when nothing matches", async () => {
      vi.mocked(oauthAccountRepository.findOAuthAccount).mockResolvedValue(null);
      vi.mocked(userRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(userRepository.createOAuthUser).mockResolvedValue(fakeActiveUser({ id: "user-3" }));

      const result = await loginOrRegisterWithOAuth("google", profile);

      expect(userRepository.createOAuthUser).toHaveBeenCalledWith({ fullName: "A", email: "a@test.com" }, undefined);
      expect(oauthAccountRepository.createOAuthAccount).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-3", provider: "GOOGLE", providerAccountId: "provider-acc-1" }),
        undefined,
      );
      expect(result.user).not.toHaveProperty("password");
      expect(result.token).toBeTypeOf("string");
    });
  });
});
