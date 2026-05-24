"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Mic, History, User } from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Latihan",
    href: "/dashboard/practice",
    icon: Mic,
  },
  {
    label: "Riwayat",
    href: "/dashboard/history",
    icon: History,
  },
  {
    label: "Profil",
    href: "/dashboard/profile",
    icon: User,
  },
];

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="md:hidden sticky top-0 w-full z-20 bg-card border-b-2 border-border px-4 py-3 flex items-center justify-between">
      {/* Brand logo */}
      <Link href="/dashboard" className="flex items-center gap-x-2">
        <div className="size-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-extrabold text-sm shadow-[0_3px_0_#0084d1]">
          P
        </div>
        <span className="text-lg font-black text-primary tracking-tight">Presenta</span>
      </Link>

      {/* Toggle button */}
      <button
        onClick={toggleMenu}
        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Fullscreen Mobile Drawer */}
      {isOpen && (
        <div className="absolute top-[57px] left-0 w-full bg-card border-b-2 border-border shadow-xl py-4 flex flex-col px-4 animate-fade-in gap-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-x-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  active
                    ? "bg-sky-500/15 text-sky-500 border-sky-300 border-[1.5px]"
                    : "text-slate-500 hover:bg-muted"
                }`}
              >
                <Icon className="size-5" />
                <span className="text-sm uppercase tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
