import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UploadForm } from "./UploadForm";

export const metadata: Metadata = { title: "Upload a Mod" };

export default async function UploadPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto mt-8 max-w-2xl pb-8">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-radar">
        // Submit to the Armory
      </p>
      <h1 className="mt-1 text-3xl font-black uppercase tracking-wider text-ink">
        Upload a Mod
      </h1>
      <p className="mt-2 text-sm text-muted">
        Submissions are reviewed by site admins before they appear in the
        public library.
      </p>
      <div className="card mt-6 p-6">
        <UploadForm />
      </div>
    </div>
  );
}
