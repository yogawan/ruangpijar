// lib/email.ts
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

// Lazily built (and cached) rather than at module load: importing this file
// must not throw for code paths that never actually send mail.
function getTransporter(): Transporter {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    throw new Error("Missing EMAIL_USER or EMAIL_PASS environment variable");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return transporter;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  await getTransporter().sendMail({
    from: `"RuangPijar" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
