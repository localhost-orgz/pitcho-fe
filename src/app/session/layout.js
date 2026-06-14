import React from "react";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Session Detail - Pitcho",
};

export default function SessionLayout({ children }) {
  return (
    <AppShell bgColor="bg-white" mainBgColor="bg-[#f8fafc]">
      {children}
    </AppShell>
  );
}
