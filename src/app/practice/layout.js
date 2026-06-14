import React from "react";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Practice - Pitcho",
  description:
    "Choose your practice mode — Presentation or Interview — and sharpen your skills with real-time AI feedback.",
};

export default function PracticeLayout({ children }) {
  return <AppShell bgColor="bg-white">{children}</AppShell>;
}
