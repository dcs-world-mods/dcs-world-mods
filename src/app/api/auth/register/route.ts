import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(24, "Username must be at most 24 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, _ and - allowed"),
  email: z.string().email("Invalid email address").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = registerSchema.parse(body);

    const existing = await db.user.findFirst({
      where: {
        OR: [
          { username: { equals: username } },
          { email: { equals: email.toLowerCase() } },
        ],
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Username or email is already taken" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { username, email: email.toLowerCase(), passwordHash },
    });

    await createSession({
      userId: user.id,
      username: user.username,
      role: user.role as "USER",
    });

    return NextResponse.json({ ok: true, username: user.username });
  } catch (error) {
    return handleApiError(error);
  }
}
