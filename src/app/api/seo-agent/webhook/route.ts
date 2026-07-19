import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { sanitizeArticleHtml, verifySeoAgentSignature } from "@/lib/seoAgent";

/**
 * Receives published articles from the SEO Agent webhook and publishes them
 * to the site's News section. Configure in SEO Agent as:
 *   URL: https://<your-domain>/api/seo-agent/webhook
 *   Signing secret: SEO_AGENT_WEBHOOK_SECRET (env var, same value on both sides)
 *
 * Expected JSON body (aliases accepted for resilience against schema drift):
 *   { title: string, html|content|body: string, slug?: string, summary|excerpt?: string }
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-seo-agent-signature");

  if (!verifySeoAgentSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const rawHtml =
    (typeof payload.html === "string" && payload.html) ||
    (typeof payload.content === "string" && payload.content) ||
    (typeof payload.body === "string" && payload.body) ||
    "";
  const summary =
    (typeof payload.summary === "string" && payload.summary) ||
    (typeof payload.excerpt === "string" && payload.excerpt) ||
    undefined;

  // Connectivity/test pings from the SEO Agent dashboard: acknowledge without publishing.
  if (!title || !rawHtml) {
    return NextResponse.json({ ok: true, received: true, published: false });
  }

  const owner = await db.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });
  if (!owner) {
    return NextResponse.json(
      { error: "No site owner account exists to attribute this article to" },
      { status: 500 }
    );
  }

  const requestedSlug =
    typeof payload.slug === "string" && payload.slug
      ? slugify(payload.slug)
      : slugify(title);
  let slug = requestedSlug || "article";
  for (let i = 2; await db.newsItem.findUnique({ where: { slug } }); i++) {
    slug = `${requestedSlug}-${i}`;
  }

  const article = await db.newsItem.create({
    data: {
      title,
      slug,
      summary: summary?.slice(0, 300),
      content: sanitizeArticleHtml(rawHtml),
      isHtml: true,
      source: "SEO_AGENT",
      authorId: owner.id,
    },
  });

  return NextResponse.json({
    ok: true,
    published: true,
    slug: article.slug,
    url: `/news/${article.slug}`,
  });
}
