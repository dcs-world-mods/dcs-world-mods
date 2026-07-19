"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewMessageForm({ initialTo = "" }: { initialTo?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(initialTo));
  const [toUsername, setToUsername] = useState(initialTo);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUsername, content }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to send");
      return;
    }
    const data = await res.json();
    router.push(`/messages/${data.conversationId}`);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        ✉ New Message
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-5">
      <div>
        <label className="label" htmlFor="toUsername">To (username)</label>
        <input
          id="toUsername"
          value={toUsername}
          onChange={(e) => setToUsername(e.target.value)}
          className="input"
          placeholder="Callsign of the recipient"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="content">Message</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input min-h-24"
          maxLength={5000}
          required
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Sending…" : "Send"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
