import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { formatDate } from "@/lib/utils";
import { UserActions } from "./UserActions";
import { UsernameRequestActions } from "./UsernameRequestActions";

export const metadata: Metadata = { title: "Manage Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await getCurrentUser();
  const [users, usernameRequests] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { mods: true, posts: true } } },
    }),
    db.usernameChangeRequest.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { username: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      {usernameRequests.length > 0 && (
        <section>
          <h2 className="section-title mb-4">
            Username Change Requests ({usernameRequests.length})
          </h2>
          <div className="card divide-y divide-line">
            {usernameRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <span className="text-sm text-ink">
                  <span className="font-semibold text-radar">
                    {req.user.username}
                  </span>{" "}
                  → <span className="font-semibold text-hud">{req.newUsername}</span>
                </span>
                <UsernameRequestActions requestId={req.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="card overflow-x-auto">
      <table className="w-full min-w-160 text-sm">
        <thead>
          <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-wider text-muted">
            <th className="p-4">User</th>
            <th className="p-4">Email</th>
            <th className="p-4">Joined</th>
            <th className="p-4">Activity</th>
            <th className="p-4">Role</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Avatar username={user.username} avatarUrl={user.avatarUrl} size="sm" />
                  <span className="font-semibold text-ink">{user.username}</span>
                </div>
              </td>
              <td className="p-4 text-muted">{user.email}</td>
              <td className="p-4 font-mono text-xs text-muted">
                {formatDate(user.createdAt)}
              </td>
              <td className="p-4 font-mono text-xs text-muted">
                {user._count.mods} mods · {user._count.posts} posts
              </td>
              <td className="p-4" colSpan={2}>
                <UserActions
                  userId={user.id}
                  username={user.username}
                  role={user.role}
                  isSelf={user.id === admin?.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
