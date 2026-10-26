"use client";

import React, { useState, useEffect, use, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Modal } from "@/components/Modal";
import { DishImageGallery } from "@/components/DishImageGallery";
import {
  UtensilsCrossed,
  ShoppingBag,
  Plus,
  Minus,
  Search,
  CheckCircle2,
  Clock,
  ChefHat,
  AlertCircle,
  X,
  History,
  Info,
  Loader2,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";

interface MenuItem {
  _id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  detail: { key: string; value: string }[];
  imgUrls: string[];
  visibility: "public" | "private";
}

interface CartItem {
  menu: MenuItem;
  quantity: number;
}

interface RestaurantInfo {
  _id: string;
  name: string;
  slug: string;
  description: string;
  detail: { key: string; value: string }[];
  logoUrl: string;
  status: string;
  config: { feeName: string; type: "percent" | "fixed"; amount: number }[];
}

export default function DinerMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();

  // Table number from URL query ?table=12
  const queryTable = searchParams.get("table") || "";
  const [table, setTable] = useState(queryTable);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableInput, setTableInput] = useState(queryTable || "12");

  // Restaurant & Menu Data
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  // Dish Lightbox Modal
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  // Active Placed Order & 1s Polling
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeOrderData, setActiveOrderData] = useState<any>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
    if (!queryTable) {
      setTableModalOpen(true);
    }
  }, [slug, queryTable]);

  // Regular 1-second polling when an order is active
  useEffect(() => {
    if (!activeOrderId) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${activeOrderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            setActiveOrderData(data.order);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    poll(); // immediate first check
    pollIntervalRef.current = setInterval(poll, 1000); // 1-second polling as per spec

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeOrderId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const restRes = await fetch(`/api/restaurants/${slug}`);
      if (restRes.ok) {
        const data = await restRes.json();
        setRestaurant(data.restaurant);
      }

      const menuRes = await fetch(`/api/restaurants/${slug}/menus`);
      if (menuRes.ok) {
        const data = await menuRes.json();
        const items: MenuItem[] = data.menus || [];
        setMenus(items);

        const cats = ["All", ...Array.from(new Set(items.map((m) => m.category)))];
        setCategories(cats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (tableInput.trim()) {
      setTable(tableInput.trim());
      setTableModalOpen(false);
    }
  };

  const addToCart = (menu: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menu._id === menu._id);
      if (existing) {
        return prev.map((item) =>
          item.menu._id === menu._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menu, quantity: 1 }];
    });
  };

  const updateCartQuantity = (menuId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.menu._id === menuId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const getItemQuantityInCart = (menuId: string): number => {
    const found = cart.find((c) => c.menu._id === menuId);
    return found ? found.quantity : 0;
  };

  // Pricing & Fees computation
  const subtotal = Number(
    cart
      .reduce((sum, item) => sum + item.menu.price * item.quantity, 0)
      .toFixed(2)
  );

  const calculatedFees = (restaurant?.config || []).map((cfg) => {
    const amount =
      cfg.type === "percent"
        ? Number(((subtotal * cfg.amount) / 100).toFixed(2))
        : Number(Number(cfg.amount).toFixed(2));
    return {
      feeName: cfg.feeName,
      type: cfg.type,
      rate: cfg.amount,
      amount,
    };
  });

  const totalFees = Number(
    calculatedFees.reduce((sum, f) => sum + f.amount, 0).toFixed(2)
  );
  const grandTotal = Number((subtotal + totalFees).toFixed(2));
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Submit Order
  const handlePlaceOrder = async () => {
    if (!table) {
      setTableModalOpen(true);
      return;
    }

    if (cart.length === 0) return;

    setPlacingOrder(true);
    try {
      const payload = {
        restaurantSlug: slug,
        table,
        customerName: customerName.trim() || "Guest",
        notes: orderNotes.trim(),
        items: cart.map((c) => ({
          menuId: c.menu._id,
          quantity: c.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to place order");
        return;
      }

      // Store in localStorage as required by spec:
      // "can place order, and store order id to localStorage"
      const existingSaved = JSON.parse(
        localStorage.getItem("qrcos_customer_orders") || "[]"
      );
      const newSaved = [
        {
          orderId: data.orderId,
          restaurantSlug: slug,
          restaurantName: restaurant?.name || slug,
          table,
          totalPrice: grandTotal,
          orderedAt: new Date().toISOString(),
        },
        ...existingSaved,
      ];
      localStorage.setItem("qrcos_customer_orders", JSON.stringify(newSaved));

      // Clear cart & switch to active order tracking
      setCart([]);
      setCartDrawerOpen(false);
      setActiveOrderId(data.orderId);
      setActiveOrderData(data.order);
    } catch (err: any) {
      alert(err.message || "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  const filteredMenus = menus.filter((item) => {
    const matchCat =
      activeCategory === "All" || item.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <h2 className="text-xl font-bold mb-2">Restaurant Not Found</h2>
          <p className="text-sm text-slate-500 mb-4">
            Could not locate restaurant &quot;{slug}&quot;.
          </p>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-semibold"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 pb-28 space-y-6">
      {/* Restaurant Header Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {restaurant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-2xl">
                {restaurant.name.charAt(0)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {restaurant.name}
                </h1>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Open
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {restaurant.description}
              </p>
            </div>
          </div>

          {/* Table Pill */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => {
                setTableInput(table || "12");
                setTableModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80 text-xs font-bold hover:scale-105 transition shadow-sm"
            >
              <span>Table {table || "Not Set"}</span>
              <span className="text-[10px] font-normal underline">Change</span>
            </button>

            <Link
              href="/my-history"
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="View past orders"
            >
              <History className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Restaurant Attributes Badges */}
        {restaurant.detail?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 text-xs">
            {restaurant.detail.map((d, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px]"
              >
                <b>{d.key}:</b> {d.value}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVE ORDER LIVE TRACKER BANNER (1-Second Polling) */}
      {activeOrderData && (
        <div className="rounded-3xl bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white shadow-xl shadow-orange-500/20 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                {activeOrderData.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                ) : activeOrderData.status === "preparing" ? (
                  <ChefHat className="w-5 h-5 text-amber-200 animate-bounce" />
                ) : (
                  <Clock className="w-5 h-5 text-white animate-spin" />
                )}
              </span>
              <div>
                <h3 className="font-extrabold text-base">
                  Order Status: {activeOrderData.status.toUpperCase()}
                </h3>
                <p className="text-xs text-orange-100">
                  Live polling updates every 1s from kitchen
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveOrderId(null)}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition"
            >
              Dismiss
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold pt-2">
            <div
              className={`p-2.5 rounded-xl transition ${
                activeOrderData.status === "pending" ||
                activeOrderData.status === "preparing" ||
                activeOrderData.status === "completed"
                  ? "bg-white text-orange-700 shadow-md"
                  : "bg-white/10 text-white/60"
              }`}
            >
              1. ⏳ Pending
            </div>

            <div
              className={`p-2.5 rounded-xl transition ${
                activeOrderData.status === "preparing" ||
                activeOrderData.status === "completed"
                  ? "bg-white text-orange-700 shadow-md"
                  : "bg-white/10 text-white/60"
              }`}
            >
              2. 👨‍🍳 Preparing
            </div>

            <div
              className={`p-2.5 rounded-xl transition ${
                activeOrderData.status === "completed"
                  ? "bg-white text-emerald-700 shadow-md"
                  : "bg-white/10 text-white/60"
              }`}
            >
              3. ✅ Ready
            </div>
          </div>
        </div>
      )}

      {/* Search & Category Pills */}
      <div className="space-y-4 sticky top-16 z-30 pt-2 pb-2 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes, ingredients, drinks..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-orange-600 text-white shadow-md shadow-orange-500/20 scale-[1.02]"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* DISHES LIST */}
      {filteredMenus.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          No dishes found matching your selection.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMenus.map((dish) => {
            const inCart = getItemQuantityInCart(dish._id);
            return (
              <div
                key={dish._id}
                className="flex rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:border-orange-500/40 transition gap-4 group"
              >
                {/* Photo thumbnail - click opens lightbox modal */}
                {dish.imgUrls?.[0] ? (
                  <button
                    type="button"
                    onClick={() => setSelectedDish(dish)}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 relative bg-slate-100 focus:outline-none"
                    title="Click to view details and full photo"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dish.imgUrls[0]}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {dish.imgUrls.length > 1 ? (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1 shadow">
                        <ImageIcon className="w-2.5 h-2.5" />
                        {dish.imgUrls.length}
                      </span>
                    ) : (
                      <span className="absolute bottom-1 right-1 p-1 rounded-md bg-slate-950/60 text-white">
                        <Sparkles className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDish(dish)}
                        className="text-left font-bold text-sm text-slate-900 dark:text-white hover:text-orange-600 transition"
                      >
                        {dish.name}
                      </button>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                        ${Number(dish.price).toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {dish.description}
                    </p>
                  </div>

                  {/* Quantity Stepper / Add button */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {dish.category}
                    </span>

                    {inCart > 0 ? (
                      <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/50 p-1 rounded-xl border border-orange-200 dark:border-orange-800">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(dish._id, -1)}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 text-orange-600 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 touch-manipulation"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-xs text-orange-600 px-1 font-mono">
                          {inCart}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(dish)}
                          className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 touch-manipulation"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(dish)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500/10 text-orange-600 hover:bg-orange-600 hover:text-white font-bold text-xs transition active:scale-95 touch-manipulation"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING CART BAR (Mobile & Desktop with Safe-Area support) */}
      {cart.length > 0 && (
        <div className="fixed bottom-safe left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40 animate-in slide-in-from-bottom duration-300">
          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-2xl shadow-orange-600/40 transition active:scale-[0.98] touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs">
                {totalCartCount}
              </span>
              <div className="text-left">
                <span className="text-xs uppercase tracking-wider font-semibold opacity-90 block">
                  Table {table}
                </span>
                <span className="font-bold text-sm">View Order Basket</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base font-mono">
                ${grandTotal.toFixed(2)}
              </span>
              <ShoppingBag className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}

      {/* CART CHECKOUT DRAWER / MODAL */}
      <Modal
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        title={`Your Basket — Table ${table}`}
        maxWidth="max-w-lg"
      >
        <div className="space-y-5">
          {/* Itemized List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[40vh] overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.menu._id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {item.menu.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    ${Number(item.menu.price).toFixed(2)} each
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.menu._id, -1)}
                    className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-xs font-mono w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.menu._id, 1)}
                    className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="font-bold text-sm font-mono text-slate-900 dark:text-white w-16 text-right">
                  ${(item.menu.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Guest Name & Notes */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Special Kitchen Instructions / Allergies
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. No onions, dressing on side"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Items Subtotal:</span>
              <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
            </div>

            {calculatedFees.map((fee, idx) => (
              <div key={idx} className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>
                  {fee.feeName} {fee.type === "percent" ? `(${fee.rate}%)` : ""}:
                </span>
                <span className="font-mono font-medium">${fee.amount.toFixed(2)}</span>
              </div>
            ))}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
              <span>Grand Total:</span>
              <span className="font-mono text-orange-600">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={placingOrder || cart.length === 0}
            className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-xl shadow-orange-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {placingOrder ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Dispatching to Kitchen...
              </>
            ) : (
              <>
                Confirm & Place Order (${grandTotal.toFixed(2)})
              </>
            )}
          </button>
        </div>
      </Modal>

      {/* MODAL: Dish Photo Lightbox */}
      {selectedDish && (
        <Modal
          isOpen={Boolean(selectedDish)}
          onClose={() => setSelectedDish(null)}
          title={selectedDish.name}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <DishImageGallery
              images={selectedDish.imgUrls || []}
              dishName={selectedDish.name}
            />

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                {selectedDish.category}
              </span>
              <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">
                ${Number(selectedDish.price).toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedDish.description}
            </p>

            {selectedDish.detail?.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-[11px] font-bold uppercase text-slate-400">
                  Dish Information
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedDish.detail.map((d, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800"
                    >
                      <span className="text-slate-400 text-[10px] block">{d.key}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                addToCart(selectedDish);
                setSelectedDish(null);
              }}
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition"
            >
              Add to Basket (${Number(selectedDish.price).toFixed(2)})
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL: Table Prompt if missing in URL */}
      <Modal
        isOpen={tableModalOpen}
        onClose={() => setTableModalOpen(false)}
        title="Enter Your Table Number"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleConfirmTable} className="space-y-4">
          <p className="text-xs text-slate-500">
            Please enter the table number shown on your table stand or ask your server.
          </p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            value={tableInput}
            onChange={(e) => setTableInput(e.target.value)}
            placeholder="e.g. 12"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition"
          >
            Confirm Table
          </button>
        </form>
      </Modal>
    </div>
  );
}
