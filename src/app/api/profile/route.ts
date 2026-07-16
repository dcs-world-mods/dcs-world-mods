import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { saveImage } from "@/lib/uploads";

const profileSchema = z.object({
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser();
    const form = await request.formData();

    const { bio } = profileSchema.parse({
      bio: form.get("bio") ?? undefined,
    });

    let avatarUrl: string | undefined;
    const avatar = form.get("avatar");
    if (avatar instanceof File && avatar.size > 0) {
      avatarUrl = await saveImage(avatar, "avatars");
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        ...(bio !== undefined ? { bio } : {}),
        ...(avatarUrl ? { avatarUrl } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
