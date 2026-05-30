"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mic,
  Trophy,
  Target,
  FileText,
  LogOut,
  HelpCircle,
  MonitorPlay,
  ChevronDown,
} from "lucide-react";

// Custom Inline SVG Logo for Pitcho
const PitchoLogo = () => (
  <svg viewBox="0 0 100 100" className="size-10 shrink-0 select-none">
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
    <path d="M 50 56 L 44 64 C 47 67, 53 67, 56 64 Z" fill="#f97316" />
  </svg>
);

const SidebarItem = ({ label, href, icon: Icon, active }) => {
  return (
    <Link
      href={href}
      className={`flex items-center lg:justify-start justify-center h-[48px] w-full lg:px-4 rounded-xl font-bold transition-all ${
        active
          ? "bg-[#e6f0ff] text-[#0066ff] border border-blue-100/50"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      <Icon className="size-[22px] shrink-0" />
      <span className="hidden lg:inline text-sm font-bold tracking-wide ml-3">
        {label}
      </span>
    </Link>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const [practiceOpen, setPracticeOpen] = useState(false);

  // Auto-open Practice dropdown if we are currently inside interview or presentation routes
  useEffect(() => {
    if (
      pathname.startsWith("/interview") ||
      pathname.startsWith("/presentation")
    ) {
      setPracticeOpen(true);
    }
  }, [pathname]);

  // Match active state for Pitcho routing mapping
  const getActiveState = (href) => {
    if (href === "/studio") {
      return (
        pathname === "/studio" ||
        pathname.startsWith("/studio") ||
        pathname === "/" ||
        pathname === ""
      );
    }
    return pathname === href || pathname.startsWith(href);
  };

  const isPracticeActive =
    pathname.startsWith("/interview") || pathname.startsWith("/presentation");

  return (
    <div className="hidden md:flex flex-col justify-between w-20 lg:w-64 h-screen fixed left-0 top-0 p-4 border-r border-slate-100 bg-white text-slate-800 z-10 select-none">
      {/* 1. Header (fixed) */}
      <div className="flex flex-col gap-y-6 shrink-0">
        <Link
          href="/studio"
          className="flex items-center gap-x-3 pt-3 lg:pl-3 pb-3 justify-center lg:justify-start"
        >
          <PitchoLogo />
          <h1 className="hidden lg:block text-2xl font-extrabold text-[#0066ff] tracking-tight">
            Pitcho
          </h1>
        </Link>
      </div>

      {/* 2. Middle Content Section (scrollable if screen is low height, hiding scrollbar) */}
      <div
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className="flex-1 overflow-y-auto py-4 space-y-6"
      >
        {/* Navigation Items */}
        <div className="flex flex-col gap-y-1">
          {/* Studio Link */}
          <SidebarItem
            label="Studio"
            href="/studio"
            icon={MonitorPlay}
            active={getActiveState("/studio")}
          />

          {/* Practice Expandable Dropdown Container */}
          <div className="flex flex-col gap-y-1">
            <Link
              href="/interview/setup"
              onClick={(e) => {
                if (
                  typeof window !== "undefined" &&
                  window.innerWidth >= 1024
                ) {
                  e.preventDefault();
                  setPracticeOpen(!practiceOpen);
                }
              }}
              className={`flex items-center lg:justify-between justify-center h-[48px] w-full lg:px-4 rounded-xl font-bold transition-all ${
                isPracticeActive
                  ? "bg-[#e6f0ff] text-[#0066ff] border border-blue-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center">
                <Mic className="size-[22px] shrink-0" />
                <span className="hidden lg:inline text-sm font-bold tracking-wide ml-3">
                  Practice
                </span>
              </div>
              <ChevronDown
                className={`hidden lg:inline size-4 text-slate-400 transition-transform duration-200 ${
                  practiceOpen ? "rotate-180" : ""
                }`}
              />
            </Link>

            {/* Sub-items list (only visible in desktop expanded mode when toggle is active) */}
            {practiceOpen && (
              <div className="hidden lg:flex flex-col gap-y-1 pl-9 mt-1">
                <Link
                  href="/interview/setup"
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all block ${
                    pathname.startsWith("/interview")
                      ? "text-[#0066ff] bg-[#e6f0ff]/50 font-extrabold pl-2.5"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Interview
                </Link>
                <Link
                  href="/presentation/setup"
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all block ${
                    pathname.startsWith("/presentation")
                      ? "text-[#0066ff] bg-[#e6f0ff]/50 font-extrabold pl-2.5"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Presentation
                </Link>
              </div>
            )}
          </div>

          {/* Challenges Link */}
          <SidebarItem
            label="Challenges"
            href="/challenges"
            icon={Trophy}
            active={getActiveState("/challenges")}
          />

          {/* Progress Link */}
          <SidebarItem
            label="Progress"
            href="/progress"
            icon={Target}
            active={getActiveState("/progress")}
          />

          {/* Resources Link */}
          <SidebarItem
            label="Resources"
            href="/resources"
            icon={FileText}
            active={getActiveState("/resources")}
          />
        </div>

        {/* Mascot Greeting Card (Only in expanded view) */}
        <div className="hidden lg:flex flex-col items-center p-5 bg-[#f4f8ff] border border-blue-50/50 rounded-3xl mt-4 select-none">
          <img
            src="/hi.svg"
            alt="Mascot"
            className="w-24 h-24 object-contain hover:scale-105 transition-transform duration-300"
          />
          <span className="text-slate-800 font-extrabold text-[15px] mt-2 text-center">
            Hi Aulia! 👋
          </span>
          <span className="text-slate-500 font-bold text-xs text-center mt-1 px-2 leading-relaxed">
            Ready to level up your speaking today?
          </span>
          <Link
            href="/interview/setup"
            className="w-full text-center bg-[#0066ff] hover:bg-[#0055ee] active:bg-[#0044cc] text-white font-extrabold text-sm py-2.5 px-4 rounded-2xl mt-4 shadow-md shadow-blue-500/10 transition-all duration-100 active:translate-y-0.5"
          >
            Start Practice
          </Link>
        </div>
      </div>

      {/* 3. Footer (fixed profile and actions) */}
      <div className="flex flex-col gap-y-4 pt-4 border-t border-slate-100 shrink-0">
        {/* Profile details (Expanded: full block; Collapsed: center avatar) */}
        <div className="flex flex-col gap-y-2 lg:px-2">
          <div className="flex items-center gap-x-3 justify-center lg:justify-start">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
              alt="Aulia Rahman"
              className="size-10 rounded-full border border-slate-100 object-cover"
            />
            <div className="hidden lg:flex flex-col select-text">
              <span className="text-sm font-extrabold text-slate-850 leading-tight">
                Aulia Rahman
              </span>
              <span className="text-xs font-bold text-slate-400">Level 12</span>
            </div>
          </div>

          {/* XP Progress Bar (Only visible when expanded) */}
          <div className="hidden lg:flex flex-col mt-1">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#0066ff] h-full rounded-full w-[68%]" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-1.5 text-right leading-none">
              820 / 1200 XP
            </span>
          </div>
        </div>

        {/* Log Out button */}
        <Link
          href="/"
          className="flex items-center lg:justify-start justify-center h-[44px] w-full lg:px-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all font-bold"
        >
          <LogOut className="size-[22px] shrink-0" />
          <span className="hidden lg:inline text-sm font-bold tracking-wide ml-3">
            Log out
          </span>
        </Link>
      </div>
    </div>
  );
}
