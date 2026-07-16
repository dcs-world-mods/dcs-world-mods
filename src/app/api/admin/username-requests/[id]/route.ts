import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { action } = reviewSchema.parse(await request.json());

    const req = await db.usernameChangeRequest.findUnique({ where: { id } });
    if (!req || req.status !== "OPEN") {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "reject") {
      await db.usernameChangeRequest.update({
        where: { id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ ok: true });
    }

    // Approve: the name may have been taken since the request was filed.
    const taken = await db.user.findUnique({
      where: { username: req.newUsername },
    });
    if (taken) {
      await db.usernameChangeRequest.update({
        where: { id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json(
        { error: "Username is no longer available — request rejected" },
        { status: 409 }
      );
    }

    await db.$transaction([
      db.user.update({
        where: { id: req.userId },
        data: { username: req.newUsername },
      }),
      db.usernameChangeRequest.update({
        where: { id },
        data: { status: "APPROVED" },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
