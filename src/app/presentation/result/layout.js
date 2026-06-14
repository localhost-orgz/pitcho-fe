import React from "react";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Session Result - Pitcho",
};

export default function PresentationResultLayout({ children }) {
  return (
    <AppShell bgColor="bg-white" mainBgColor="bg-[#f8fafc]">
      {children}
    </AppShell>
  );
}
