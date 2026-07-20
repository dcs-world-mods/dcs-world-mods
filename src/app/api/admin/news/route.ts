import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { slugify } from "@/lib/utils";

const createSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  summary: z.string().max(300).optional(),
  content: z.string().min(10, "Content must be at least 10 characters").max(20000),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { title, summary, content } = createSchema.parse(await request.json());

    const base = slugify(title) || "news";
    let slug = base;
    for (let i = 2; await db.newsItem.findUnique({ where: { slug } }); i++) {
      slug = `${base}-${i}`;
    }

    const item = await db.newsItem.create({
      data: {
        title,
        slug,
        summary: summary || undefined,
        content,
        isHtml: false,
        source: "MANUAL",
        authorId: admin.id,
      },
    });

    return NextResponse.json({ ok: true, slug: item.slug });
  } catch (error) {
    return handleApiError(error);
  }
}
