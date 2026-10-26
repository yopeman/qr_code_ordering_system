import QRCode from "qrcode";

export interface QRCodeCardOptions {
  restaurantName: string;
  restaurantSlug: string;
  tableNumber: string;
  logoUrl?: string;
  baseUrl?: string;
}

/**
 * Generates the order URL for a specific table
 */
export function getTableOrderUrl(slug: string, table: string, baseUrl?: string): string {
  const host = baseUrl || process.env.NEXT_PUBLIC_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  return `${host}/m/${slug}?table=${encodeURIComponent(table)}`;
}

/**
 * Renders a high-resolution, beautiful printable table card on a Canvas element
 */
export async function renderQRCodeCard(
  canvas: HTMLCanvasElement,
  options: QRCodeCardOptions
): Promise<string> {
  const { restaurantName, restaurantSlug, tableNumber, logoUrl, baseUrl } = options;
  const targetUrl = getTableOrderUrl(restaurantSlug, tableNumber, baseUrl);

  // Canvas size: 800 x 1100 px (ideal for high-DPI tabletop stand)
  const width = 800;
  const height = 1100;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not acquire 2D canvas context");

  // 1. Background: Sleek modern dark-gradient or warm aesthetic
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#0f172a");
  bgGrad.addColorStop(1, "#1e293b");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Decorative outer border / gold-amber accent
  ctx.strokeStyle = "rgba(249, 115, 22, 0.4)";
  ctx.lineWidth = 4;
  roundRect(ctx, 30, 30, width - 60, height - 60, 24);
  ctx.stroke();

  // Subtle inner card container
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 60, 70, width - 120, height - 140, 28);
  ctx.fill();

  // 3. Header: Restaurant Name & Table Number
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 38px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(restaurantName.toUpperCase(), width / 2, 160);

  // Table Badge Container
  ctx.fillStyle = "#f97316";
  roundRect(ctx, width / 2 - 130, 195, 260, 52, 26);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
  ctx.fillText(`TABLE ${tableNumber}`, width / 2, 231);

  // 4. Subtitle / Scan prompt
  ctx.fillStyle = "#64748b";
  ctx.font = "500 22px system-ui, -apple-system, sans-serif";
  ctx.fillText("SCAN WITH YOUR PHONE CAMERA TO ORDER", width / 2, 300);

  // 5. Generate QR Code Data URL
  const qrDataUrl = await QRCode.toDataURL(targetUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 380,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });

  // Load and draw QR code
  await new Promise<void>((resolve, reject) => {
    const qrImg = new Image();
    qrImg.onload = () => {
      // White box behind QR code with soft shadow
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, width / 2 - 210, 340, 420, 420, 24);
      ctx.fill();
      ctx.restore();

      // Draw QR
      ctx.drawImage(qrImg, width / 2 - 190, 360, 380, 380);
      resolve();
    };
    qrImg.onerror = reject;
    qrImg.src = qrDataUrl;
  });

  // Optional: Center logo over QR if provided
  if (logoUrl) {
    try {
      await new Promise<void>((resolve) => {
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.onload = () => {
          const logoSize = 72;
          const logoX = width / 2 - logoSize / 2;
          const logoY = 340 + 210 - logoSize / 2;

          ctx.save();
          ctx.beginPath();
          ctx.arc(width / 2, 340 + 210, logoSize / 2 + 8, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.closePath();

          ctx.beginPath();
          ctx.arc(width / 2, 340 + 210, logoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          ctx.restore();
          resolve();
        };
        logo.onerror = () => resolve(); // Ignore image failure gracefully
        logo.src = logoUrl;
      });
    } catch {
      // Continue even if remote logo fails CORS
    }
  }

  // 6. Action Guide Steps
  ctx.fillStyle = "#334155";
  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.fillText("1. Scan QR  •  2. Browse Menu  •  3. Instant Kitchen Order", width / 2, 820);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "16px system-ui, -apple-system, sans-serif";
  ctx.fillText("No apps to download • Fast & Contactless", width / 2, 860);

  // 7. Footer: Brand
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(120, 910);
  ctx.lineTo(width - 120, 910);
  ctx.stroke();

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
  ctx.fillText("POWERED BY QRCOS", width / 2, 955);

  return canvas.toDataURL("image/png");
}

/**
 * Helper to download the generated QR code image with the exact filename required:
 * restaurantNameOrSlug_table_tableNo_QR_code.png
 */
export function downloadQRCodeImage(dataUrl: string, restaurantNameOrSlug: string, tableNo: string) {
  const cleanName = restaurantNameOrSlug.replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanTable = String(tableNo).replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${cleanName}_table_${cleanTable}_QR_code.png`;

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
