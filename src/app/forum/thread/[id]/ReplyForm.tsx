"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReplyForm({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/forum/threads/${threadId}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to post reply");
      return;
    }
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your reply…"
        className="input min-h-28"
        maxLength={20000}
        required
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? "Posting…" : "Post Reply"}
      </button>
    </form>
  );
}
