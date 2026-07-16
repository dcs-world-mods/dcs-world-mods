export const ROLES = ["USER", "DEVELOPER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  USER: "Member",
  DEVELOPER: "Mod Developer",
  ADMIN: "Owner",
};

// Roles that can be assigned through the admin dashboard.
// ADMIN (Owner) is deliberately excluded — it can only be granted manually
// via `npm run set-owner <username>` on the server. There is no UI path to it.
export const ASSIGNABLE_ROLES = ["USER", "DEVELOPER"] as const;

export const MOD_CATEGORIES = [
  "AIRCRAFT",
  "WEAPONS",
  "MAPS",
  "MISSIONS",
  "OTHER",
] as const;
export type ModCategory = (typeof MOD_CATEGORIES)[number];

export const MOD_CATEGORY_LABELS: Record<ModCategory, string> = {
  AIRCRAFT: "Aircraft Mods",
  WEAPONS: "Weapons Mods",
  MAPS: "Maps",
  MISSIONS: "Missions",
  OTHER: "Other",
};

export const MOD_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ModStatus = (typeof MOD_STATUSES)[number];

export const GUIDE_TAGS = [
  "GETTING_STARTED",
  "LUA",
  "TOOLS",
  "PROJECTS",
] as const;
export type GuideTag = (typeof GUIDE_TAGS)[number];

export const GUIDE_TAG_LABELS: Record<GuideTag, string> = {
  GETTING_STARTED: "Getting Started",
  LUA: "Lua Scripting",
  TOOLS: "Tools & Pipelines",
  PROJECTS: "Community Projects",
};

export const REPORT_TARGETS = [
  "MOD",
  "THREAD",
  "POST",
  "USER",
  "COMMENT",
] as const;

export const SOCIAL = {
  youtube: "https://youtube.com/@dcsworldmods",
  discord: "https://discord.gg/RAdwkaAWma",
};

export const SITE_NAME = "DCS World Mods";
export const SITE_TAGLINE =
  "The ultimate community for DCS World modifications, developers and aviation enthusiasts.";

// Upload limits
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_MOD_FILE_BYTES = 500 * 1024 * 1024; // 500 MB
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const ALLOWED_MOD_FILE_EXTENSIONS = [".zip", ".rar", ".7z"];
