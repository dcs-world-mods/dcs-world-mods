import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Avatar } from "@/components/Avatar";
import { formatDate, stripHtml, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "News" };
export const dynamic = "force-dynamic";

export default async function NewsListPage() {
  const news = await db.newsItem.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { author: { select: { username: true, avatarUrl: true } } },
  });

  return (
    <div className="mx-auto mt-8 max-w-3xl space-y-6 pb-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-radar">
          // Community Operations Center
        </p>
        <h1 className="mt-1 text-3xl font-black uppercase tracking-wider text-ink">
          News &amp; Updates
        </h1>
      </div>

      <div className="space-y-4">
        {news.length === 0 && (
          <div className="card p-10 text-center text-muted">No news posted yet.</div>
        )}
        {news.map((item) => {
          const preview = item.isHtml
            ? stripHtml(item.content).slice(0, 220)
            : item.content.slice(0, 220);
          const body = item.summary ?? preview;
          return (
            <Link
              key={item.id}
              href={item.slug ? `/news/${item.slug}` : "#"}
              className="card block p-5 transition-colors hover:border-hud/60"
            >
              <div className="mb-2 flex items-center gap-3">
                <Avatar
                  username={item.author.username}
                  avatarUrl={item.author.avatarUrl}
                  size="sm"
                />
                <span className="text-sm text-radar">{item.author.username}</span>
                <span className="font-mono text-xs text-muted">
                  {formatDate(item.createdAt)} · {timeAgo(item.createdAt)}
                </span>
              </div>
              <h2 className="text-lg font-bold text-ink">{item.title}</h2>
              <p className="mt-1 text-sm text-muted">
                {body}
                {body.length >= 220 ? "…" : ""}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
