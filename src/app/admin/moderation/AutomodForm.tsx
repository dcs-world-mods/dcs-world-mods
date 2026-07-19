"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  warningsForSuspension: number;
  suspensionDays: number;
  warningsForBan: number;
};

export function AutomodForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update(key: keyof Settings, value: string) {
    setSaved(false);
    setSettings({ ...settings, [key]: Number.parseInt(value, 10) || 0 });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          max={100}
          value={settings.warningsForSuspension}
          onChange={(e) => update("warningsForSuspension", e.target.value)}
          className="input !w-20 text-center"
        />
        <span className="text-sm text-ink">
          warnings → automatic suspension for
        </span>
        <input
          type="number"
          min={1}
          max={365}
          value={settings.suspensionDays}
          onChange={(e) => update("suspensionDays", e.target.value)}
          className="input !w-20 text-center"
        />
        <span className="text-sm text-ink">days</span>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          max={100}
          value={settings.warningsForBan}
          onChange={(e) => update("warningsForBan", e.target.value)}
          className="input !w-20 text-center"
        />
        <span className="text-sm text-ink">warnings → automatic permanent ban</span>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-ok">✓ Rules saved</p>}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? "Saving…" : "Save Rules"}
      </button>
    </form>
  );
}
