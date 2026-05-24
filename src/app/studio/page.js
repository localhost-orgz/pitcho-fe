"use client";

import React from "react";
import { Button } from "@/components/UI/button";
import {
  Play,
  TrendingUp,
  Eye,
  Activity,
  Calendar,
  ChevronRight,
  Clock,
} from "lucide-react";
import Image from "next/image";

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

  const recentSessions = [
    {
      id: 1,
      topic: "Pitching Kompetisi Bisnis",
      date: "24 Mei 2026",
      duration: "5:00",
      eyeContact: "92%",
      status: "Sangat Baik",
      statusColor: "text-green-500 bg-green-50",
    },
    {
      id: 2,
      topic: "Presentasi Akhir Proyek",
      date: "22 Mei 2026",
      duration: "10:15",
      eyeContact: "85%",
      status: "Baik",
      statusColor: "text-sky-500 bg-sky-50",
    },
    {
      id: 3,
      topic: "Sambutan Singkat Ketua",
      date: "19 Mei 2026",
      duration: "3:30",
      eyeContact: "74%",
      status: "Cukup",
      statusColor: "text-amber-500 bg-amber-50",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex bg-white fixed right-20 px-5 py-3 gap-3 items-center rounded-2xl border-2 border-b-4 border-r-4">
        <Image className="w-8 h-8" src={"/star.png"} height={100} width={100} />
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
              stroke-opacity="0.25"
            />
          </svg>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-400 to-indigo-500 text-white rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight leading-tight uppercase">
            Selamat Datang, Presenter!
          </h1>
          <p className="text-sky-100 font-medium text-sm md:text-base max-w-md">
            Latih kemampuan presentasi Anda dan tingkatkan kontak mata dengan
            audiens secara real-time.
          </p>
        </div>
        <Button
          variant="default"
          size="lg"
          className="bg-white hover:bg-slate-100 text-sky-600 font-extrabold shadow-[0_5px_0_#e2e8f0] hover:shadow-[0_5px_0_#cbd5e1] border-none shrink-0 self-start md:self-auto"
        >
          <Play className="size-5 fill-current mr-2" />
          Mulai Latihan
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-card border-2 border-border rounded-2xl p-5 flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className="text-2xl font-black text-slate-800">
                  {stat.value}
                </div>
                <span className="text-[11px] font-bold text-slate-500 block flex items-center gap-1">
                  <TrendingUp className="size-3.5 text-green-500 inline" />
                  {stat.change}
                </span>
              </div>
              <div className={`p-3.5 rounded-xl border-2 ${stat.color}`}>
                <Icon className="size-6" />
              </div>
            </div>
          );
        })}
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
