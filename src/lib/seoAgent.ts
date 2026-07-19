import "server-only";
import crypto from "crypto";
import sanitizeHtml from "sanitize-html";

/** Timing-safe HMAC-SHA256 verification for the X-SEO-Agent-Signature header. */
export function verifySeoAgentSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.SEO_AGENT_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  // Accept "sha256=<hex>" or a bare hex digest, case-insensitively.
  const provided = signatureHeader.replace(/^sha256=/i, "").trim().toLowerCase();
  const expectedBuf = Buffer.from(expected, "utf8");
  const providedBuf = Buffer.from(provided, "utf8");
  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

/** Constant-time check for the inbound Articles API bearer key. */
export function isValidSeoAgentApiKey(authHeader: string | null): boolean {
  const expected = process.env.SEO_AGENT_API_KEY;
  if (!expected || !authHeader) return false;
  const provided = authHeader.replace(/^Bearer\s+/i, "").trim();
  const expectedBuf = Buffer.from(expected, "utf8");
  const providedBuf = Buffer.from(provided, "utf8");
  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

/** Strips scripts, event handlers and other unsafe markup before storage. */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "figure",
      "figcaption",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height"],
      a: ["href", "name", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}
