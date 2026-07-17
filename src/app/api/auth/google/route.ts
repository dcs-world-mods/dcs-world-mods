import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { appUrl, isGoogleEnabled } from "@/lib/oauth";

// Step 1: redirect the user to Google's consent screen.
export async function GET(request: NextRequest) {
  if (!isGoogleEnabled()) {
    return NextResponse.redirect(
      new URL("/login?error=google-not-configured", request.url)
    );
  }

  const base = appUrl(request.nextUrl.origin);
  const redirectUri = `${base}/api/auth/google/callback`;
  const state = crypto.randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
  // CSRF protection: the callback must present the same state.
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return response;
}
