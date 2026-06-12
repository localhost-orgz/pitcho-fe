"use client";

import Link from "next/link";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-2 group">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-main text-white shadow-md transition-transform group-hover:scale-105">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
        <span className="text-xl font-extrabold tracking-tight text-foreground">
          pitcho
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border-2 border-border bg-card px-6 py-8 shadow-sm sm:px-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
