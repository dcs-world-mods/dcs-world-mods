import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { timeAgo } from "@/lib/utils";
import {
  REPORT_CATEGORY_LABELS,
  type ReportCategory,
} from "@/lib/constants";
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
              <span className="hud-tag !border-danger/40 !bg-danger/10 !text-danger">
                {REPORT_CATEGORY_LABELS[report.category as ReportCategory] ??
                  report.category}
              </span>
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
                by {report.reporter.username} · {timeAgo(report.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink/90">{report.reason}</p>
            {report.targetType === "MESSAGE" && (
              <Link
                href={`/admin/reports/message/${report.targetId}`}
                className="mt-1 inline-block font-mono text-xs text-radar hover:text-hud"
              >
                🔍 View reported conversation →
              </Link>
            )}
          </div>
          {report.status === "OPEN" && <ReportActions reportId={report.id} />}
        </div>
      ))}
    </div>
  );
}
