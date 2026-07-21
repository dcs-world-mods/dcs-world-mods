import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { GUIDE_TAG_LABELS, SOCIAL, type GuideTag } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Developer Hub",
  description:
    "Guides, Lua scripting tips and tooling for building DCS World mods.",
};
export const dynamic = "force-dynamic";

export default async function DevelopersPage() {
  const guides = await db.guide.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { username: true } } },
  });

  const grouped = Object.entries(GUIDE_TAG_LABELS).map(([tag, label]) => ({
    tag,
    label,
    guides: guides.filter((g) => g.tag === tag),
  }));

  return (
    <div className="mt-8 space-y-10 pb-8">
      <section className="hud-corners rounded-lg border border-line bg-surface/60 px-6 py-12 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-radar">
          // Engineering Bay
        </p>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-wider text-ink sm:text-5xl">
          Developer <span className="text-hud">Hub</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted">
          Guides, Lua scripting tips, tooling and a place to showcase your
          projects. Built by modders, for modders.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/forum/mod-development" className="btn-primary">
            Mod Development Forum
          </Link>
          <a
            href={SOCIAL.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Get Help on Discord
          </a>
        </div>
      </section>

      {grouped.map((group) => (
        <section key={group.tag}>
          <h2 className="section-title mb-5">{group.label}</h2>
          {group.guides.length === 0 ? (
            <p className="text-sm text-muted">No guides in this section yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.guides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/developers/${guide.slug}`}
                  className="card group p-5 transition-colors hover:border-hud/60"
                >
                  <span className="hud-tag">
                    {GUIDE_TAG_LABELS[guide.tag as GuideTag] ?? guide.tag}
                  </span>
                  <h3 className="mt-3 font-bold text-ink group-hover:text-hud">
                    {guide.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {guide.summary}
                  </p>
                  <p className="mt-3 font-mono text-xs text-muted">
                    by <span className="text-radar">{guide.author.username}</span>{" "}
                    · {timeAgo(guide.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
