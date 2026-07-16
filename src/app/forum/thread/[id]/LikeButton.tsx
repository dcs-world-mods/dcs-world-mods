"use client";

import { useState } from "react";

export function LikeButton({
  postId,
  count,
  liked,
  canLike,
}: {
  postId: string;
  count: number;
  liked: boolean;
  canLike: boolean;
}) {
  const [state, setState] = useState({ count, liked });
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!canLike || busy) return;
    setBusy(true);
    const res = await fetch(`/api/forum/posts/${postId}/like`, {
      method: "POST",
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      setState({ count: data.count, liked: data.liked });
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={!canLike || busy}
      className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-xs transition-colors ${
        state.liked
          ? "border-hud/60 bg-hud/10 text-hud"
          : "border-line text-muted hover:border-hud/40 hover:text-hud"
      } disabled:cursor-default disabled:opacity-60`}
    >
      ▲ {state.count}
    </button>
  );
}
