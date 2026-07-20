import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate, timeAgo } from "@/lib/utils";
import { DeleteNewsButton } from "./DeleteNewsButton";

export const metadata: Metadata = { title: "Manage News" };
export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const news = await db.newsItem.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { username: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">News Posts ({news.length})</h2>
        <Link href="/admin/news/new" className="btn-primary">
          + New Post
        </Link>
      </div>

      <div className="card divide-y divide-line">
        {news.length === 0 && (
          <p className="p-8 text-center text-sm text-muted">No news posts yet.</p>
        )}
        {news.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ink">{item.title}</span>
                <span
                  className={`hud-tag !normal-case ${
                    item.source === "SEO_AGENT"
                      ? ""
                      : "!border-line !text-muted"
                  }`}
                >
                  {item.source === "SEO_AGENT" ? "SEO Agent" : "Manual"}
                </span>
              </div>
              <p className="mt-0.5 font-mono text-xs text-muted">
                by {item.author.username} · {formatDate(item.createdAt)} (
                {timeAgo(item.createdAt)})
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {item.slug && (
                <Link href={`/news/${item.slug}`} className="btn-ghost !px-3 !py-1 text-xs">
                  View
                </Link>
              )}
              {!item.isHtml && (
                <Link
                  href={`/admin/news/${item.id}/edit`}
                  className="btn-ghost !px-3 !py-1 text-xs"
                >
                  Edit
                </Link>
              )}
              <DeleteNewsButton newsId={item.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
