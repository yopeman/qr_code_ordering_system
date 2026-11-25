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
import { getServerI18n } from "@/lib/i18n/server";

export default async function HomePage() {
  const { t } = await getServerI18n();

  const portalShowcases = [
    {
      title: t("home.portal1.title"),
      audience: t("home.portal1.audience"),
      description: t("home.portal1.desc"),
      href: "/m/habesha-restaurant?table=4",
      icon: UtensilsCrossed,
      color: "from-orange-600 to-amber-600",
      cta: t("home.portal1.cta"),
      badge: t("home.portal1.badge"),
    },
    {
      title: t("home.portal2.title"),
      audience: t("home.portal2.audience"),
      description: t("home.portal2.desc"),
      href: "/o/habesha-restaurant",
      icon: ChefHat,
      color: "from-rose-600 to-pink-600",
      cta: t("home.portal2.cta"),
      badge: t("home.portal2.badge"),
    },
    {
      title: t("home.portal3.title"),
      audience: t("home.portal3.audience"),
      description: t("home.portal3.desc"),
      href: "/r/habesha-restaurant",
      icon: Store,
      color: "from-emerald-600 to-teal-600",
      cta: t("home.portal3.cta"),
      badge: t("home.portal3.badge"),
    },
    {
      title: t("home.portal4.title"),
      audience: t("home.portal4.audience"),
      description: t("home.portal4.desc"),
      href: "/admin",
      icon: ShieldCheck,
      color: "from-blue-600 to-indigo-600",
      cta: t("home.portal4.cta"),
      badge: t("home.portal4.badge"),
    },
  ];

  const venueTypes = [
    {
      icon: UtensilsCrossed,
      title: t("home.venue1.title"),
      sub: t("home.venue1.sub"),
      desc: t("home.venue1.desc"),
    },
    {
      icon: Coffee,
      title: t("home.venue2.title"),
      sub: t("home.venue2.sub"),
      desc: t("home.venue2.desc"),
    },
    {
      icon: Building2,
      title: t("home.venue3.title"),
      sub: t("home.venue3.sub"),
      desc: t("home.venue3.desc"),
    },
    {
      icon: Wine,
      title: t("home.venue4.title"),
      sub: t("home.venue4.sub"),
      desc: t("home.venue4.desc"),
    },
  ];

  const businessPillars = [
    {
      icon: TrendingUp,
      title: t("home.pillar1.title"),
      desc: t("home.pillar1.desc"),
    },
    {
      icon: Send,
      title: t("home.pillar2.title"),
      desc: t("home.pillar2.desc"),
    },
    {
      icon: FileSpreadsheet,
      title: t("home.pillar3.title"),
      desc: t("home.pillar3.desc"),
    },
    {
      icon: Smartphone,
      title: t("home.pillar4.title"),
      desc: t("home.pillar4.desc"),
    },
    {
      icon: Clock,
      title: t("home.pillar5.title"),
      desc: t("home.pillar5.desc"),
    },
    {
      icon: Zap,
      title: t("home.pillar6.title"),
      desc: t("home.pillar6.desc"),
    },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="w-full pt-16 pb-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden bg-gradient-to-b from-orange-50/50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("home.badge")}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {t("home.heroTitle1")}{" "}
            <span className="bg-linear-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
              {t("home.heroTitleHighlight")}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t("home.heroDesc")}
          </p>

          {/* Primary Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/m/habesha-restaurant?table=4"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>{t("home.ctaMenu")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/r/habesha-restaurant"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-orange-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-xs transition-all"
            >
              <Store className="w-4 h-4 text-orange-600" />
              <span>{t("home.ctaOwner")}</span>
            </Link>

            <Link
              href="/o/habesha-restaurant"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
            >
              <ChefHat className="w-4 h-4 text-rose-500" />
              <span>{t("home.ctaKitchen")}</span>
            </Link>
          </div>

          {/* Trust Value Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t("home.trust1")}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t("home.trust2")}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t("home.trust3")}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t("home.trust4")}
            </span>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE PLATFORM SHOWCASE */}
      <section id="demo" className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400">
            {t("home.suiteEyebrow")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t("home.suiteTitle")}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {t("home.suiteDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portalShowcases.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.href}
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
              {t("home.howEyebrow")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {t("home.howTitle")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("home.howDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("home.step1.title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("home.step1.desc")}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("home.step2.title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("home.step2.desc")}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("home.step3.title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("home.step3.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY ADVANTAGES FOR RESTAURANT & HOTEL OWNERS */}
      <section id="features" className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400">
            {t("home.roiEyebrow")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t("home.roiTitle")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("home.roiDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
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
              {t("home.venuesEyebrow")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t("home.venuesTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t("home.venuesDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {venueTypes.map((venue, idx) => {
              const Icon = venue.icon;
              return (
                <div
                  key={idx}
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
                        {venue.sub}
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
              <span>{t("home.trackingBadge")}</span>
            </div>
            <h3 className="text-2xl font-black">
              {t("home.trackingTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-orange-100 max-w-lg">
              {t("home.trackingDesc")}
            </p>
          </div>

          <Link
            href="/my-history"
            className="px-6 py-3.5 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 active:scale-98 font-bold text-xs sm:text-sm whitespace-nowrap shadow-md transition-all shrink-0"
          >
            {t("home.trackingCta")}
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
            {t("home.footerTitle")}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {t("home.footerDesc")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <Link href="/m/habesha-restaurant?table=4" className="hover:text-orange-600 transition">
            {t("home.footerLink1")}
          </Link>
          <Link href="/o/habesha-restaurant" className="hover:text-orange-600 transition">
            {t("home.footerLink2")}
          </Link>
          <Link href="/r/habesha-restaurant" className="hover:text-orange-600 transition">
            {t("home.footerLink3")}
          </Link>
          <Link href="/admin" className="hover:text-orange-600 transition">
            {t("home.footerLink4")}
          </Link>
          <Link href="/my-history" className="hover:text-orange-600 transition">
            {t("home.footerLink5")}
          </Link>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-4">
          {t("home.footerCopy", { year: new Date().getFullYear() })}
        </p>
      </footer>
    </div>
  );
}
