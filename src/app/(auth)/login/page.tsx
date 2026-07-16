import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getSession()) redirect("/");

  return (
    <div className="mx-auto mt-16 max-w-md">
      <div className="card hud-corners p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-radar">
          // Pilot Authentication
        </p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-wider text-ink">
          Log in
        </h1>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted">
          No account yet?{" "}
          <Link href="/register" className="text-hud hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
