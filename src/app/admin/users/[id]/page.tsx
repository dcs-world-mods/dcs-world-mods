import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Avatar } from "@/components/Avatar";
import { RoleBadge } from "@/components/RoleBadge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { formatDate, timeAgo } from "@/lib/utils";
import { ModerateForm } from "./ModerateForm";

export const metadata: Metadata = { title: "Moderate User" };
export const dynamic = "force-dynamic";

const TYPE_STYLES: Record<string, string> = {
  WARNING: "text-hud",
  SUSPENSION: "text-danger",
  BAN: "text-danger",
  UNBAN: "text-ok",
};

const TYPE_ICONS: Record<string, string> = {
  WARNING: "⚠",
  SUSPENSION: "🟡",
  BAN: "🔴",
  UNBAN: "✅",
};

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: {
      moderationReceived: { orderBy: { createdAt: "desc" } },
      _count: { select: { mods: true, posts: true } },
    },
  });
  if (!user) notFound();

  const history = user.moderationReceived;
  const warnings = history.filter((h) => h.type === "WARNING").length;
  const suspensions = history.filter((h) => h.type === "SUSPENSION").length;
  const bans = history.filter((h) => h.type === "BAN").length;

  const suspended =
    user.suspendedUntil && user.suspendedUntil > new Date()
      ? user.suspendedUntil
      : null;

  return (
    <div className="space-y-6">
      <nav className="font-mono text-xs text-muted">
        <Link href="/admin/users" className="hover:text-hud">Users</Link>
        {" / "}
        <span className="text-ink">{user.username}</span>
      </nav>

      {/* User summary */}
      <div className="card flex flex-wrap items-center gap-4 p-6">
        <Avatar username={user.username} avatarUrl={user.avatarUrl} size="lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-black text-ink">{user.username}</span>
            {user.verified && <VerifiedBadge size={18} />}
            <RoleBadge role={user.role} />
            {user.banned && (
              <span className="hud-tag !border-danger/60 !bg-danger/10 !text-danger">
                🔴 Banned
              </span>
            )}
            {!user.banned && suspended && (
              <span className="hud-tag">
                🟡 Suspended until {formatDate(suspended)}
              </span>
            )}
            {!user.banned && !suspended && (
              <span className="hud-tag !border-ok/50 !text-ok">Active</span>
            )}
          </div>
          <p className="mt-1 font-mono text-xs text-muted">
            {user.email} · joined {formatDate(user.createdAt)} ·{" "}
            {user._count.mods} mods · {user._count.posts} posts
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 font-mono text-center">
          {[
            { value: warnings, label: "Warnings" },
            { value: suspensions, label: "Suspensions" },
            { value: bans, label: "Bans" },
          ].map((stat) => (
            <div key={stat.label} className="rounded border border-line px-4 py-2">
              <div className="text-xl font-bold text-hud">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {user.role !== "ADMIN" ? (
        <section className="card p-6">
          <h2 className="section-title mb-4">Take Action</h2>
          <ModerateForm userId={user.id} banned={user.banned} />
        </section>
      ) : (
        <p className="card p-4 font-mono text-sm text-muted">
          Owner accounts cannot be moderated.
        </p>
      )}

      {/* History */}
      <section>
        <h2 className="section-title mb-4">
          Punishment History ({history.length})
        </h2>
        <div className="card divide-y divide-line">
          {history.length === 0 && (
            <p className="p-8 text-center text-sm text-muted">
              Clean record — no moderation actions.
            </p>
          )}
          {history.map((action) => (
            <div key={action.id} className="flex flex-col gap-1 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-mono text-sm font-bold ${TYPE_STYLES[action.type] ?? "text-ink"}`}>
                  {TYPE_ICONS[action.type] ?? ""} {action.type}
                </span>
                {action.expiresAt && (
                  <span className="font-mono text-xs text-muted">
                    until {formatDate(action.expiresAt)}
                  </span>
                )}
                <span className="ml-auto font-mono text-xs text-muted">
                  by <span className="text-radar">{action.adminName}</span> ·{" "}
                  {formatDate(action.createdAt)} ({timeAgo(action.createdAt)})
                </span>
              </div>
              <p className="text-sm text-ink/90">{action.reason}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
