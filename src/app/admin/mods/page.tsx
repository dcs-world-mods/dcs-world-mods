import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { MOD_CATEGORY_LABELS, type ModCategory } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { ModReviewActions } from "./ModReviewActions";

export const metadata: Metadata = { title: "Mod Approval" };
export const dynamic = "force-dynamic";

export default async function AdminModsPage() {
  const [pending, recent] = await Promise.all([
    db.mod.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { username: true } } },
    }),
    db.mod.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: { author: { select: { username: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="section-title mb-4">
          Pending Approval ({pending.length})
        </h2>
        <div className="card divide-y divide-line">
          {pending.length === 0 && (
            <p className="p-8 text-center text-sm text-muted">
              All clear — no mods waiting for review.
            </p>
          )}
          {pending.map((mod) => (
            <div key={mod.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link
                  href={`/mods/${mod.slug}`}
                  className="font-semibold text-ink hover:text-hud"
                >
                  {mod.title}{" "}
                  <span className="font-mono text-xs text-muted">v{mod.version}</span>
                </Link>
                <div className="mt-0.5 font-mono text-xs text-muted">
                  {MOD_CATEGORY_LABELS[mod.category as ModCategory] ?? mod.category}{" "}
                  · by {mod.author.username} · submitted {timeAgo(mod.createdAt)}
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-muted">{mod.summary}</p>
              </div>
              <ModReviewActions modId={mod.id} pending />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title mb-4">Recently Reviewed</h2>
        <div className="card divide-y divide-line">
          {recent.map((mod) => (
            <div key={mod.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <Link href={`/mods/${mod.slug}`} className="font-semibold text-ink hover:text-hud">
                  {mod.title}
                </Link>
                <span
                  className={`ml-2 font-mono text-xs ${
                    mod.status === "APPROVED" ? "text-ok" : "text-danger"
                  }`}
                >
                  {mod.status}
                </span>
                <div className="mt-0.5 font-mono text-xs text-muted">
                  by {mod.author.username} · {mod.downloads} downloads
                </div>
              </div>
              <ModReviewActions modId={mod.id} pending={false} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
