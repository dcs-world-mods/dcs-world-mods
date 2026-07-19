import "server-only";
import { db } from "./db";
import { AUTOMOD_DEFAULTS } from "./constants";

export type AutomodSettings = typeof AUTOMOD_DEFAULTS;

export async function getAutomodSettings(): Promise<AutomodSettings> {
  const rows = await db.siteSetting.findMany({
    where: { key: { in: Object.keys(AUTOMOD_DEFAULTS) } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, Number(r.value)]));
  return {
    warningsForSuspension:
      map.warningsForSuspension ?? AUTOMOD_DEFAULTS.warningsForSuspension,
    suspensionDays: map.suspensionDays ?? AUTOMOD_DEFAULTS.suspensionDays,
    warningsForBan: map.warningsForBan ?? AUTOMOD_DEFAULTS.warningsForBan,
  };
}

export async function setAutomodSettings(
  settings: AutomodSettings
): Promise<void> {
  for (const [key, value] of Object.entries(settings)) {
    await db.siteSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
}
