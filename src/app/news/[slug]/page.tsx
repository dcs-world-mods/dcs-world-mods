import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Avatar } from "@/components/Avatar";
import { formatDate, stripHtml, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await db.newsItem.findUnique({ where: { slug } });
  if (!item) return {};
  const description = (
    item.summary ?? (item.isHtml ? stripHtml(item.content) : item.content)
  ).slice(0, 160);
  return {
    title: item.title,
    description,
    openGraph: { title: item.title, description, type: "article" },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await db.newsItem.findUnique({
    where: { slug },
    include: { author: { select: { username: true, avatarUrl: true } } },
  });
  if (!item) notFound();

  return (
    <div className="mx-auto mt-8 max-w-2xl space-y-6 pb-8">
      <nav className="font-mono text-xs text-muted">
        <Link href="/news" className="hover:text-hud">News</Link>
        {" / "}
        <span className="text-ink">{item.title}</span>
      </nav>

      <article className="card p-6">
        <div className="mb-4 flex items-center gap-3">
          <Avatar username={item.author.username} avatarUrl={item.author.avatarUrl} />
          <div>
            <div className="text-sm font-semibold text-radar">
              {item.author.username}
            </div>
            <div className="font-mono text-xs text-muted">
              {formatDate(item.createdAt)} · {timeAgo(item.createdAt)}
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-black tracking-wide text-ink">{item.title}</h1>
        {item.isHtml ? (
          <div
            className="prose-dcs mt-4"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        ) : (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink/90">
            {item.content}
          </p>
        )}
      </article>
    </div>
  );
}
