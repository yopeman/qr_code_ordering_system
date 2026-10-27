import Link from "next/link";
import {
  QrCode,
  Store,
  UtensilsCrossed,
  ChefHat,
  History,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Clock,
  CheckCircle2,
  Coffee,
  Building2,
  Wine,
  FileSpreadsheet,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const portalShowcases = [
    {
      title: "Public Diner Menu",
      audience: "For Guests & Diners",
      subtitle: "Instant Mobile Table Experience",
      description:
        "Contactless dining at its finest. Guests scan table QR stands, browse vivid food photos with authentic Ethiopian descriptions, customize notes (ቃሪያ በጎን), and order in seconds without downloading any app.",
      href: "/m/habesha-restaurant?table=4",
      icon: UtensilsCrossed,
      color: "from-orange-600 to-amber-600",
      accent: "text-orange-500",
      cta: "Explore Diner Experience",
      badge: "Table 4 Demo",
    },
    {
      title: "Kitchen Live Dispatcher",
      audience: "For Chefs & Kitchen Staff",
      subtitle: "Paperless Real-Time Kitchen Display",
      description:
        "Incoming tickets appear instantly with audio-visual alerts and itemized details. Kitchen teams transition statuses with a single tap (Pending → Preparing → Served), automatically synced with staff Telegram channels.",
      href: "/o/habesha-restaurant",
      icon: ChefHat,
      color: "from-rose-600 to-pink-600",
      accent: "text-rose-500",
      cta: "View Kitchen Display",
      badge: "Real-Time Sync",
    },
    {
      title: "Restaurant Owner Portal",
      audience: "For Managers & Owners",
      subtitle: "Complete Menu & Venue Control",
      description:
        "Effortlessly manage menus, upload dish photos, adjust ETB prices instantly, configure Fasting (የጾም) specials, manage 15% VAT and service charges, and generate high-resolution printable table QR stand cards.",
      href: "/r/habesha-restaurant",
      icon: Store,
      color: "from-emerald-600 to-teal-600",
      accent: "text-emerald-500",
      cta: "Open Manager Portal",
      badge: "Habesha Restaurant",
    },
    {
      title: "Multi-Venue Administration",
      audience: "For Hospitality Groups & Hotels",
      subtitle: "Centralized Enterprise Governance",
      description:
        "Oversee multiple branches, cafes, and hotel restaurant concepts from a single dashboard. Monitor live order volume, manage venue accounts, and enforce standard brand guidelines across all locations.",
      href: "/admin",
      icon: ShieldCheck,
      color: "from-blue-600 to-indigo-600",
      accent: "text-blue-500",
      cta: "Launch Venue Admin",
      badge: "Group Management",
    },
  ];

  const venueTypes = [
    {
      icon: UtensilsCrossed,
      title: "Traditional Restaurants",
      amharic: "ባህላዊ ምግብ ቤቶች",
      desc: "Perfect for sizzling clay pot tibs, slow-cooked festive wats, beyaynetu platters, and coffee ceremonies with high guest volumes.",
    },
    {
      icon: Coffee,
      title: "Cafes & Roasteries",
      amharic: "ካፌዎች እና ኬክ ቤቶች",
      desc: "Speed up morning rushes for macchiatos, chechebsa, and pastries with rapid table and counter QR ordering.",
    },
    {
      icon: Building2,
      title: "Hotels & Resorts",
      amharic: "ሆቴሎች እና ሪዞርቶች",
      desc: "Enable effortless poolside ordering, patio dining, and room service without guests having to call the front desk.",
    },
    {
      icon: Wine,
      title: "Lounges & Bars",
      amharic: "ላውንጆች እና ክበቦች",
      desc: "Eliminate crowded bar queues by letting patrons reorder drinks, appetizers, and snacks directly from their seats.",
    },
  ];

  const businessPillars = [
    {
      icon: TrendingUp,
      title: "Higher Average Order Value",
      desc: "Rich dish photography, dietary tags (Fasting, Spice Level), and seamless beverage reordering increase customer spend by up to 30%.",
    },
    {
      icon: Send,
      title: "Instant Telegram Dispatch",
      desc: "Orders instantly notify kitchen display screens and staff Telegram channels with interactive status buttons for swift coordination.",
    },
    {
      icon: FileSpreadsheet,
      title: "Zero Menu Reprinting Costs",
      desc: "Change dish prices, highlight daily specials, or switch to Fasting (የጾም) menus in seconds without paying for paper printing.",
    },
    {
      icon: Smartphone,
      title: "Zero App Download for Diners",
      desc: "Guests simply point their mobile camera at the table stand. Works on all iOS and Android devices without installing any apps.",
    },
    {
      icon: Clock,
      title: "Faster Table Turnover",
      desc: "Diners browse and order immediately upon seating, cutting wait times, freeing staff to provide attentive hospitality.",
    },
    {
      icon: Zap,
      title: "100% Ethiopian Birr (ETB) Ready",
      desc: "Designed specifically for Ethiopian hospitality with local currency (ETB), automated 15% VAT, and customizable service charges.",
    },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="w-full pt-16 pb-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden bg-gradient-to-b from-orange-50/50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Hospitality Platform for Ethiopian Venues</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Contactless QR Dining, Instant Kitchen Dispatch &{" "}
            <span className="bg-linear-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
              Telegram Order Sync.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Empower your restaurant, cafe, or hotel with elegant QR table menus in Ethiopian Birr (ETB). Eliminate order delays, boost sales with mouthwatering dish photos, and synchronize front-of-house with the kitchen in real time.
          </p>

          {/* Primary Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="#"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Experience Guest Menu (Table 4)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="#"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-orange-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-xs transition-all"
            >
              <Store className="w-4 h-4 text-orange-600" />
              <span>Venue Management Portal</span>
            </Link>

            <Link
              href="#"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
            >
              <ChefHat className="w-4 h-4 text-rose-500" />
              <span>Live Kitchen Board</span>
            </Link>
          </div>

          {/* Trust Value Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No App Download Needed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Priced & Computed in ETB
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant Telegram Sync
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> High-DPI Table QR Stands
            </span>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE PLATFORM SHOWCASE */}
      <section id="demo" className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400">
            Complete Digital Hospitality Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Designed for Every Step of Your Service
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            From the moment guests sit down to food preparation and operational analytics, explore the connected ecosystem live in action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portalShowcases.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.title}
                className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900/90 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 hover:border-orange-500/50 transition-all hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-linear-to-tr ${portal.color} flex items-center justify-center text-white shadow-md`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {portal.badge}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 block mb-1">
                    {portal.audience}
                  </span>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {portal.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {portal.description}
                  </p>
                </div>

                <Link
                  href={portal.href}
                  className="mt-auto inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-600 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all group-hover:shadow-md"
                >
                  <span>{portal.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. HOW IT WORKS (FOR DINERS & FOR VENUES) */}
      <section
        id="how-it-works"
        className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80"
      >
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400">
              Effortless Simplicity
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              How the Smart QR Experience Works
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No complex installations, no costly proprietary hardware. Designed to work smoothly on standard phones and tablets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                1. Diners Scan Table Stand
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Guests arrive, scan the branded high-resolution QR card with their camera, and their assigned table number is recognized instantly. Zero download or account creation needed.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                2. Browse Visual Menu & Order
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Guests view vibrant photos of traditional dishes, fast filters (Fasting / የጾም, Tibs, Drinks), specify kitchen notes (e.g. extra mitmita), review clear ETB pricing with VAT, and place their order.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                3. Kitchen Prepares & Syncs
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Chefs receive tickets live on the kitchen display, while waitstaff get automated Telegram alerts. Diners watch the preparation status live on their own phones without waiting for staff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY ADVANTAGES FOR RESTAURANT & HOTEL OWNERS */}
      <section id="features" className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400">
            Designed for Hospitality ROI
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Built to Grow Your Revenue & Delight Diners
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Address the everyday bottlenecks of dining operations: save time, cut costs, and delight guests with modern hospitality standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-orange-500/40 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. TAILORED FOR EVERY VENUE TYPE */}
      <section id="venues" className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400">
              Versatile Hospitality Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Trusted by Dining Establishments Across Addis Ababa
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Whether you operate a heritage cultural restaurant, high-energy cafe, or luxury hotel lounge, QRCOS adapts seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {venueTypes.map((venue) => {
              const Icon = venue.icon;
              return (
                <div
                  key={venue.title}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        {venue.title}
                      </h4>
                      <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                        {venue.amharic}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {venue.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. DINER ORDER TRACKING CALLOUT */}
      <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-linear-to-r from-orange-600 to-amber-600 p-8 sm:p-10 text-white shadow-xl shadow-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <History className="w-3.5 h-3.5" />
              <span>Guest Order Tracking</span>
            </div>
            <h3 className="text-2xl font-black">
              Already Placed an Order at a Table?
            </h3>
            <p className="text-xs sm:text-sm text-orange-100 max-w-lg">
              Check live kitchen preparation status, review your itemized receipt, or easily reorder favorites from your recent orders history.
            </p>
          </div>

          <Link
            href="/my-history"
            className="px-6 py-3.5 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 active:scale-98 font-bold text-xs sm:text-sm whitespace-nowrap shadow-md transition-all shrink-0"
          >
            Track My Order Status
          </Link>
        </div>
      </section>

      {/* 7. BOTTOM CTA & FOOTER */}
      <footer className="w-full pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800 text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm">
            <QrCode className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            QRCOS Hospitality Platform
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          The contactless QR ordering platform engineered for Ethiopian restaurants, cafes, hotels, and lounges. Powered with real-time Telegram synchronization.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <Link href="#" className="hover:text-orange-600 transition">
            Guest Table Menu
          </Link>
          <Link href="#" className="hover:text-orange-600 transition">
            Kitchen Live Dispatch
          </Link>
          <Link href="#" className="hover:text-orange-600 transition">
            Restaurant Owner Portal
          </Link>
          <Link href="#" className="hover:text-orange-600 transition">
            Multi-Branch Admin
          </Link>
          <Link href="/my-history" className="hover:text-orange-600 transition">
            Order Tracking
          </Link>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-4">
          © {new Date().getFullYear()} QRCOS. Addis Ababa, Ethiopia. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
