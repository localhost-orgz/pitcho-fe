import React from "react";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Resources - Pitcho",
};

export default function ResourcesLayout({ children }) {
  return <AppShell bgColor="bg-white">{children}</AppShell>;
}
