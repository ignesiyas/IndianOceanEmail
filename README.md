# SMTP Email API (Node.js)

Simple REST API to send emails via SMTP (Hostinger-compatible) using Node.js + Express + Nodemailer.

## Security

`POST /send-email` requires Bearer token auth.

Set in env:

- `API_BEARER_TOKEN=your-long-random-secret`

Send in header:

- `Authorization: Bearer your-long-random-secret`

## Rate limiting

`POST /send-email` is rate-limited per IP.

Env settings:

- `RATE_LIMIT_WINDOW_MS=900000` (15 minutes)
- `RATE_LIMIT_MAX=20` (max requests per window per IP)
- `TRUST_PROXY=true` (recommended behind hosting proxy)

When limit is exceeded, API returns `429 Too Many Requests`.

## Endpoints

- `GET /health` (public)
- `POST /send-email` (protected + rate-limited)

### POST /send-email body

```json
{
  "to": "recipient@example.com",
  "subject": "Hello",
  "text": "Plain text body",
  "html": "<p>HTML body</p>",
  "cc": "cc@example.com",
  "bcc": ["a@example.com", "b@example.com"],
  "replyTo": "support@example.com"
}
```

Required: `to`, `subject`, and at least one of `text` or `html`.

## Local setup

1. Copy env:
   - `copy .env.example .env`
2. Install:
   - `npm install`
3. Run:
   - `npm run dev`

## Production run

- `npm install --omit=dev`
- `npm start`

## Deploy on Hostinger (VPS/Node hosting)

1. Upload project files.
2. Set environment variables from `.env.example` in Hostinger panel.
3. Set start command: `npm start`.
4. Ensure your app port uses the `PORT` env provided by host (already supported).
5. Point your domain/subdomain to the app according to Hostinger setup.

## Example fetch from another app

```js
await fetch("https://your-api-domain.com/send-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-long-random-secret"
  },
  body: JSON.stringify({
    to: "user@example.com",
    subject: "Welcome",
    html: "<h1>Welcome!</h1>"
  })
});
```