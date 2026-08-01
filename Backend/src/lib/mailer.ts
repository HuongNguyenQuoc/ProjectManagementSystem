import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_USER,
} from "../../config/env.js";
import { VERIFICATION_CODE_TTL_MINUTES } from "./otp.js";

let transporterPromise: Promise<Transporter> | null = null;

/**
 * No real SMTP configured yet -> fall back to a free Ethreal test inbox so the flow still works locally. the send's preview URL is logged instead of landing in a real maibox.
 */

const buildTransporter = async (): Promise<Transporter> => {
  if (SMTP_HOST) {
    const port = SMTP_PORT ? Number(SMTP_PORT) : 587;
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: port,
      secure: port === 465, // true for 465, false for other parts
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

const getTransporter = async (): Promise<Transporter> => {
  if (!transporterPromise) transporterPromise = buildTransporter();
  return transporterPromise;
}

export const sendVerificationEmail = async (to: string, code: string) => {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: SMTP_USER || "no-reply@projecthub.local",
    to,
    subject: "Your ProjectHub verification code",
    text: `Your verification code is: ${code}. It expires in ${VERIFICATION_CODE_TTL_MINUTES} minutes.`,
    html: `<p>Your verification code is: <strong>${code}</strong>. It expires in ${VERIFICATION_CODE_TTL_MINUTES} minutes.</p>`,
  });

  if (!SMTP_HOST) {
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
};