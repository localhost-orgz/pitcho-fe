import React from "react";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Presentation Setup - Pitcho",
};

export default function PresentationSetupLayout({ children }) {
  return <AppShell bgColor="bg-white">{children}</AppShell>;
}
