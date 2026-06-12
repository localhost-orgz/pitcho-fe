import React from "react";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";

export const metadata = {
  title: "Dashboard - Pitcho",
  description: "Pitcho dashboard untuk memantau perkembangan latihan presentasi dan wawancara Anda.",
};

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f3f7fd]">
      {/* Responsive Left Sidebar */}
      <Sidebar />

      {/* Mobile Top Header */}
      <MobileHeader />

      {/* Main Content Area */}
      <main className="flex-1 md:pl-20 lg:pl-64 min-h-screen bg-[#f3f7fd]">
        <div className=" mx-auto p-4 md:p-8 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
