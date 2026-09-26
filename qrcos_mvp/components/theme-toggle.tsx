"use client";

import { useEffect, useSyncExternalStore } from "react";

const MODES = [
  { id: "light", label: "Light", icon: "☀️" },
  { id: "dark", label: "Dark", icon: "🌙" },
  { id: "system", label: "System", icon: "🖥️" },
] as const;

type Mode = (typeof MODES)[number]["id"];

const STORAGE_KEY = "theme";
const CHANGE_EVENT = "theme-change";

const isMode = (value: string | null): value is Mode =>
  value === "light" || value === "dark" || value === "system";

function readMode(): Mode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isMode(stored) ? stored : "system";
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function resolveDark(mode: Mode) {
  return (
    mode === "dark" ||
    (mode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
}

function subscribeSystemScheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const getSystemScheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

function paint(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const mode = useSyncExternalStore<Mode>(subscribe, readMode, () => "system");
  const systemIsDark = useSyncExternalStore(
    subscribeSystemScheme,
    getSystemScheme,
    () => false,
  );

  useEffect(() => {
    paint(mode === "system" ? systemIsDark : resolveDark(mode));
  }, [mode, systemIsDark]);

  const select = (next: Mode) => {
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="flex items-center gap-0.5 rounded-full border border-stone-200 bg-stone-100 p-0.5 dark:border-stone-700 dark:bg-stone-800"
    >
      {MODES.map((option) => {
        const isActive = mounted && mode === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            title={option.label}
            onClick={() => select(option.id)}
            className={`flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition ${
              isActive
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-950 dark:text-stone-100"
                : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
            }`}
          >
            <span aria-hidden>{option.icon}</span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
