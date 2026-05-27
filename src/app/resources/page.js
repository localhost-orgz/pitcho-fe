"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Star,
  ChevronRight,
  Clock,
  Mic,
  Eye,
  Users,
  Play,
  Download,
  BookOpen,
  FileText,
  Presentation,
  Brain,
  AudioLines,
  MessageSquare,
  CheckSquare,
  Target,
  Sparkles,
} from "lucide-react";

export default function ResourcesPage() {
  React.useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#f3f7fd";
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  const categories = [
    {
      name: "Speaking Basics",
      count: 12,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-500",
      Icon: Mic,
    },
    {
      name: "Presentation Skills",
      count: 18,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
      Icon: Presentation,
    },
    {
      name: "Interview Prep",
      count: 15,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-500",
      Icon: MessageSquare,
    },
    {
      name: "Mindset & Confidence",
      count: 10,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-500",
      Icon: Brain,
    },
    {
      name: "Voice & Delivery",
      count: 9,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-500",
      Icon: AudioLines,
    },
  ];

  const featured = [
    {
      title: "Structure Your Talk Like a Pro",
      desc: "Learn a simple framework to organize your ideas and speak with clarity.",
      readTime: "6 min read",
      tag: "Presentation",
      tagColor: "bg-sky-100 text-sky-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Answer Any Question Confidently",
      desc: "Practical strategies to think on your feet and respond with confidence.",
      readTime: "8 min read",
      tag: "Interview",
      tagColor: "bg-violet-100 text-violet-600",
      bgColor: "bg-sky-50",
    },
    {
      title: 'Stop Saying "Umm..."',
      desc: "Understand filler words and how to reduce them effectively.",
      readTime: "5 min read",
      tag: "Speaking Basics",
      tagColor: "bg-amber-100 text-amber-600",
      bgColor: "bg-rose-50",
    },
  ];

  const guides = [
    {
      title: "How to Maintain Eye Contact Naturally",
      desc: "Tips and exercises to build stronger connection with your audience.",
      readTime: "5 min read",
      placeholderBg: "bg-emerald-100",
    },
    {
      title: "Find Your Ideal Speaking Pace",
      desc: "Learn how to pace your speech for clarity and impact.",
      readTime: "4 min read",
      placeholderBg: "bg-sky-100",
    },
    {
      title: "Strong Openings for Any Presentation",
      desc: "Start strong and grab your audience attention from the first second.",
      readTime: "6 min read",
      placeholderBg: "bg-rose-100",
    },
    {
      title: "The PREP Method for Clear Answers",
      desc: "A simple formula to structure your answers in interviews.",
      readTime: "7 min read",
      placeholderBg: "bg-violet-100",
    },
  ];

  const templates = [
    {
      title: "Presentation Outline Template",
      desc: "Organize your ideas clearly.",
      iconBg: "bg-sky-50",
      iconColor: "text-sky-500",
      Icon: FileText,
    },
    {
      title: "Interview Answer Template",
      desc: "Structure your answers with confidence.",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      Icon: MessageSquare,
    },
    {
      title: "Practice Checklist",
      desc: "Stay on track before, during, and after your practice.",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      Icon: CheckSquare,
    },
    {
      title: "Goal Setting Worksheet",
      desc: "Set goals and track your progress.",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      Icon: Target,
    },
  ];

  return (
    <div className="w-full min-h-screen pb-10">
      {/* ─── Header ─── */}
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-5">
        {/* Left: Title + Illustration */}
        <div className="flex-1 flex items-center gap-6">
          <div className="flex flex-col gap-1.5 shrink-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Resources
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-[280px]">
              Everything you need to improve your speaking and communication
              skills.
            </p>
          </div>
          {/* Illustration placeholder */}
          <div className="hidden md:flex w-[180px] h-[100px] bg-sky-100 rounded-2xl items-center justify-center shrink-0">
            <span className="text-xs font-bold text-sky-400">Illustration</span>
          </div>
        </div>

        {/* Right: Motivational card */}
        <div className="flex items-center gap-3 bg-amber-50/60 border border-amber-100 rounded-2xl px-5 py-4 max-w-xs">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
            <Star size={20} className="text-amber-500 fill-amber-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm text-slate-800">
              Keep learning!
            </span>
            <p className="text-[11px] text-slate-500 font-medium leading-normal mt-0.5">
              Small lessons today lead to big confidence tomorrow.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Browse by category ─── */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">
            Browse by category
          </h3>
          <button className="flex items-center gap-1 text-main text-sm font-bold hover:underline cursor-pointer">
            See all categories <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-5">
          {categories.map((cat, i) => {
            const Icon = cat.Icon;
            return (
              <button
                key={i}
                className="bg-white border-bold p-4 flex flex-col items-center gap-2.5 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div
                  className={`w-12 h-12 ${cat.iconBg} rounded-xl flex items-center justify-center`}
                >
                  <Icon size={22} className={cat.iconColor} />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-extrabold text-slate-800 text-center leading-tight">
                    {cat.name}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                    {cat.count} resources
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Featured for you ─── */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">
            Featured for you
          </h3>
          <button className="flex items-center gap-1 text-main text-sm font-bold hover:underline cursor-pointer">
            See all <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 relative">
          {featured.map((item, i) => (
            <div
              key={i}
              className="bg-white border-bold overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer group"
            >
              {/* Image placeholder */}
              <div
                className={`relative w-full h-[160px] ${item.bgColor} flex items-center justify-center`}
              >
                {/* NEW badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white">
                  NEW
                </div>
                {/* Dummy illustration */}
                <div className="w-32 h-24 bg-white/30 rounded-xl flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-400/60">
                    Image
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4 flex flex-col flex-1">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 font-medium mt-1.5 leading-relaxed line-clamp-2">
                  {item.desc}
                </p>

                {/* Footer */}
                <div className="flex items-center gap-3 mt-auto pt-4">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock size={12} />
                    <span className="text-[11px] font-bold">
                      {item.readTime}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${item.tagColor}`}
                  >
                    {item.tag}
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

      {/* ─── Guides & Articles ─── */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">
            Guides & Articles
          </h3>
          <button className="flex items-center gap-1 text-main text-sm font-bold hover:underline cursor-pointer">
            See all <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {guides.map((guide, i) => (
            <div
              key={i}
              className="bg-white border-bold px-5 py-4 flex items-start gap-4 hover:shadow-sm transition-shadow cursor-pointer group"
            >
              {/* Image placeholder */}
              <div
                className={`w-16 h-16 ${guide.placeholderBg} rounded-xl flex items-center justify-center shrink-0`}
              >
                <span className="text-[10px] font-bold text-slate-400/60">
                  Image
                </span>
              </div>

              {/* Text */}
              <div className="flex flex-col min-w-0 flex-1">
                <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                  {guide.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed line-clamp-2">
                  {guide.desc}
                </p>
                <div className="flex items-center gap-1 text-slate-400 mt-2">
                  <Clock size={11} />
                  <span className="text-[10px] font-bold">
                    {guide.readTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Templates & Tools ─── */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">
            Templates & Tools
          </h3>
          <button className="flex items-center gap-1 text-main text-sm font-bold hover:underline cursor-pointer">
            See all <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {templates.map((tmpl, i) => {
            const Icon = tmpl.Icon;
            return (
              <div
                key={i}
                className="bg-white border-bold p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow"
              >
                {/* Icon area */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${tmpl.iconBg} rounded-xl flex items-center justify-center shrink-0`}
                  >
                    <Icon size={18} className={tmpl.iconColor} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2">
                      {tmpl.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                      {tmpl.desc}
                    </span>
                  </div>
                </div>

                {/* Download button */}
                <button className="flex items-center gap-1.5 text-main font-extrabold text-xs hover:underline cursor-pointer mt-auto">
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Bottom Motivational Banner ─── */}
      <div className="w-full mt-10 rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400 flex items-center justify-between px-6 md:px-8 py-6 min-h-[120px]">
        {/* Left text */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-white font-extrabold text-lg">
            Keep growing, keep shining!
          </h3>
          <p className="text-white/80 text-xs font-medium max-w-xs">
            Explore, practice, and become the speaker you're proud of.
          </p>
          <button className="mt-3 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-extrabold px-5 py-2.5 rounded-xl w-fit transition-colors cursor-pointer border border-white/30">
            <span>Explore more resources</span>
          </button>
        </div>

        {/* Right illustration placeholders */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/50">Img</span>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/50">Img</span>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/50">Img</span>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/50">Img</span>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/50">Img</span>
          </div>
        </div>
      </div>
    </div>
  );
}
