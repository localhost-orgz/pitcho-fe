"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PerformanceCircle from "@/components/UI/PerformanceCircle";

export default function StationPage() {
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

  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("right");

  const recentSessions = [
    {
      id: 1,
      topic: "Pitching Kompetisi Bisnis",
      date: "May 24, 2026",
      time: "02:00 PM",
      score: 92,
      color: "#10b981", // Green
      feedback: "Excellent! Outstanding eye contact and pacing.",
    },
    {
      id: 2,
      topic: "Presentasi Akhir Proyek",
      date: "May 22, 2026",
      time: "11:15 AM",
      score: 85,
      color: "#3b82f6", // Blue
      feedback: "Great attempt! Very confident tone, keep it up.",
    },
    {
      id: 3,
      topic: "Sambutan Singkat Ketua",
      date: "May 19, 2026",
      time: "09:45 AM",
      score: 74,
      color: "#f59e0b", // Yellow
      feedback: "Fair effort. Work on reducing filler words.",
    },
    {
      id: 4,
      topic: "Final Thesis Presentation",
      date: "May 17, 2026",
      time: "10:30 AM",
      score: 78,
      color: "#8b5cf6", // Purple
      feedback: "Good Job! You showed improvement in focus and clarity.",
    },
    {
      id: 5,
      topic: "Latihan Wawancara Kerja",
      date: "May 15, 2026",
      time: "04:30 PM",
      score: 63,
      color: "#ef4444", // Red
      feedback: "Practice needed. Keep eye contact with your interviewer.",
    },
  ];

  const activeSession = recentSessions[activeSessionIndex];

  return (
    <div className="space-y-3">
      <div className="flex bg-white fixed right-20 px-5 py-3 gap-3 items-center rounded-2xl border-2 border-b-4 border-r-4">
        <Image
          className="w-8 h-8"
          src={"/star.png"}
          height={100}
          width={100}
          alt="star"
        />
        <div className="flex flex-col">
          <h3 className="font-bold text-xl">2.450</h3>
          <span className="text-sm text-gray-500 font-medium">
            Pitcho Points
          </span>
        </div>
      </div>
      {/* Welcome Banner */}
      <div className="w-full h-100 relative">
        <div className="flex flex-col text-[#1B2C52] gap-2">
          <h6 className="text-xl font-semibold">Welcome back,</h6>
          <div className="flex flex-row items-center gap-2">
            <h1 className="text-4xl font-bold">Faza!</h1>
            <Image
              src={"/hi.svg"}
              height={100}
              width={100}
              className="w-7 h-auto"
            />
          </div>
          <p className="w-68 mt-1">
            Let's continue your speaking journey and become more confident every
            day.
          </p>
        </div>
        <div className="absolute bottom-0 -right-10">
          <svg
            width="1017"
            height="222"
            viewBox="0 0 1017 222"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="w-full col-span-2 p-6 bg-white rounded-2xl border-bold">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold">Today's plan</h2>
            <p className="text-slate-500 mt-1">Let's get better togather!</p>
          </div>

          <div className="grid grid-cols-3 gap-5 mt-7">
            <div className="w-full bg-white border-2 rounded-2xl p-5 gap-7 col-span-1 flex flex-col">
              <div className="flex flex-col">
                <span className="text-sm font-bold">Today's Goal</span>
                <span className="text-sm text-slate-500">
                  Practice for 15 minutes
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-end gap-0.5">
                  <span className="text-lg font-bold">0 / 15</span>
                  <span className="font-medium text-sm mb-0.5 text-slate-500">
                    min
                  </span>
                </div>
                <div className="w-full bg-border h-1 rounded-2xl"></div>
              </div>
            </div>

            <div className="w-full bg-linear-to-br from-white via-white to-sky-200/20 border-bold relative p-5 col-span-2 flex flex-col justify-between ">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">
                  Suggested for you
                </span>
                <span className="text-xs font-bold text-slate-400 mt-1 leading-normal">
                  Focus on maintaining eye contact and reducing filler words.
                </span>
              </div>
              <Link
                className="text-xs font-extrabold flex items-center text-main group-hover:text-sky-600 transition-colors mt-4"
                href={"/"}
              >
                See tips{" "}
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full col-span-1 flex flex-col gap-3">
          <div className="w-full bg-linear-to-l from-white via-white to-orange-500/5 gap-3 rounded-2xl border-bold p-6 flex items-center">
            <Image
              src={"/streak.svg"}
              width={100}
              height={100}
              className="w-9 h-9 mb-1"
              alt="streak"
            />
            <div className="flex flex-col">
              <span className="font-bold">12 Days Streak</span>
              <span className="text-sm text-slate-500">keep it going!</span>
            </div>
          </div>
          <div className="w-full bg-indigo-400/10 gap-3 rounded-2xl border-bold p-6 flex items-center">
            <Image
              src={"/target.svg"}
              width={100}
              height={100}
              className="w-9 h-9 mb-1"
              alt="dart"
            />
            <div className="flex flex-col">
              <span className="font-bold">12 Days Streak</span>
              <span className="text-sm text-slate-500">keep it going!</span>
            </div>
          </div>
          <div className="w-full bg-yellow-400/10 gap-3 rounded-2xl border-bold p-6 flex items-center">
            <Image
              src={"/trophy.svg"}
              width={100}
              height={100}
              className="w-9 h-9 mb-1"
              alt="trophy"
            />
            <div className="flex flex-col">
              <span className="font-bold">12 Days Streak</span>
              <span className="text-sm text-slate-500">keep it going!</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="w-full col-span-2 px-5 py-4 bg-white rounded-2xl border-bold">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Continue Your Practice</h2>
            <div className="flex items-center text-main text-sm font-semibold gap-1">
              <span>View all</span>
              <ChevronRight size={18} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 mt-7">
            <div className="w-full bg-blue-500/10 border-2 rounded-2xl p-5 gap-7 col-span-1 flex flex-col">
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold text-blue-500">
                  Presentation Mode
                </span>
                <span className="text-sm text-slate-500 w-[60%]">
                  Practice your public speaking with virtual audiences and
                  distractions.
                </span>
              </div>
              <Button className="flex flex-row gap-2 text-blue-500 bg-white w-fit items-center py-2 px-5 rounded-2xl font-bold">
                <span>Continue</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </Button>
            </div>
            <div className="w-full bg-emerald-600/10 border-2 rounded-2xl p-5 gap-7 col-span-1 flex flex-col">
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold text-emerald-500">
                  Interview Mode
                </span>
                <span className="text-sm text-slate-500 w-[60%]">
                  Prepeare for you dream job with AI Mock intervies based on
                  your CV.
                </span>
              </div>
              <Button className="flex flex-row gap-2 bg-white text-emerald-600 w-fit items-center py-2 px-5 rounded-2xl font-bold">
                <span>Continue</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full px-5 py-4 col-span-1 flex flex-col gap-3 bg-white border-bold">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Sessions</h2>
            <div className="flex items-center text-main text-sm font-semibold gap-1">
              <span>View all</span>
              <ChevronRight size={18} />
            </div>
          </div>
          <div
            key={activeSessionIndex}
            className={`w-full border-2 rounded-xl py-3 px-4 flex flex-col justify-between h-[180px] ${
              slideDirection === "left"
                ? "animate-slide-fade-in-left"
                : "animate-slide-fade-in-right"
            }`}
          >
            <div className="flex flex-col">
              <h6 className="font-bold text-slate-800 line-clamp-1">
                {activeSession.topic}
              </h6>
              <div className="flex items-center text-slate-400 font-extrabold text-[10px] gap-1 mt-0.5 uppercase tracking-wide">
                <span>{activeSession.date}</span>
                <span>·</span>
                <span>{activeSession.time}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <h6 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                Performance Overview
              </h6>
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
                  <div className="flex items-center text-main hover:text-sky-600 transition-colors font-bold text-xs mt-1.5 cursor-pointer">
                    See full report
                    <ChevronRight size={14} className="ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dots and chevrons control bar */}
          <div className="flex items-center justify-between w-full mt-2 px-1">
            {/* Left Chevron */}
            <button
              onClick={() => {
                setSlideDirection("left");
                setActiveSessionIndex((prev) =>
                  prev > 0 ? prev - 1 : recentSessions.length - 1,
                );
              }}
              className="p-1 rounded-full border border-slate-200 bg-slate-200 hover:bg-slate-200/80 cursor-pointer transition-colors"
              aria-label="Previous session"
            >
              <ChevronLeft size={20} className="text-slate-500" />
            </button>

            {/* 5 Dots indicator */}
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

            {/* Right Chevron */}
            <button
              onClick={() => {
                setSlideDirection("right");
                setActiveSessionIndex((prev) =>
                  prev < recentSessions.length - 1 ? prev + 1 : 0,
                );
              }}
              className="p-1 rounded-full border border-slate-200 bg-slate-200 hover:bg-slate-200/80 cursor-pointer transition-colors"
              aria-label="Next session"
            >
              <ChevronRight size={20} className="text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full grid grid-cols-3 gap-6">
        <div className="w-full p-10 rounded-2xl border-bold px-5 py-4 col-span-2">
          <h3 className="text-xl font-bold">Your Speaking Summary</h3>
          <div className="grid grid-cols-3 gap-6 mt-7">
            <div className="w-full col-span-1 rounded-xl bg-blue-100/50 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/20 w-fit rounded-full">
                  <Eye size={20} className="text-blue-500" />
                </div>
                <span className="font-bold">Eye Contact</span>
              </div>
              <span className="font-extrabold text-xl mt-5">78%</span>
            </div>
            <div className="w-full col-span-1 rounded-xl bg-orange-100/50 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-500/20 w-fit rounded-full">
                  <AudioLines size={20} className="text-orange-500" />
                </div>
                <span className="font-bold">Filler Words</span>
              </div>
              <span className="font-extrabold text-xl mt-5">78%</span>
            </div>
            <div className="w-full col-span-1 rounded-xl bg-emerald-100/50 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/20 w-fit rounded-full">
                  <Timer size={20} className="text-emerald-500" />
                </div>
                <span className="font-bold">Eye Contact</span>
              </div>
              <span className="font-extrabold text-xl mt-5">78%</span>
            </div>
          </div>
        </div>
        <div className="w-full h-10 border-bold rounded-2xl"></div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent History Table */}
        <div className="bg-card border-2 border-border rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Riwayat Latihan
            </h2>
            <Button
              variant="sidebar"
              className="text-xs text-sky-500 hover:text-sky-600 p-0 font-bold flex items-center"
            >
              Lihat Semua
              <ChevronRight className="size-4 ml-0.5" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-2">Topik / Judul</th>
                  <th className="py-3 px-2">Tanggal</th>
                  <th className="py-3 px-2">Durasi</th>
                  <th className="py-3 px-2">Kontak Mata</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 px-2 font-bold text-slate-700">
                      {session.topic}
                    </td>
                    <td className="py-3 px-2 text-slate-500 text-xs">
                      {session.date}
                    </td>
                    <td className="py-3 px-2 text-slate-500 text-xs">
                      {session.duration}
                    </td>
                    <td className="py-3 px-2 text-sky-600 font-bold">
                      {session.eyeContact}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span
                        className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${session.statusColor}`}
                      >
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Tips Box */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-x-2 text-amber-600">
            <Calendar className="size-5" />
            <h2 className="text-base font-black uppercase tracking-tight">
              Tips Hari Ini
            </h2>
          </div>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed font-medium">
            <p>
              <strong>1. Pertahankan Kontak Mata:</strong> Cobalah untuk menatap
              langsung ke kamera laptop Anda seolah-olah menatap mata audiens.
            </p>
            <p>
              <strong>2. Atur Tempo:</strong> Jangan berbicara terlalu cepat.
              Berikan jeda 1-2 detik di antara poin-poin penting agar presentasi
              terasa tenang.
            </p>
            <p>
              <strong>3. Postur Tegak:</strong> Postur tubuh yang tegak membantu
              meningkatkan kepercayaan diri dan kualitas proyeksi suara Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
