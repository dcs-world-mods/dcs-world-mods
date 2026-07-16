import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

const threadSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(5, "Title must be at least 5 characters").max(150),
  content: z.string().min(10, "Post must be at least 10 characters").max(20000),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const { categoryId, title, content } = threadSchema.parse(
      await request.json()
    );

    const category = await db.forumCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const thread = await db.thread.create({
      data: {
        title,
        categoryId,
        authorId: user.id,
        posts: { create: { content, authorId: user.id } },
      },
    });

    return NextResponse.json({ ok: true, threadId: thread.id });
  } catch (error) {
    return handleApiError(error);
  }
}
