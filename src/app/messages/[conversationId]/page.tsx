import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { ReportButton } from "@/components/ReportButton";
import { timeAgo } from "@/lib/utils";
import { clearedAtFor, isOnline, isParticipant } from "@/lib/messaging";
import { MessageComposer } from "./MessageComposer";
import { ConversationActions } from "./ConversationActions";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { conversationId } = await params;

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      userA: {
        select: { id: true, username: true, avatarUrl: true, lastSeenAt: true },
      },
      userB: {
        select: { id: true, username: true, avatarUrl: true, lastSeenAt: true },
      },
    },
  });
  if (!conversation || !isParticipant(conversation, user.id)) notFound();

  const other =
    conversation.userAId === user.id ? conversation.userB : conversation.userA;
  const cleared = clearedAtFor(conversation, user.id);

  const messages = await db.message.findMany({
    where: {
      conversationId,
      ...(cleared ? { createdAt: { gt: cleared } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  // Opening the thread marks incoming messages as read.
  await db.message.updateMany({
    where: { conversationId, senderId: { not: user.id }, readAt: null },
    data: { readAt: new Date() },
  });

  const blocked = await db.userBlock.findUnique({
    where: {
      blockerId_blockedId: { blockerId: user.id, blockedId: other.id },
    },
  });

  return (
    <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-4 pb-8">
      <nav className="font-mono text-xs text-muted">
        <Link href="/messages" className="hover:text-hud">Messages</Link>
        {" / "}
        <span className="text-ink">{other.username}</span>
      </nav>

      {/* Header */}
      <div className="card flex items-center justify-between gap-3 p-4">
        <Link
          href={`/profile/${other.username}`}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <Avatar username={other.username} avatarUrl={other.avatarUrl} />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface ${
                isOnline(other.lastSeenAt) ? "bg-ok" : "bg-line"
              }`}
            />
          </div>
          <div>
            <div className="font-semibold text-ink hover:text-hud">
              {other.username}
            </div>
            <div className="font-mono text-xs text-muted">
              {isOnline(other.lastSeenAt) ? "🟢 Online" : "⚫ Offline"}
            </div>
          </div>
        </Link>
        <ConversationActions
          conversationId={conversation.id}
          otherUserId={other.id}
          otherUsername={other.username}
          initiallyBlocked={Boolean(blocked)}
        />
      </div>

      {/* Messages */}
      <div className="card flex flex-col gap-3 p-4">
        {messages.length === 0 && (
          <p className="p-6 text-center text-sm text-muted">
            No messages here yet — say hi!
          </p>
        )}
        {messages.map((message) => {
          const mine = message.senderId === user.id;
          return (
            <div
              key={message.id}
              className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-line rounded-lg border px-3 py-2 text-sm ${
                  mine
                    ? "border-hud/40 bg-hud/10 text-ink"
                    : "border-line bg-raised text-ink/90"
                }`}
              >
                {message.content}
              </div>
              <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-muted">
                <span>{timeAgo(message.createdAt)}</span>
                {mine && message.readAt && <span className="text-radar">✓✓ read</span>}
                {!mine && (
                  <ReportButton targetType="MESSAGE" targetId={message.id} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {blocked ? (
        <p className="card p-4 text-center font-mono text-sm text-muted">
          You blocked this user — unblock to continue the conversation.
        </p>
      ) : (
        <MessageComposer conversationId={conversation.id} />
      )}
    </div>
  );
}
