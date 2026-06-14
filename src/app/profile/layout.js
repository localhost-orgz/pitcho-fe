import React from "react";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Profile - Pitcho",
  description: "View your profile, account details, and manage your Pitcho experience.",
};

export default function ProfileLayout({ children }) {
  return <AppShell bgColor="bg-white">{children}</AppShell>;
}
