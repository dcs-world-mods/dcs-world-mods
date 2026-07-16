/* eslint-disable @next/next/no-img-element */
const SIZES = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-10 w-10 text-sm",
  lg: "h-20 w-20 text-2xl",
} as const;

export function Avatar({
  username,
  avatarUrl,
  size = "md",
}: {
  username: string;
  avatarUrl?: string | null;
  size?: keyof typeof SIZES;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className={`${SIZES[size]} shrink-0 rounded-full border border-line object-cover`}
      />
    );
  }
  return (
    <div
      className={`${SIZES[size]} flex shrink-0 items-center justify-center rounded-full border border-hud/40 bg-raised font-mono font-bold uppercase text-hud`}
      aria-label={username}
    >
      {username.slice(0, 2)}
    </div>
  );
}
