import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Sign up" };

export default async function RegisterPage() {
  if (await getSession()) redirect("/");

  return (
    <div className="mx-auto mt-16 max-w-md">
      <div className="card hud-corners p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-radar">
          // New Pilot Registration
        </p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-wider text-ink">
          Create Account
        </h1>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted">
          Already registered?{" "}
          <Link href="/login" className="text-hud hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
