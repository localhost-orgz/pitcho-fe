"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/UI/button";
import {
  Play,
  TrendingUp,
  Eye,
  Activity,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Clock,
  ArrowRight,
  Lightbulb,
  AudioLines,
  Timer,
  Trophy,
  Flame,
  Gift,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PerformanceCircle from "@/components/UI/PerformanceCircle";
import MiniLineChart from "@/components/UI/MiniLineChart";
import { fetchHistory } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function StationPage() {
  const { user } = useAuth();
  React.useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#f3f7fd";
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  const stats = [
    {
      label: "Total Latihan",
      value: "14 Sesi",
      change: "+3 minggu ini",
      icon: Activity,
      color: "bg-sky-500/10 text-sky-500 border-sky-200",
    },
    {
      label: "Kontak Mata",
      value: "88%",
      change: "+4% vs kemarin",
      icon: Eye,
      color: "bg-green-500/10 text-green-500 border-green-200",
    },
    {
      label: "Durasi Latihan",
      value: "2j 45m",
      change: "Target: 5j/minggu",
      icon: Clock,
      color: "bg-amber-500/10 text-amber-500 border-amber-200",
    },
  ];

  const eyeContactData = [70, 75, 82, 79, 85, 83, 88];
  const fillerWordsData = [10, 8, 9, 7, 6, 5, 10];
  const speakingPaceData = [142, 138, 135, 130, 128, 122, 125];

  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("right");
  const [recentSessions, setRecentSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // ── Fetch last 5 sessions from /api/history ──────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setSessionsLoading(true);
      try {
        const raw = await fetchHistory({ limit: 5 });
        if (cancelled) return;

        const mapped = raw.map((s) => {
          const score = s.overallScore ?? s.overall_score ?? s.score ?? 0;
          const color =
            score >= 90
              ? "#10b981"
              : score >= 80
                ? "#3b82f6"
                : score >= 70
                  ? "#f59e0b"
                  : score >= 60
                    ? "#8b5cf6"
                    : "#ef4444";

          const feedback =
            score >= 90
              ? "Excellent! Outstanding delivery and pacing."
              : score >= 80
                ? "Great job! Very confident tone, keep it up."
                : score >= 70
                  ? "Fair effort. Keep working on your delivery."
                  : score >= 60
                    ? "Good start. Focus on eye contact and clarity."
                    : "Practice needed. Keep at it — you'll improve!";

          const rawDate = s.createdAt || s.created_at || s.date;
          const d = rawDate ? new Date(rawDate) : new Date();
          const dateStr = d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const timeStr = d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return {
            id: s.id || s._id,
            topic: s.name || s.topic || "Untitled Session",
            date: dateStr,
            time: timeStr,
            score,
            color,
            feedback,
          };
        });

        if (!cancelled) setRecentSessions(mapped);
      } catch (err) {
        console.warn("Failed to fetch session history:", err);
      } finally {
        if (!cancelled) setSessionsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeSession =
    recentSessions.length > 0 ? recentSessions[activeSessionIndex] : null;

  return (
    <div className="space-y-6">
      {/* Floating Pitcho Points Header Badge (Desktop only) */}
      {/* <div className="hidden lg:flex bg-white fixed top-6 right-8 lg:right-12 xl:right-16 px-5 py-3 gap-3 items-center rounded-2xl border-2 border-b-4 border-r-4 z-20">
        <Image
          className="w-8 h-8"
          src={"/star.png"}
          height={100}
          width={100}
          alt="star"
        />
        <div className="flex flex-col">
          <h3 className="font-bold text-xl leading-none">2.450</h3>
          <span className="text-sm text-gray-500 font-medium mt-0.5">
            Pitcho Points
          </span>
        </div>
      </div> */}

      {/* Welcome Banner */}
      <div className="w-full relative py-6 lg:py-10 bg-transparent rounded-2xl p-4 lg:p-0 border border-slate-100 mb-20">
        <div className="flex flex-col text-[#1B2C52] gap-2 max-w-lg relative z-10">
          <h6 className="text-xl font-semibold">Welcome back,</h6>
          <div className="flex flex-row items-center gap-2">
            <h1 className="text-4xl font-bold">{user?.name}!</h1>
            <Image
              src={"/hi.svg"}
              height={100}
              width={100}
              className="w-7 h-auto"
              alt="hi"
            />
          </div>
          <p className="mt-1 font-medium text-slate-500 max-w-sm leading-relaxed">
            Let's continue your speaking journey and become more confident every
            day.
          </p>
        </div>

        <img
          src="/hero.png"
          className="hidden lg:block absolute lg:-bottom-10 lg:-right-10 lg:h-72 w-auto z-50 pointer-events-none"
        />

        {/* Desktop Shelf SVG Background */}
        {/* <div className="hidden xl:block absolute bottom-0 -right-10 pointer-events-none select-none opacity-80 max-w-[650px]">
          <svg
            width="1017"
            height="222"
            viewBox="0 0 1017 222"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M14.4178 221.5L1016.5 219.863V159.293H14.4178V221.5Z"
              fill="#5C453A"
            />
            <path
              d="M1016.5 148.652H14.4178V159.293H1016.5V148.652Z"
              fill="#4D3A31"
            />
            <path
              d="M0.5 135.556H1016.5L977.203 96.2667H94.6499H42.2534L0.5 135.556Z"
              fill="#9D755A"
            />
            <path
              d="M14.4178 148.652H1016.5V135.556H0.5V148.652H14.4178Z"
              fill="#664C3E"
            />
            <path
              d="M977.203 96.2667L1016.5 135.556V45.5185H94.6499V96.2667H977.203Z"
              fill="#5C463A"
            />
            <path
              d="M1016.5 37.3333H94.6499V45.5185H1016.5V37.3333Z"
              fill="#4D3A31"
            />
            <path
              d="M94.6499 37.3333H1016.5V25.8741H81.5508V37.3333H94.6499Z"
              fill="#644B3C"
            />
            <path
              d="M81.5508 25.8741H1016.5V0.5H111.024L81.5508 25.8741Z"
              fill="#9C7459"
            />
            <path
              d="M14.4178 148.652H1016.5M14.4178 148.652V159.293M94.6499 96.2667H42.2534L0.5 135.556V148.652H14.4178M1016.5 148.652H0.5M1016.5 148.652V159.293M1016.5 148.652V135.556M1016.5 135.556H0.5M1016.5 135.556L977.203 96.2667H94.6499M1016.5 135.556V45.5185M1016.5 159.293V219.863L14.4178 221.5V159.293M1016.5 159.293H14.4178M94.6499 96.2667V45.5185M94.6499 37.3333H1016.5M94.6499 37.3333V45.5185M1016.5 25.8741V0.5H111.024L81.5508 25.8741V37.3333H94.6499M1016.5 37.3333V45.5185M1016.5 37.3333H81.5508M1016.5 37.3333V25.8741M1016.5 45.5185H94.6499M1016.5 25.8741H81.5508M81.5508 25.8741C91.3751 17.4161 111.024 0.5 111.024 0.5"
              stroke="black"
              strokeOpacity="0.25"
            />
          </svg>
        </div> */}
      </div>

      {/* Grid container with custom responsive column sorting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6 gap-3">
        {/* Mobile Points & Day Streak Row (Order 1, Hidden on desktop) */}
        <div className="order-1 lg:hidden flex flex-row gap-4 w-full bg-white p-4 rounded-2xl">
          <div className="flex-1 flex items-center gap-3">
            <Image
              src="/streak.svg"
              width={40}
              height={40}
              className="w-9 h-9 shrink-0"
              alt="streak"
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm text-slate-800">
                12 Days Streak
              </span>
              <span className="text-[11px] text-slate-500 font-bold leading-none">
                Keep it going!
              </span>
            </div>
          </div>
        </div>

        {/* Continue Your Practice (Order 2 on Mobile, Order 1 on Desktop) */}
        <div className="order-2 lg:order-1 lg:col-span-2 px-5 py-6 bg-white rounded-2xl border-bold flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Continue Your Practice</h2>
            {/* <Link
              href="/interview/setup"
              className="flex items-center text-main hover:underline text-sm font-semibold gap-1"
            >
              <span>View all</span>
              <ChevronRight size={18} />
            </Link> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-3">
            <div className="w-full bg-blue-500/10 border-2 border-blue-100/50 relative rounded-2xl p-5 gap-7 flex flex-col justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold text-blue-500">
                  Presentation Mode
                </span>
                <span className="text-sm text-slate-500 leading-relaxed mt-1 w-[60%]">
                  Practice your public speaking with virtual audiences and
                  distractions.
                </span>
              </div>
              <Button
                asChild
                className="flex flex-row gap-2 text-blue-500 bg-white hover:bg-slate-50 transition-colors w-fit items-center py-2 px-5 rounded-2xl font-bold cursor-pointer"
              >
                <Link
                  href="/presentation/setup"
                  className="flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </Link>
              </Button>
              <img
                src="/presentation.png"
                className="absolute bottom-0 right-0 w-40 z-10"
              />
              <div className="w-30 h-30 rounded-full bg-blue-500/40 absolute bottom-10 right-5"></div>
            </div>
            <div className="w-full bg-emerald-600/10 border-2 border-emerald-100/50 relative rounded-2xl p-5 gap-7 flex flex-col justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold text-emerald-500">
                  Interview Mode
                </span>
                <span className="text-sm text-slate-500 leading-relaxed mt-1 w-[60%]">
                  Prepare for your dream job with AI Mock interviews based on
                  your CV.
                </span>
              </div>
              <Button
                asChild
                className="flex flex-row gap-2 bg-white text-emerald-600 hover:bg-slate-50 transition-colors w-fit items-center py-2 px-5 rounded-2xl font-bold cursor-pointer"
              >
                <Link
                  href="/interview/setup"
                  className="flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </Link>
              </Button>
              <img
                src="/interview.png"
                className="w-38 absolute bottom-0 right-0 z-10"
              />
              <div className="w-30 h-30 rounded-full bg-green-500/40 absolute bottom-10 right-5"></div>
            </div>
          </div>
        </div>

        {/* Desktop Streak sidebar stats list (Hidden on mobile, Order 2 on Desktop) */}
        <div className="hidden lg:flex flex-col gap-3 lg:order-2 lg:col-span-1">
          <div className="w-full bg-gradient-to-l from-white via-white to-orange-500/5 gap-3 rounded-2xl border-bold p-6 flex items-center">
            <Image
              src="/streak.svg"
              width={100}
              height={100}
              className="w-9 h-9"
              alt="streak"
            />
            <div className="flex flex-col">
              <span className="font-bold">12 Days Streak</span>
              <span className="text-sm text-slate-500">keep it going!</span>
            </div>
          </div>
          <div className="w-full bg-yellow-400/10 gap-3 rounded-2xl border-bold p-6 flex items-center">
            <Image
              src="/trophy.svg"
              width={100}
              height={100}
              className="w-9 h-9"
              alt="badge"
            />
            <div className="flex flex-col">
              <span className="font-bold">12 Badges</span>
              <span className="text-sm text-slate-500">owned now!</span>
            </div>
          </div>
        </div>

        {/* Your Speaking Summary (Order 3 on Mobile & Desktop) */}
        <div className="order-3 lg:col-span-2 p-6 rounded-2xl border-bold bg-white">
          <h3 className="text-xl font-bold">Your Speaking Summary</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-7">
            <div className="rounded-xl bg-blue-50/50 border border-blue-100/30 p-4 flex flex-col justify-between min-h-[140px]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 w-fit rounded-full">
                    <Eye size={20} className="text-blue-500" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">
                    Eye Contact
                  </span>
                </div>
                <div className="flex items-baseline mt-4 gap-1">
                  <span className="font-extrabold text-2xl text-slate-800 ">
                    88
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    % average
                  </span>
                </div>
              </div>
              <div className="w-full h-8 mt-4">
                <MiniLineChart
                  data={eyeContactData}
                  color="#3b82f6"
                  strokeWidth={1.8}
                />
              </div>
            </div>

            <div className="rounded-xl bg-orange-50/50 border border-orange-100/30 p-4 flex flex-col justify-between min-h-[140px]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-500/10 w-fit rounded-full">
                    <AudioLines size={20} className="text-orange-500" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">
                    Filler Words
                  </span>
                </div>
                <div className="flex items-baseline mt-4 gap-1">
                  <span className="font-extrabold text-2xl text-slate-800 ">
                    4
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    times average
                  </span>
                </div>
              </div>
              <div className="w-full h-8 mt-4">
                <MiniLineChart
                  data={fillerWordsData}
                  color="#ea580c"
                  strokeWidth={1.8}
                />
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50/50 border border-emerald-100/30 p-4 flex flex-col justify-between min-h-[140px]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 w-fit rounded-full">
                    <Timer size={20} className="text-emerald-500" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">
                    Speaking Pace
                  </span>
                </div>
                <div className="flex items-baseline mt-4 gap-1">
                  <span className="font-extrabold text-2xl text-slate-800 ">
                    125
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    wpm average
                  </span>
                </div>
              </div>
              <div className="w-full h-8 mt-4">
                <MiniLineChart
                  data={speakingPaceData}
                  color="#10b981"
                  strokeWidth={1.8}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions (Order 4 on Mobile & Desktop) */}
        <div className="order-4 lg:col-span-1 px-5 py-4 flex flex-col justify-between bg-white border-bold">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Sessions</h2>
            <Link
              href="/presentation/result"
              className="flex items-center text-main hover:underline text-sm font-semibold gap-1"
            >
              <span>View all</span>
              <ChevronRight size={18} />
            </Link>
          </div>

          {sessionsLoading ? (
            <div className="w-full border-2 rounded-xl py-6 px-4 flex flex-col items-center justify-center h-[185px] mt-6 gap-3">
              <Loader2 size={24} className="text-slate-400 animate-spin" />
              <span className="text-xs font-bold text-slate-400">
                Loading sessions…
              </span>
            </div>
          ) : !activeSession ? (
            <div className="w-full border-2 rounded-xl py-6 px-4 flex flex-col items-center justify-center h-[185px] mt-6 gap-3 border-dashed border-slate-200">
              <Calendar size={28} className="text-slate-300" />
              <span className="text-xs font-bold text-slate-400 text-center">
                No sessions yet
              </span>
              <span className="text-[10px] text-slate-300 text-center">
                Complete a practice session to see it here.
              </span>
            </div>
          ) : (
            <>
              <div
                key={activeSessionIndex}
                className={`w-full border-2 rounded-xl py-3.5 px-4 flex flex-col justify-between h-[185px] mt-6 ${
                  slideDirection === "left"
                    ? "animate-slide-fade-in-left"
                    : "animate-slide-fade-in-right"
                }`}
              >
                <div className="flex flex-col">
                  <h6 className="font-bold text-slate-800 line-clamp-1 leading-snug">
                    {activeSession.topic}
                  </h6>
                  <div className="flex items-center text-slate-400 font-extrabold text-[10px] gap-1 mt-1 uppercase tracking-wide">
                    <span>{activeSession.date}</span>
                    <span>·</span>
                    <span>{activeSession.time}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex gap-4 items-center">
                    <PerformanceCircle
                      value={activeSession.score}
                      color={activeSession.color}
                      size={64}
                      strokeWidth={5}
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">
                        {activeSession.score >= 90
                          ? "Excellent!"
                          : activeSession.score >= 80
                            ? "Good Job!"
                            : activeSession.score >= 70
                              ? "Fair Effort"
                              : "Keep Practicing!"}
                      </span>
                      <span className="text-slate-550 text-[11px] font-bold leading-tight mt-0.5 max-w-[140px] line-clamp-2">
                        {activeSession.feedback}
                      </span>
                      <Link
                        href={`/session/${activeSession.id}`}
                        className="flex items-center text-main hover:underline font-bold text-xs mt-1.5 cursor-pointer"
                      >
                        Lihat laporan
                        <ChevronRight size={14} className="ml-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dots and chevrons control bar */}
              <div className="flex items-center justify-between w-full mt-4 px-1">
                <button
                  onClick={() => {
                    setSlideDirection("left");
                    setActiveSessionIndex((prev) =>
                      prev > 0 ? prev - 1 : recentSessions.length - 1,
                    );
                  }}
                  className="p-1 rounded-full border border-slate-200 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
                  aria-label="Previous session"
                >
                  <ChevronLeft size={20} className="text-slate-500" />
                </button>

                <div className="flex gap-x-1.5 items-center justify-center">
                  {recentSessions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (i > activeSessionIndex) {
                          setSlideDirection("right");
                        } else if (i < activeSessionIndex) {
                          setSlideDirection("left");
                        }
                        setActiveSessionIndex(i);
                      }}
                      className={`size-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activeSessionIndex === i
                          ? "bg-main w-4"
                          : "bg-slate-200 hover:bg-slate-350"
                      }`}
                      aria-label={`Go to session ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSlideDirection("right");
                    setActiveSessionIndex((prev) =>
                      prev < recentSessions.length - 1 ? prev + 1 : 0,
                    );
                  }}
                  className="p-1 rounded-full border border-slate-200 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
                  aria-label="Next session"
                >
                  <ChevronRight size={20} className="text-slate-500" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
