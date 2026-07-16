import type { Metadata } from "next";
import { db } from "@/lib/db";
import { timeAgo } from "@/lib/utils";
import { ReportActions } from "./ReportActions";

export const metadata: Metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await db.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: { reporter: { select: { username: true } } },
  });

  return (
    <div className="card divide-y divide-line">
      {reports.length === 0 && (
        <p className="p-8 text-center text-sm text-muted">No reports filed.</p>
      )}
      {reports.map((report) => (
        <div
          key={report.id}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="hud-tag">{report.targetType}</span>
              <span
                className={`font-mono text-xs ${
                  report.status === "OPEN"
                    ? "text-hud"
                    : report.status === "RESOLVED"
                      ? "text-ok"
                      : "text-muted"
                }`}
              >
                {report.status}
              </span>
              <span className="font-mono text-xs text-muted">
                by {report.reporter.username} · {timeAgo(report.createdAt)} ·
                target: {report.targetId}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink/90">{report.reason}</p>
          </div>
          {report.status === "OPEN" && <ReportActions reportId={report.id} />}
        </div>
      ))}
    </div>
  );
}
