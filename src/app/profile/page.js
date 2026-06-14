"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HelpCircle, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTour } from "@/components/Tour/TourContext";

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const { restartTour } = useTour();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className="text-center md:text-left">
          <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="border-bold bg-white rounded-2xl p-6 space-y-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-slate-200" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-36 bg-slate-200 rounded" />
              <div className="h-4 w-52 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-12 w-full bg-slate-100 rounded-xl" />
          <div className="h-12 w-full bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="border-bold bg-white rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
            <User className="size-7 text-slate-400" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              Not logged in
            </h2>
            <p className="text-sm text-slate-500 font-bold mt-1">
              Sign in to view your profile and track your progress.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center py-2.5 px-6 rounded-xl bg-[#0066ff] text-white font-extrabold text-sm transition-all border-b-[5px] active:border-b-0 active:translate-y-1 border-black/20 hover:bg-[#0052cc]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Logged in
  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
          Profile
        </h1>
        <p className="text-slate-500 font-bold mt-1">
          Your account details
        </p>
      </div>

      {/* User Info Card */}
      <div className="border-bold bg-white rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <img
            src="/dummy_ava.png"
            alt={user?.name || "User"}
            className="size-16 rounded-full border-2 border-slate-100 object-cover"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold text-slate-800 truncate">
              {user?.name || "User"}
            </h2>
            <p className="text-sm text-slate-500 font-bold truncate">
              {user?.email || "No email"}
            </p>
          </div>
        </div>
      </div>

      {/* Actions Card */}
      <div className="border-bold bg-white rounded-2xl p-3 space-y-1">
        {/* Tour Guide */}
        <button
          type="button"
          onClick={restartTour}
          className="flex items-center gap-3 w-full py-3 px-4 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-[#0066ff] transition-all font-bold"
        >
          <HelpCircle className="size-[22px] shrink-0" />
          <span className="text-sm font-bold">Tour Guide</span>
        </button>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full py-3 px-4 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all font-bold"
        >
          <LogOut className="size-[22px] shrink-0" />
          <span className="text-sm font-bold">Log out</span>
        </button>
      </div>
    </div>
  );
}
