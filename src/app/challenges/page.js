"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  Star,
  ChevronRight,
  ChevronDown,
  Play,
  Clock,
  Mic,
  Eye,
  Users,
  Target,
  Zap,
  Trophy,
  Gift,
  Calendar,
  MoreHorizontal,
  ArrowDownCircle,
} from "lucide-react";

export default function ChallengesPage() {
  React.useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#f3f7fd";
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  const [activeTab, setActiveTab] = useState("All Challenges");

  const tabs = [
    "All Challenges",
    "Speaking Skills",
    "Focus & Confidence",
    "Consistency",
    "Advanced",
  ];

  const tabIcons = {
    "All Challenges": null,
    "Speaking Skills": Mic,
    "Focus & Confidence": Eye,
    "Consistency": Target,
    "Advanced": Users,
  };

  const featuredChallenges = [
    {
      title: "3-Minute Talk Master",
      desc: "Deliver a clear 3-minute talk without using filler words.",
      xp: 500,
      progress: "0 / 1",
      badge: "Popular",
      badgeColor: "bg-amber-100 text-amber-600",
      bgColor: "bg-sky-50",
    },
    {
      title: "Focus Under Pressure",
      desc: "Maintain eye contact for 80% while facing 3 distractions.",
      xp: 700,
      progress: "0 / 1",
      badge: "New",
      badgeColor: "bg-emerald-100 text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Clear & Concise",
      desc: "Present your ideas using concise and powerful sentences.",
      xp: 400,
      progress: "0 / 1",
      badge: "Trending",
      badgeColor: "bg-rose-100 text-rose-600",
      bgColor: "bg-violet-50",
    },
  ];

  const allChallenges = [
    {
      title: "Daily Warm-up",
      desc: "Record a 1-minute introduction about any topic.",
      tag: "Daily",
      tagColor: "bg-sky-100 text-sky-600",
      xp: 100,
      progress: "0 / 1",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-500",
      Icon: Clock,
      hasProgress: false,
    },
    {
      title: "No Filler Words",
      desc: "Speak for 2 minutes without using filler words.",
      tag: "Speaking Skills",
      tagColor: "bg-violet-100 text-violet-600",
      xp: 300,
      progress: "0 / 1",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
      Icon: Mic,
      hasProgress: false,
    },
    {
      title: "Engage Your Audience",
      desc: "Ask a rhetorical question and keep your audience engaged.",
      tag: "Advanced",
      tagColor: "bg-indigo-100 text-indigo-600",
      xp: 600,
      progress: "0 / 1",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-500",
      Icon: Users,
      hasProgress: false,
    },
    {
      title: "Slow Down Challenge",
      desc: "Maintain a steady pace for a 2-minute explanation.",
      tag: "Focus & Confidence",
      tagColor: "bg-sky-100 text-sky-600",
      xp: 300,
      progress: "0 / 1",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-500",
      Icon: Clock,
      hasProgress: false,
    },
    {
      title: "Weekly Streak",
      desc: "Complete 5 practice sessions this week.",
      tag: "Consistency",
      tagColor: "bg-emerald-100 text-emerald-600",
      xp: 500,
      progress: "3 / 5",
      progressPercent: 60,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-500",
      Icon: Calendar,
      hasProgress: true,
    },
  ];

  return (
    <div className="w-full min-h-screen pb-10">
      {/* ─── Header Row ─── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Challenges
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xs">
            Complete challenges, earn XP, and become a better speaker every day.
          </p>
        </div>

        {/* Right badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-white border-bold px-4 py-2.5">
            <Flame size={20} className="text-amber-500" />
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-800 text-sm leading-tight">
                12
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                Day Streak
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white border-bold px-4 py-2.5">
            <Star size={20} className="text-amber-400 fill-amber-400" />
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-800 text-sm leading-tight">
                2,450
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                Pitcho Points
              </span>
            </div>
          </div>
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 shrink-0" />
        </div>
      </div>

      {/* ─── Hero Banner ─── */}
      <div className="w-full mt-6 rounded-2xl overflow-hidden bg-gradient-to-r from-sky-50 via-sky-50 to-sky-100 border border-sky-100 flex items-stretch min-h-[160px]">
        {/* Left text */}
        <div className="flex flex-col justify-center p-6 md:p-8 flex-1">
          <h2 className="text-2xl md:text-[28px] font-extrabold text-slate-900 leading-tight">
            New challenges,
            <br />
            new you!
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-2 max-w-[260px]">
            Step out of your comfort zone and grow your confidence.
          </p>
          <button className="mt-4 flex items-center gap-2 bg-main hover:bg-sky-600 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl w-fit transition-colors cursor-pointer">
            <Play size={14} fill="white" />
            <span>See How It Works</span>
          </button>
        </div>
        {/* Right illustration placeholder */}
        <div className="hidden md:flex items-end justify-end flex-1 pr-6 pb-0">
          <div className="w-[280px] h-[140px] bg-sky-200/50 rounded-t-2xl flex items-center justify-center">
            <span className="text-xs font-bold text-sky-400">
              Illustration
            </span>
          </div>
        </div>
      </div>

      {/* ─── Filter Tabs ─── */}
      <div className="mt-8 flex items-center gap-1 border-b-2 border-slate-100 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const Icon = tabIcons[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? "border-main text-main"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {Icon && <Icon size={15} />}
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Featured Challenges ─── */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-slate-900">
            Featured Challenges
          </h3>
          <button className="flex items-center gap-1 text-main text-sm font-bold hover:underline cursor-pointer">
            View all <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 relative">
          {featuredChallenges.map((c, i) => (
            <div
              key={i}
              className="bg-white border-bold overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer group"
            >
              {/* Image placeholder area */}
              <div
                className={`relative w-full h-[160px] ${c.bgColor} flex items-center justify-center`}
              >
                {/* Badge */}
                <div
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold ${c.badgeColor}`}
                >
                  {c.badge}
                </div>
                {/* More button */}
                <div className="absolute top-3 right-3 p-1.5 bg-white/80 rounded-full">
                  <MoreHorizontal size={14} className="text-slate-400" />
                </div>
                {/* Dummy illustration placeholder */}
                <div className="w-32 h-24 bg-white/30 rounded-xl flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-400/60">
                    Image
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4 flex flex-col flex-1">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {c.title}
                </h4>
                <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed line-clamp-2">
                  {c.desc}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-4">
                  <div className="flex items-center gap-1.5">
                    <Star
                      size={14}
                      className="text-amber-400 fill-amber-400"
                    />
                    <span className="text-xs font-extrabold text-slate-700">
                      {c.xp} XP
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {c.progress}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Scroll arrow */}
          <button className="absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-pointer z-10 hidden lg:flex">
            <ChevronRight size={18} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* ─── All Challenges List ─── */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-slate-900">
            All Challenges
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 font-bold bg-white border-2 border-slate-200 rounded-xl px-3.5 py-2 cursor-pointer hover:border-slate-300 transition-colors">
            <span>Sort by: Recommended</span>
            <ChevronDown size={14} />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-5">
          {allChallenges.map((c, i) => {
            const Icon = c.Icon;
            return (
              <div
                key={i}
                className="w-full bg-white border-bold px-5 py-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow cursor-pointer group"
              >
                {/* Left */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Icon circle */}
                  <div
                    className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}
                  >
                    <Icon size={20} className={c.iconColor} />
                  </div>

                  {/* Text */}
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-sm text-slate-900">
                      {c.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-slate-400 font-medium truncate">
                        {c.desc}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.tagColor} whitespace-nowrap`}
                      >
                        {c.tag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-5 shrink-0">
                  {/* Progress bar (only for Weekly Streak) */}
                  {c.hasProgress && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-main rounded-full transition-all"
                          style={{ width: `${c.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                        {c.progress}
                      </span>
                    </div>
                  )}

                  {!c.hasProgress && (
                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                      {c.progress}
                    </span>
                  )}

                  {/* XP badge */}
                  <div className="flex items-center gap-1.5">
                    <Star
                      size={14}
                      className="text-amber-400 fill-amber-400"
                    />
                    <span className="text-xs font-extrabold text-slate-700 whitespace-nowrap">
                      {c.xp} XP
                    </span>
                  </div>

                  {/* Chevron */}
                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-slate-500 transition-colors"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Bottom Rewards Banner ─── */}
      <div className="w-full mt-8 bg-white border-bold px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
            <Trophy size={20} className="text-amber-500" />
          </div>
          <p className="text-sm font-bold text-slate-600">
            Complete challenges to earn Pitcho Points and unlock special rewards!
          </p>
        </div>
        <button className="flex items-center gap-2 bg-main/10 text-main hover:bg-main/20 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
          <Gift size={15} />
          <span>View Rewards</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
