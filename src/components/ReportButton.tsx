"use client";

import { useState } from "react";
import { REPORT_CATEGORIES, REPORT_CATEGORY_LABELS } from "@/lib/constants";

export function ReportButton({
  targetType,
  targetId,
}: {
  targetType: string;
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("SPAM");
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, category, reason }),
    });
    setBusy(false);
    if (res.ok) {
      setDone(true);
      setOpen(false);
    }
  }

  if (done) {
    return (
      <span className="font-mono text-xs text-ok">✓ Report submitted</span>
    );
  }

  return (
    <div className="inline-block text-left">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="font-mono text-xs text-muted hover:text-danger"
        >
          ⚑ Report
        </button>
      ) : (
        <form onSubmit={submit} className="card w-72 space-y-2 p-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input text-xs"
          >
            {REPORT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {REPORT_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the issue…"
            className="input min-h-16 text-xs"
            minLength={5}
            maxLength={1000}
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-danger !px-3 !py-1 text-xs" disabled={busy}>
              Submit
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-ghost !px-3 !py-1 text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
