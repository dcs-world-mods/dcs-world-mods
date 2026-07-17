import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ForgotPasswordPage() {
  if (await getSession()) redirect("/");

  return (
    <div className="mx-auto mt-16 max-w-md">
      <div className="card hud-corners p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-radar">
          // Password Recovery
        </p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-wider text-ink">
          Reset Password
        </h1>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-muted">
          Remembered it?{" "}
          <Link href="/login" className="text-hud hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
