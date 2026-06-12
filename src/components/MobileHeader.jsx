"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  Mic, 
  Trophy, 
  Target, 
  FileText,
  MonitorPlay,
  ChevronDown
} from "lucide-react";

// Navigation Items mapping matching Sidebar
const navItems = [
  {
    label: "Studio",
    href: "/studio",
    icon: MonitorPlay,
  },
  {
    label: "Practice",
    href: "/interview/setup",
    icon: Mic,
    isDropdown: true,
  },
  {
    label: "Challenges",
    href: "/challenges",
    icon: Trophy,
  },
  {
    label: "Progress",
    href: "/progress",
    icon: Target,
  },
  {
    label: "Resources",
    href: "/resources",
    icon: FileText,
  },
];

// Using /logo-text-transparent.svg directly in render

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobilePracticeOpen, setMobilePracticeOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Auto-open dropdown if active on mobile menu load
  useEffect(() => {
    if (pathname.startsWith("/interview") || pathname.startsWith("/presentation")) {
      setMobilePracticeOpen(true);
    }
  }, [pathname]);

  // Match active state for Pitcho routing mapping
  const getActiveState = (href) => {
    if (href === "/studio") {
      return pathname === "/studio" || pathname.startsWith("/studio") || pathname === "/" || pathname === "";
    }
    return pathname === href || pathname.startsWith(href);
  };

  const isPracticeActive = pathname.startsWith("/interview") || pathname.startsWith("/presentation");

  return (
    <header className="md:hidden sticky top-0 w-full z-20 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between select-none">
      {/* Brand logo */}
      <Link href="/studio" className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-text-transparent.svg"
          alt="Pitcho"
          className="h-8 w-auto select-none"
        />
      </Link>

      {/* Toggle button */}
      <button
        onClick={toggleMenu}
        className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Fullscreen Mobile Drawer */}
      {isOpen && (
        <div className="absolute top-[57px] left-0 w-full bg-white border-b border-slate-100 shadow-lg py-3 flex flex-col px-4 animate-fade-in gap-y-1 z-30">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = getActiveState(item.href);

            if (item.isDropdown) {
              return (
                <div key={item.href} className="flex flex-col gap-y-1">
                  <button
                    onClick={() => setMobilePracticeOpen(!mobilePracticeOpen)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all cursor-pointer ${
                      isPracticeActive
                        ? "bg-[#e6f0ff] text-[#0066ff] border border-blue-100/50"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-x-3">
                      <Icon className="size-5" />
                      <span className="text-sm tracking-wide">{item.label}</span>
                    </div>
                    <ChevronDown 
                      className={`size-4 text-slate-400 transition-transform duration-200 ${
                        mobilePracticeOpen ? "rotate-180" : ""
                      }`} 
                    />
                  </button>
                  {mobilePracticeOpen && (
                    <div className="flex flex-col gap-y-1 pl-10 mt-1">
                      <Link
                        href="/interview/setup"
                        onClick={() => setIsOpen(false)}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition-all block ${
                          pathname.startsWith("/interview")
                            ? "text-[#0066ff] bg-[#e6f0ff]/50 font-extrabold border-l-2 border-[#0066ff] pl-3.5"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        Interview
                      </Link>
                      <Link
                        href="/presentation/setup"
                        onClick={() => setIsOpen(false)}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition-all block ${
                          pathname.startsWith("/presentation")
                            ? "text-[#0066ff] bg-[#e6f0ff]/50 font-extrabold border-l-2 border-[#0066ff] pl-3.5"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        Presentation
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-x-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  active
                    ? "bg-[#e6f0ff] text-[#0066ff] border border-blue-100/50"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon className="size-5" />
                <span className="text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
