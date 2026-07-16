"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileEditor({
  initialBio,
  pendingUsername,
}: {
  initialBio: string;
  pendingUsername: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Username change request state
  const [nameOpen, setNameOpen] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSent, setNameSent] = useState(false);
  const [newUsername, setNewUsername] = useState("");

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

  async function requestUsername(event: React.FormEvent) {
    event.preventDefault();
    setNameError(null);
    setBusy(true);
    const res = await fetch("/api/profile/username-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newUsername }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setNameError(data.error ?? "Request failed");
      return;
    }
    setNameSent(true);
    setNameOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {!open && (
          <button onClick={() => setOpen(true)} className="btn-ghost">
            ⚙ Edit Profile
          </button>
        )}
        {!nameOpen && !pendingUsername && !nameSent && (
          <button onClick={() => setNameOpen(true)} className="btn-ghost">
            ✎ Request Username Change
          </button>
        )}
      </div>

      {(pendingUsername || nameSent) && (
        <p className="font-mono text-xs text-hud">
          ⏳ Username change request pending Owner approval
          {pendingUsername ? ` (→ ${pendingUsername})` : ""}
        </p>
      )}

      {nameOpen && (
        <form onSubmit={requestUsername} className="card space-y-3 p-6">
          <div>
            <label className="label" htmlFor="newUsername">
              Requested Username
            </label>
            <input
              id="newUsername"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="input"
              minLength={3}
              maxLength={24}
              pattern="[a-zA-Z0-9_\-]+"
              title="Letters, numbers, _ and - only"
              required
            />
            <p className="mt-1 text-xs text-muted">
              Username changes require approval by the site Owner.
            </p>
          </div>
          {nameError && <p className="text-sm text-danger">{nameError}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Sending…" : "Submit Request"}
            </button>
            <button type="button" onClick={() => setNameOpen(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      )}

      {open && (
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
      )}
    </div>
  );
}
