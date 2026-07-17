import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api";

const resetSchema = z.object({
  email: z.string().email().max(254),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const MAX_ATTEMPTS = 5;

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = resetSchema.parse(await request.json());

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    const invalid = NextResponse.json(
      { error: "Invalid or expired code" },
      { status: 400 }
    );
    if (!user) return invalid;

    const reset = await db.passwordResetCode.findFirst({
      where: { userId: user.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!reset || reset.attempts >= MAX_ATTEMPTS) return invalid;

    if (reset.codeHash !== hashCode(code)) {
      await db.passwordResetCode.update({
        where: { id: reset.id },
        data: { attempts: { increment: 1 } },
      });
      return invalid;
    }

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(newPassword, 12) },
      }),
      db.passwordResetCode.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
