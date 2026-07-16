import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

const moderateSchema = z.object({
  action: z.enum(["pin", "unpin", "lock", "unlock", "delete"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { action } = moderateSchema.parse(await request.json());

    const thread = await db.thread.findUnique({ where: { id } });
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    if (action === "delete") {
      await db.thread.delete({ where: { id } });
    } else {
      await db.thread.update({
        where: { id },
        data:
          action === "pin" || action === "unpin"
            ? { pinned: action === "pin" }
            : { locked: action === "lock" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
