import "server-only";
import nodemailer from "nodemailer";
import { SITE_NAME } from "./constants";

// Email is sent over SMTP. Works with any provider (Brevo, Gmail app
// password, Mailgun, ...). Enabled when these env vars are set:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM

export function isEmailEnabled(): boolean {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && EMAIL_FROM);
}

export async function sendMail(to: string, subject: string, text: string): Promise<void> {
  if (!isEmailEnabled()) {
    throw new Error("Email is not configured (missing SMTP_* env vars)");
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${SITE_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    text,
  });
}
