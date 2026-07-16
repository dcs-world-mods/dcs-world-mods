import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { ModCard, type ModCardData } from "@/components/ModCard";
import { MOD_CATEGORIES, MOD_CATEGORY_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Mods Library" };
export const dynamic = "force-dynamic";

const SORTS = {
  newest: { createdAt: "desc" },
  downloads: { downloads: "desc" },
} as const;

export default async function ModsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const { q, category, sort } = await searchParams;
  const activeCategory = MOD_CATEGORIES.find((c) => c === category);
  const activeSort = sort === "downloads" ? "downloads" : "newest";

  const mods = await db.mod.findMany({
    where: {
      status: "APPROVED",
      ...(activeCategory ? { category: activeCategory } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { summary: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: SORTS[activeSort],
    take: 60,
    include: {
      author: { select: { username: true } },
      ratings: { select: { value: true } },
    },
  });

  const cards: ModCardData[] = mods.map((mod) => ({
    slug: mod.slug,
    title: mod.title,
    summary: mod.summary,
    version: mod.version,
    category: mod.category,
    imageUrl: mod.imageUrl,
    downloads: mod.downloads,
    author: mod.author,
    avgRating:
      mod.ratings.length > 0
        ? mod.ratings.reduce((sum, r) => sum + r.value, 0) / mod.ratings.length
        : 0,
    ratingCount: mod.ratings.length,
  }));

  const filterHref = (params: Record<string, string | undefined>) => {
    const merged = { q, category: activeCategory, sort: activeSort, ...params };
    const search = new URLSearchParams();
    if (merged.q) search.set("q", merged.q);
    if (merged.category) search.set("category", merged.category);
    if (merged.sort && merged.sort !== "newest") search.set("sort", merged.sort);
    const qs = search.toString();
    return qs ? `/mods?${qs}` : "/mods";
  };

  return (
    <div className="mt-8 space-y-8 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-radar">
            // Armory
          </p>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-wider text-ink">
            Mods Library
          </h1>
        </div>
        <Link href="/mods/upload" className="btn-primary">
          ⬆ Upload a Mod
        </Link>
      </div>

      {/* Search */}
      <form action="/mods" className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search mods…"
          className="input max-w-md"
        />
        {activeCategory && (
          <input type="hidden" name="category" value={activeCategory} />
        )}
        <button type="submit" className="btn-ghost">
          Search
        </button>
      </form>

      {/* Category filter + sort */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={filterHref({ category: undefined })}
          className={`hud-tag !normal-case ${!activeCategory ? "" : "!border-line !bg-transparent !text-muted hover:!text-hud"}`}
        >
          All
        </Link>
        {MOD_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={filterHref({ category: cat })}
            className={`hud-tag !normal-case ${activeCategory === cat ? "" : "!border-line !bg-transparent !text-muted hover:!text-hud"}`}
          >
            {MOD_CATEGORY_LABELS[cat]}
          </Link>
        ))}
        <span className="mx-2 hidden h-4 w-px bg-line sm:block" />
        <Link
          href={filterHref({ sort: "newest" })}
          className={`font-mono text-xs uppercase tracking-wider ${activeSort === "newest" ? "text-hud" : "text-muted hover:text-hud"}`}
        >
          Newest
        </Link>
        <Link
          href={filterHref({ sort: "downloads" })}
          className={`font-mono text-xs uppercase tracking-wider ${activeSort === "downloads" ? "text-hud" : "text-muted hover:text-hud"}`}
        >
          Most Downloaded
        </Link>
      </div>

      {cards.length === 0 ? (
        <div className="card p-16 text-center text-muted">
          No mods match your search.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((mod) => (
            <ModCard key={mod.slug} mod={mod} />
          ))}
        </div>
      )}
    </div>
  );
}
