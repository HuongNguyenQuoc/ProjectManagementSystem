import {
  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL,
  FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, FACEBOOK_CALLBACK_URL,
  APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY, APPLE_CALLBACK_URL,
} from "../../config/env.js";

export type OAuthProviderName = "google" | "facebook" | "apple";

export const OAUTH_PROVIDERS: OAuthProviderName[] = ["google", "facebook", "apple"];

export const isOAuthProvider = (value: string): value is OAuthProviderName =>
  (OAUTH_PROVIDERS as string[]).includes(value);

interface ProviderEndpoints {
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  clientId: string | undefined;
  clientSecret: string | undefined;
  callbackUrl: string | undefined;
}

export const getProviderEndpoints = (provider: OAuthProviderName): ProviderEndpoints => {
  switch (provider) {
    case "google":
      return {
        authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scope: "openid email profile",
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackUrl: GOOGLE_CALLBACK_URL,
      };
    case "facebook":
      return {
        authorizeUrl: "https://www.facebook.com/v19.0/dialog/oauth",
        tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
        scope: "email public_profile",
        clientId: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        callbackUrl: FACEBOOK_CALLBACK_URL,
      };
    case "apple":
      return {
        authorizeUrl: "https://appleid.apple.com/auth/authorize",
        tokenUrl: "https://appleid.apple.com/auth/token",
        scope: "name email",
        clientId: APPLE_CLIENT_ID,
        clientSecret: undefined, // Apple's "client secret" is a signed JWT generated per-request, not a static value
        callbackUrl: APPLE_CALLBACK_URL,
      };
  }
};

/** Apple-only config needed to sign the per-request client-secret JWT. */
export const getAppleSigningConfig = () => ({
  teamId: APPLE_TEAM_ID,
  keyId: APPLE_KEY_ID,
  privateKey: APPLE_PRIVATE_KEY,
});
