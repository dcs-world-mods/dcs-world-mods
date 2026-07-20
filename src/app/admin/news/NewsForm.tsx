"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewsForm({
  mode,
  newsId,
  initialTitle = "",
  initialSummary = "",
  initialContent = "",
}: {
  mode: "create" | "edit";
  newsId?: string;
  initialTitle?: string;
  initialSummary?: string;
  initialContent?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const url =
      mode === "create" ? "/api/admin/news" : `/api/admin/news/${newsId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, summary, content }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save");
      return;
    }
    router.push("/admin/news");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <label className="label" htmlFor="title">Title</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          minLength={3}
          maxLength={150}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="summary">
          Summary (optional — shown in previews)
        </label>
        <input
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="input"
          maxLength={300}
        />
      </div>
      <div>
        <label className="label" htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input min-h-64"
          minLength={10}
          maxLength={20000}
          placeholder="Write the post…"
          required
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : mode === "create" ? "Publish" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/news")}
          className="btn-ghost"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
