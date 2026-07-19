import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { getAutomodSettings, setAutomodSettings } from "@/lib/settings";

const settingsSchema = z.object({
  warningsForSuspension: z.number().int().min(1).max(100),
  suspensionDays: z.number().int().min(1).max(365),
  warningsForBan: z.number().int().min(1).max(100),
});

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await getAutomodSettings());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const settings = settingsSchema.parse(await request.json());
    await setAutomodSettings(settings);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
