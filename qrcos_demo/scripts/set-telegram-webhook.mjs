const token = process.env.TELEGRAM_BOT_TOKEN;
const publicUrl = process.env.PUBLIC_URL;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}

if (!publicUrl) {
  console.error("Missing PUBLIC_URL in .env (or pass PUBLIC_URL=https://your-domain.com)");
  process.exit(1);
}

const webhookUrl = `${publicUrl.replace(/\/$/, "")}/api/telegram/webhook`;

console.log(`Setting Telegram webhook to: ${webhookUrl}`);

fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: webhookUrl,
    secret_token: secret || undefined,
    allowed_updates: ["callback_query", "message"],
  }),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.ok) {
      console.log("Telegram webhook registered successfully:", data);
    } else {
      console.error("Telegram webhook registration failed:", data);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Network error while setting webhook:", err);
    process.exit(1);
  });
