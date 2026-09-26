This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Telegram kitchen orders

The order panel posts to `/api/orders`, which forwards the receipt to a Telegram
channel using the bot token from `.env` (never exposed to the browser).

Required variables in `.env`:

```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHANNEL=@your_channel
TELEGRAM_WEBHOOK_SECRET=some_secret   # optional, validates webhook calls
```

Each order message carries inline buttons — Pending, Preparing, Completed — and
the status line in the message updates as they are pressed.

Two ways the status can change:

1. From the UI: the "Kitchen status" switcher under *Place order* calls
   `PATCH /api/orders`, which edits the Telegram message. Works locally.
2. From Telegram itself: press a button and the bot needs a webhook that
   receives `callback_query` updates. Register it once against a public URL:

   ```
   PUBLIC_URL=https://your-domain.com npm run telegram:webhook
   ```

Without a webhook, button presses reach the bot but nothing answers them, so
use the UI switcher (or run behind a tunnel such as `cloudflared tunnel` /
`ngrok http 3000` and register that URL).
