import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

const postSchema = z.object({
  content: z.string().min(1, "Reply cannot be empty").max(20000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { content } = postSchema.parse(await request.json());

    const thread = await db.thread.findUnique({ where: { id } });
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    if (thread.locked && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Thread is locked" }, { status: 403 });
    }

    await db.post.create({
      data: { threadId: id, authorId: user.id, content },
    });
    // Bump the thread so it sorts to the top of its category.
    await db.thread.update({ where: { id }, data: { updatedAt: new Date() } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
