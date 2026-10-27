"use client";

import React, { useState, useEffect, use } from "react";
import { Modal } from "@/components/Modal";
import { QRCodeModal } from "@/components/QRCodeModal";
import { LogoUpload } from "@/components/LogoUpload";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { DishImageGallery } from "@/components/DishImageGallery";
import { FeeConfigBuilder, FeeItem } from "@/components/FeeConfigBuilder";
import { KeyValueBuilder, KeyValueItem } from "@/components/KeyValueBuilder";
import {
  Store,
  UtensilsCrossed,
  Settings,
  ChefHat,
  QrCode,
  KeyRound,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Tag,
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

interface RestaurantProfile {
  _id: string;
  name: string;
  slug: string;
  description: string;
  detail: { key: string; value: string }[];
  logoUrl: string;
  expiredAt: string | null;
  status: "active" | "inactive" | "suspended";
  telegramChat: string;
  config: { feeName: string; type: "percent" | "fixed"; amount: number }[];
}

export default function RestaurantOwnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  // Auth state
  const [authChecking, setAuthChecking] = useState(true);
  const [isOwnerAuth, setIsOwnerAuth] = useState(false);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"menu" | "orders" | "settings">("menu");

  // Restaurant & Menu Data
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loadingMenus, setLoadingMenus] = useState(false);

  // Menu Modal State
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [previewDish, setPreviewDish] = useState<MenuItem | null>(null);
  const [menuFormData, setMenuFormData] = useState({
    category: "",
    name: "",
    description: "",
    price: "",
    imgUrls: [] as string[],
    details: [] as KeyValueItem[],
    visibility: "public" as "public" | "private",
  });
  const [savingMenu, setSavingMenu] = useState(false);
  const [menuError, setMenuError] = useState("");
  const [isNewCategory, setIsNewCategory] = useState(false);

  // Derived Categories
  const existingCategories = Array.from(
    new Set(menus.map((m) => m.category?.trim()).filter((c): c is string => Boolean(c)))
  );
  const categories = ["All", ...existingCategories];

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "pending" | "preparing" | "completed">("all");
  const [loadingOrders, setLoadingOrders] = useState(false);

  // QR Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Change Password Modal
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [changeNewPwd, setChangeNewPwd] = useState("");
  const [changeConfirmPwd, setChangeConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState({ text: "", isError: false });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Settings form
  const [settingsFormData, setSettingsFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
    telegramChat: "",
    details: [] as KeyValueItem[],
    fees: [] as FeeItem[],
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    initAuthAndData();
  }, [slug]);

  const initAuthAndData = async () => {
    setAuthChecking(true);
    setAuthError("");
    try {
      // 1. Check if existing session cookie/token is valid for this slug
      const authRes = await fetch("/api/auth/restaurant");
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.authenticated && authData.restaurant?.slug === slug) {
          setIsOwnerAuth(true);
          await loadRestaurantData();
          return;
        }
      }

      // 2. Otherwise check password setup status
      const checkRes = await fetch("/api/auth/restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", slug }),
      });
      const checkData = await checkRes.json();

      if (!checkRes.ok) {
        setAuthError(checkData.error || "Restaurant not found");
        return;
      }

      setNeedsPasswordSetup(Boolean(checkData.needsPasswordSetup));
    } catch (err: any) {
      setAuthError(err.message || "Authentication error");
    } finally {
      setAuthChecking(false);
    }
  };

  const loadRestaurantData = async () => {
    try {
      // Fetch restaurant
      const restRes = await fetch(`/api/restaurants/${slug}`);
      if (restRes.ok) {
        const restData = await restRes.json();
        const r = restData.restaurant;
        setRestaurant(r);

        const details: KeyValueItem[] = (r.detail || []).map((d: any) => ({
          key: d.key,
          value: d.value,
        }));
        const fees: FeeItem[] = (r.config || []).map((c: any) => ({
          feeName: c.feeName,
          type: c.type,
          amount: c.amount,
        }));

        setSettingsFormData({
          name: r.name || "",
          description: r.description || "",
          logoUrl: r.logoUrl || "",
          telegramChat: r.telegramChat || "",
          details,
          fees,
        });
      }

      // Fetch menus
      await loadMenus();
    } catch (err) {
      console.error(err);
    }
  };

  const loadMenus = async () => {
    setLoadingMenus(true);
    try {
      const res = await fetch(`/api/restaurants/${slug}/menus`);
      if (res.ok) {
        const data = await res.json();
        setMenus(data.menus || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMenus(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders/restaurant/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Auth: Setup Password (null password onboarding)
  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!newPassword || newPassword.length < 4) {
      setAuthError("Password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "setup",
          slug,
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Failed to set up password");
        return;
      }

      localStorage.setItem(`qrcos-restaurant-${data.token}`, data.token);
      setIsOwnerAuth(true);
      await loadRestaurantData();
    } catch (err: any) {
      setAuthError(err.message || "Setup failed");
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth: Standard Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!loginPassword) {
      setAuthError("Password is required");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          slug,
          password: loginPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.needsPasswordSetup) {
          setNeedsPasswordSetup(true);
          return;
        }
        setAuthError(data.error || "Invalid password");
        return;
      }

      localStorage.setItem(`qrcos-restaurant-${data.token}`, data.token);
      setIsOwnerAuth(true);
      await loadRestaurantData();
    } catch (err: any) {
      setAuthError(err.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/restaurant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setIsOwnerAuth(false);
    setNeedsPasswordSetup(false);
    setLoginPassword("");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg({ text: "", isError: false });

    if (!changeNewPwd || changeNewPwd.length < 4) {
      setPwdMsg({ text: "New password must be at least 4 characters", isError: true });
      return;
    }
    if (changeNewPwd !== changeConfirmPwd) {
      setPwdMsg({ text: "Passwords do not match", isError: true });
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetch("/api/auth/restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change-password",
          slug,
          currentPassword: currentPwd,
          newPassword: changeNewPwd,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPwdMsg({ text: data.error || "Failed to update password", isError: true });
        return;
      }

      setPwdMsg({ text: "Password updated successfully!", isError: false });
      setTimeout(() => {
        setChangePwdOpen(false);
        setCurrentPwd("");
        setChangeNewPwd("");
        setChangeConfirmPwd("");
        setPwdMsg({ text: "", isError: false });
      }, 1500);
    } catch (err: any) {
      setPwdMsg({ text: err.message || "Failed to change password", isError: true });
    } finally {
      setPwdLoading(false);
    }
  };

  // Menu Management
  const openCreateMenuModal = () => {
    setEditingMenu(null);
    const initialCategory =
      selectedCategory !== "All"
        ? selectedCategory
        : existingCategories.length === 1
        ? existingCategories[0]
        : "";
    setIsNewCategory(existingCategories.length === 0);
    setMenuFormData({
      category: initialCategory,
      name: "",
      description: "",
      price: "",
      imgUrls: [],
      details: [],
      visibility: "public",
    });
    setMenuError("");
    setMenuModalOpen(true);
  };

  const openEditMenuModal = (item: MenuItem) => {
    setEditingMenu(item);
    const details: KeyValueItem[] = (item.detail || []).map((d) => ({
      key: d.key,
      value: d.value,
    }));
    const isExisting = existingCategories.includes(item.category);
    setIsNewCategory(!isExisting && !!item.category);
    setMenuFormData({
      category: item.category,
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      imgUrls: item.imgUrls || [],
      details,
      visibility: item.visibility,
    });
    setMenuError("");
    setMenuModalOpen(true);
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setMenuError("");

    if (!menuFormData.name.trim() || !menuFormData.category.trim() || !menuFormData.price) {
      setMenuError("Category, Name, and Price are required");
      return;
    }

    // Clean details
    const parsedDetail = (menuFormData.details || [])
      .filter((d) => d.key.trim() && d.value.trim())
      .map((d) => ({ key: d.key.trim(), value: d.value.trim() }));

    setSavingMenu(true);
    try {
      const payload = {
        category: menuFormData.category.trim(),
        name: menuFormData.name.trim(),
        description: menuFormData.description.trim(),
        price: parseFloat(menuFormData.price) || 0,
        detail: parsedDetail,
        imgUrls: menuFormData.imgUrls,
        visibility: menuFormData.visibility,
      };

      const url = editingMenu
        ? `/api/restaurants/${slug}/menus/${editingMenu._id}`
        : `/api/restaurants/${slug}/menus`;
      const method = editingMenu ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setMenuError(data.error || "Failed to save menu");
        return;
      }

      setMenuModalOpen(false);
      loadMenus();
    } catch (err: any) {
      setMenuError(err.message || "Failed to save menu");
    } finally {
      setSavingMenu(false);
    }
  };

  const handleDeleteMenu = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}" from your menu?`)) return;

    try {
      const res = await fetch(`/api/restaurants/${slug}/menus/${item._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadMenus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVisibility = async (item: MenuItem) => {
    const next = item.visibility === "public" ? "private" : "public";
    try {
      const res = await fetch(`/api/restaurants/${slug}/menus/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: next }),
      });
      if (res.ok) {
        setMenus((prev) =>
          prev.map((m) => (m._id === item._id ? { ...m, visibility: next } : m))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      // Clean details
      const detail = (settingsFormData.details || [])
        .filter((d) => d.key.trim() && d.value.trim())
        .map((d) => ({ key: d.key.trim(), value: d.value.trim() }));

      // Parse fees
      const config = (settingsFormData.fees || []).map((f) => ({
        feeName: f.feeName.trim(),
        type: f.type,
        amount: parseFloat(String(f.amount)) || 0,
      }));

      // Owner cannot modify status or expiredAt per spec
      const payload = {
        name: settingsFormData.name,
        description: settingsFormData.description,
        logoUrl: settingsFormData.logoUrl,
        telegramChat: settingsFormData.telegramChat?.trim() || "",
        detail,
        config,
      };

      const res = await fetch(`/api/restaurants/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setRestaurant(data.restaurant);
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Quick Kitchen status switcher
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
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
    }
  };

  const filteredMenus =
    selectedCategory === "All"
      ? menus
      : menus.filter((m) => m.category === selectedCategory);

  if (authChecking) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  // Auth Screen
  if (!isOwnerAuth) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 mx-auto mb-5">
            <Store className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
            Restaurant Owner Portal
          </h2>
          <p className="text-xs text-center font-mono text-orange-600 mt-1 mb-6">
            /r/{slug}
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {needsPasswordSetup ? (
            <form onSubmit={handleSetupPassword} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
                Welcome to your restaurant portal! Your account is currently unpassworded. Please establish a password to complete onboarding.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Create Owner Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 4 characters"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Set Password & Enter Dashboard
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Owner Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter restaurant password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Log In
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Restaurant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 sm:gap-4">
          {restaurant?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={restaurant.logoUrl}
              alt={restaurant.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-xl shrink-0">
              {restaurant?.name?.charAt(0) || "R"}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {restaurant?.name}
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                {restaurant?.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>Owner Dashboard</span>
              <span>•</span>
              <a
                href={`/m/${slug}?table=12`}
                target="_blank"
                rel="noreferrer"
                className="text-orange-600 hover:underline flex items-center gap-1 font-mono"
              >
                /m/{slug} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition touch-manipulation"
          >
            <QrCode className="w-4 h-4" />
            <span>Table QR Stand</span>
          </button>

          <button
            type="button"
            onClick={() => setChangePwdOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition touch-manipulation"
          >
            <KeyRound className="w-4 h-4" />
            <span>Password</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition touch-manipulation"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab("menu")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition shrink-0 px-2 sm:px-0 touch-manipulation ${
            activeTab === "menu"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          Menu Management ({menus.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("orders");
            loadOrders();
          }}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition shrink-0 px-2 sm:px-0 touch-manipulation ${
            activeTab === "orders"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ChefHat className="w-4 h-4" />
          Live Orders ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition shrink-0 px-2 sm:px-0 touch-manipulation ${
            activeTab === "settings"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          Restaurant Settings
        </button>
      </div>

      {/* TAB 1: MENU MANAGEMENT */}
      {activeTab === "menu" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 max-w-xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 touch-manipulation ${
                    selectedCategory === cat
                      ? "bg-orange-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={openCreateMenuModal}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-semibold text-xs shadow-md transition touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              Add Dish
            </button>
          </div>

          {loadingMenus ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : filteredMenus.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <p className="text-slate-500 text-sm">No dishes found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenus.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:border-orange-500/30 transition group"
                >
                  <div>
                    {item.imgUrls?.[0] ? (
                      <div
                        onClick={() => setPreviewDish(item)}
                        className="h-44 w-full overflow-hidden bg-slate-100 relative cursor-pointer group/img"
                        title="Click to preview photos"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imgUrls[0]}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-3 right-3 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full backdrop-blur-md ${
                            item.visibility === "public"
                              ? "bg-emerald-900/80 text-emerald-200 border border-emerald-500/30"
                              : "bg-slate-900/80 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {item.visibility}
                        </span>
                        {item.imgUrls.length > 1 && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1 shadow">
                            <ImageIcon className="w-2.5 h-2.5" />
                            {item.imgUrls.length} photos
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="h-32 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                        No Photo
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                          {item.category}
                        </span>
                        <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                          ${Number(item.price).toFixed(2)}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">
                        {item.name}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {item.description || "No description provided."}
                      </p>

                      {item.detail?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {item.detail.map((d, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              {d.key}: {d.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(item)}
                      className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                    >
                      {item.visibility === "public" ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>Private</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditMenuModal(item)}
                        className="p-2 sm:p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 touch-manipulation inline-flex items-center justify-center"
                        title="Edit Dish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMenu(item)}
                        className="p-2 sm:p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 touch-manipulation inline-flex items-center justify-center"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Kitchen Orders ({orders.length})
            </h2>
            <a
              href={`/o/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:underline"
            >
              Open Full Kitchen Display Screen <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick status filter pills on mobile & desktop */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {(["all", "pending", "preparing", "completed"] as const).map((st) => {
              const count =
                st === "all"
                  ? orders.length
                  : orders.filter((o) => o.status === st).length;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap touch-manipulation ${
                    orderStatusFilter === st
                      ? "bg-orange-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <span className="capitalize">{st === "all" ? "All Orders" : st}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 text-white font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {loadingOrders ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center py-16 text-slate-500 text-sm">No orders recorded yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders
                .filter((ord) => orderStatusFilter === "all" || ord.status === orderStatusFilter)
                .map((ord) => (
                <div
                  key={ord._id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-base text-slate-900 dark:text-white">
                        Table {ord.table}
                      </span>
                      <p className="text-xs text-slate-400">
                        {ord.customerName} • {new Date(ord.orderedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        ord.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : ord.status === "preparing"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {ord.details?.map((it: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span>
                          {it.name} <span className="text-slate-400">x{it.quantity}</span>
                        </span>
                        <span className="font-mono">${Number(it.subtotalPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {ord.notes && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg italic">
                      Note: &quot;{ord.notes}&quot;
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-bold text-xs">
                    <span>Total</span>
                    <span className="font-mono text-orange-600">${Number(ord.totalPrice).toFixed(2)}</span>
                  </div>

                  {/* Status buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(ord._id, "pending")}
                      className={`py-1 text-[11px] font-semibold rounded-lg border transition ${
                        ord.status === "pending"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(ord._id, "preparing")}
                      className={`py-1 text-[11px] font-semibold rounded-lg border transition ${
                        ord.status === "preparing"
                          ? "bg-amber-600 text-white border-amber-600"
                          : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      Preparing
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(ord._id, "completed")}
                      className={`py-1 text-[11px] font-semibold rounded-lg border transition ${
                        ord.status === "completed"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      Completed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === "settings" && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Restaurant Profile & Charges
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update branding, customer details, and fee structures. Note: Account status and subscription expiry can only be managed by Super Admins.
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Restaurant Display Name
              </label>
              <input
                type="text"
                required
                value={settingsFormData.name}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Description / Culinary Story
              </label>
              <textarea
                rows={3}
                value={settingsFormData.description}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Logo Upload with Cloudinary Integration */}
            <LogoUpload
              value={settingsFormData.logoUrl}
              onChange={(url) => setSettingsFormData((prev) => ({ ...prev, logoUrl: url }))}
              folder="qrcos/restaurants"
              label="Restaurant Logo (Cloudinary Upload)"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Telegram Chat / Channel ID (Optional)
              </label>
              <input
                type="text"
                value={settingsFormData.telegramChat}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, telegramChat: e.target.value })}
                placeholder="e.g. @my_restaurant_orders (optional)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Leave blank if you do not want kitchen ticket alerts sent to Telegram.
              </p>
            </div>

            {/* Interactive Contact & Amenities Key-Value Form */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <KeyValueBuilder
                label="Contact & Amenities"
                description="Interactive key-value specifications displayed to diners (e.g. WiFi pass, telephone, opening hours)."
                keyPlaceholder="Key (e.g. WiFi)"
                valuePlaceholder="Value (e.g. GuestPass123)"
                items={settingsFormData.details}
                onChange={(details) => setSettingsFormData((prev) => ({ ...prev, details }))}
                presets={[
                  { key: "Phone", label: "Phone", defaultValue: "+1 " },
                  { key: "WiFi", label: "WiFi", defaultValue: "" },
                  { key: "Hours", label: "Hours", defaultValue: "11:00 AM - 11:00 PM" },
                  { key: "Cuisine", label: "Cuisine", defaultValue: "" },
                  { key: "Instagram", label: "Instagram", defaultValue: "@" },
                ]}
              />
            </div>

            {/* Interactive Fee Config Form */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <FeeConfigBuilder
                fees={settingsFormData.fees}
                onChange={(fees) => setSettingsFormData((prev) => ({ ...prev, fees }))}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
              >
                {savingSettings ? "Saving Settings..." : "Save Restaurant Settings"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 1: Add/Edit Menu Item */}
      <Modal
        isOpen={menuModalOpen}
        onClose={() => setMenuModalOpen(false)}
        title={editingMenu ? `Edit Dish: ${editingMenu.name}` : "Add New Dish to Menu"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveMenu} className="space-y-4">
          {menuError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
              {menuError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Category *
                </label>
                {existingCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isNewCategory;
                      setIsNewCategory(next);
                      if (next) {
                        if (existingCategories.includes(menuFormData.category)) {
                          setMenuFormData({ ...menuFormData, category: "" });
                        }
                      } else {
                        if (!existingCategories.includes(menuFormData.category)) {
                          setMenuFormData({
                            ...menuFormData,
                            category: existingCategories[0] || "",
                          });
                        }
                      }
                    }}
                    className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1 transition-colors"
                  >
                    {isNewCategory ? (
                      <>
                        <Tag className="w-3 h-3" /> Select Existing
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" /> + New Category
                      </>
                    )}
                  </button>
                )}
              </div>

              {!isNewCategory && existingCategories.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    required
                    value={menuFormData.category}
                    onChange={(e) => {
                      if (e.target.value === "__NEW__") {
                        setIsNewCategory(true);
                        setMenuFormData({ ...menuFormData, category: "" });
                      } else {
                        setMenuFormData({ ...menuFormData, category: e.target.value });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="" disabled>
                      -- Select Existing Category --
                    </option>
                    {existingCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__NEW__" className="text-orange-600 font-semibold">
                      + Create New Category...
                    </option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    autoFocus={isNewCategory}
                    value={menuFormData.category}
                    onChange={(e) =>
                      setMenuFormData({ ...menuFormData, category: e.target.value })
                    }
                    placeholder="e.g. Starters, Mains, Drinks"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {existingCategories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        Or pick existing:
                      </span>
                      {existingCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setMenuFormData({ ...menuFormData, category: cat });
                            setIsNewCategory(false);
                          }}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 dark:hover:bg-orange-950/40 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Price ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={menuFormData.price}
                onChange={(e) => setMenuFormData({ ...menuFormData, price: e.target.value })}
                placeholder="15.50"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Dish Name *
            </label>
            <input
              type="text"
              required
              value={menuFormData.name}
              onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
              placeholder="e.g. Truffle Burrata Bruschetta"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Description & Ingredients
            </label>
            <textarea
              rows={2}
              value={menuFormData.description}
              onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
              placeholder="Ingredients, culinary notes, preparation details..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Multiple Dish Photos with Cloudinary Upload */}
          <MultiImageUpload
            urls={menuFormData.imgUrls}
            onChange={(urls) => setMenuFormData((prev) => ({ ...prev, imgUrls: urls }))}
            folder="qrcos/dishes"
            label="Dish Photos"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Visibility
            </label>
            <select
              value={menuFormData.visibility}
              onChange={(e: any) => setMenuFormData({ ...menuFormData, visibility: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="public">Public (Visible to diners)</option>
              <option value="private">Private (Hidden from menu)</option>
            </select>
          </div>

          {/* Interactive Dietary & Menu Details Key-Value Form */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <KeyValueBuilder
              label="Dietary & Menu Details"
              description="Nutritional info, allergens, spiciness, or dietary indicators."
              keyPlaceholder="Key (e.g. Calories)"
              valuePlaceholder="Value (e.g. 450 kcal)"
              items={menuFormData.details}
              onChange={(details) => setMenuFormData((prev) => ({ ...prev, details }))}
              presets={[
                { key: "Calories", label: "Calories", defaultValue: "450 kcal" },
                { key: "Spice", label: "Spice", defaultValue: "Medium" },
                { key: "Allergens", label: "Allergens", defaultValue: "Contains Nuts" },
                { key: "Vegan", label: "Vegan", defaultValue: "Yes" },
                { key: "Gluten-Free", label: "Gluten-Free", defaultValue: "Yes" },
                { key: "Prep Time", label: "Prep Time", defaultValue: "15 mins" },
              ]}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMenuModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingMenu}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow transition disabled:opacity-50"
            >
              {savingMenu ? "Saving..." : editingMenu ? "Update Dish" : "Add Dish"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Change Password */}
      <Modal
        isOpen={changePwdOpen}
        onClose={() => setChangePwdOpen(false)}
        title="Change Owner Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          {pwdMsg.text && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                pwdMsg.isError
                  ? "bg-rose-500/10 border border-rose-500/20 text-rose-600"
                  : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
              }`}
            >
              {pwdMsg.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{pwdMsg.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={changeNewPwd}
              onChange={(e) => setChangeNewPwd(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={changeConfirmPwd}
              onChange={(e) => setChangeConfirmPwd(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setChangePwdOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow transition disabled:opacity-50"
            >
              {pwdLoading ? "Saving..." : "Update Password"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Dish Photo Lightbox Preview for Owner */}
      {previewDish && (
        <Modal
          isOpen={Boolean(previewDish)}
          onClose={() => setPreviewDish(null)}
          title={previewDish.name}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <DishImageGallery
              images={previewDish.imgUrls || []}
              dishName={previewDish.name}
            />

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                {previewDish.category}
              </span>
              <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">
                ${Number(previewDish.price).toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {previewDish.description || "No description provided."}
            </p>

            {previewDish.detail?.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-[11px] font-bold uppercase text-slate-400">
                  Dish Information
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {previewDish.detail.map((d, i) => (
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

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = previewDish;
                  setPreviewDish(null);
                  openEditMenuModal(target);
                }}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition"
              >
                Edit Dish
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: QR Studio */}
      {restaurant && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          restaurantName={restaurant.name}
          restaurantSlug={restaurant.slug}
          logoUrl={restaurant.logoUrl}
          defaultTable="12"
        />
      )}
    </div>
  );
}
