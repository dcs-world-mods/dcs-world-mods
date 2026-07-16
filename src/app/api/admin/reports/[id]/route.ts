import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

const resolveSchema = z.object({
  action: z.enum(["resolve", "dismiss"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { action } = resolveSchema.parse(await request.json());

    await db.report.update({
      where: { id },
      data: { status: action === "resolve" ? "RESOLVED" : "DISMISSED" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
