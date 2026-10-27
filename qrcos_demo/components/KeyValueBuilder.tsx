"use client";

import React from "react";
import { Plus, Trash2, Tag, Sparkles } from "lucide-react";

export interface KeyValueItem {
  key: string;
  value: string;
}

export interface KeyValuePreset {
  key: string;
  label?: string;
  defaultValue?: string;
}

interface KeyValueBuilderProps {
  items: KeyValueItem[];
  onChange: (items: KeyValueItem[]) => void;
  label?: string;
  description?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  emptyText?: string;
  presets?: KeyValuePreset[];
}

export function KeyValueBuilder({
  items = [],
  onChange,
  label = "Custom Attributes & Details",
  description = "Define structured key-value specifications.",
  keyPlaceholder = "Key (e.g. Phone, Location, WiFi)",
  valuePlaceholder = "Value (e.g. Bole Medhanialem, +251 9...)",
  emptyText = "No key-value attributes added yet.",
  presets = [],
}: KeyValueBuilderProps) {
  const addItem = (key = "", value = "") => {
    onChange([...items, { key, value }]);
  };

  const updateItem = (index: number, field: "key" | "value", val: string) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleApplyPreset = (preset: KeyValuePreset) => {
    const existingIndex = items.findIndex(
      (item) => item.key.toLowerCase().trim() === preset.key.toLowerCase().trim()
    );
    if (existingIndex >= 0) {
      if (!items[existingIndex].value && preset.defaultValue) {
        updateItem(existingIndex, "value", preset.defaultValue);
      }
      return;
    }
    addItem(preset.key, preset.defaultValue || "");
  };

  return (
    <div className="space-y-3">
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between gap-2">
        <div>
          {label && (
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {label}
            </label>
          )}
          {description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => addItem("", "")}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Pair
        </button>
      </div>

      {/* Optional Preset Buttons */}
      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-orange-500" /> Presets:
          </span>
          {presets.map((preset) => {
            const isAdded = items.some(
              (it) => it.key.toLowerCase().trim() === preset.key.toLowerCase().trim()
            );
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium transition flex items-center gap-1 ${
                  isAdded
                    ? "bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-400"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                <span>{preset.label || preset.key}</span>
                {isAdded && <span className="text-[9px] opacity-70">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Item Rows */}
      {items.length === 0 ? (
        <div className="text-center py-4 px-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <Tag className="w-5 h-5 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
          <p className="text-xs text-slate-500 dark:text-slate-400">{emptyText}</p>
          <button
            type="button"
            onClick={() => addItem("", "")}
            className="mt-2 text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline"
          >
            + Add first key-value pair
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 transition focus-within:border-orange-400"
            >
              {/* Key Input */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={item.key}
                  onChange={(e) => updateItem(index, "key", e.target.value)}
                  placeholder={keyPlaceholder}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Separator */}
              <div className="hidden sm:flex items-center text-slate-400 font-bold px-1 select-none">
                :
              </div>

              {/* Value Input */}
              <div className="flex-[1.4] min-w-0">
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => updateItem(index, "value", e.target.value)}
                  placeholder={valuePlaceholder}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Delete Button */}
              <div className="flex justify-end sm:justify-center shrink-0">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                  title="Remove attribute"
                  aria-label="Remove attribute"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
