import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { getAutomodSettings } from "@/lib/settings";

const moderateSchema = z.object({
  action: z.enum(["warn", "suspend", "ban", "unban"]),
  reason: z.string().min(3, "A reason is required").max(1000),
  days: z.number().int().min(1).max(3650).optional(), // for suspensions
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const { action, reason, days } = moderateSchema.parse(await request.json());

    if (id === admin.id) {
      return NextResponse.json(
        { error: "You cannot moderate yourself" },
        { status: 400 }
      );
    }
    const target = await db.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (target.role === "ADMIN") {
      return NextResponse.json(
        { error: "Owner accounts cannot be moderated" },
        { status: 403 }
      );
    }

    const record = (
      type: string,
      extra: { expiresAt?: Date; adminName?: string } = {}
    ) =>
      db.moderationAction.create({
        data: {
          type,
          reason,
          userId: id,
          adminName: extra.adminName ?? admin.username,
          expiresAt: extra.expiresAt ?? null,
        },
      });

    const notify = (title: string, body: string) =>
      db.notification.create({
        data: { userId: id, title, body, link: null },
      });

    if (action === "unban") {
      await db.user.update({
        where: { id },
        data: { banned: false, suspendedUntil: null },
      });
      await record("UNBAN");
      await notify(
        "Your ban has been lifted",
        `An administrator removed your ban. Reason: ${reason}`
      );
      return NextResponse.json({ ok: true, result: "unbanned" });
    }

    if (action === "ban") {
      await db.user.update({ where: { id }, data: { banned: true } });
      await record("BAN");
      return NextResponse.json({ ok: true, result: "banned" });
    }

    if (action === "suspend") {
      const suspensionDays = days ?? 7;
      const expiresAt = new Date(
        Date.now() + suspensionDays * 24 * 60 * 60 * 1000
      );
      await db.user.update({
        where: { id },
        data: { suspendedUntil: expiresAt },
      });
      await record("SUSPENSION", { expiresAt });
      return NextResponse.json({
        ok: true,
        result: "suspended",
        until: expiresAt.toISOString(),
      });
    }

    // action === "warn"
    await record("WARNING");
    await notify(
      "⚠ You received a warning",
      `Reason: ${reason}. Repeated warnings lead to suspension or a permanent ban.`
    );

    // --- Automatic rules (configurable in admin settings) ---
    const rules = await getAutomodSettings();
    const warningCount = await db.moderationAction.count({
      where: { userId: id, type: "WARNING" },
    });

    if (warningCount >= rules.warningsForBan) {
      await db.user.update({ where: { id }, data: { banned: true } });
      await db.moderationAction.create({
        data: {
          type: "BAN",
          reason: `Automatic: reached ${warningCount} warnings`,
          userId: id,
          adminName: "AutoMod",
        },
      });
      return NextResponse.json({
        ok: true,
        result: "warned",
        auto: `User reached ${warningCount} warnings and was automatically banned`,
      });
    }

    if (warningCount >= rules.warningsForSuspension && !target.suspendedUntil) {
      const expiresAt = new Date(
        Date.now() + rules.suspensionDays * 24 * 60 * 60 * 1000
      );
      await db.user.update({
        where: { id },
        data: { suspendedUntil: expiresAt },
      });
      await db.moderationAction.create({
        data: {
          type: "SUSPENSION",
          reason: `Automatic: reached ${warningCount} warnings`,
          userId: id,
          adminName: "AutoMod",
          expiresAt,
        },
      });
      return NextResponse.json({
        ok: true,
        result: "warned",
        auto: `User reached ${warningCount} warnings and was automatically suspended for ${rules.suspensionDays} days`,
      });
    }

    return NextResponse.json({
      ok: true,
      result: "warned",
      warningCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
