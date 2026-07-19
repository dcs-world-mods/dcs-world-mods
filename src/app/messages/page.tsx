import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { timeAgo } from "@/lib/utils";
import { clearedAtFor, isOnline, otherParty } from "@/lib/messaging";
import { NewMessageForm } from "./NewMessageForm";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; to?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { q, to } = await searchParams;

  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ userAId: user.id }, { userBId: user.id }],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      userA: {
        select: { id: true, username: true, avatarUrl: true, lastSeenAt: true },
      },
      userB: {
        select: { id: true, username: true, avatarUrl: true, lastSeenAt: true },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const rows = (
    await Promise.all(
      conversations.map(async (conv) => {
        const other = conv.userAId === user.id ? conv.userB : conv.userA;
        const cleared = clearedAtFor(conv, user.id);
        const last = conv.messages[0];
        // Hidden entirely if the user cleared it and nothing new arrived since.
        if (!last || (cleared && last.createdAt <= cleared)) return null;
        const unread = await db.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: user.id },
            readAt: null,
            ...(cleared ? { createdAt: { gt: cleared } } : {}),
          },
        });
        return { conv, other, last, unread };
      })
    )
  ).filter((r): r is NonNullable<typeof r> => r !== null);

  const filtered = q
    ? rows.filter((r) =>
        r.other.username.toLowerCase().includes(q.toLowerCase())
      )
    : rows;

  return (
    <div className="mx-auto mt-8 max-w-2xl space-y-6 pb-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-radar">
          // Secure Comms
        </p>
        <h1 className="mt-1 text-3xl font-black uppercase tracking-wider text-ink">
          Messages
        </h1>
      </div>

      <NewMessageForm initialTo={to ?? ""} />

      <form action="/messages" className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search conversations…"
          className="input"
        />
        <button type="submit" className="btn-ghost">Search</button>
      </form>

      <div className="card divide-y divide-line">
        {filtered.length === 0 && (
          <p className="p-10 text-center text-sm text-muted">
            No conversations yet. Send a message to a fellow pilot above, or
            from their profile page.
          </p>
        )}
        {filtered.map(({ conv, other, last, unread }) => (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className="flex items-center gap-3 p-4 hover:bg-raised/60"
          >
            <div className="relative">
              <Avatar username={other.username} avatarUrl={other.avatarUrl} />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface ${
                  isOnline(other.lastSeenAt) ? "bg-ok" : "bg-line"
                }`}
                title={isOnline(other.lastSeenAt) ? "Online" : "Offline"}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${unread > 0 ? "text-hud" : "text-ink"}`}>
                  {other.username}
                </span>
                {unread > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-hud px-1 font-mono text-[10px] font-bold text-[#0a0e14]">
                    {unread}
                  </span>
                )}
              </div>
              <p className={`truncate text-sm ${unread > 0 ? "text-ink" : "text-muted"}`}>
                {last.senderId === user.id ? "You: " : ""}
                {last.content}
              </p>
            </div>
            <span className="shrink-0 font-mono text-xs text-muted">
              {timeAgo(last.createdAt)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
