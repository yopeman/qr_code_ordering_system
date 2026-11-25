"use client";

import React, { useState, useEffect, use } from "react";
import { Modal } from "@/components/Modal";
import { QRCodeModal } from "@/components/QRCodeModal";
import { LogoUpload } from "@/components/LogoUpload";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { DishImageGallery } from "@/components/DishImageGallery";
import { FeeConfigBuilder, FeeItem } from "@/components/FeeConfigBuilder";
import { KeyValueBuilder, KeyValueItem } from "@/components/KeyValueBuilder";
import { TelegramChatInput } from "@/components/TelegramChatInput";
import { useI18n } from "@/components/I18nProvider";
import { checkRestaurantAccess, formatOrderTime, formatOrderDate } from "@/lib/utils";
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
  const { t } = useI18n();

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
  const access = checkRestaurantAccess(restaurant?.status, restaurant?.expiredAt, t);
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
      const authRes = await fetch("/api/auth/restaurant");
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.authenticated && authData.restaurant?.slug === slug) {
          setIsOwnerAuth(true);
          await loadRestaurantData();
          return;
        }
      }

      const checkRes = await fetch("/api/auth/restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", slug }),
      });
      const checkData = await checkRes.json();

      if (!checkRes.ok) {
        setAuthError(checkData.error || t("err.restaurantNotFound"));
        return;
      }

      if (checkData.status === "suspended") {
        setAuthError(t("owner.suspendedAuth"));
        return;
      }

      setNeedsPasswordSetup(Boolean(checkData.needsPasswordSetup));
    } catch (err: any) {
      setAuthError(err.message || t("err.authError"));
    } finally {
      setAuthChecking(false);
    }
  };

  const loadRestaurantData = async () => {
    try {
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

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!newPassword || newPassword.length < 4) {
      setAuthError(t("owner.pwdMinError"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthError(t("owner.pwdMismatch"));
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
        setAuthError(data.error || t("err.failedSetupPwd"));
        return;
      }

      localStorage.setItem(`qrcos-restaurant-${data.token}`, data.token);
      setIsOwnerAuth(true);
      await loadRestaurantData();
    } catch (err: any) {
      setAuthError(err.message || t("err.setupFailed"));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!loginPassword) {
      setAuthError(t("owner.pwdRequired"));
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
        setAuthError(data.error || t("err.invalidPassword"));
        return;
      }

      localStorage.setItem(`qrcos-restaurant-${data.token}`, data.token);
      setIsOwnerAuth(true);
      await loadRestaurantData();
    } catch (err: any) {
      setAuthError(err.message || t("err.loginFailed"));
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
      setPwdMsg({ text: t("owner.pwdMinError"), isError: true });
      return;
    }
    if (changeNewPwd !== changeConfirmPwd) {
      setPwdMsg({ text: t("owner.pwdMismatch"), isError: true });
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
        setPwdMsg({ text: data.error || t("err.failedUpdatePwd"), isError: true });
        return;
      }

      setPwdMsg({ text: t("owner.pwdUpdated"), isError: false });
      setTimeout(() => {
        setChangePwdOpen(false);
        setCurrentPwd("");
        setChangeNewPwd("");
        setChangeConfirmPwd("");
        setPwdMsg({ text: "", isError: false });
      }, 1500);
    } catch (err: any) {
      setPwdMsg({ text: err.message || t("err.failedChangePwd"), isError: true });
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
      setMenuError(t("err.menuFieldsRequired"));
      return;
    }

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
        setMenuError(data.error || t("err.failedSaveMenu"));
        return;
      }

      setMenuModalOpen(false);
      loadMenus();
    } catch (err: any) {
      setMenuError(err.message || t("err.failedSaveMenu"));
    } finally {
      setSavingMenu(false);
    }
  };

  const handleDeleteMenu = async (item: MenuItem) => {
    if (!confirm(t("owner.confirmDeleteDish", { name: item.name }))) return;

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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const detail = (settingsFormData.details || [])
        .filter((d) => d.key.trim() && d.value.trim())
        .map((d) => ({ key: d.key.trim(), value: d.value.trim() }));

      const config = (settingsFormData.fees || []).map((f) => ({
        feeName: f.feeName.trim(),
        type: f.type,
        amount: parseFloat(String(f.amount)) || 0,
      }));

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
            {t("owner.portalTitle")}
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
                {t("owner.onboardingInfo")}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t("owner.createPwd")}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("owner.minChars")}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t("owner.confirmPwd")}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("owner.confirmPwdPlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("owner.setPwdEnter")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t("owner.ownerPwd")}
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={t("owner.enterPwdPlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("common.logIn")}
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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {restaurant?.name}
              </h1>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                  access.badgeVariant === "active"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : access.badgeVariant === "suspended"
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : access.badgeVariant === "expired"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                }`}
              >
                {access.statusLabel}
              </span>
              {restaurant?.expiredAt && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    access.isExpired
                      ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {access.isExpired ? t("common.expired") : t("common.expires")}: {formatOrderDate(restaurant.expiredAt)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{t("owner.dashboard")}</span>
              <span>•</span>
              <a
                href={`/m/${slug}?table=1`}
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
            <span>{t("owner.tableQrStand")}</span>
          </button>

          <button
            type="button"
            onClick={() => setChangePwdOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition touch-manipulation"
          >
            <KeyRound className="w-4 h-4" />
            <span>{t("owner.passwordBtn")}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition touch-manipulation"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("common.signOut")}</span>
          </button>
        </div>
      </div>

      {/* Operational Notice Banner if Inactive, Suspended or Expired */}
      {!access.isOperational && (
        <div
          className={`p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 border shadow-xs ${
            access.reason === "suspended"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
              : access.reason === "expired"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
              : "bg-slate-500/10 border-slate-500/30 text-slate-900 dark:text-slate-200"
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-current" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold">
              {access.reason === "suspended"
                ? t("owner.bannerSuspended")
                : access.reason === "expired"
                ? t("owner.bannerExpired")
                : t("owner.bannerInactive")}
            </h3>
            <p className="text-xs opacity-90 leading-relaxed">
              {access.message} {t("owner.bannerSuffix")}
            </p>
          </div>
        </div>
      )}

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
          {t("owner.tabMenu", { count: menus.length })}
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
          {t("owner.tabOrders", { count: orders.length })}
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
          {t("owner.tabSettings")}
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
                  {cat === "All" ? t("common.all") : cat}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={openCreateMenuModal}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-semibold text-xs shadow-md transition touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              {t("owner.addDish")}
            </button>
          </div>

          {loadingMenus ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : filteredMenus.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <p className="text-slate-500 text-sm">{t("owner.noDishesInCat")}</p>
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
                        title={t("owner.previewPhotosTitle")}
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
                          {t(`status.${item.visibility}`)}
                        </span>
                        {item.imgUrls.length > 1 && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1 shadow">
                            <ImageIcon className="w-2.5 h-2.5" />
                            {t("owner.photosCount", { count: item.imgUrls.length })}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="h-32 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                        {t("owner.noPhoto")}
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                          {item.category}
                        </span>
                        <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                          {Number(item.price).toFixed(2)} {t("common.etb")}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">
                        {item.name}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {item.description || t("owner.noDesc")}
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
                          <span>{t("status.public")}</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t("status.private")}</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditMenuModal(item)}
                        className="p-2 sm:p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 touch-manipulation inline-flex items-center justify-center"
                        title={t("owner.editDish")}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMenu(item)}
                        className="p-2 sm:p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 touch-manipulation inline-flex items-center justify-center"
                        title={t("owner.deleteDish")}
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
              {t("owner.kitchenOrders", { count: orders.length })}
            </h2>
            <a
              href={`/o/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:underline"
            >
              {t("owner.openFullKitchen")} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

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
                  <span>{st === "all" ? t("kitchen.allOrders") : t(`status.${st}`)}</span>
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
            <p className="text-center py-16 text-slate-500 text-sm">{t("owner.noOrdersYet")}</p>
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
                        {t("common.tableWithNumber", { table: ord.table })}
                      </span>
                      <p className="text-xs text-slate-400">
                        {ord.customerName} • {formatOrderTime(ord.orderedAt, { includeZone: true })}
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
                      {ord.status === "completed" ? t("status.completed") : ord.status === "preparing" ? t("status.preparing") : t("status.pending")}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {ord.details?.map((it: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span>
                          {it.name} <span className="text-slate-400">x{it.quantity}</span>
                        </span>
                        <span className="font-mono">{Number(it.subtotalPrice).toFixed(2)} {t("common.etb")}</span>
                      </div>
                    ))}
                  </div>

                  {ord.notes && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg italic">
                      {t("common.note")}: &quot;{ord.notes}&quot;
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-bold text-xs">
                    <span>{t("common.total")}</span>
                    <span className="font-mono text-orange-600">{Number(ord.totalPrice).toFixed(2)} {t("common.etb")}</span>
                  </div>

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
                      {t("status.pending")}
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
                      {t("status.preparing")}
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
                      {t("status.completed")}
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
              {t("owner.profileChargesTitle")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("owner.profileChargesDesc")}
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t("owner.settingsSaved")}</span>
            </div>
          )}

          {/* Account Status & Subscription Expiry Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t("owner.operationalStatus")}</span>
              <span
                className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                  access.badgeVariant === "active"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : access.badgeVariant === "suspended"
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : access.badgeVariant === "expired"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                }`}
              >
                {access.statusLabel}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t("owner.subscriptionExpiry")}</span>
              <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                {restaurant?.expiredAt ? formatOrderDate(restaurant.expiredAt) : t("common.noExpiry")}
                {access.isExpired && ` (${t("common.expired")})`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              {t("owner.managedByAdmin")}
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t("owner.displayName")}
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
                {t("owner.culinaryStory")}
              </label>
              <textarea
                rows={3}
                value={settingsFormData.description}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <LogoUpload
              value={settingsFormData.logoUrl}
              onChange={(url) => setSettingsFormData((prev) => ({ ...prev, logoUrl: url }))}
              folder="qrcos/restaurants"
              label={t("owner.logoUploadLabel")}
            />

            <TelegramChatInput
              value={settingsFormData.telegramChat}
              onChange={(val) => setSettingsFormData({ ...settingsFormData, telegramChat: val })}
              restaurantName={settingsFormData.name || restaurant?.name}
              placeholder={t("owner.tgPlaceholder")}
              helperText={t("owner.tgHelper")}
            />

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <KeyValueBuilder
                label={t("owner.contactAmenities")}
                description={t("owner.contactAmenitiesDesc")}
                keyPlaceholder={t("owner.kvKeyPlaceholder")}
                valuePlaceholder={t("owner.kvValPlaceholder")}
                items={settingsFormData.details}
                onChange={(details) => setSettingsFormData((prev) => ({ ...prev, details }))}
                presets={[
                  { key: "Phone", label: t("preset.phone"), defaultValue: "+251 9" },
                  { key: "Location", label: t("preset.location"), defaultValue: "Bole, Addis Ababa" },
                  { key: "Hours", label: t("preset.hours"), defaultValue: "08:00 AM - 10:00 PM" },
                  { key: "Cuisine", label: t("preset.cuisine"), defaultValue: "Ethiopian Traditional" },
                  { key: "WiFi", label: t("preset.wifi"), defaultValue: "" },
                  { key: "Telegram", label: t("preset.telegram"), defaultValue: "@" },
                ]}
              />
            </div>

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
                {savingSettings ? t("owner.savingSettings") : t("owner.saveSettings")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 1: Add/Edit Menu Item */}
      <Modal
        isOpen={menuModalOpen}
        onClose={() => setMenuModalOpen(false)}
        title={editingMenu ? t("owner.editDishTitle", { name: editingMenu.name }) : t("owner.addDishTitle")}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveMenu} className="space-y-4">
          {menuError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
              {menuError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t("owner.dishNameLabel")}
            </label>
            <input
              type="text"
              required
              value={menuFormData.name}
              onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
              placeholder={t("owner.dishNamePlaceholder")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {t("owner.categoryLabel")}
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
                        <Tag className="w-3 h-3" /> {t("owner.selectExisting")}
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" /> {t("owner.newCategory")}
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
                      {t("owner.selectCategoryOpt")}
                    </option>
                    {existingCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__NEW__" className="text-orange-600 font-semibold">
                      {t("owner.createNewCategoryOpt")}
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
                    placeholder={t("owner.categoryPlaceholder")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {existingCategories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {t("owner.orPickExisting")}
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
                {t("owner.priceLabel")}
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={menuFormData.price}
                onChange={(e) => setMenuFormData({ ...menuFormData, price: e.target.value })}
                placeholder="450.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t("owner.descIngredients")}
            </label>
            <textarea
              rows={2}
              value={menuFormData.description}
              onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
              placeholder={t("owner.descIngredientsPlaceholder")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <MultiImageUpload
            urls={menuFormData.imgUrls}
            onChange={(urls) => setMenuFormData((prev) => ({ ...prev, imgUrls: urls }))}
            folder="qrcos/dishes"
            label={t("multiImg.defaultLabel")}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t("owner.visibilityLabel")}
            </label>
            <select
              value={menuFormData.visibility}
              onChange={(e: any) => setMenuFormData({ ...menuFormData, visibility: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="public">{t("owner.visPublicOpt")}</option>
              <option value="private">{t("owner.visPrivateOpt")}</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <KeyValueBuilder
              label={t("owner.dietaryLabel")}
              description={t("owner.dietaryDesc")}
              keyPlaceholder={t("owner.dietaryKeyPlaceholder")}
              valuePlaceholder={t("owner.dietaryValPlaceholder")}
              items={menuFormData.details}
              onChange={(details) => setMenuFormData((prev) => ({ ...prev, details }))}
              presets={[
                { key: "Calories", label: t("preset.calories"), defaultValue: "450 kcal" },
                { key: "Spice", label: t("preset.spice"), defaultValue: "Medium (መካከለኛ)" },
                { key: "Fasting", label: t("preset.fasting"), defaultValue: "Yes" },
                { key: "Portion", label: t("preset.portion"), defaultValue: "1 Person" },
                { key: "Prep Time", label: t("preset.prepTime"), defaultValue: "15 mins" },
              ]}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMenuModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={savingMenu}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow transition disabled:opacity-50"
            >
              {savingMenu ? t("common.saving") : editingMenu ? t("owner.updateDish") : t("owner.addDish")}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Change Password */}
      <Modal
        isOpen={changePwdOpen}
        onClose={() => setChangePwdOpen(false)}
        title={t("owner.changePwdTitle")}
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
              {t("owner.currentPwd")}
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
              {t("owner.newPwd")}
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
              {t("owner.confirmNewPwd")}
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
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow transition disabled:opacity-50"
            >
              {pwdLoading ? t("common.saving") : t("owner.updatePwdBtn")}
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
                {Number(previewDish.price).toFixed(2)} {t("common.etb")}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {previewDish.description || t("owner.noDesc")}
            </p>

            {previewDish.detail?.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-[11px] font-bold uppercase text-slate-400">
                  {t("menu.dishInfo")}
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
                {t("owner.editDish")}
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
          defaultTable="1"
        />
      )}
    </div>
  );
}
