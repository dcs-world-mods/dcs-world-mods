"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UsernameRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/username-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Action failed");
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-danger">{error}</span>}
      <button
        onClick={() => act("approve")}
        disabled={busy}
        className="btn !border !border-ok/50 !px-3 !py-1 text-xs text-ok hover:!bg-ok/10"
      >
        ✓ Approve
      </button>
      <button
        onClick={() => act("reject")}
        disabled={busy}
        className="btn-danger !px-3 !py-1 text-xs"
      >
        ✕ Reject
      </button>
    </div>
  );
}
