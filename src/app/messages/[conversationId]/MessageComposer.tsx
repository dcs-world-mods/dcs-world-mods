"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/messages/${conversationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to send");
      return;
    }
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card flex items-end gap-2 p-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
        placeholder="Type a message… (Enter to send, Shift+Enter for a new line)"
        className="input min-h-12 flex-1"
        maxLength={5000}
        required
      />
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? "…" : "Send"}
      </button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </form>
  );
}
