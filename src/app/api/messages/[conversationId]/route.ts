import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import {
  isBlockedEitherWay,
  isParticipant,
  otherParty,
} from "@/lib/messaging";

const replySchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(5000),
});

// Reply inside an existing conversation.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await requireUser();
    const { conversationId } = await params;
    const { content } = replySchema.parse(await request.json());

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation || !isParticipant(conversation, user.id)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    if (await isBlockedEitherWay(user.id, otherParty(conversation, user.id))) {
      return NextResponse.json(
        { error: "Messaging is not available with this user" },
        { status: 403 }
      );
    }

    await db.message.create({
      data: { conversationId, senderId: user.id, content },
    });
    await db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

// "Delete conversation" — hides existing messages for the requesting user only.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await requireUser();
    const { conversationId } = await params;

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation || !isParticipant(conversation, user.id)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    await db.conversation.update({
      where: { id: conversationId },
      data:
        conversation.userAId === user.id
          ? { clearedAtA: new Date() }
          : { clearedAtB: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
