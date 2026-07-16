import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { REPORT_TARGETS } from "@/lib/constants";

const reportSchema = z.object({
  targetType: z.enum(REPORT_TARGETS),
  targetId: z.string().min(1).max(64),
  reason: z.string().min(5, "Please describe the issue").max(1000),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const data = reportSchema.parse(await request.json());

    await db.report.create({
      data: { ...data, reporterId: user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
