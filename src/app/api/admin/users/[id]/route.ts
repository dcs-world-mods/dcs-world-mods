import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { ASSIGNABLE_ROLES } from "@/lib/constants";

// Owner (ADMIN) can never be granted here — only via `npm run set-owner`.
const updateSchema = z.object({ role: z.enum(ASSIGNABLE_ROLES) });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const { role } = updateSchema.parse(await request.json());

    if (id === admin.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    const target = await db.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (target.role === "ADMIN") {
      return NextResponse.json(
        { error: "Owner accounts cannot be modified from the dashboard" },
        { status: 403 }
      );
    }

    await db.user.update({ where: { id }, data: { role } });
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
    const admin = await requireAdmin();
    const { id } = await params;

    if (id === admin.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const target = await db.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (target.role === "ADMIN") {
      return NextResponse.json(
        { error: "Owner accounts cannot be deleted from the dashboard" },
        { status: 403 }
      );
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
