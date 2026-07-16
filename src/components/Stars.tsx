export function Stars({
  value,
  count,
  size = "text-sm",
}: {
  value: number;
  count?: number;
  size?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-1 ${size}`}>
      <span className="tracking-tight text-hud" aria-label={`${value.toFixed(1)} out of 5`}>
        {"★".repeat(rounded)}
        <span className="text-line">{"★".repeat(5 - rounded)}</span>
      </span>
      {count !== undefined && (
        <span className="font-mono text-xs text-muted">({count})</span>
      )}
    </span>
  );
}
