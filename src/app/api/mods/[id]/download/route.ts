import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mod = await db.mod.findUnique({ where: { id } });
    if (!mod || mod.status !== "APPROVED") {
      return NextResponse.json({ error: "Mod not found" }, { status: 404 });
    }
    const url = mod.fileUrl ?? mod.externalUrl;
    if (!url) {
      return NextResponse.json({ error: "No download available" }, { status: 404 });
    }
    await db.mod.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    return handleApiError(error);
  }
}
