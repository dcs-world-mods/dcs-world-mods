import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { content } = commentSchema.parse(await request.json());

    const mod = await db.mod.findUnique({ where: { id } });
    if (!mod || mod.status !== "APPROVED") {
      return NextResponse.json({ error: "Mod not found" }, { status: 404 });
    }

    await db.modComment.create({
      data: { modId: id, userId: user.id, content },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
