"use client";

import React from "react";
import { Plus, Trash2, Percent, DollarSign, Sparkles, Calculator } from "lucide-react";

export interface FeeItem {
  feeName: string;
  type: "percent" | "fixed";
  amount: number | string;
}

interface FeeConfigBuilderProps {
  fees: FeeItem[];
  onChange: (fees: FeeItem[]) => void;
}

export function FeeConfigBuilder({ fees, onChange }: FeeConfigBuilderProps) {
  const addFee = (feeName = "Service Fee", type: "percent" | "fixed" = "percent", amount: number = 10) => {
    onChange([...fees, { feeName, type, amount }]);
  };

  const updateFee = (index: number, key: keyof FeeItem, val: any) => {
    const next = [...fees];
    next[index] = { ...next[index], [key]: val };
    onChange(next);
  };

  const removeFee = (index: number) => {
    onChange(fees.filter((_, i) => i !== index));
  };

  // Preview calculation based on a sample $50.00 order
  const sampleSubtotal = 50.0;
  const sampleFeeBreakdown = fees.map((f) => {
    const amt = parseFloat(String(f.amount)) || 0;
    const calc = f.type === "percent" ? (sampleSubtotal * amt) / 100 : amt;
    return { name: f.feeName || "Fee", calc };
  });
  const sampleTotal = sampleSubtotal + sampleFeeBreakdown.reduce((s, f) => s + f.calc, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Taxes, Fees & Service Charges
          </label>
          <p className="text-[11px] text-slate-400">
            Automatically computed and added to diner checkout and receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => addFee("New Fee", "percent", 10)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Fee Row
        </button>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Quick Presets:
        </span>
        <button
          type="button"
          onClick={() => addFee("VAT", "percent", 15)}
          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
        >
          + VAT (15%)
        </button>
        <button
          type="button"
          onClick={() => addFee("Service Charge", "fixed", 2.5)}
          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
        >
          + Service Charge ($2.50)
        </button>
        <button
          type="button"
          onClick={() => addFee("Sales Tax", "percent", 8.5)}
          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
        >
          + Sales Tax (8.5%)
        </button>
        <button
          type="button"
          onClick={() => addFee("Eco / Packaging", "fixed", 1.0)}
          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
        >
          + Packaging ($1.00)
        </button>
      </div>

      {/* Fees List */}
      {fees.length === 0 ? (
        <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
          No fees configured. Diners will only pay the menu item subtotal.
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {fees.map((fee, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              {/* Fee Name */}
              <div className="flex-1">
                <input
                  type="text"
                  required
                  value={fee.feeName}
                  onChange={(e) => updateFee(idx, "feeName", e.target.value)}
                  placeholder="e.g. VAT, Service Charge"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Type Switcher */}
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => updateFee(idx, "type", "percent")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    fee.type === "percent"
                      ? "bg-white dark:bg-slate-800 text-orange-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>Percent (%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateFee(idx, "type", "fixed")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    fee.type === "fixed"
                      ? "bg-white dark:bg-slate-800 text-orange-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Fixed ($)</span>
                </button>
              </div>

              {/* Amount */}
              <div className="w-full sm:w-28 relative shrink-0">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={fee.amount}
                  onChange={(e) => updateFee(idx, "amount", e.target.value)}
                  placeholder={fee.type === "percent" ? "15" : "2.50"}
                  className="w-full pl-3 pr-7 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="absolute right-2.5 top-2 text-xs font-bold text-slate-400">
                  {fee.type === "percent" ? "%" : "$"}
                </span>
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => removeFee(idx)}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 self-end sm:self-auto"
                title="Remove fee"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Live Preview Box */}
      {fees.length > 0 && (
        <div className="p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-orange-700 dark:text-orange-400">
            <Calculator className="w-3.5 h-3.5" />
            <span>Real-Time Receipt Calculation Example (on a $50.00 meal):</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
            <span>Subtotal: <b>$50.00</b></span>
            {sampleFeeBreakdown.map((f, i) => (
              <span key={i}>
                + {f.name}: <b>${f.calc.toFixed(2)}</b>
              </span>
            ))}
            <span className="text-orange-600 dark:text-orange-400 font-extrabold">
              = Total: ${sampleTotal.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
