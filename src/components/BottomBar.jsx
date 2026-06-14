"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MonitorPlay, Mic, Target, CircleUser } from "lucide-react";

const navItems = [
  { label: "Studio", href: "/studio", icon: MonitorPlay },
  { label: "Practice", href: "/practice", icon: Mic },
  { label: "Progress", href: "/progress", icon: Target },
  { label: "Profile", href: "/profile", icon: CircleUser },
];

export default function BottomBar() {
  const pathname = usePathname();

  const isActive = (href) => {
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white border-t border-slate-200 h-16 flex items-center justify-around pb-[env(safe-area-inset-bottom,8px)]">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`relative flex flex-col items-center justify-center h-full flex-1 transition-colors ${
              active ? "text-[#0066ff]" : "text-slate-400"
            }`}
          >
            {/* Active indicator bar */}
            {active && (
              <span className="absolute top-0 left-1/4 right-1/4 h-[3px] bg-[#0066ff] rounded-b-full" />
            )}
            <Icon className="size-[24px] shrink-0" />
          </Link>
        );
      })}
    </nav>
  );
}
