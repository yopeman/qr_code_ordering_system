"use client";

import React, { useState, useEffect } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useI18n } from "./I18nProvider";

interface TelegramChatInputProps {
  value: string;
  onChange: (value: string) => void;
  restaurantName?: string;
  placeholder?: string;
  helperText?: string;
}

/**
 * Reusable input for Telegram Chat / Channel ID with an inline "Test" button
 * that dispatches a test message through /api/telegram/test.
 */
export function TelegramChatInput({
  value,
  onChange,
  restaurantName,
  placeholder,
  helperText,
}: TelegramChatInputProps) {
  const { t } = useI18n();
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    setStatus(null);
  }, [value]);

  const handleTest = async () => {
    if (!value.trim() || testing) return;
    setTesting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: value.trim(),
          restaurantName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus({
          ok: true,
          message: data.message || t("tg.testSuccess"),
        });
      } else {
        setStatus({
          ok: false,
          message: data.error || t("tg.testFailed"),
        });
      }
    } catch (err: any) {
      setStatus({
        ok: false,
        message: err?.message || t("tg.networkError"),
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
        {t("tg.label")}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? t("tg.placeholder")}
          className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="button"
          onClick={handleTest}
          disabled={!value.trim() || testing}
          title={t("tg.testTitle")}
          className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5 text-orange-600" />
          )}
          <span>{testing ? t("tg.testing") : t("tg.test")}</span>
        </button>
      </div>

      {status && (
        <div
          className={`mt-1.5 flex items-start gap-1.5 text-[11px] font-medium ${
            status.ok
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {status.ok ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <p className="text-[10px] text-slate-400 mt-1">{helperText ?? t("tg.helper")}</p>
    </div>
  );
}
