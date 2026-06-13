import React from "react";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";

export const metadata = {
  title: "Session Detail - Pitcho",
};

export default function SessionLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <Sidebar />
      <MobileHeader />
      <main className="flex-1 md:pl-20 lg:pl-64 min-h-screen bg-[#f8fafc]">
        <div className="mx-auto p-4 md:p-8 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
