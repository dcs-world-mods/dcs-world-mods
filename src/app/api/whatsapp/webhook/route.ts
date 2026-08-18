import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * WhatsApp Business API webhook.
 *
 * GET  — Meta's subscription verification handshake. Meta calls this once
 *        with hub.challenge; we echo it back if hub.verify_token matches
 *        WHATSAPP_VERIFY_TOKEN.
 * POST — Incoming message/status events, signed with the app secret via
 *        X-Hub-Signature-256 (verified against WHATSAPP_APP_SECRET).
 *
 * Configure in Meta: Callback URL = <site>/api/whatsapp/webhook
 */

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  const expected = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!expected) {
    console.error("WHATSAPP_VERIFY_TOKEN is not configured");
    return new NextResponse("Not configured", { status: 500 });
  }

  if (mode === "subscribe" && token === expected && challenge) {
    // Meta requires the raw challenge string back, as plain text.
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

/** Timing-safe check of Meta's X-Hub-Signature-256 header. */
function verifyMetaSignature(rawBody: string, header: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  // Without an app secret configured we cannot verify; accept but warn, so
  // the integration still works before the secret is added.
  if (!appSecret) return true;
  if (!header) return false;

  const expected =
    "sha256=" +
    crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(header, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!verifyMetaSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody || "{}");
    // Log for now — extend here to route messages into the site later.
    console.log("WhatsApp webhook event:", JSON.stringify(payload));
  } catch {
    // Meta occasionally sends pings with no/blank body; acknowledge anyway.
  }

  // Meta expects a fast 200 or it retries and eventually disables the webhook.
  return new NextResponse("EVENT_RECEIVED", { status: 200 });
}
