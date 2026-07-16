import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { GUIDE_TAG_LABELS, type GuideTag } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await db.guide.findUnique({
    where: { slug },
    include: { author: { select: { username: true } } },
  });
  if (!guide) notFound();

  return (
    <div className="mx-auto mt-8 max-w-3xl space-y-6 pb-8">
      <nav className="font-mono text-xs text-muted">
        <Link href="/developers" className="hover:text-hud">Developer Hub</Link>
        {" / "}
        <span className="text-ink">{guide.title}</span>
      </nav>

      <div>
        <span className="hud-tag">
          {GUIDE_TAG_LABELS[guide.tag as GuideTag] ?? guide.tag}
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-wide text-ink">
          {guide.title}
        </h1>
        <p className="mt-2 font-mono text-xs text-muted">
          by <span className="text-radar">{guide.author.username}</span> ·{" "}
          {formatDate(guide.createdAt)}
        </p>
      </div>

      <article className="card whitespace-pre-line p-6 text-sm leading-relaxed text-ink/90">
        {guide.content}
      </article>
    </div>
  );
}
