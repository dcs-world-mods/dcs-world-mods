"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOD_CATEGORIES, MOD_CATEGORY_LABELS } from "@/lib/constants";

export function UploadForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/mods", { method: "POST", body: form });

    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Upload failed");
      return;
    }
    const data = await res.json();
    router.push(`/mods/${data.slug}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="title">Mod Title</label>
        <input id="title" name="title" className="input" minLength={3} maxLength={100} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="version">Version</label>
          <input id="version" name="version" className="input" placeholder="1.0.0" maxLength={20} required />
        </div>
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" name="category" className="input" required>
            {MOD_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {MOD_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="summary">Short Summary</label>
        <input
          id="summary"
          name="summary"
          className="input"
          placeholder="One sentence shown on the mod card"
          minLength={10}
          maxLength={200}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="description">Full Description</label>
        <textarea
          id="description"
          name="description"
          className="input min-h-40"
          placeholder="Features, installation instructions, requirements, changelog…"
          minLength={20}
          maxLength={10000}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="image">Cover Image (PNG/JPEG/WebP, max 5 MB)</label>
        <input id="image" name="image" type="file" accept="image/png,image/jpeg,image/webp" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="screenshots">Screenshots (up to 8, optional)</label>
        <input
          id="screenshots"
          name="screenshots"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="file">Mod Archive (.zip / .rar / .7z, max 500 MB)</label>
        <input id="file" name="file" type="file" accept=".zip,.rar,.7z" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="externalUrl">
          …or External Download Link
        </label>
        <input
          id="externalUrl"
          name="externalUrl"
          type="url"
          className="input"
          placeholder="https://example.com/my-mod.zip"
        />
        <p className="mt-1 text-xs text-muted">
          Provide either an archive upload or an external link.
        </p>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Uploading…" : "Submit for Review"}
      </button>
    </form>
  );
}
