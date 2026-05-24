"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/UI/button";
import { 
  LayoutDashboard, 
  Mic, 
  History, 
  User, 
  LogOut 
} from "lucide-react";

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

const SidebarItem = ({ label, href, icon: Icon }) => {
  const pathname = usePathname();
  // Match active route
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Button
      className="lg:justify-start justify-center h-[52px] w-full p-0 lg:px-4 lg:py-2 transition-all"
      variant={active ? "sidebarOutline" : "sidebar"}
      asChild
    >
      <Link href={href} className="flex items-center w-full gap-x-3">
        <Icon className="size-[22px] shrink-0" />
        <span className="hidden lg:inline text-sm font-bold tracking-wide">{label}</span>
      </Link>
    </Button>
  );
};

export default function Sidebar() {
  return (
    <div className="hidden md:flex flex-col justify-between w-20 lg:w-64 h-screen fixed left-0 top-0 p-4 border-r-2 border-border bg-card text-card-foreground z-10">
      <div className="flex flex-col gap-y-8">
        {/* Brand Logo & Title */}
        <Link href="/dashboard" className="flex items-center gap-x-3 pt-4 lg:pl-3 pb-3 justify-center lg:justify-start">
          <div className="size-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-extrabold text-xl shadow-[0_4px_0_#0084d1] transform transition-transform active:translate-y-0.5">
            P
          </div>
          <h1 className="hidden lg:block text-2xl font-black text-primary tracking-tight">
            Presenta
          </h1>
        </Link>

        {/* Navigation Items */}
        <div className="flex flex-col gap-y-2">
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              label={item.label}
              href={item.href}
              icon={item.icon}
            />
          ))}
        </div>
      </div>

      {/* Logout / Footer */}
      <div className="w-full">
        <Button
          className="lg:justify-start justify-center h-[52px] w-full p-0 lg:px-4 lg:py-2 text-rose-500 hover:bg-rose-50/50 hover:text-rose-600 transition-colors"
          variant="sidebar"
          asChild
        >
          <Link href="/" className="flex items-center w-full gap-x-3">
            <LogOut className="size-[22px] shrink-0" />
            <span className="hidden lg:inline text-sm font-bold tracking-wide">Keluar</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
