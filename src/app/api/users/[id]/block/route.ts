import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

// Toggle blocking a user (stops private messages both ways).
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    if (id === user.id) {
      return NextResponse.json(
        { error: "You cannot block yourself" },
        { status: 400 }
      );
    }
    const target = await db.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await db.userBlock.findUnique({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: id } },
    });

    if (existing) {
      await db.userBlock.delete({ where: { id: existing.id } });
    } else {
      await db.userBlock.create({
        data: { blockerId: user.id, blockedId: id },
      });
    }

    return NextResponse.json({ ok: true, blocked: !existing });
  } catch (error) {
    return handleApiError(error);
  }
}
