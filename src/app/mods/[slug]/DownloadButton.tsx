"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DownloadButton({
  modId,
  available,
}: {
  modId: string;
  available: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    const res = await fetch(`/api/mods/${modId}/download`, { method: "POST" });
    setBusy(false);
    if (!res.ok) return;
    const data = await res.json();
    window.open(data.url, "_blank");
    router.refresh();
  }

  if (!available) {
    return (
      <button disabled className="btn-secondary w-full cursor-default text-base opacity-80">
        🔜 Coming Soon
      </button>
    );
  }

  return (
    <button
      onClick={download}
      disabled={busy}
      className="btn-primary w-full text-base"
    >
      ⬇ {busy ? "Preparing…" : "Download"}
    </button>
  );
}
