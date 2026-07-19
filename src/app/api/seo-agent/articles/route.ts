import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidSeoAgentApiKey } from "@/lib/seoAgent";

/**
 * Public read API for the site's News/articles, gated by a bearer API key.
 * Configure the caller with: Authorization: Bearer <SEO_AGENT_API_KEY>
 */
export async function GET(request: NextRequest) {
  if (!isValidSeoAgentApiKey(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articles = await db.newsItem.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      slug: true,
      title: true,
      summary: true,
      content: true,
      isHtml: true,
      source: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const base = (process.env.APP_URL ?? request.nextUrl.origin).replace(/\/$/, "");

  return NextResponse.json({
    articles: articles.map((a) => ({
      title: a.title,
      slug: a.slug,
      summary: a.summary,
      html: a.isHtml ? a.content : undefined,
      text: a.isHtml ? undefined : a.content,
      source: a.source,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      url: a.slug ? `${base}/news/${a.slug}` : null,
    })),
  });
}
