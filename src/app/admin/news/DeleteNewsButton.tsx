"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteNewsButton({ newsId }: { newsId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm("Delete this news post permanently?")) return;
    setBusy(true);
    await fetch(`/api/admin/news/${newsId}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button onClick={remove} disabled={busy} className="btn-danger !px-3 !py-1 text-xs">
      Delete
    </button>
  );
}
