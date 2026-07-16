"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileEditor({ initialBio }: { initialBio: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/profile", { method: "PATCH", body: form });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Update failed");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost">
        ⚙ Edit Profile
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <div>
        <label className="label" htmlFor="avatar">
          Profile Picture (PNG/JPEG/WebP, max 5 MB)
        </label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={initialBio}
          className="input min-h-24"
          maxLength={500}
          placeholder="Tell the squadron about yourself…"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
