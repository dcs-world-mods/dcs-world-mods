"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUSPENSION_PRESETS } from "@/lib/constants";

export function ModerateForm({
  userId,
  banned,
}: {
  userId: string;
  banned: boolean;
}) {
  const router = useRouter();
  const [action, setAction] = useState<string>(banned ? "unban" : "warn");
  const [days, setDays] = useState<number>(7);
  const [customDays, setCustomDays] = useState<string>("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const finalDays =
      days === -1 ? Number.parseInt(customDays, 10) : days;
    if (action === "suspend" && (!finalDays || finalDays < 1)) {
      setError("Enter a valid number of days");
      return;
    }
    if (
      (action === "ban" || action === "suspend") &&
      !confirm(`Are you sure you want to ${action} this user?`)
    ) {
      return;
    }

    setBusy(true);
    const res = await fetch(`/api/admin/users/${userId}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        reason,
        ...(action === "suspend" ? { days: finalDays } : {}),
      }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Action failed");
      return;
    }
    setReason("");
    if (data.auto) setInfo(`⚡ AutoMod: ${data.auto}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          { value: "warn", label: "⚠ Warning", cls: "border-hud/50 text-hud" },
          { value: "suspend", label: "🟡 Suspend", cls: "border-danger/40 text-hud" },
          { value: "ban", label: "🔴 Permanent Ban", cls: "border-danger/60 text-danger" },
          { value: "unban", label: "✅ Remove Ban / Suspension", cls: "border-ok/50 text-ok" },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setAction(opt.value)}
            className={`btn border !px-3 !py-1.5 text-xs ${opt.cls} ${
              action === opt.value ? "bg-raised ring-1 ring-hud/40" : "opacity-60"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {action === "suspend" && (
        <div>
          <label className="label">Duration</label>
          <div className="flex flex-wrap items-center gap-2">
            {SUSPENSION_PRESETS.map((preset) => (
              <button
                key={preset.days}
                type="button"
                onClick={() => setDays(preset.days)}
                className={`btn-ghost !px-3 !py-1 text-xs ${
                  days === preset.days ? "!border-hud !text-hud" : ""
                }`}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setDays(-1)}
              className={`btn-ghost !px-3 !py-1 text-xs ${
                days === -1 ? "!border-hud !text-hud" : ""
              }`}
            >
              Custom
            </button>
            {days === -1 && (
              <input
                type="number"
                min={1}
                max={3650}
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="days"
                className="input !w-24 !py-1 text-xs"
              />
            )}
          </div>
        </div>
      )}

      <div>
        <label className="label" htmlFor="reason">
          Reason (required — recorded in the punishment history)
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="input min-h-20"
          minLength={3}
          maxLength={1000}
          placeholder="Explain the violation…"
          required
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {info && <p className="text-sm text-hud">{info}</p>}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? "Applying…" : "Apply Action"}
      </button>
    </form>
  );
}
