"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ASSIGNABLE_ROLES, ROLE_LABELS, type Role } from "@/lib/constants";

export function UserActions({
  userId,
  username,
  role,
  isSelf,
}: {
  userId: string;
  username: string;
  role: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setRole(newRole: string) {
    setBusy(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete user "${username}" and all their content?`)) return;
    setBusy(true);
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  // Owner accounts are immutable from the dashboard by design.
  if (isSelf || role === "ADMIN") {
    return (
      <span className="font-mono text-xs uppercase tracking-wider text-hud">
        Owner{isSelf ? " (you)" : ""}
      </span>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        disabled={busy}
        className="input !w-auto !py-1 text-xs"
      >
        {ASSIGNABLE_ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r as Role]}
          </option>
        ))}
      </select>
      <button onClick={remove} disabled={busy} className="btn-danger !px-2.5 !py-1 text-xs">
        Delete
      </button>
    </div>
  );
}
