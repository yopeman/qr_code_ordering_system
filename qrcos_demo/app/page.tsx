import Link from "next/link";
import {
  QrCode,
  Shield,
  Store,
  UtensilsCrossed,
  ChefHat,
  History,
  Send,
  Sparkles,
  ArrowRight,
  Database,
  Cloud,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const demoCards = [
    {
      title: "Super Admin Portal",
      subtitle: "/admin",
      description:
        "Manage all restaurants in grid/table view, reset owner passwords to null, inspect live orders, and generate high-DPI table QR stand cards.",
      href: "/admin",
      icon: Shield,
      badge: "Single-Page + Modals",
      color: "from-blue-600 to-indigo-600",
      accent: "text-blue-500",
      cta: "Launch Admin Portal",
    },
    {
      title: "Restaurant Owner Portal",
      subtitle: "/r/habesha-restaurant",
      description:
        "Self-service onboarding with null-password initialization, Ethiopian menu CRUD with image galleries, dietary tags, ETB fee config, and QR generator.",
      href: "/r/habesha-restaurant",
      icon: Store,
      badge: "Self-Serve & Menu CRUD",
      color: "from-emerald-600 to-teal-600",
      accent: "text-emerald-500",
      cta: "Launch Restaurant Portal",
    },
    {
      title: "Public Diner Menu",
      subtitle: "/m/habesha-restaurant?table=4",
      description:
        "Contactless mobile menu with table detection, image modal, Ethiopian dietary badges, interactive cart drawer in ETB, and 1-second live polling.",
      href: "/m/habesha-restaurant?table=4",
      icon: UtensilsCrossed,
      badge: "Zero Auth • Table 4",
      color: "from-orange-600 to-amber-600",
      accent: "text-orange-500",
      cta: "Browse Table Menu",
    },
    {
      title: "Kitchen Live Dispatcher",
      subtitle: "/o/habesha-restaurant",
      description:
        "Real-time kitchen display showing incoming tickets with one-click status transitions synced bidirectionally with Telegram inline keyboards.",
      href: "/o/habesha-restaurant",
      icon: ChefHat,
      badge: "Real-Time Kitchen Sync",
      color: "from-rose-600 to-pink-600",
      accent: "text-rose-500",
      cta: "Open Kitchen Board",
    },
    {
      title: "Diner Order History",
      subtitle: "/my-history",
      description:
        "Client-side order tracking stored in localStorage with 1-second background status polling and instant receipt re-check.",
      href: "/my-history",
      icon: History,
      badge: "localStorage Tracking",
      color: "from-purple-600 to-violet-600",
      accent: "text-purple-500",
      cta: "View My Orders",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation QR Ordering System (QRCOS)</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Contactless Dining, Seamless Kitchens,{" "}
          <span className="bg-linear-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
            Instant Telegram Sync.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An end-to-end QR code restaurant ecosystem connecting diners directly to the kitchen with dynamic table QR codes, live order tracking, and Telegram bot notifications.
        </p>

        {/* Quick Credentials Info Box */}
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left text-sm text-slate-700 dark:text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="space-y-1">
            <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Demo Onboarding Ready:
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Admin: <code className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-900 dark:text-slate-100">admin@qrcos.com</code> • Restaurant: <code className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-900 dark:text-slate-100">habesha-restaurant</code>
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
              Both accounts start with <i>null password</i> to demonstrate initial onboarding setup on first login!
            </p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs whitespace-nowrap shadow-md transition"
          >
            Try Admin Login
          </Link>
        </div>
      </div>

      {/* Demo Cards Grid */}
      <div className="mt-14 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 hover:border-orange-500/50 transition-all hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-linear-to-tr ${card.color} flex items-center justify-center text-white shadow-lg`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {card.badge}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-xs font-mono font-medium text-slate-400">
                    {card.subtitle}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {card.title}
                  </h3>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {card.description}
                </p>
              </div>

              <Link
                href={card.href}
                className="mt-auto inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-600 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all group-hover:shadow-md"
              >
                <span>{card.cta}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Tech Stack Bar */}
      <div className="mt-16 w-full max-w-4xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">
          Architected With Modern Production Standards
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-600 dark:text-slate-400 text-sm font-medium">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-900 dark:text-white" />
            <span>Next.js 15 (App Router)</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span>Tailwind CSS v4</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            <span>MongoDB + Mongoose</span>
          </div>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-sky-500" />
            <span>Telegram Bot Webhook</span>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            <span>Cloudinary Media</span>
          </div>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-500" />
            <span>Dynamic QR Studio</span>
          </div>
        </div>
      </div>
    </div>
  );
}
