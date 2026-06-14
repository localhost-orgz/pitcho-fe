import React from "react";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Your Progress - Pitcho",
};

export default function ProgressLayout({ children }) {
  return <AppShell bgColor="bg-white">{children}</AppShell>;
}
