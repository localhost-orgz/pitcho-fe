"use client";

import Link from "next/link";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center justify-center group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-text-transparent.svg"
          alt="Pitcho"
          className="h-12 w-auto select-none transition-transform duration-200 group-hover:scale-105"
        />
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
