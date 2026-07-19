import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Reported Conversation" };
export const dynamic = "force-dynamic";

// PRIVACY: private messages are only visible to admins when a message in the
// conversation has been reported. Without a report, this page refuses access.
export default async function ReportedConversationPage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = await params;

  // Access is gated on an actual report existing for this message.
  const report = await db.report.findFirst({
    where: { targetType: "MESSAGE", targetId: messageId },
    include: { reporter: { select: { username: true } } },
  });
  if (!report) notFound();

  const reported = await db.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: {
        include: {
          userA: { select: { id: true, username: true } },
          userB: { select: { id: true, username: true } },
        },
      },
    },
  });
  if (!reported) {
    return (
      <div className="card p-8 text-center text-sm text-muted">
        The reported message no longer exists (it may have been deleted).
      </div>
    );
  }

  // Context: up to 20 messages around the reported one.
  const messages = await db.message.findMany({
    where: { conversationId: reported.conversationId },
    orderBy: { createdAt: "asc" },
    take: 40,
    include: { sender: { select: { id: true, username: true } } },
  });

  const conv = reported.conversation;

  return (
    <div className="max-w-2xl space-y-6">
      <nav className="font-mono text-xs text-muted">
        <Link href="/admin/reports" className="hover:text-hud">Reports</Link>
        {" / "}
        <span className="text-ink">Reported conversation</span>
      </nav>

      <div className="card border-hud/40 p-4 text-sm">
        <p className="font-mono text-xs uppercase tracking-wider text-hud">
          ⚑ Reported by {report.reporter.username} · {timeAgo(report.createdAt)}
        </p>
        <p className="mt-1 text-ink/90">{report.reason}</p>
        <p className="mt-2 font-mono text-xs text-muted">
          Conversation between{" "}
          <Link href={`/admin/users/${conv.userA.id}`} className="text-radar hover:text-hud">
            {conv.userA.username}
          </Link>{" "}
          and{" "}
          <Link href={`/admin/users/${conv.userB.id}`} className="text-radar hover:text-hud">
            {conv.userB.username}
          </Link>
          . Shown only because a message was reported.
        </p>
      </div>

      <div className="card flex flex-col gap-3 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded border px-3 py-2 text-sm ${
              message.id === messageId
                ? "border-danger/60 bg-danger/10"
                : "border-line bg-raised"
            }`}
          >
            <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-muted">
              <span className="text-radar">{message.sender.username}</span>
              <span>
                {formatDate(message.createdAt)} · {timeAgo(message.createdAt)}
                {message.id === messageId && (
                  <span className="ml-2 text-danger">⚑ REPORTED</span>
                )}
              </span>
            </div>
            <p className="whitespace-pre-line text-ink/90">{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
