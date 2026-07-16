"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RatingWidget({
  modId,
  initial,
}: {
  modId: string;
  initial: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [hover, setHover] = useState(0);

  async function rate(v: number) {
    setValue(v);
    await fetch(`/api/mods/${modId}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: v }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-1 text-2xl" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => rate(star)}
          onMouseEnter={() => setHover(star)}
          className={`cursor-pointer transition-colors ${
            star <= (hover || value) ? "text-hud" : "text-line hover:text-hud/50"
          }`}
          aria-label={`Rate ${star} stars`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
