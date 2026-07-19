import type { Metadata } from "next";
import { getAutomodSettings } from "@/lib/settings";
import { AutomodForm } from "./AutomodForm";

export const metadata: Metadata = { title: "Auto-Mod Rules" };
export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  const settings = await getAutomodSettings();

  return (
    <div className="max-w-xl space-y-6">
      <div className="card p-6">
        <h2 className="section-title mb-2">Automatic Moderation Rules</h2>
        <p className="mb-6 text-sm text-muted">
          When a user accumulates warnings, the system escalates automatically.
          Actions taken by the system are recorded in the punishment history as
          &quot;AutoMod&quot;.
        </p>
        <AutomodForm initial={settings} />
      </div>
    </div>
  );
}
