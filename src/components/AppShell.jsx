"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import BottomBar from "@/components/BottomBar";

export default function AppShell({ children, bgColor = "bg-white", mainBgColor }) {
  const mainBg = mainBgColor || bgColor;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${bgColor}`}>
      {/* Responsive Left Sidebar */}
      <Sidebar />

      {/* Mobile Top Header */}
      <MobileHeader />

      {/* Main Content Area */}
      <main className={`flex-1 md:pl-20 lg:pl-64 min-h-screen pb-20 md:pb-0 ${mainBg}`}>
        <div className="mx-auto p-4 md:p-8 lg:p-10">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomBar />
    </div>
  );
}
