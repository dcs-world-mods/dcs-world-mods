import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";

export default async function ForumCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await db.forumCategory.findUnique({
    where: { slug },
    include: {
      threads: {
        orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
        take: 50,
        include: {
          author: { select: { username: true, avatarUrl: true } },
          _count: { select: { posts: true } },
        },
      },
    },
  });
  if (!category) notFound();

  return (
    <div className="mt-8 space-y-6 pb-8">
      <nav className="font-mono text-xs text-muted">
        <Link href="/forum" className="hover:text-hud">Forum</Link>
        {" / "}
        <span className="text-ink">{category.name}</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-ink">
            {category.name}
          </h1>
          <p className="mt-1 text-sm text-muted">{category.description}</p>
        </div>
        <Link href={`/forum/new?category=${category.slug}`} className="btn-primary">
          + New Thread
        </Link>
      </div>

      <div className="card divide-y divide-line">
        {category.threads.length === 0 && (
          <p className="p-10 text-center text-muted">
            No threads yet — start the first discussion.
          </p>
        )}
        {category.threads.map((thread) => (
          <Link
            key={thread.id}
            href={`/forum/thread/${thread.id}`}
            className="flex items-center gap-4 p-4 hover:bg-raised/60"
          >
            <Avatar
              username={thread.author.username}
              avatarUrl={thread.author.avatarUrl}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {thread.pinned && <span className="hud-tag">Pinned</span>}
                {thread.locked && (
                  <span className="hud-tag !border-line !text-muted">Locked</span>
                )}
                <span className="truncate font-semibold text-ink">
                  {thread.title}
                </span>
              </div>
              <div className="mt-0.5 font-mono text-xs text-muted">
                by {thread.author.username} · {timeAgo(thread.updatedAt)}
              </div>
            </div>
            <div className="shrink-0 text-right font-mono text-xs text-muted">
              <div>{thread._count.posts - 1} replies</div>
              <div>{thread.views} views</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
