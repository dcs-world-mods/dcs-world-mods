import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

const requestSchema = z.object({
  newUsername: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(24, "Username must be at most 24 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, _ and - allowed"),
});

// A user asks to change their username; an Owner must approve it.
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const { newUsername } = requestSchema.parse(await request.json());

    if (newUsername === user.username) {
      return NextResponse.json(
        { error: "That is already your username" },
        { status: 400 }
      );
    }

    const taken = await db.user.findUnique({ where: { username: newUsername } });
    if (taken) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    const open = await db.usernameChangeRequest.findFirst({
      where: { userId: user.id, status: "OPEN" },
    });
    if (open) {
      // Replace the previous pending request instead of stacking them.
      await db.usernameChangeRequest.update({
        where: { id: open.id },
        data: { newUsername },
      });
    } else {
      await db.usernameChangeRequest.create({
        data: { userId: user.id, newUsername },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
