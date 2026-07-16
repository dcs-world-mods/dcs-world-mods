"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    if (form.get("password") !== form.get("confirm")) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Registration failed");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label className="label" htmlFor="username">
          Callsign (Username)
        </label>
        <input
          id="username"
          name="username"
          className="input"
          minLength={3}
          maxLength={24}
          pattern="[a-zA-Z0-9_\-]+"
          title="Letters, numbers, _ and - only"
          autoComplete="username"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          minLength={8}
          autoComplete="new-password"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="confirm">
          Confirm Password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          className="input"
          minLength={8}
          autoComplete="new-password"
          required
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}
