"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import { fetchDocumentLibrary } from "@/lib/api";

/**
 * Format bytes into a human-readable string (e.g. "1.2 MB", "456 KB").
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 KB";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = (bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0);
  return `${val} ${sizes[i]}`;
}

/**
 * Convert an ISO date string to a relative label ("Today", "Yesterday",
 * "3 days ago", "2 weeks ago", or a short date like "Jun 12").
 */
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Just now";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DocumentLibrary({
  onSelectDocument,
  label = "Your Library",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "error" | "empty" | "ready"

  const loadLibrary = useCallback(async () => {
    setStatus("loading");
    try {
      const docs = await fetchDocumentLibrary();
      if (!docs || docs.length === 0) {
        setStatus("empty");
        setDocuments([]);
      } else {
        setDocuments(docs);
        setStatus("ready");
      }
    } catch (err) {
      console.error("Failed to load document library:", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // ── Loading state ──────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="w-full mt-2">
        <div className="flex items-center gap-2 mb-3">
          <Loader2 size={14} className="text-main animate-spin" />
          <span className="text-sm font-bold text-slate-500">
            Loading {label}...
          </span>
        </div>
        <div className="space-y-2">
          <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-10 bg-slate-100 rounded-lg animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="w-full mt-2">
        <div className="flex items-center gap-2 mb-3">
          <FolderOpen size={16} className="text-main" />
          <span className="text-sm font-bold text-slate-600">{label}</span>
        </div>
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2.5 rounded-xl">
          <AlertTriangle size={14} className="shrink-0" />
          <span className="text-[10px] font-bold">
            Could not load your library.
          </span>
          <button
            onClick={loadLibrary}
            className="text-[10px] font-bold text-main hover:underline ml-auto cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────
  if (status === "empty") {
    return (
      <div className="w-full mt-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 w-full text-left cursor-pointer"
        >
          {isOpen ? (
            <ChevronDown size={16} className="text-slate-400" />
          ) : (
            <ChevronRight size={16} className="text-slate-400" />
          )}
          <FolderOpen size={16} className="text-main" />
          <span className="text-sm font-bold text-slate-600">{label}</span>
          <span className="text-[10px] text-slate-400 ml-auto">No files</span>
        </button>
        {isOpen && (
          <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
            <FileText size={24} className="text-slate-300" />
            <span className="text-xs text-slate-400 font-medium">
              No documents in your library yet.
            </span>
            <span className="text-[10px] text-slate-400">
              Upload a file above to get started.
            </span>
          </div>
        )}
      </div>
    );
  }

  // ── Ready state (documents available) ──────────────────────
  return (
    <div className="w-full mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left cursor-pointer"
      >
        {isOpen ? (
          <ChevronDown size={16} className="text-slate-400" />
        ) : (
          <ChevronRight size={16} className="text-slate-400" />
        )}
        <FolderOpen size={16} className="text-main" />
        <span className="text-sm font-bold text-slate-600">{label}</span>
        <span className="text-[10px] text-slate-400 ml-auto">
          {documents.length} file{documents.length !== 1 ? "s" : ""}
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          {documents.map((doc) => (
            <button
              key={doc.id || doc._id || doc.fileName}
              onClick={() => {
                if (!disabled && onSelectDocument) {
                  onSelectDocument(doc);
                }
              }}
              disabled={disabled}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-colors text-left ${
                disabled
                  ? "border-slate-100 opacity-50 cursor-not-allowed"
                  : "border-slate-200 hover:border-main hover:bg-main/5 cursor-pointer"
              }`}
            >
              <div className="shrink-0 p-1.5 bg-main/5 rounded-md">
                <FileText size={16} className="text-main" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-700 truncate">
                  {doc.fileName || doc.name || "Untitled"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {(doc.pageCount ?? doc.pages ?? "?") + " pages"} &bull;{" "}
                  {formatBytes(doc.fileSize ?? doc.size)} &bull;{" "}
                  {timeAgo(doc.uploadedAt ?? doc.createdAt ?? doc.uploadDate)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
