"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConversationActions({
  conversationId,
  otherUserId,
  otherUsername,
  initiallyBlocked,
}: {
  conversationId: string;
  otherUserId: string;
  otherUsername: string;
  initiallyBlocked: boolean;
}) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(initiallyBlocked);
  const [busy, setBusy] = useState(false);

  async function toggleBlock() {
    if (
      !blocked &&
      !confirm(`Block ${otherUsername}? Neither of you will be able to message the other.`)
    ) {
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/users/${otherUserId}/block`, { method: "POST" });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      setBlocked(data.blocked);
      router.refresh();
    }
  }

  async function clearConversation() {
    if (!confirm("Delete this conversation from your inbox? (The other user keeps their copy.)")) {
      return;
    }
    setBusy(true);
    await fetch(`/api/messages/${conversationId}`, { method: "DELETE" });
    setBusy(false);
    router.push("/messages");
    router.refresh();
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button
        onClick={clearConversation}
        disabled={busy}
        className="btn-ghost !px-3 !py-1 text-xs"
      >
        🗑 Delete
      </button>
      <button
        onClick={toggleBlock}
        disabled={busy}
        className={`!px-3 !py-1 text-xs ${blocked ? "btn-ghost" : "btn-danger"}`}
      >
        {blocked ? "Unblock" : "⛔ Block"}
      </button>
    </div>
  );
}
