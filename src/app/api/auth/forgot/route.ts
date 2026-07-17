import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api";
import { isEmailEnabled, sendMail } from "@/lib/email";
import { SITE_NAME } from "@/lib/constants";

const forgotSchema = z.object({
  email: z.string().email().max(254),
});

const CODE_TTL_MINUTES = 15;

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    if (!isEmailEnabled()) {
      return NextResponse.json(
        { error: "Password reset by email is not configured yet. Please contact an admin on Discord." },
        { status: 503 }
      );
    }

    const { email } = forgotSchema.parse(await request.json());
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always answer OK so attackers can't probe which emails are registered.
    if (!user) return NextResponse.json({ ok: true });

    // Basic rate limit: one code per minute per user.
    const recent = await db.passwordResetCode.findFirst({
      where: {
        userId: user.id,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
    });
    if (recent) return NextResponse.json({ ok: true });

    const code = crypto.randomInt(100000, 1000000).toString();
    await db.passwordResetCode.deleteMany({ where: { userId: user.id } });
    await db.passwordResetCode.create({
      data: {
        userId: user.id,
        codeHash: hashCode(code),
        expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
      },
    });

    await sendMail(
      user.email,
      `${SITE_NAME} — Password reset code`,
      `Hello ${user.username},\n\n` +
        `Your password reset code is:\n\n    ${code}\n\n` +
        `It expires in ${CODE_TTL_MINUTES} minutes. ` +
        `If you didn't request this, you can safely ignore this email.\n\n` +
        `— ${SITE_NAME}`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
