"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "./Modal";
import { renderQRCodeCard, downloadQRCodeImage, getTableOrderUrl } from "@/lib/qr";
import { Download, Copy, Check, ExternalLink, QrCode } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  restaurantSlug: string;
  logoUrl?: string;
  defaultTable?: string;
}

export function QRCodeModal({
  isOpen,
  onClose,
  restaurantName,
  restaurantSlug,
  logoUrl,
  defaultTable = "12",
}: QRCodeModalProps) {
  const [table, setTable] = useState(defaultTable);
  const [generating, setGenerating] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const orderUrl = getTableOrderUrl(restaurantSlug, table);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const generate = async () => {
      setGenerating(true);
      try {
        if (canvasRef.current) {
          const url = await renderQRCodeCard(canvasRef.current, {
            restaurantName,
            restaurantSlug,
            tableNumber: table || "1",
            logoUrl,
          });
          if (active) {
            setDataUrl(url);
          }
        }
      } catch (err) {
        console.error("QR card generation error:", err);
      } finally {
        if (active) setGenerating(false);
      }
    };

    const timeout = setTimeout(generate, 150);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [isOpen, table, restaurantName, restaurantSlug, logoUrl]);

  const handleDownload = () => {
    if (!dataUrl) return;
    downloadQRCodeImage(dataUrl, restaurantName || restaurantSlug, table || "1");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(orderUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Generate Table QR Code — ${restaurantName}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Table Number or Label
            </label>
            <input
              type="text"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              placeholder="e.g. 12, Patio-3, Bar-1"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Destination URL
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={orderUrl}
                className="w-full text-xs font-mono px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={orderUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-2xl shadow-inner overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full max-w-[340px] h-auto rounded-xl shadow-2xl border border-slate-700"
          />
          {generating && (
            <p className="text-xs text-orange-400 mt-2 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 animate-spin" /> Rendering high-resolution card...
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export format: <span className="font-mono text-slate-700 dark:text-slate-300">{restaurantSlug}_table_{table || "1"}_QR_code.png</span>
          </p>

          <button
            type="button"
            onClick={handleDownload}
            disabled={generating || !dataUrl}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-medium text-sm shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download Stand Card (PNG)
          </button>
        </div>
      </div>
    </Modal>
  );
}
