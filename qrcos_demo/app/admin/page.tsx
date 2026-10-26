"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/Modal";
import { QRCodeModal } from "@/components/QRCodeModal";
import { LogoUpload } from "@/components/LogoUpload";
import { FeeConfigBuilder, FeeItem } from "@/components/FeeConfigBuilder";
import { KeyValueBuilder, KeyValueItem } from "@/components/KeyValueBuilder";
import { slugify } from "@/lib/utils";
import {
  Shield,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  KeyRound,
  QrCode,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  LogOut,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface RestaurantItem {
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
  createdAt: string;
}

export default function AdminPage() {
  // Auth state
  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Login flow
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginStep, setLoginStep] = useState<"email" | "password" | "setup">("email");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard state
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [changeNewPwd, setChangeNewPwd] = useState("");
  const [changeConfirmPwd, setChangeConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState({ text: "", isError: false });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Restaurant Edit/Create Modal
  const [restModalOpen, setRestModalOpen] = useState(false);
  const [editingRest, setEditingRest] = useState<RestaurantItem | null>(null);
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logoUrl: "",
    expiredAt: "",
    status: "active" as "active" | "inactive" | "suspended",
    telegramChat: "",
    detail: [] as KeyValueItem[],
    fees: [
      { feeName: "VAT", type: "percent" as const, amount: 15 },
      { feeName: "Service Charge", type: "fixed" as const, amount: 2.5 },
    ] as FeeItem[],
  });
  const [savingRest, setSavingRest] = useState(false);
  const [restError, setRestError] = useState("");

  // QR Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedRestForQR, setSelectedRestForQR] = useState<RestaurantItem | null>(null);

  // Order View Modal
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [selectedRestForOrders, setSelectedRestForOrders] = useState<RestaurantItem | null>(null);
  const [restOrders, setRestOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Initial Auth Check
  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    setAuthChecking(true);
    try {
      const res = await fetch("/api/auth/admin");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.admin) {
          setAdminUser(data.admin);
          loadRestaurants();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuthChecking(false);
    }
  };

  const loadRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const res = await fetch("/api/admin/restaurants");
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data.restaurants || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  // Auth: Email Step Check
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail.trim()) {
      setLoginError("Please enter your admin email");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", email: loginEmail }),
      });
      const data = await res.json();

      if (!res.ok || !data.exists) {
        setLoginError("No admin account found with this email");
        return;
      }

      if (data.needsPasswordSetup) {
        setLoginStep("setup");
      } else {
        setLoginStep("password");
      }
    } catch (err: any) {
      setLoginError(err.message || "Failed to check email");
    } finally {
      setLoginLoading(false);
    }
  };

  // Auth: Setup password (for password === null)
  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!newPassword || newPassword.length < 4) {
      setLoginError("Password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLoginError("Passwords do not match");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "setup",
          email: loginEmail,
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Failed to set up password");
        return;
      }

      localStorage.setItem(`qrcos-admin-${data.token}`, data.token);
      setAdminUser(data.admin);
      loadRestaurants();
    } catch (err: any) {
      setLoginError(err.message || "Failed to setup password");
    } finally {
      setLoginLoading(false);
    }
  };

  // Auth: Standard Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginPassword) {
      setLoginError("Please enter your password");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.needsPasswordSetup) {
          setLoginStep("setup");
          return;
        }
        setLoginError(data.error || "Invalid credentials");
        return;
      }

      localStorage.setItem(`qrcos-admin-${data.token}`, data.token);
      setAdminUser(data.admin);
      loadRestaurants();
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setAdminUser(null);
    setLoginStep("email");
    setLoginEmail("");
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
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change-password",
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

  // Reset restaurant password to null (for owner onboarding)
  const handleResetRestaurantPassword = async (rest: RestaurantItem) => {
    if (!confirm(`Reset password for "${rest.name}" to null? The owner will be prompted to set a new password on their next visit.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/restaurants/${rest._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password" }),
      });
      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Password reset successfully!");
      } else {
        alert(data.error || "Failed to reset password");
      }
    } catch (err: any) {
      alert(err.message || "Failed to reset password");
    }
  };

  // Delete restaurant
  const handleDeleteRestaurant = async (rest: RestaurantItem) => {
    if (!confirm(`Are you sure you want to delete "${rest.name}"? This will permanently delete all its menus and orders.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/restaurants/${rest._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadRestaurants();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch (err: any) {
      alert(err.message || "Delete error");
    }
  };

    const handleNameChange = (name: string) => {
      setFormData((prev) => ({
        ...prev,
        name,
        slug: isSlugManual ? prev.slug : slugify(name),
      }));
    };

    const handleSlugChange = (slug: string) => {
      setIsSlugManual(true);
      setFormData((prev) => ({ ...prev, slug }));
    };

    // Save restaurant (create or edit)
    const handleSaveRestaurant = async (e: React.FormEvent) => {
      e.preventDefault();
      setRestError("");

      if (!formData.name.trim() || !formData.slug.trim()) {
        setRestError("Name and Slug are required");
        return;
      }

      const parsedConfig = (formData.fees || []).map((f) => ({
        feeName: f.feeName.trim(),
        type: f.type,
        amount: parseFloat(String(f.amount)) || 0,
      }));

      const parsedDetail = (formData.detail || [])
        .filter((d) => d.key.trim() && d.value.trim())
        .map((d) => ({ key: d.key.trim(), value: d.value.trim() }));

      setSavingRest(true);
      try {
        const payload = {
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description,
          detail: parsedDetail,
          logoUrl: formData.logoUrl,
          expiredAt: formData.expiredAt ? new Date(formData.expiredAt).toISOString() : null,
          status: formData.status,
          telegramChat: formData.telegramChat?.trim() || "",
          config: parsedConfig,
        };

        const url = editingRest
          ? `/api/admin/restaurants/${editingRest._id}`
          : "/api/admin/restaurants";
        const method = editingRest ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok) {
          setRestError(data.error || "Failed to save restaurant");
          return;
        }

        setRestModalOpen(false);
        loadRestaurants();
      } catch (err: any) {
        setRestError(err.message || "Failed to save");
      } finally {
        setSavingRest(false);
      }
    };

    const openCreateModal = () => {
      setEditingRest(null);
      setIsSlugManual(false);
      setFormData({
        name: "",
        slug: "",
        description: "",
        logoUrl: "",
        expiredAt: "",
        status: "active",
        telegramChat: "", // No default telegram channel!
        detail: [
          { key: "Phone", value: "+1 555-0192" },
          { key: "WiFi", value: "Guest123" },
        ],
        fees: [
          { feeName: "VAT", type: "percent", amount: 15 },
          { feeName: "Service Charge", type: "fixed", amount: 2.5 },
        ],
      });
      setRestError("");
      setRestModalOpen(true);
    };

    const openEditModal = (rest: RestaurantItem) => {
      setEditingRest(rest);
      setIsSlugManual(true);
      setFormData({
        name: rest.name,
        slug: rest.slug,
        description: rest.description || "",
        logoUrl: rest.logoUrl || "",
        expiredAt: rest.expiredAt ? rest.expiredAt.substring(0, 10) : "",
        status: rest.status,
        telegramChat: rest.telegramChat || "",
        detail: (rest.detail || []).map((d) => ({
          key: d.key,
          value: d.value,
        })),
        fees: (rest.config || []).map((c) => ({
          feeName: c.feeName,
          type: c.type,
          amount: c.amount,
        })),
      });
      setRestError("");
      setRestModalOpen(true);
    };

  const openOrdersModal = async (rest: RestaurantItem) => {
    setSelectedRestForOrders(rest);
    setOrdersModalOpen(true);
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders/restaurant/${rest.slug}`);
      if (res.ok) {
        const data = await res.json();
        setRestOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (authChecking) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  // Auth Screen if not logged in
  if (!adminUser) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 mx-auto mb-5">
            <Shield className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
            Admin Authentication
          </h2>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Enter your admin email to verify credentials or complete initial onboarding setup.
          </p>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* STEP 1: Email */}
          {loginStep === "email" && (
            <form onSubmit={handleCheckEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@qrcos.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Continue
              </button>
            </form>
          )}

          {/* STEP 2: Password Login */}
          {loginStep === "password" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Password for {loginEmail}
                  </label>
                  <button
                    type="button"
                    onClick={() => setLoginStep("email")}
                    className="text-xs text-orange-600 hover:underline"
                  >
                    Change Email
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your admin password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign In
              </button>
            </form>
          )}

          {/* STEP 3: Initial Password Setup Modal */}
          {loginStep === "setup" && (
            <form onSubmit={handleSetupPassword} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                Welcome! Your account is currently unpassworded. Please establish a secure password to complete onboarding.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Create New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 4 characters"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Password & Continue
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 pb-safe space-y-8">
      {/* Admin Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Platform Administration
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Logged in as <span className="font-semibold text-slate-700 dark:text-slate-200">{adminUser.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setChangePwdOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
          >
            <KeyRound className="w-4 h-4" />
            Change Password
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Control Actions & Views */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Restaurants & Tenancy
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {restaurants.length} {restaurants.length === 1 ? "restaurant" : "restaurants"} registered
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-orange-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-orange-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-semibold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            Add Restaurant
          </button>
        </div>
      </div>

      {/* Restaurant List Display */}
      {loadingRestaurants ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-slate-500 text-sm">No restaurants found. Click &quot;Add Restaurant&quot; to create one.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((rest) => (
            <div
              key={rest._id}
              className="flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-500/40 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {rest.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rest.logoUrl}
                        alt={rest.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-lg">
                        {rest.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {rest.name}
                      </h3>
                      <span className="text-xs font-mono text-orange-600 dark:text-orange-400">
                        /r/{rest.slug}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      rest.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : rest.status === "suspended"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {rest.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                  {rest.description || "No description provided."}
                </p>

                <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span>Telegram Alert:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {rest.telegramChat || "Default bot"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Configured Fees:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {rest.config?.length || 0} applied
                    </span>
                  </div>
                  {rest.expiredAt && (
                    <div className="flex items-center justify-between">
                      <span>Expires:</span>
                      <span>{new Date(rest.expiredAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRestForQR(rest);
                    setQrModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 transition"
                  title="Generate and download table QR stands"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  QR Card
                </button>

                <button
                  type="button"
                  onClick={() => openOrdersModal(rest)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Orders
                </button>

                <button
                  type="button"
                  onClick={() => openEditModal(rest)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleResetRestaurantPassword(rest)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition"
                  title="Reset password to null so owner can onboard again"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Pwd
                </button>

                <div className="col-span-2 pt-1 flex items-center justify-between">
                  <a
                    href={`/r/${rest.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-orange-600 hover:underline flex items-center gap-1"
                  >
                    Owner Portal <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteRestaurant(rest)}
                    className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div
            className="overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label="Registered Restaurants Directory"
          >
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Restaurant</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Telegram Chat</th>
                  <th className="py-3.5 px-4">Expires</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {restaurants.map((rest) => (
                  <tr key={rest._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      {rest.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rest.logoUrl}
                          alt={rest.name}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                      )}
                      <span>{rest.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-orange-600">{rest.slug}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rest.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : rest.status === "suspended"
                            ? "bg-rose-500/10 text-rose-600"
                            : "bg-slate-500/10 text-slate-600"
                        }`}
                      >
                        {rest.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {rest.telegramChat || "Default"}
                    </td>
                    <td className="py-3 px-4">
                      {rest.expiredAt ? new Date(rest.expiredAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRestForQR(rest);
                          setQrModalOpen(true);
                        }}
                        className="p-2 sm:p-1.5 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 touch-manipulation inline-flex items-center justify-center"
                        title="QR Stand"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openOrdersModal(rest)}
                        className="p-2 sm:p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 touch-manipulation inline-flex items-center justify-center"
                        title="View Orders"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(rest)}
                        className="p-2 sm:p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 touch-manipulation inline-flex items-center justify-center"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResetRestaurantPassword(rest)}
                        className="p-2 sm:p-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 touch-manipulation inline-flex items-center justify-center"
                        title="Reset Password to null"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRestaurant(rest)}
                        className="p-2 sm:p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 touch-manipulation inline-flex items-center justify-center"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Change Password */}
      <Modal
        isOpen={changePwdOpen}
        onClose={() => setChangePwdOpen(false)}
        title="Change Admin Password"
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
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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

      {/* MODAL 2: Create / Edit Restaurant */}
      <Modal
        isOpen={restModalOpen}
        onClose={() => setRestModalOpen(false)}
        title={editingRest ? `Edit Restaurant: ${editingRest.name}` : "Create New Restaurant"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveRestaurant} className="space-y-4">
          {restError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
              {restError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Bistro Delight & Grill"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  URL Slug *
                </label>
                {!isSlugManual && formData.slug && (
                  <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/60 px-1.5 py-0.5 rounded">
                    Auto-slugified
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g. bistro-delight-and-grill"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short description of culinary style and specialty"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Logo Upload with Cloudinary Integration */}
          <LogoUpload
            value={formData.logoUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, logoUrl: url }))}
            folder="qrcos/restaurants"
            label="Restaurant Logo (Cloudinary Upload)"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Telegram Chat / Channel ID (Optional)
              </label>
              <input
                type="text"
                value={formData.telegramChat}
                onChange={(e) => setFormData({ ...formData, telegramChat: e.target.value })}
                placeholder="e.g. @my_restaurant_orders"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                No default channel. Leave blank if not using Telegram notifications.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              value={formData.expiredAt}
              onChange={(e) => setFormData({ ...formData, expiredAt: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Interactive Contact & Amenities Key-Value Form */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <KeyValueBuilder
              label="Contact & Amenities"
              description="Store key-value information such as Phone, WiFi, Hours, Cuisine, etc."
              keyPlaceholder="Key (e.g. Phone)"
              valuePlaceholder="Value (e.g. +1 555-0192)"
              items={formData.detail}
              onChange={(detail) => setFormData((prev) => ({ ...prev, detail }))}
              presets={[
                { key: "Phone", label: "Phone", defaultValue: "+1 " },
                { key: "WiFi", label: "WiFi", defaultValue: "" },
                { key: "Hours", label: "Hours", defaultValue: "10:00 AM - 10:00 PM" },
                { key: "Cuisine", label: "Cuisine", defaultValue: "Continental" },
                { key: "Instagram", label: "Instagram", defaultValue: "@" },
              ]}
            />
          </div>

          {/* Interactive Fee Config Form */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <FeeConfigBuilder
              fees={formData.fees}
              onChange={(fees) => setFormData((prev) => ({ ...prev, fees }))}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRestModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingRest}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow transition disabled:opacity-50"
            >
              {savingRest ? "Saving..." : editingRest ? "Update Restaurant" : "Create Restaurant"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Restaurant Live Orders Viewer */}
      <Modal
        isOpen={ordersModalOpen}
        onClose={() => setOrdersModalOpen(false)}
        title={`Live Orders — ${selectedRestForOrders?.name || ""}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
            </div>
          ) : restOrders.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-sm">No orders recorded yet.</p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {restOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Table {ord.table}
                      </span>
                      <span className="text-xs text-slate-400">• {ord.customerName}</span>
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

                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    {ord.details?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span>
                          {item.name} <span className="text-slate-400">x{item.quantity}</span>
                        </span>
                        <span className="font-mono">${Number(item.subtotalPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span className="text-slate-500 dark:text-slate-400 font-normal">
                      Total (inc. fees)
                    </span>
                    <span className="text-orange-600 font-mono">${Number(ord.totalPrice).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 4: QR Studio */}
      {selectedRestForQR && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          restaurantName={selectedRestForQR.name}
          restaurantSlug={selectedRestForQR.slug}
          logoUrl={selectedRestForQR.logoUrl}
          defaultTable="12"
        />
      )}
    </div>
  );
}
