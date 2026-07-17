import "server-only";
import { db } from "./db";
import { slugify } from "./utils";

export function isGoogleEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/** Base URL of the app, e.g. https://dcs-world-mods.vercel.app */
export function appUrl(requestOrigin: string): string {
  return (process.env.APP_URL ?? requestOrigin).replace(/\/$/, "");
}

export type GoogleProfile = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
};

/** Exchange an authorization code for the user's Google profile. */
export async function fetchGoogleProfile(
  code: string,
  redirectUri: string
): Promise<GoogleProfile> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Google token exchange failed: ${tokenRes.status}`);
  }
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const profileRes = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  if (!profileRes.ok) {
    throw new Error(`Google userinfo failed: ${profileRes.status}`);
  }
  return (await profileRes.json()) as GoogleProfile;
}

/** Derive a unique username from an email address. */
export async function uniqueUsernameFromEmail(email: string): Promise<string> {
  const base =
    slugify(email.split("@")[0]).replace(/-/g, "_").slice(0, 20) || "pilot";
  let candidate = base;
  for (let i = 2; await db.user.findUnique({ where: { username: candidate } }); i++) {
    candidate = `${base}${i}`;
  }
  return candidate;
}
