import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const post = await db.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existing = await db.postLike.findUnique({
      where: { postId_userId: { postId: id, userId: user.id } },
    });

    if (existing) {
      await db.postLike.delete({ where: { id: existing.id } });
    } else {
      await db.postLike.create({ data: { postId: id, userId: user.id } });
    }

    const count = await db.postLike.count({ where: { postId: id } });
    return NextResponse.json({ ok: true, liked: !existing, count });
  } catch (error) {
    return handleApiError(error);
  }
}
