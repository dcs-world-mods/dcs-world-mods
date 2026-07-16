import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    users,
    mods,
    pendingMods,
    threads,
    posts,
    openReports,
    downloads,
  ] = await Promise.all([
    db.user.count(),
    db.mod.count({ where: { status: "APPROVED" } }),
    db.mod.count({ where: { status: "PENDING" } }),
    db.thread.count(),
    db.post.count(),
    db.report.count({ where: { status: "OPEN" } }),
    db.mod.aggregate({ _sum: { downloads: true } }),
  ]);

  const stats = [
    { label: "Registered Users", value: users, href: "/admin/users" },
    { label: "Published Mods", value: mods, href: "/admin/mods" },
    { label: "Pending Approval", value: pendingMods, href: "/admin/mods", alert: pendingMods > 0 },
    { label: "Forum Threads", value: threads, href: "/forum" },
    { label: "Forum Posts", value: posts, href: "/forum" },
    { label: "Open Reports", value: openReports, href: "/admin/reports", alert: openReports > 0 },
    { label: "Total Downloads", value: downloads._sum.downloads ?? 0, href: "/mods" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Link
          key={stat.label}
          href={stat.href}
          className={`card p-5 transition-colors hover:border-hud/60 ${
            stat.alert ? "border-hud/50" : ""
          }`}
        >
          <div className={`font-mono text-3xl font-bold ${stat.alert ? "text-hud" : "text-ink"}`}>
            {stat.value}
          </div>
          <div className="mt-1 text-xs uppercase tracking-widest text-muted">
            {stat.label}
          </div>
        </Link>
      ))}
    </div>
  );
}
