import { createPublicKey, randomBytes, type JsonWebKey } from "node:crypto";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/appError.js";
import { JWT_SECRET, EXPIRES_IN } from "../../config/env.js";
import { prisma } from "../lib/prisma.js";
import { createOAuthUser, findUserByEmail } from "../repositories/user.repository.js";
import { createOAuthAccount, findOAuthAccount } from "../repositories/oauthAccount.repository.js";
import { OAuthProvider as OAuthProviderEnum } from "../generated/prisma/enums.js";
import {
  getAppleSigningConfig,
  getProviderEndpoints,
  type OAuthProviderName,
} from "../lib/oauthProviders.js";

const PROVIDER_ENUM: Record<OAuthProviderName, OAuthProviderEnum> = {
  google: OAuthProviderEnum.GOOGLE,
  facebook: OAuthProviderEnum.FACEBOOK,
  apple: OAuthProviderEnum.APPLE,
};

export interface NormalizedOAuthProfile {
  providerAccountId: string;
  email: string;
  fullName: string;
}

/** Short-lived, self-contained CSRF token used as the OAuth `state` param.
 * Not a cookie: Apple's callback is a cross-site POST (`response_mode=form_post`),
 * which browsers never attach a SameSite cookie to, even `Lax`. A signed JWT
 * works identically whether the provider echoes it back via query string
 * (Google/Facebook) or form body (Apple). */
export const buildOAuthState = (): string => {
  return jwt.sign({ nonce: randomBytes(8).toString("hex") }, JWT_SECRET as string, {
    expiresIn: "10m",
  });
};

export const verifyOAuthState = (state: string | undefined): boolean => {
  if (!state) return false;
  try {
    jwt.verify(state, JWT_SECRET as string);
    return true;
  } catch {
    return false;
  }
};

export const buildAuthorizationUrl = (provider: OAuthProviderName, state: string): string => {
  const { authorizeUrl, scope, clientId, callbackUrl } = getProviderEndpoints(provider);
  if (!clientId || !callbackUrl) {
    throw new AppError(500, `${provider} sign-in is not configured`);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope,
    state,
  });
  if (provider === "apple") {
    params.set("response_mode", "form_post");
  }
  return `${authorizeUrl}?${params.toString()}`;
};

const generateAppleClientSecret = (): string => {
  const { teamId, keyId, privateKey } = getAppleSigningConfig();
  const { clientId } = getProviderEndpoints("apple");
  if (!teamId || !keyId || !privateKey || !clientId) {
    throw new AppError(500, "apple sign-in is not configured");
  }

  return jwt.sign({}, privateKey.replace(/\\n/g, "\n"), {
    algorithm: "ES256",
    issuer: teamId,
    subject: clientId,
    audience: "https://appleid.apple.com",
    keyid: keyId,
    expiresIn: "5m",
  });
};

const verifyAppleIdToken = async (
  idToken: string,
  clientId: string,
): Promise<{ sub: string; email?: string }> => {
  const decoded = jwt.decode(idToken, { complete: true });
  const kid = decoded && typeof decoded === "object" ? decoded.header.kid : undefined;
  if (!kid) {
    throw new AppError(400, "Invalid Apple identity token");
  }

  const jwksRes = await fetch("https://appleid.apple.com/auth/keys");
  const jwks = (await jwksRes.json()) as { keys: Array<JsonWebKey & { kid: string }> };
  const jwk = jwks.keys.find((key) => key.kid === kid);
  if (!jwk) {
    throw new AppError(400, "Unable to verify Apple identity token");
  }

  const publicKey = createPublicKey({ key: jwk, format: "jwk" }).export({
    type: "spki",
    format: "pem",
  });

  try {
    const payload = jwt.verify(idToken, publicKey, {
      algorithms: ["RS256"],
      issuer: "https://appleid.apple.com",
      audience: clientId,
    }) as jwt.JwtPayload;
    return { sub: payload.sub as string, email: payload.email as string | undefined };
  } catch {
    throw new AppError(400, "Apple identity token verification failed");
  }
};

/** `appleUserPayload` is the raw `user` field from Apple's form_post callback body —
 * only present on the very first authorization ever, and only carries a name. */
export const fetchOAuthProfile = async (
  provider: OAuthProviderName,
  code: string,
  appleUserPayload?: string,
): Promise<NormalizedOAuthProfile> => {
  const { tokenUrl, clientId, clientSecret, callbackUrl } = getProviderEndpoints(provider);
  if (!clientId || !callbackUrl) {
    throw new AppError(500, `${provider} sign-in is not configured`);
  }

  if (provider === "google") {
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret as string,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new AppError(400, "Failed to exchange Google authorization code");
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = (await userRes.json()) as { sub?: string; email?: string; name?: string };
    if (!userRes.ok || !profile.sub || !profile.email) {
      throw new AppError(400, "No email available from Google account");
    }

    return {
      providerAccountId: profile.sub,
      email: profile.email,
      fullName: profile.name || profile.email.split("@")[0],
    };
  }

  if (provider === "facebook") {
    const tokenParams = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret as string,
      redirect_uri: callbackUrl,
    });
    const tokenRes = await fetch(`${tokenUrl}?${tokenParams.toString()}`);
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new AppError(400, "Failed to exchange Facebook authorization code");
    }

    const profileParams = new URLSearchParams({
      fields: "id,name,email",
      access_token: tokenData.access_token,
    });
    const profileRes = await fetch(`https://graph.facebook.com/v19.0/me?${profileParams.toString()}`);
    const profile = (await profileRes.json()) as { id?: string; email?: string; name?: string };
    if (!profileRes.ok || !profile.id || !profile.email) {
      throw new AppError(400, "No email available from Facebook account");
    }

    return {
      providerAccountId: profile.id,
      email: profile.email,
      fullName: profile.name || profile.email.split("@")[0],
    };
  }

  // apple
  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: generateAppleClientSecret(),
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }),
  });
  const tokenData = (await tokenRes.json()) as { id_token?: string };
  if (!tokenRes.ok || !tokenData.id_token) {
    throw new AppError(400, "Failed to exchange Apple authorization code");
  }

  const { sub, email } = await verifyAppleIdToken(tokenData.id_token, clientId);
  if (!email) {
    throw new AppError(400, "No email available from Apple account");
  }

  let fullName = email.split("@")[0];
  if (appleUserPayload) {
    try {
      const parsed = JSON.parse(appleUserPayload) as { name?: { firstName?: string; lastName?: string } };
      const joined = [parsed.name?.firstName, parsed.name?.lastName].filter(Boolean).join(" ");
      if (joined) fullName = joined;
    } catch {
      // malformed/absent `user` field on this callback — keep the email-derived fallback
    }
  }

  return { providerAccountId: sub, email, fullName };
};

const issueSession = (user) => {
  const token = jwt.sign({ userId: user.id }, JWT_SECRET as string, {
    expiresIn: EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
  const { password, verificationCode, verificationCodeExpiresAt, ...safeUser } = user;
  return { user: safeUser, token };
};

export const loginOrRegisterWithOAuth = async (
  provider: OAuthProviderName,
  profile: NormalizedOAuthProfile,
) => {
  const providerEnum = PROVIDER_ENUM[provider];

  const existingAccount = await findOAuthAccount(providerEnum, profile.providerAccountId);
  if (existingAccount) {
    if (existingAccount.user.status !== "ACTIVE") {
      throw new AppError(403, "User account is not active");
    }
    return issueSession(existingAccount.user);
  }

  const existingUser = await findUserByEmail(profile.email);
  if (existingUser) {
    if (existingUser.status !== "ACTIVE") {
      throw new AppError(403, "User account is not active");
    }
    await createOAuthAccount({
      userId: existingUser.id,
      provider: providerEnum,
      providerAccountId: profile.providerAccountId,
    });
    return issueSession(existingUser);
  }

  const newUser = await prisma.$transaction(async (tx) => {
    const user = await createOAuthUser({ fullName: profile.fullName, email: profile.email }, tx);
    await createOAuthAccount(
      { userId: user.id, provider: providerEnum, providerAccountId: profile.providerAccountId },
      tx,
    );
    return user;
  });
  return issueSession(newUser);
};
