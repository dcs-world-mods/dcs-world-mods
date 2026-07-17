"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    setStep("code");
  }

  async function resetPassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword: password }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Reset failed");
      return;
    }
    setStep("done");
    setTimeout(() => router.push("/login"), 2500);
  }

  if (step === "done") {
    return (
      <p className="mt-6 rounded border border-ok/40 bg-ok/10 p-4 text-sm text-ok">
        ✓ Password updated! Redirecting you to the login page…
      </p>
    );
  }

  if (step === "code") {
    return (
      <form onSubmit={resetPassword} className="mt-6 space-y-4">
        <p className="text-sm text-muted">
          We sent a 6-digit code to <span className="text-ink">{email}</span>.
          It expires in 15 minutes.
        </p>
        <div>
          <label className="label" htmlFor="code">6-Digit Code</label>
          <input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="input text-center font-mono text-xl tracking-[0.5em]"
            inputMode="numeric"
            pattern="\d{6}"
            placeholder="••••••"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="password">New Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            minLength={8}
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirm New Password</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input"
            minLength={8}
            autoComplete="new-password"
            required
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? "Updating…" : "Set New Password"}
        </button>
        <button
          type="button"
          onClick={() => setStep("email")}
          className="w-full text-center text-xs text-muted hover:text-hud"
        >
          Didn&apos;t get the code? Send again
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="mt-6 space-y-4">
      <p className="text-sm text-muted">
        Enter the email address you registered with and we&apos;ll send you a
        6-digit verification code.
      </p>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          autoComplete="email"
          required
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Sending…" : "Send Reset Code"}
      </button>
    </form>
  );
}
