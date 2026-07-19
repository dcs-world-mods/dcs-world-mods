import Link from "next/link";
import { db } from "@/lib/db";
import { SITE_NAME, SITE_TAGLINE, SOCIAL } from "@/lib/constants";
import { ModCard, type ModCardData } from "@/components/ModCard";
import { Avatar } from "@/components/Avatar";
import { stripHtml, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [mods, news, stats] = await Promise.all([
    db.mod.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        author: { select: { username: true } },
        ratings: { select: { value: true } },
      },
    }),
    db.newsItem.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        author: { select: { username: true, avatarUrl: true } },
      },
    }),
    Promise.all([
      db.user.count(),
      db.mod.count({ where: { status: "APPROVED" } }),
      db.thread.count(),
    ]),
  ]);

  const [userCount, modCount, threadCount] = stats;

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

  return (
    <div className="space-y-16 pb-8">
      {/* Hero */}
      <section className="hud-corners relative mt-8 overflow-hidden rounded-lg border border-line px-6 py-16 text-center sm:py-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-launch.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-base/60 via-base/40 to-base/90" />
        <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" className="mx-auto h-20 w-20 sm:h-24 sm:w-24" />
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.4em] text-radar">
          // Community Operations Center
        </p>
        <h1 className="mt-4 text-4xl font-black uppercase tracking-wider text-ink sm:text-6xl">
          DCS <span className="text-hud">World Mods</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg">
          {SITE_TAGLINE}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={SOCIAL.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            ⌬ Join Discord
          </a>
          <a
            href={SOCIAL.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            ▶ Watch YouTube
          </a>
          <Link href="/mods" className="btn-ghost">
            ✈ Explore Mods
          </Link>
        </div>
        <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4 font-mono">
          {[
            { value: userCount, label: "Pilots" },
            { value: modCount, label: "Mods" },
            { value: threadCount, label: "Threads" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-hud">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Latest mods */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="section-title">Latest Mods</h2>
          <Link href="/mods" className="font-mono text-sm text-radar hover:text-hud">
            View all →
          </Link>
        </div>
        {cards.length === 0 ? (
          <div className="card p-10 text-center text-muted">
            No mods published yet — be the first to{" "}
            <Link href="/mods/upload" className="text-hud hover:underline">
              upload one
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((mod) => (
              <ModCard key={mod.slug} mod={mod} />
            ))}
          </div>
        )}
      </section>

      {/* News + community */}
      <section className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="section-title">News &amp; Updates</h2>
            <Link href="/news" className="font-mono text-sm text-radar hover:text-hud">
              View all →
            </Link>
          </div>
          {news.length === 0 ? (
            <div className="card p-10 text-center text-muted">
              No news posted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => {
                const preview = item.isHtml
                  ? stripHtml(item.content)
                  : item.content;
                return (
                  <Link
                    key={item.id}
                    href={item.slug ? `/news/${item.slug}` : "/news"}
                    className="card block p-5 transition-colors hover:border-hud/60"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <Avatar
                        username={item.author.username}
                        avatarUrl={item.author.avatarUrl}
                        size="sm"
                      />
                      <span className="text-sm text-radar">
                        {item.author.username}
                      </span>
                      <span className="font-mono text-xs text-muted">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-bold text-ink">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {item.summary ?? preview}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <h2 className="section-title mb-6">Join the Squadron</h2>
          <div className="card hud-corners space-y-4 p-6">
            <p className="text-sm text-muted">
              {SITE_NAME} is home to mod developers, mission builders and
              virtual pilots. Get help, share your work, and fly with us.
            </p>
            <a
              href={SOCIAL.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full"
            >
              Join our Discord Community
            </a>
            <a
              href={SOCIAL.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full"
            >
              Subscribe on YouTube
            </a>
            <Link href="/register" className="btn-ghost w-full">
              Create an Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
