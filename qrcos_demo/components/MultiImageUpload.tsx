"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  Plus,
  Star,
  ArrowLeft,
  ArrowRight,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";

interface MultiImageUploadProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  maxImages?: number;
}

export function MultiImageUpload({
  urls = [],
  onChange,
  folder = "qrcos/dishes",
  label = "Dish Photos",
  maxImages = 8,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" is not a supported image file.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 5MB file size limit.`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    if (urls.length + validFiles.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images per dish.`);
      return;
    }

    setUploading(true);
    setUploadProgress(`Uploading ${validFiles.length} photo${validFiles.length > 1 ? "s" : ""}...`);

    try {
      const formData = new FormData();
      formData.append("folder", folder);
      for (const file of validFiles) {
        formData.append("files", file);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to upload images");
      }

      const newUrls: string[] = data.urls || (data.url ? [data.url] : []);
      onChange([...urls, ...newUrls]);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (urls.length >= maxImages) {
      setError(`Maximum of ${maxImages} images reached.`);
      return;
    }
    onChange([...urls, urlInput.trim()]);
    setUrlInput("");
    setError(null);
  };

  const handleRemove = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const item = urls[index];
    const filtered = urls.filter((_, i) => i !== index);
    onChange([item, ...filtered]);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= urls.length) return;
    const next = [...urls];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    onChange(next);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
          <p className="text-[11px] text-slate-400">
            Upload multiple photos. The first image serves as the cover photo on menus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">
            {urls.length}/{maxImages}
          </span>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-medium"
          >
            <LinkIcon className="w-3 h-3" />
            {showUrlInput ? "Hide URL Input" : "Add via URL"}
          </button>
        </div>
      </div>

      {/* Optional URL Input */}
      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlInput.trim() || urls.length >= maxImages}
            className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-semibold transition"
          >
            Add URL
          </button>
        </div>
      )}

      {/* Upload Drag & Drop Box */}
      {urls.length < maxImages && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
            dragActive
              ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20"
              : "border-slate-300 dark:border-slate-700 hover:border-orange-400 bg-slate-50/50 dark:bg-slate-800/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />

          {uploading ? (
            <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-medium py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{uploadProgress || "Uploading..."}</span>
            </div>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  Click to select multiple images
                </span>{" "}
                or drag & drop
              </div>
              <p className="text-[10px] text-slate-400">
                PNG, JPG, WEBP, SVG up to 5MB each (supports multiple selection)
              </p>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </p>
      )}

      {/* Image Gallery Grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {urls.map((url, index) => {
            const isCover = index === 0;
            return (
              <div
                key={url + index}
                className={`group relative rounded-2xl overflow-hidden border bg-white dark:bg-slate-800 shadow-sm transition ${
                  isCover
                    ? "border-orange-500 ring-2 ring-orange-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                }`}
              >
                {/* Thumbnail Image */}
                <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Dish photo ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Cover Badge */}
                  {isCover && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold shadow-md">
                      <Star className="w-2.5 h-2.5 fill-current" /> Cover
                    </span>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition shadow opacity-90 group-hover:opacity-100"
                    title="Remove photo"
                    aria-label="Remove photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Bottom Action Bar */}
                <div className="p-1.5 flex items-center justify-between gap-1 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 text-[10px]">
                  {!isCover ? (
                    <button
                      type="button"
                      onClick={() => handleSetCover(index)}
                      className="text-orange-600 dark:text-orange-400 font-semibold hover:underline"
                    >
                      Make Cover
                    </button>
                  ) : (
                    <span className="text-slate-400 font-medium">Main</span>
                  )}

                  <div className="flex items-center gap-0.5 ml-auto">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "left")}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition"
                      title="Move earlier"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === urls.length - 1}
                      onClick={() => handleMove(index, "right")}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition"
                      title="Move later"
                    >
                      <ArrowRight className="w-3 h-3" />
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
