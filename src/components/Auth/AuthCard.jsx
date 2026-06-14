"use client";

import Link from "next/link";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
      {/* Logo */}
      <Link href="/" className="mb-6 sm:mb-10 flex items-center justify-center group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-text-transparent.svg"
          alt="Pitcho"
          className="h-10 sm:h-12 w-auto select-none transition-transform duration-200 group-hover:scale-105"
        />
      </Link>

      {/* Card */}
      <div className="w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border border-slate-100 sm:border-2 sm:border-border bg-white sm:bg-card px-4 py-6 sm:px-10 sm:py-8 shadow-sm sm:shadow-sm">
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
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
