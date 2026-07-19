import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/mods", label: "Mod Approval" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/moderation", label: "Auto-Mod Rules" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  return (
    <div className="mt-8 space-y-6 pb-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-radar">
          // Command Center
        </p>
        <h1 className="mt-1 text-3xl font-black uppercase tracking-wider text-ink">
          Admin Dashboard
        </h1>
      </div>
      <nav className="flex flex-wrap gap-2 border-b border-line pb-3">
        {TABS.map((tab) => (
          <Link key={tab.href} href={tab.href} className="btn-ghost !px-3 !py-1.5 text-xs">
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
