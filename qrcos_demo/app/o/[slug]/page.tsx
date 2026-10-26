"use client";

import React, { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Filter,
  Volume2,
  VolumeX,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface OrderTicket {
  _id: string;
  table: string;
  customerName: string;
  notes: string;
  details: { name: string; quantity: number; unitPrice: number; subtotalPrice: number }[];
  fees: { feeName: string; calculatedAmount: number }[];
  subtotal: number;
  totalPrice: number;
  status: "pending" | "preparing" | "completed";
  orderedAt: string;
  startPreparingAt?: string;
  completedAt?: string;
}

export default function KitchenOrderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [restaurantName, setRestaurantName] = useState(slug);
  const [orders, setOrders] = useState<OrderTicket[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "preparing" | "completed">("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastOrderCountRef = useRef(0);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders/restaurant/${slug}`);
      if (res.ok) {
        const data = await res.json();
        const incomingOrders: OrderTicket[] = data.orders || [];
        setOrders(incomingOrders);
        if (data.restaurant?.name) {
          setRestaurantName(data.restaurant.name);
        }

        // Check for new incoming pending orders to play sound chime
        const pendingCount = incomingOrders.filter((o) => o.status === "pending").length;
        if (soundEnabled && lastOrderCountRef.current > 0 && pendingCount > lastOrderCountRef.current) {
          playOrderChime();
        }
        lastOrderCountRef.current = pendingCount;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const playOrderChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext blocked or unsupported
    }
  };

  // 1-second polling as specified in qrcos_demo.md
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 1000);
    return () => clearInterval(interval);
  }, [slug]);

  const handleUpdateStatus = async (orderId: string, status: "pending" | "preparing" | "completed") => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status } : o))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Kitchen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {restaurantName} Kitchen Display
              </h1>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live 1s Polling
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Auto-syncs with customer orders and Telegram kitchen channel callbacks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              soundEnabled
                ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                : "bg-slate-50 dark:bg-slate-900 text-slate-400 border-transparent"
            }`}
            title="Toggle new order sound chime"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
            <span>Sound {soundEnabled ? "On" : "Off"}</span>
          </button>

          <Link
            href={`/r/${slug}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition"
          >
            Owner Portal <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Counts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeFilter === "all"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
          }`}
        >
          <span>All Orders</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono">
            {orders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("pending")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeFilter === "pending"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800 hover:bg-blue-50/50"
          }`}
        >
          <span>⏳ Pending</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono">
            {pendingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("preparing")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeFilter === "preparing"
              ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
              : "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-800 hover:bg-amber-50/50"
          }`}
        >
          <span>👨‍🍳 Preparing</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono">
            {preparingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("completed")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeFilter === "completed"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
              : "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 hover:bg-emerald-50/50"
          }`}
        >
          <span>✅ Completed</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
            {completedCount}
          </span>
        </button>
      </div>

      {/* TICKET CARDS GRID */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-slate-500 text-sm">No orders matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((ticket) => {
            const timeAgo = formatTimeAgo(ticket.orderedAt);
            const isUpdating = updatingId === ticket._id;

            return (
              <div
                key={ticket._id}
                className={`flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border transition shadow-sm overflow-hidden ${
                  ticket.status === "pending"
                    ? "border-blue-500/50 shadow-blue-500/10 ring-2 ring-blue-500/20"
                    : ticket.status === "preparing"
                    ? "border-amber-500/50 shadow-amber-500/10"
                    : "border-slate-200 dark:border-slate-800 opacity-80"
                }`}
              >
                {/* Ticket Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        Table {ticket.table}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {ticket.customerName} • <span className="font-mono">{timeAgo}</span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        ticket.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : ticket.status === "preparing"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 border border-blue-500/20 animate-pulse"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  {ticket.notes && (
                    <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-medium">
                      📝 Note: &quot;{ticket.notes}&quot;
                    </div>
                  )}

                  {/* Items List */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {ticket.details?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold font-mono text-slate-700 dark:text-slate-300">
                            {item.quantity}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-mono text-slate-500">
                          ${Number(item.subtotalPrice).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Footer & Status Controls */}
                <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 mt-auto space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span className="text-slate-500 dark:text-slate-400 font-normal">
                      Total ({ticket.fees?.length || 0} fees incl.)
                    </span>
                    <span className="font-mono text-orange-600 text-sm">
                      ${Number(ticket.totalPrice).toFixed(2)}
                    </span>
                  </div>

                  {/* Interactive Status Switcher */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(ticket._id, "pending")}
                      className={`py-2 rounded-xl text-xs font-semibold transition ${
                        ticket.status === "pending"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      Pending
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(ticket._id, "preparing")}
                      className={`py-2 rounded-xl text-xs font-semibold transition ${
                        ticket.status === "preparing"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      Preparing
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(ticket._id, "completed")}
                      className={`py-2 rounded-xl text-xs font-semibold transition ${
                        ticket.status === "completed"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      Completed
                    </button>
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

function formatTimeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}
