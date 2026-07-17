import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isGoogleEnabled } from "@/lib/oauth";
import { GoogleButton } from "@/components/GoogleButton";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

const OAUTH_ERRORS: Record<string, string> = {
  "google-not-configured": "Google sign-in is not configured yet.",
  "google-state-mismatch": "Google sign-in was interrupted — please try again.",
  "google-email-unverified": "Your Google email is not verified.",
  "google-failed": "Google sign-in failed — please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSession()) redirect("/");
  const { error } = await searchParams;
  const oauthError = error ? (OAUTH_ERRORS[error] ?? null) : null;

  return (
    <div className="mx-auto mt-16 max-w-md">
      <div className="card hud-corners p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-radar">
          // Pilot Authentication
        </p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-wider text-ink">
          Log in
        </h1>
        {oauthError && (
          <p className="mt-4 rounded border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {oauthError}
          </p>
        )}
        {isGoogleEnabled() && (
          <>
            <div className="mt-6">
              <GoogleButton label="Continue with Google" />
            </div>
            <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
              <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
            </div>
          </>
        )}
        <LoginForm />
        <p className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-radar hover:text-hud">
            Forgot password?
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-muted">
          No account yet?{" "}
          <Link href="/register" className="text-hud hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
