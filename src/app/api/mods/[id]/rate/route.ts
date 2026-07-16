import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

const rateSchema = z.object({ value: z.number().int().min(1).max(5) });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { value } = rateSchema.parse(await request.json());

    const mod = await db.mod.findUnique({ where: { id } });
    if (!mod || mod.status !== "APPROVED") {
      return NextResponse.json({ error: "Mod not found" }, { status: 404 });
    }

    await db.modRating.upsert({
      where: { modId_userId: { modId: id, userId: user.id } },
      create: { modId: id, userId: user.id, value },
      update: { value },
    });

    const agg = await db.modRating.aggregate({
      where: { modId: id },
      _avg: { value: true },
      _count: true,
    });

    return NextResponse.json({
      ok: true,
      average: agg._avg.value ?? 0,
      count: agg._count,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
