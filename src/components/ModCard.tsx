/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Stars } from "./Stars";
import {
  MOD_CATEGORY_LABELS,
  type ModCategory,
} from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

export function categoryPlaceholder(category: string): string {
  const map: Record<string, string> = {
    AIRCRAFT: "/images/placeholder-aircraft.svg",
    WEAPONS: "/images/placeholder-weapons.svg",
    MAPS: "/images/placeholder-maps.svg",
    MISSIONS: "/images/placeholder-missions.svg",
  };
  return map[category] ?? "/images/placeholder-other.svg";
}

export type ModCardData = {
  slug: string;
  title: string;
  summary: string;
  version: string;
  category: string;
  imageUrl: string | null;
  downloads: number;
  author: { username: string };
  avgRating: number;
  ratingCount: number;
  available?: boolean; // false = no file/link yet ("Coming Soon")
};

export function ModCard({ mod }: { mod: ModCardData }) {
  const available = mod.available ?? true;
  return (
    <Link
      href={`/mods/${mod.slug}`}
      className="card group flex flex-col overflow-hidden transition-colors hover:border-hud/60"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-raised">
        <img
          src={mod.imageUrl ?? categoryPlaceholder(mod.category)}
          alt={mod.title}
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            available ? "" : "opacity-70 grayscale-[35%]"
          }`}
        />
        <span className="hud-tag absolute left-2 top-2">
          {MOD_CATEGORY_LABELS[mod.category as ModCategory] ?? mod.category}
        </span>
        {!available && (
          <span className="absolute right-2 top-2 rounded-sm border border-radar/50 bg-radar/10 px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest text-radar">
            🔜 Coming Soon
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-snug text-ink group-hover:text-hud">
            {mod.title}
          </h3>
          <span className="shrink-0 font-mono text-xs text-muted">
            v{mod.version}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-muted">{mod.summary}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted">
          <span>
            by <span className="text-radar">{mod.author.username}</span>
          </span>
          <span className="flex items-center gap-3">
            <Stars value={mod.avgRating} size="text-xs" />
            {available ? (
              <span className="font-mono">⬇ {formatNumber(mod.downloads)}</span>
            ) : (
              <span className="font-mono text-radar">Soon</span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
