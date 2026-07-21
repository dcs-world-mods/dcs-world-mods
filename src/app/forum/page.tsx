import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Community Forum",
  description:
    "Discuss DCS World mods, mission building, bug reports and more with the community.",
};
export const dynamic = "force-dynamic";

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  if (q) {
    const threads = await db.thread.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { posts: { some: { content: { contains: q } } } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 30,
      include: {
        author: { select: { username: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { posts: true } },
      },
    });

    return (
      <div className="mt-8 space-y-6 pb-8">
        <h1 className="text-3xl font-black uppercase tracking-wider text-ink">
          Forum Search
        </h1>
        <SearchBox defaultValue={q} />
        <p className="font-mono text-sm text-muted">
          {threads.length} result{threads.length === 1 ? "" : "s"} for “{q}”
        </p>
        <div className="card divide-y divide-line">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/forum/thread/${thread.id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-raised/60"
            >
              <div>
                <div className="font-semibold text-ink">{thread.title}</div>
                <div className="mt-0.5 font-mono text-xs text-muted">
                  in {thread.category.name} · by {thread.author.username} ·{" "}
                  {timeAgo(thread.updatedAt)}
                </div>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted">
                {thread._count.posts - 1} replies
              </span>
            </Link>
          ))}
          {threads.length === 0 && (
            <p className="p-8 text-center text-muted">No threads found.</p>
          )}
        </div>
      </div>
    );
  }

  const categories = await db.forumCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { threads: true } },
      threads: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: { author: { select: { username: true } } },
      },
    },
  });

  return (
    <div className="mt-8 space-y-6 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-radar">
            // Comms Channel
          </p>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-wider text-ink">
            Community Forum
          </h1>
        </div>
        <Link href="/forum/new" className="btn-primary">
          + New Thread
        </Link>
      </div>

      <SearchBox />

      <div className="card divide-y divide-line">
        {categories.map((cat) => {
          const latest = cat.threads[0];
          return (
            <Link
              key={cat.id}
              href={`/forum/${cat.slug}`}
              className="flex flex-col gap-2 p-5 hover:bg-raised/60 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-bold text-ink hover:text-hud">
                  {cat.name}
                </div>
                <div className="text-sm text-muted">{cat.description}</div>
              </div>
              <div className="flex shrink-0 items-center gap-6 font-mono text-xs text-muted">
                <span>{cat._count.threads} threads</span>
                {latest && (
                  <span className="hidden sm:inline">
                    latest: {latest.title.slice(0, 30)}
                    {latest.title.length > 30 ? "…" : ""} ·{" "}
                    {timeAgo(latest.updatedAt)}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SearchBox({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/forum" className="flex max-w-md gap-2">
      <input
        name="q"
        defaultValue={defaultValue ?? ""}
        placeholder="Search the forum…"
        className="input"
      />
      <button type="submit" className="btn-ghost">
        Search
      </button>
    </form>
  );
}
