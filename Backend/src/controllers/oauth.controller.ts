import type { Request, Response } from "express";
import { COOKIE_NAME, FRONTEND_URL, NODE_ENV } from "../../config/env.js";
import { isOAuthProvider } from "../lib/oauthProviders.js";
import {
  buildAuthorizationUrl,
  buildOAuthState,
  fetchOAuthProfile,
  loginOrRegisterWithOAuth,
  verifyOAuthState,
} from "../services/oauth.service.js";

const loginFailureRedirect = (reason: string) => `${FRONTEND_URL}/login?error=${reason}`;

/** Kicks off a provider's consent screen. Always ends in a redirect — this is
 * hit via `window.location.href`, a real browser navigation, never axios. */
export const oauthRedirectController = (req: Request, res: Response) => {
  const provider = req.params.provider;
  if (typeof provider !== "string" || !isOAuthProvider(provider)) {
    res.redirect(loginFailureRedirect("oauth_unsupported_provider"));
    return;
  }

  try {
    const state = buildOAuthState();
    res.redirect(buildAuthorizationUrl(provider, state));
  } catch {
    res.redirect(loginFailureRedirect("oauth_not_configured"));
  }
};

/** Google/Facebook land here via GET `?code&state`; Apple lands here via a
 * cross-site POST with a form-encoded body (`response_mode=form_post`),
 * which is why `code`/`state`/`user` are read from req.body for Apple only.
 * This must never let an error reach the JSON errorHandler — the caller is
 * a real browser mid-navigation, not an API client. */
export const oauthCallbackController = async (req: Request, res: Response) => {
  const provider = req.params.provider;
  if (typeof provider !== "string" || !isOAuthProvider(provider)) {
    res.redirect(loginFailureRedirect("oauth_unsupported_provider"));
    return;
  }

  const source = provider === "apple" ? req.body : req.query;
  const code = source?.code as string | undefined;
  const state = source?.state as string | undefined;

  try {
    if (!code || !verifyOAuthState(state)) {
      throw new Error("Invalid or expired OAuth state");
    }

    const appleUserPayload = provider === "apple" ? (req.body?.user as string | undefined) : undefined;
    const profile = await fetchOAuthProfile(provider, code, appleUserPayload);
    const { token } = await loginOrRegisterWithOAuth(provider, profile);

    // Identical cookie options to loginController — OAuth logins ride the
    // exact same session mechanism as password logins.
    res.cookie(COOKIE_NAME as string, token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${FRONTEND_URL}/auth/callback`);
  } catch {
    res.redirect(loginFailureRedirect("oauth_failed"));
  }
};
