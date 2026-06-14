import React from "react";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Your Progress v2 - Pitcho",
};

export default function ProgressV2Layout({ children }) {
  return <AppShell bgColor="bg-[#f3f7fd]">{children}</AppShell>;
}
