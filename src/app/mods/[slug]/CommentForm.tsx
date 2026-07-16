"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CommentForm({ modId }: { modId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/mods/${modId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to post comment");
      return;
    }
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your experience with this mod…"
        className="input min-h-20"
        maxLength={2000}
        required
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" className="btn-ghost" disabled={busy}>
        {busy ? "Posting…" : "Post Comment"}
      </button>
    </form>
  );
}
