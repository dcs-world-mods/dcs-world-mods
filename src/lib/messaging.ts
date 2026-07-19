import "server-only";
import { db } from "./db";

/** Canonical pair ordering so each user pair has exactly one conversation. */
export function conversationPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function isBlockedEitherWay(
  userA: string,
  userB: string
): Promise<boolean> {
  const block = await db.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userA, blockedId: userB },
        { blockerId: userB, blockedId: userA },
      ],
    },
  });
  return Boolean(block);
}

export async function findOrCreateConversation(userA: string, userB: string) {
  const [a, b] = conversationPair(userA, userB);
  return db.conversation.upsert({
    where: { userAId_userBId: { userAId: a, userBId: b } },
    update: {},
    create: { userAId: a, userBId: b },
  });
}

/** True if this user participates in the conversation. */
export function isParticipant(
  conv: { userAId: string; userBId: string },
  userId: string
): boolean {
  return conv.userAId === userId || conv.userBId === userId;
}

/** The other participant's id. */
export function otherParty(
  conv: { userAId: string; userBId: string },
  userId: string
): string {
  return conv.userAId === userId ? conv.userBId : conv.userAId;
}

/** Cleared-at boundary for this user (messages before it are hidden). */
export function clearedAtFor(
  conv: { userAId: string; clearedAtA: Date | null; clearedAtB: Date | null },
  userId: string
): Date | null {
  return conv.userAId === userId ? conv.clearedAtA : conv.clearedAtB;
}

/** Consider a user online if seen within the last 5 minutes. */
export function isOnline(lastSeenAt: Date | null): boolean {
  return Boolean(lastSeenAt && Date.now() - lastSeenAt.getTime() < 5 * 60 * 1000);
}
