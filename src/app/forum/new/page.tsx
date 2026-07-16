import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { NewThreadForm } from "./NewThreadForm";

export const metadata: Metadata = { title: "New Thread" };
export const dynamic = "force-dynamic";

export default async function NewThreadPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { category } = await searchParams;
  const categories = await db.forumCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="mx-auto mt-8 max-w-2xl pb-8">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-radar">
        // Open Channel
      </p>
      <h1 className="mt-1 text-3xl font-black uppercase tracking-wider text-ink">
        New Thread
      </h1>
      <div className="card mt-6 p-6">
        <NewThreadForm categories={categories} defaultSlug={category} />
      </div>
    </div>
  );
}
