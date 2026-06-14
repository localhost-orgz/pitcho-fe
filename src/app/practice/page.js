"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/UI/button";

export default function PracticePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Practice
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Choose your practice mode
        </p>
      </div>

      {/* Practice Mode Cards — same style as studio "Continue Your Practice" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Presentation Card */}
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
            alt=""
          />
          <div className="w-30 h-30 rounded-full bg-blue-500/40 absolute bottom-10 right-5" />
        </div>

        {/* Interview Card */}
        <div className="w-full bg-emerald-600/10 border-2 border-emerald-100/50 relative rounded-2xl p-5 gap-7 flex flex-col justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold text-emerald-500">
              Interview Mode
            </span>
            <span className="text-sm text-slate-500 leading-relaxed mt-1 w-[60%]">
              Prepare for your dream job with AI Mock interviews based on your
              CV.
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
            alt=""
          />
          <div className="w-30 h-30 rounded-full bg-green-500/40 absolute bottom-10 right-5" />
        </div>
      </div>
    </div>
  );
}
