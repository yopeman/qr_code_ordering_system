import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { I18nProvider } from "@/components/I18nProvider";
import { getServerLocale } from "@/lib/i18n/server";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
};

export const metadata: Metadata = {
  title: "Demo QRCOS — Modern QR Code Restaurant Ordering System",
  description:
    "Next.js, Tailwind CSS, MongoDB, Cloudinary, and Telegram bot integrated QR ordering solution for diners, restaurant owners, and admins.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
        <I18nProvider initialLocale={locale}>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
