const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
app.use(express.json({ limit: "200kb" }));

const required = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "MAIL_FROM",
  "API_BEARER_TOKEN",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function requireBearerToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token || token !== process.env.API_BEARER_TOKEN) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  return next();
}

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "smtp-email-api" });
});

app.post("/send-email", requireBearerToken, async (req, res) => {
  const { to, subject, text, html, cc, bcc, replyTo } = req.body || {};

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({
      ok: false,
      error: "'to', 'subject', and one of 'text' or 'html' are required.",
    });
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      cc,
      bcc,
      replyTo,
      subject,
      text,
      html,
    });

    return res.status(200).json({
      ok: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  } catch (error) {
    console.error("Email send error:", error);
    return res.status(500).json({ ok: false, error: "Failed to send email." });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`SMTP API listening on port ${port}`);
});