const token = process.env.TELEGRAM_BOT_TOKEN;
const url = process.env.PUBLIC_URL;

if (!token || !url) {
  console.error("Set TELEGRAM_BOT_TOKEN and PUBLIC_URL before running this script.");
  process.exit(1);
}

const secret = process.env.TELEGRAM_WEBHOOK_SECRET || "";
const webhook = `${url.replace(/\/$/, "")}/api/telegram/webhook`;

const response = await fetch(
  `https://api.telegram.org/bot${token}/setWebhook`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhook,
      allowed_updates: ["callback_query"],
      secret_token: secret || undefined,
      drop_pending_updates: true,
    }),
  },
);

const data = await response.json();
console.log(data.ok ? `Webhook set to ${webhook}` : data.description);
process.exit(data.ok ? 0 : 1);
