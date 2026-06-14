import React from "react";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Interview Setup - Pitcho",
};

export default function InterviewLayout({ children }) {
  return <AppShell bgColor="bg-white">{children}</AppShell>;
}
