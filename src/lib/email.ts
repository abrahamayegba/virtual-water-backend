import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
export async function sendEmail(to: string, subject: string, text: string) {
  try {
    await transporter.sendMail({
      from: '"Your App" <no-reply@yourapp.com>',
      to,
      subject,
      text,
    });
    console.log(`[MAIL SENT] to=${to} subject=${subject}`);
  } catch (err) {
    console.error("sendEmail error:", err);
  }
}
