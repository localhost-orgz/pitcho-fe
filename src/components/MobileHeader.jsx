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

// Custom Inline SVG Logo for Pitcho
const PitchoLogo = () => (
  <svg viewBox="0 0 100 100" className="size-8 shrink-0 select-none">
    {/* Blue background circle */}
    <circle cx="50" cy="50" r="46" fill="#0066ff" />
    
    {/* White face cheeks area */}
    <path
      d="M 22 56 C 22 36, 78 36, 78 56 C 78 72, 68 76, 50 76 C 32 76, 22 72, 22 56 Z"
      fill="#ffffff"
    />
    
    {/* Blue helmet upper mask */}
    <path
      d="M 22 56 C 22 36, 78 36, 78 56 C 78 54, 75 52, 70 48 C 60 41, 40 41, 30 48 C 25 52, 22 54, 22 56 Z"
      fill="#0055dd"
    />
    
    {/* Eyes */}
    <circle cx="37" cy="54" r="6" fill="#0f172a" />
    <circle cx="63" cy="54" r="6" fill="#0f172a" />
    
    {/* Eye Highlights */}
    <circle cx="35" cy="52" r="2.2" fill="#ffffff" />
    <circle cx="61" cy="52" r="2.2" fill="#ffffff" />
    
    {/* Cheeks */}
    <circle cx="28" cy="62" r="4" fill="#f87171" opacity="0.5" />
    <circle cx="72" cy="62" r="4" fill="#f87171" opacity="0.5" />
    
    {/* Beak / Nose */}
    <path
      d="M 50 56 L 44 64 C 47 67, 53 67, 56 64 Z"
      fill="#f97316"
    />
  </svg>
);

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
      <Link href="/studio" className="flex items-center gap-x-2.5">
        <PitchoLogo />
        <span className="text-xl font-extrabold text-[#0066ff] tracking-tight">Pitcho</span>
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
