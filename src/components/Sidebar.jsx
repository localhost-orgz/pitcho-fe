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

// Custom Inline SVG Icon only (extracted from logo-text-transparent.svg path)
const PitchoIcon = () => (
  <svg
    viewBox="68 50 330 335"
    className="size-10 shrink-0 select-none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M71.2 369.974V208.585C68.9068 149.638 87.0281 127.318 90.1074 123.312C118.721 86.0861 142.82 80.3897 168.031 75.8113C188.199 72.1486 231.821 74.667 252.83 76.3839C288.927 81.5346 314.519 109.386 323.305 122.168C339.806 111.18 352.717 89.7373 357.11 80.3897H346.796C334.764 80.3897 334.764 66.6547 342.786 64.9378L376.018 52.347C385.758 48.9134 388.05 52.3471 389.196 59.2147L395.498 91.2636C396.071 95.8418 397.561 103.74 389.769 105.571C381.976 107.402 377.354 96.7958 376.018 91.2636C358.256 122.168 343.55 131.706 333.618 139.337C341.41 152.614 343.741 176.155 343.931 186.266V230.333C343.931 247.502 335.91 266.388 331.326 275.545C328.461 282.984 316.2 300.382 294.656 317.322C273.113 334.263 235.068 337.544 218.452 336.781V296.72C255.58 288.479 264.098 257.612 263.716 243.496H242.516C228.192 243.496 230.484 228.616 242.516 228.616H263.716L263.143 174.819C263.143 141.054 223.609 127.318 206.993 127.318C169.75 127.318 152.752 161.084 151.415 175.392H173.76C183.501 175.392 185.22 189.699 173.188 189.699H150.842V202.29H173.188C185.793 202.29 184.647 216.598 173.76 216.598H150.842V228.616H173.76C185.793 228.616 184.647 243.496 173.76 243.496H150.842C152.217 281.954 181.973 295.003 196.679 296.72V336.781C173.302 338.154 155.235 334.682 149.123 332.775L86.6701 382.565C72.9189 388.059 70.627 376.46 71.2 369.974Z"
      fill="#086AFC"
    />
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
  const isPracticeActive =
    pathname.startsWith("/interview") || pathname.startsWith("/presentation");
  const [practiceOpen, setPracticeOpen] = useState(isPracticeActive);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (isPracticeActive) {
      setPracticeOpen(true);
    }
  }

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

  // -- Handle logout
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token");
      localStorage.removeItem("auth-user");
      document.cookie =
        "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
    }
  };

  return (
    <div className="hidden md:flex flex-col justify-between w-20 lg:w-64 h-screen fixed left-0 top-0 p-4 border-r border-slate-100 bg-white text-slate-800 z-10 select-none">
      {/* 1. Header (fixed) */}
      <div className="flex flex-col gap-y-6 shrink-0">
        <Link
          href="/studio"
          className="flex items-center gap-x-3 pt-3 lg:pl-3 pb-3 justify-center lg:justify-start"
        >
          {/* Expanded (lg): Show the full logo-text-transparent.svg */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-text-transparent.svg"
            alt="Pitcho"
            className="hidden lg:block h-auto w-[50%] select-none"
          />
          {/* Collapsed (md/lg-hidden): Show only the logo icon */}
          <div className="lg:hidden flex items-center justify-center">
            <PitchoIcon />
          </div>
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
              href="/presentation/setup"
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
                  href="/presentation/setup"
                  className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all block ${
                    pathname.startsWith("/presentation")
                      ? "text-[#0066ff] bg-[#e6f0ff]/50 font-extrabold pl-3.5"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Presentation
                </Link>
                <Link
                  href="/interview/setup"
                  className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all block ${
                    pathname.startsWith("/interview")
                      ? "text-[#0066ff] bg-[#e6f0ff]/50 font-extrabold pl-3.5"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Interview
                </Link>
              </div>
            )}
          </div>

          {/* Progress Link */}
          <SidebarItem
            label="Progress"
            href="/progress"
            icon={Target}
            active={getActiveState("/progress")}
          />

          {/* Challenges Link (hidden)
          <SidebarItem
            label="Challenges"
            href="/challenges"
            icon={Trophy}
            active={getActiveState("/challenges")}
          />
          */}

          {/* Resources Link (hidden)
          <SidebarItem
            label="Resources"
            href="/resources"
            icon={FileText}
            active={getActiveState("/resources")}
          />
          */}
        </div>
      </div>

      {/* 3. Footer (fixed profile and actions) */}
      <div className="flex flex-col gap-y-4 pt-4 border-t border-slate-100 shrink-0">
        {/* Profile details (Expanded: full block; Collapsed: center avatar) */}
        <div className="flex flex-col gap-y-2 lg:px-2">
          <div className="flex items-center gap-x-3 justify-center lg:justify-start">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
              alt="Faza Mumtaz"
              className="size-10 rounded-full border border-slate-100 object-cover"
            />
            <div className="hidden lg:flex flex-col select-text">
              <span className="text-sm font-extrabold text-slate-850 leading-tight">
                Faza Mumtaz
              </span>
              {/* <span className="text-xs font-bold text-slate-400">Level 12</span> */}
            </div>
          </div>

          {/* XP Progress Bar (Only visible when expanded) */}
          {/* <div className="hidden lg:flex flex-col mt-1">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#0066ff] h-full rounded-full w-[68%]" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-1.5 text-right leading-none">
              820 / 1200 XP
            </span>
          </div> */}
        </div>

        {/* Log Out button */}
        <button
          onClick={handleLogout}
          className="flex items-center lg:justify-start justify-center h-[44px] w-full lg:px-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all font-bold"
        >
          <LogOut className="size-[22px] shrink-0" />
          <span className="hidden lg:inline text-sm font-bold tracking-wide ml-3">
            Log out
          </span>
        </button>
      </div>
    </div>
  );
}
