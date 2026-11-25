"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { formatOrderDateTime } from "@/lib/utils";
import { useI18n } from "@/components/I18nProvider";
import {
  History,
  Clock,
  CheckCircle2,
  ChefHat,
  ShoppingBag,
  Trash2,
  ExternalLink,
  Loader2,
  Edit2,
} from "lucide-react";

interface SavedOrderRef {
  orderId: string;
  restaurantSlug: string;
  restaurantName: string;
  table: string;
  totalPrice: number;
  orderedAt: string;
}

interface OrderLiveState {
  _id: string;
  restaurant: { name: string; slug: string; logoUrl?: string };
  table: string;
  customerName: string;
  details: { name: string; quantity: number; unitPrice: number; subtotalPrice: number }[];
  fees: { feeName: string; calculatedAmount: number }[];
  subtotal: number;
  totalPrice: number;
  status: "pending" | "preparing" | "completed";
  orderedAt: string;
}

export default function MyHistoryPage() {
  const { t } = useI18n();
  const [savedRefs, setSavedRefs] = useState<SavedOrderRef[]>([]);
  const [liveOrders, setLiveOrders] = useState<Record<string, OrderLiveState>>({});
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("qrcos_customer_orders");
      if (stored) {
        const parsed: SavedOrderRef[] = JSON.parse(stored);
        setSavedRefs(parsed);
      }
    } catch (err) {
      console.error("Failed to read localStorage:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll active orders every 1 second as specified in qrcos_demo.md
  useEffect(() => {
    if (savedRefs.length === 0) return;

    const fetchAllStatuses = async () => {
      const updates: Record<string, OrderLiveState> = {};
      await Promise.all(
        savedRefs.map(async (ref) => {
          try {
            const res = await fetch(`/api/orders/${ref.orderId}`, {
              cache: "no-store",
            });
            if (res.ok) {
              const data = await res.json();
              if (data.order) {
                updates[ref.orderId] = data.order;
              }
            }
          } catch (err) {
            console.error("Order fetch error:", err);
          }
        })
      );
      setLiveOrders((prev) => ({ ...prev, ...updates }));
    };

    fetchAllStatuses();
    pollTimerRef.current = setInterval(fetchAllStatuses, 1000); // 1-second polling

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [savedRefs]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(t("menu.confirmCancelOrder"))) {
      return;
    }

    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || t("menu.failedCancelOrder"));
        return;
      }

      const updatedRefs = savedRefs.filter((r) => r.orderId !== orderId);
      localStorage.setItem("qrcos_customer_orders", JSON.stringify(updatedRefs));
      setSavedRefs(updatedRefs);
      setLiveOrders((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    } catch (err: any) {
      alert(err.message || t("menu.failedCancelOrder"));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 pb-safe space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {t("history.title")}
              </h1>
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                {t("history.saved")}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("history.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : savedRefs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {t("history.noOrdersTitle")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {t("history.noOrdersDesc")}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-md transition"
            >
              {t("history.tryOrdering")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {savedRefs.map((ref) => {
            const live = liveOrders[ref.orderId];
            const currentStatus = live ? live.status : "pending";

            return (
              <div
                key={ref.orderId}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 hover:border-orange-500/30 transition"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {live?.restaurant?.name || ref.restaurantName}
                      </h3>
                      <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-md">
                        {t("common.tableWithNumber", { table: live?.table || ref.table })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t("history.orderedOn", { date: formatOrderDateTime(ref.orderedAt, { includeZone: true }) })}
                    </p>
                  </div>

                  {/* Status Pill with animated indicator */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider ${
                        currentStatus === "completed"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : currentStatus === "preparing"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      }`}
                    >
                      {currentStatus === "completed" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>{t("history.readyServed")}</span>
                        </>
                      ) : currentStatus === "preparing" ? (
                        <>
                          <ChefHat className="w-4 h-4 text-amber-500 animate-bounce" />
                          <span>{t("history.cookingKitchen")}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-blue-500 animate-spin" />
                          <span>{t("history.orderReceived")}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                  <div
                    className={`py-1.5 rounded-lg transition ${
                      currentStatus === "pending" ||
                      currentStatus === "preparing" ||
                      currentStatus === "completed"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {t("history.step1")}
                  </div>
                  <div
                    className={`py-1.5 rounded-lg transition ${
                      currentStatus === "preparing" ||
                      currentStatus === "completed"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {t("history.step2")}
                  </div>
                  <div
                    className={`py-1.5 rounded-lg transition ${
                      currentStatus === "completed"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {t("history.step3")}
                  </div>
                </div>

                {/* Items breakdown if live loaded */}
                {live && live.details && (
                  <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    {live.details.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.name} <span className="text-slate-400">x{item.quantity}</span>
                        </span>
                        <span className="font-mono">{Number(item.subtotalPrice).toFixed(2)} {t("common.etb")}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total & Action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-slate-400 mr-2">{t("menu.grandTotal")}</span>
                    <span className="font-extrabold text-sm font-mono text-orange-600">
                      {Number(live?.totalPrice || ref.totalPrice).toFixed(2)} {t("common.etb")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {currentStatus === "pending" && live && (
                      <>
                        <Link
                          href={`/m/${ref.restaurantSlug}?table=${encodeURIComponent(live.table || ref.table)}&editOrder=${ref.orderId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-700 dark:text-slate-200 hover:text-orange-600 text-xs font-semibold transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{t("common.edit")}</span>
                        </Link>
                        <button
                          type="button"
                          disabled={cancellingId === ref.orderId}
                          onClick={() => handleCancelOrder(ref.orderId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-600 dark:text-rose-400 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                          {cancellingId === ref.orderId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>{t("common.cancel")}</span>
                        </button>
                      </>
                    )}

                    <Link
                      href={`/m/${ref.restaurantSlug}?table=${ref.table}`}
                      className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline"
                    >
                      {t("history.reorder")} <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
