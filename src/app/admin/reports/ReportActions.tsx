"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "resolve" | "dismiss") {
    setBusy(true);
    await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button
        onClick={() => act("resolve")}
        disabled={busy}
        className="btn !border !border-ok/50 !px-3 !py-1 text-xs text-ok hover:!bg-ok/10"
      >
        ✓ Resolve
      </button>
      <button
        onClick={() => act("dismiss")}
        disabled={busy}
        className="btn-ghost !px-3 !py-1 text-xs"
      >
        Dismiss
      </button>
    </div>
  );
}
