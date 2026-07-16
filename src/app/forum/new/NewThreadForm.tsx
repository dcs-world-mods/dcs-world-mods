"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; slug: string };

export function NewThreadForm({
  categories,
  defaultSlug,
}: {
  categories: Category[];
  defaultSlug?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const defaultCategory =
    categories.find((c) => c.slug === defaultSlug)?.id ?? categories[0]?.id;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const form = new FormData(event.currentTarget);

    const res = await fetch("/api/forum/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: form.get("categoryId"),
        title: form.get("title"),
        content: form.get("content"),
      }),
    });

    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create thread");
      return;
    }
    const data = await res.json();
    router.push(`/forum/thread/${data.threadId}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="categoryId">Category</label>
        <select
          id="categoryId"
          name="categoryId"
          className="input"
          defaultValue={defaultCategory}
          required
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          className="input"
          minLength={5}
          maxLength={150}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="content">First Post</label>
        <textarea
          id="content"
          name="content"
          className="input min-h-40"
          minLength={10}
          maxLength={20000}
          required
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Creating…" : "Create Thread"}
      </button>
    </form>
  );
}
