import Link from "next/link";
import { SITE_NAME, SOCIAL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface/50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt={SITE_NAME} className="h-9 w-9" />
            <p className="font-mono text-sm font-bold uppercase tracking-widest text-ink">
              DCS<span className="text-hud"> World Mods</span>
            </p>
          </div>
          <p className="mt-2 text-sm text-muted">
            The ultimate community for DCS World modifications, developers and
            aviation enthusiasts.
          </p>
        </div>
        <div>
          <p className="label">Navigation</p>
          <ul className="space-y-1.5 text-sm text-muted">
            <li><Link href="/mods" className="hover:text-hud">Mods Library</Link></li>
            <li><Link href="/forum" className="hover:text-hud">Community Forum</Link></li>
            <li><Link href="/developers" className="hover:text-hud">Developer Hub</Link></li>
            <li><Link href="/mods/upload" className="hover:text-hud">Upload a Mod</Link></li>
          </ul>
        </div>
        <div>
          <p className="label">Community</p>
          <ul className="space-y-1.5 text-sm text-muted">
            <li>
              <a href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-hud">
                ▶ YouTube — @dcsworldmods
              </a>
            </li>
            <li>
              <a href={SOCIAL.discord} target="_blank" rel="noopener noreferrer" className="hover:text-hud">
                ⌬ Discord Community
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center font-mono text-xs text-muted">
        © {new Date().getFullYear()} {SITE_NAME} · Community project — not affiliated with Eagle Dynamics
      </div>
    </footer>
  );
}
