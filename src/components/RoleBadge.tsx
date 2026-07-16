import { ROLE_LABELS, type Role } from "@/lib/constants";

const STYLES: Record<Role, string> = {
  USER: "border-line text-muted",
  DEVELOPER: "border-radar/50 text-radar",
  ADMIN: "border-hud/50 text-hud",
};

export function RoleBadge({ role }: { role: string }) {
  const r = (role in STYLES ? role : "USER") as Role;
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STYLES[r]}`}
    >
      {ROLE_LABELS[r]}
    </span>
  );
}
