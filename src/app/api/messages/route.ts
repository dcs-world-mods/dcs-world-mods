import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import {
  findOrCreateConversation,
  isBlockedEitherWay,
} from "@/lib/messaging";

const sendSchema = z.object({
  toUsername: z.string().min(1).max(24),
  content: z.string().min(1, "Message cannot be empty").max(5000),
});

// Start (or continue) a conversation with another user.
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const { toUsername, content } = sendSchema.parse(await request.json());

    const target = await db.user.findUnique({
      where: { username: toUsername },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (target.id === user.id) {
      return NextResponse.json(
        { error: "You cannot message yourself" },
        { status: 400 }
      );
    }
    if (await isBlockedEitherWay(user.id, target.id)) {
      return NextResponse.json(
        { error: "Messaging is not available with this user" },
        { status: 403 }
      );
    }

    const conversation = await findOrCreateConversation(user.id, target.id);
    await db.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        content,
      },
    });
    await db.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true, conversationId: conversation.id });
  } catch (error) {
    return handleApiError(error);
  }
}
