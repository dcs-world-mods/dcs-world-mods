"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ModReviewActions({
  modId,
  pending,
}: {
  modId: string;
  pending: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function review(action: "approve" | "reject") {
    setBusy(true);
    await fetch(`/api/admin/mods/${modId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this mod permanently?")) return;
    setBusy(true);
    await fetch(`/api/admin/mods/${modId}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      {pending ? (
        <>
          <button
            onClick={() => review("approve")}
            disabled={busy}
            className="btn !border !border-ok/50 !px-3 !py-1 text-xs text-ok hover:!bg-ok/10"
          >
            ✓ Approve
          </button>
          <button
            onClick={() => review("reject")}
            disabled={busy}
            className="btn-danger !px-3 !py-1 text-xs"
          >
            ✕ Reject
          </button>
        </>
      ) : (
        <button onClick={remove} disabled={busy} className="btn-danger !px-3 !py-1 text-xs">
          Delete
        </button>
      )}
    </div>
  );
}
