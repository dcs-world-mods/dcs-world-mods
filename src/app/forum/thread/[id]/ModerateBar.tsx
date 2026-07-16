"use client";

import { useRouter } from "next/navigation";

export function ModerateBar({
  threadId,
  pinned,
  locked,
  categorySlug,
}: {
  threadId: string;
  pinned: boolean;
  locked: boolean;
  categorySlug: string;
}) {
  const router = useRouter();

  async function act(action: string) {
    if (action === "delete" && !confirm("Delete this thread permanently?")) {
      return;
    }
    const res = await fetch(`/api/forum/threads/${threadId}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      if (action === "delete") {
        router.push(`/forum/${categorySlug}`);
      }
      router.refresh();
    }
  }

  return (
    <div className="card flex flex-wrap items-center gap-2 border-hud/30 p-3">
      <span className="font-mono text-xs uppercase tracking-wider text-hud">
        Admin:
      </span>
      <button onClick={() => act(pinned ? "unpin" : "pin")} className="btn-ghost !px-3 !py-1 text-xs">
        {pinned ? "Unpin" : "Pin"}
      </button>
      <button onClick={() => act(locked ? "unlock" : "lock")} className="btn-ghost !px-3 !py-1 text-xs">
        {locked ? "Unlock" : "Lock"}
      </button>
      <button onClick={() => act("delete")} className="btn-danger !px-3 !py-1 text-xs">
        Delete
      </button>
    </div>
  );
}
