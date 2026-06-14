import React from "react";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Dashboard - Pitcho",
  description: "Pitcho dashboard untuk memantau perkembangan latihan presentasi dan wawancara Anda.",
};

export default function DashboardLayout({ children }) {
  return <AppShell bgColor="bg-[#f3f7fd]">{children}</AppShell>;
}
