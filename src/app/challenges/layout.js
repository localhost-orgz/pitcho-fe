import React from "react";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Challenges - Pitcho",
};

export default function ChallengesLayout({ children }) {
  return <AppShell bgColor="bg-white">{children}</AppShell>;
}
