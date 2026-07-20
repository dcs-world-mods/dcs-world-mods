import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

const updateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  summary: z.string().max(300).optional(),
  content: z.string().min(10, "Content must be at least 10 characters").max(20000),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { title, summary, content } = updateSchema.parse(await request.json());

    const existing = await db.newsItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "News item not found" }, { status: 404 });
    }

    await db.newsItem.update({
      where: { id },
      data: { title, summary: summary || null, content },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.newsItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
