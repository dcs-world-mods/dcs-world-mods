import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import {
  appUrl,
  fetchGoogleProfile,
  isGoogleEnabled,
  uniqueUsernameFromEmail,
} from "@/lib/oauth";
import type { Role } from "@/lib/constants";

// Step 2: Google redirects back here with a one-time code.
export async function GET(request: NextRequest) {
  const base = appUrl(request.nextUrl.origin);
  const fail = (reason: string) =>
    NextResponse.redirect(`${base}/login?error=${reason}`);

  try {
    if (!isGoogleEnabled()) return fail("google-not-configured");

    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const cookieState = request.cookies.get("google_oauth_state")?.value;
    if (!code || !state || !cookieState || state !== cookieState) {
      return fail("google-state-mismatch");
    }

    const profile = await fetchGoogleProfile(
      code,
      `${base}/api/auth/google/callback`
    );
    if (!profile.email || !profile.email_verified) {
      return fail("google-email-unverified");
    }
    const email = profile.email.toLowerCase();

    // 1. Existing Google-linked account
    let user = await db.user.findUnique({ where: { googleId: profile.sub } });

    // 2. Existing password account with the same email -> link Google to it
    if (!user) {
      const byEmail = await db.user.findUnique({ where: { email } });
      if (byEmail) {
        user = await db.user.update({
          where: { id: byEmail.id },
          data: { googleId: profile.sub },
        });
      }
    }

    // 3. Brand new user -> one-click sign-up
    if (!user) {
      user = await db.user.create({
        data: {
          username: await uniqueUsernameFromEmail(email),
          email,
          googleId: profile.sub,
          avatarUrl: profile.picture ?? null,
        },
      });
    }

    await createSession({
      userId: user.id,
      username: user.username,
      role: user.role as Role,
    });

    const response = NextResponse.redirect(base + "/");
    response.cookies.delete("google_oauth_state");
    return response;
  } catch (error) {
    console.error("Google OAuth error:", error);
    return fail("google-failed");
  }
}
