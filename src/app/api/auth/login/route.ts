import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import type { Role } from "@/lib/constants";

const loginSchema = z.object({
  identifier: z.string().min(1, "Username or email is required").max(254),
  password: z.string().min(1, "Password is required").max(128),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = loginSchema.parse(body);

    const user = await db.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier.toLowerCase() }],
      },
    });

    // Same error for unknown user and wrong password (no user enumeration).
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.id,
      username: user.username,
      role: user.role as Role,
    });

    return NextResponse.json({ ok: true, username: user.username });
  } catch (error) {
    return handleApiError(error);
  }
}
