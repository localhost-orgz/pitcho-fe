"use client";

// src/app/interview/result/page.js

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  Eye,
  AudioLines,
  Timer,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Zap,
  MessageSquare,
  Star,
  Target,
  Loader2,
  CircleAlert,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/UI/button";

// ── Tabs ────────────────────────────────────────────────────
const TABS = [
  { id: "distraction", label: "Distraction", icon: Eye },
  { id: "wpm", label: "WPM", icon: TrendingUp },
  { id: "filler", label: "Filler Words", icon: AudioLines },
  { id: "wordiness", label: "Wordiness", icon: FileText },
  { id: "ai_review", label: "AI Review", icon: Star },
];

// ── Score Ring ──────────────────────────────────────────────
function ScoreRing({ score, size = 120, strokeWidth = 10, label, sublabel }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, score));
  const offset = circumference - (pct / 100) * circumference;
  const color =
    pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black text-slate-800">{score}</span>
        </div>
      </div>
      {label && <span className="text-xs font-bold text-slate-500">{label}</span>}
      {sublabel && (
        <span className="text-[10px] text-slate-400">{sublabel}</span>
      )}
    </div>
  );
}

// ── Mini Bar Chart ──────────────────────────────────────────
function MiniBar({ value, max, color = "bg-blue-500" }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function InterviewResultPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("distraction");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  // Load data
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("interview_results");
      if (!raw) {
        setError("No interview results found. Please complete an interview session first.");
        setLoading(false);
        return;
      }
      const data = JSON.parse(raw);
      setResultData(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load results:", err);
      setError("Failed to load interview results.");
      setLoading(false);
    }
  }, []);

  const perQuestionData = resultData?.per_question_data || [];
  const evaluateData = resultData?.evaluate_response?.data || resultData?.evaluate_response || {};
  const qaAnalysis = evaluateData?.qa_analysis || [];
  const overallScore = evaluateData?.overall_interview_score ?? 0;
  const metricsSummary = evaluateData?.metrics_summary || {};

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-main animate-spin" />
          <span className="text-sm font-bold text-slate-400">Loading results…</span>
        </div>
      </div>
    );
  }

  // ── Error / no data ────────────────────────────────────────
  if (error || !resultData) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center px-4">
          <CircleAlert size={40} className="text-red-400" />
          <p className="text-sm font-bold text-slate-700">{error || "No results found."}</p>
          <Link
            href="/interview/setup"
            className="text-sm font-bold text-main underline"
          >
            Go to Interview Setup
          </Link>
        </div>
      </div>
    );
  }

  // ── Active tab icon ────────────────────────────────────────
  const ActiveIcon = TABS.find((t) => t.id === activeTab)?.icon || Eye;

  return (
    <div className="w-full min-h-screen pb-16 font-sans text-slate-800">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold">Interview Results</h1>
          <p className="text-slate-500 text-sm">
            Review your performance across {perQuestionData.length} questions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/interview/setup">
            <Button variant="secondary" size="sm" className="flex items-center gap-1.5 font-bold">
              <RotateCcw size={14} />
              Practice Again
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Score Overview ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Overall Score */}
        <div className="bg-white border-bold p-5 flex flex-col items-center">
          <ScoreRing score={overallScore} size={100} strokeWidth={8} label="Overall Score" />
        </div>

        {/* Metric: Filler Words */}
        <div className="bg-white border-bold p-5 flex flex-col items-center justify-center gap-2">
          <AudioLines size={20} className="text-orange-500" />
          <span className="text-2xl font-black text-slate-800">
            {metricsSummary.total_filler_words ?? perQuestionData.reduce((s, q) => s + (q.filler_words_count || 0), 0)}
          </span>
          <span className="text-xs font-bold text-slate-400">Total Filler Words</span>
        </div>

        {/* Metric: Distraction */}
        <div className="bg-white border-bold p-5 flex flex-col items-center justify-center gap-2">
          <Eye size={20} className="text-blue-500" />
          <span className="text-2xl font-black text-slate-800">
            {metricsSummary.total_distract_duration ?? perQuestionData.reduce((s, q) => s + (q.distract_duration_seconds || 0), 0)}s
          </span>
          <span className="text-xs font-bold text-slate-400">Total Distracted</span>
        </div>

        {/* Metric: Average WPM */}
        <div className="bg-white border-bold p-5 flex flex-col items-center justify-center gap-2">
          <Timer size={20} className="text-green-500" />
          <span className="text-2xl font-black text-slate-800">
            {metricsSummary.average_wpm ?? (perQuestionData.length > 0
              ? Math.round(perQuestionData.reduce((s, q) => s + (q.wpm || 0), 0) / perQuestionData.length)
              : 0)}
          </span>
          <span className="text-xs font-bold text-slate-400">Average WPM</span>
        </div>
      </div>

      {/* ── Tab Navigation ──────────────────────────────────── */}
      <div className="flex border-b-2 border-slate-200 mb-5 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? "border-main text-main"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ──────────────────────────────────────── */}
      <div className="bg-white border-bold p-5">
        {/* Tab 1: Distraction */}
        {activeTab === "distraction" && (
          <div>
            <h3 className="font-bold text-lg mb-4">Distraction Per Question</h3>
            {perQuestionData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No distraction data available.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {perQuestionData.map((q, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 w-20 shrink-0">
                      Q {q.question_number || i + 1}
                    </span>
                    <div className="flex-1">
                      <MiniBar
                        value={q.distract_duration_seconds || 0}
                        max={Math.max(...perQuestionData.map((d) => d.distract_duration_seconds || 0), 1)}
                        color="bg-blue-500"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600 w-12 text-right">
                      {q.distract_duration_seconds || 0}s
                    </span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-4 mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-500">Total</span>
                    <span className="font-black text-slate-700">
                      {perQuestionData.reduce((s, q) => s + (q.distract_duration_seconds || 0), 0)}s distracted
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: WPM */}
        {activeTab === "wpm" && (
          <div>
            <h3 className="font-bold text-lg mb-4">Speaking Pace Per Question</h3>
            {perQuestionData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No WPM data available.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {perQuestionData.map((q, i) => {
                  const wpm = q.wpm || 0;
                  const maxWpm = Math.max(...perQuestionData.map((d) => d.wpm || 0), 1);
                  const isGood = wpm >= 100 && wpm <= 150;
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-400 w-20 shrink-0">
                        Q {q.question_number || i + 1}
                      </span>
                      <div className="flex-1">
                        <MiniBar
                          value={wpm}
                          max={maxWpm}
                          color={isGood ? "bg-green-500" : wpm > 150 ? "bg-red-500" : "bg-orange-400"}
                        />
                      </div>
                      <span className={`text-xs font-bold w-16 text-right ${isGood ? "text-green-600" : wpm > 150 ? "text-red-500" : "text-orange-500"}`}>
                        {wpm} wpm
                      </span>
                    </div>
                  );
                })}
                {/* Average line */}
                <div className="border-t border-slate-200 pt-4 mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-500">Average</span>
                    <span className="font-black text-slate-700">
                      {perQuestionData.length > 0
                        ? Math.round(perQuestionData.reduce((s, q) => s + (q.wpm || 0), 0) / perQuestionData.length)
                        : 0}{" "}
                      wpm
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Filler Words */}
        {activeTab === "filler" && (
          <div>
            <h3 className="font-bold text-lg mb-4">Filler Words Per Question</h3>
            {perQuestionData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No filler word data available.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {perQuestionData.map((q, i) => {
                  const analysis = q.speech_analysis;
                  const incidents =
                    analysis?.analysis?.filler_words?.incidents ||
                    analysis?.filler_words?.incidents ||
                    [];
                  const totalCount =
                    analysis?.analysis?.filler_words?.total_filler_count ||
                    analysis?.filler_words?.total_filler_count ||
                    q.filler_words_count ||
                    0;

                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700">
                          Question {q.question_number || i + 1}
                        </span>
                        <span className="text-xs font-bold text-orange-500">
                          {totalCount} filler word{totalCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {incidents.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {incidents.slice(0, 5).map((inc, j) => (
                            <div
                              key={j}
                              className="p-2.5 bg-orange-50 border border-orange-100 rounded-lg text-xs"
                            >
                              <span className="font-bold text-orange-600">
                                &ldquo;{inc.word}&rdquo;
                              </span>
                              {inc.context_text && (
                                <span className="text-slate-500 ml-1">
                                  — &hellip;{inc.context_text}&hellip;
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          {totalCount > 0
                            ? `${totalCount} filler word${totalCount !== 1 ? "s" : ""} detected (no detailed breakdown)`
                            : "No filler words detected — great job!"}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Wordiness */}
        {activeTab === "wordiness" && (
          <div>
            <h3 className="font-bold text-lg mb-4">Wordiness & Efficiency Per Question</h3>
            {perQuestionData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No wordiness data available.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {perQuestionData.map((q, i) => {
                  const analysis = q.speech_analysis;
                  const findings =
                    analysis?.analysis?.word_efficiency?.findings ||
                    analysis?.word_efficiency?.findings ||
                    [];

                  return (
                    <div key={i}>
                      <span className="text-sm font-bold text-slate-700 block mb-2">
                        Question {q.question_number || i + 1}
                      </span>
                      {findings.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {findings.map((item, j) => (
                            <div
                              key={j}
                              className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-slate-400 line-through">
                                  {item.original_phrase}
                                </span>
                                <span className="text-green-600 font-bold">
                                  → {item.recommended_phrase}
                                </span>
                              </div>
                              {item.transcript_context && (
                                <p className="text-slate-500 mb-1">
                                  Context: &ldquo;&hellip;{item.transcript_context}&hellip;&rdquo;
                                </p>
                              )}
                              {item.coach_tip && (
                                <p className="text-purple-600 font-medium">
                                  <Lightbulb size={10} className="inline mr-1" />
                                  {item.coach_tip}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          No wordiness issues — your answers were concise!
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: AI Review Carousel */}
        {activeTab === "ai_review" && (
          <div>
            <h3 className="font-bold text-lg mb-4">AI Review Per Question</h3>
            {qaAnalysis.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No AI review data available. Complete a full session to get AI feedback.
              </p>
            ) : (
              <AIReviewCarousel qaAnalysis={qaAnalysis} perQuestionData={perQuestionData} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI Review Carousel ──────────────────────────────────────
function AIReviewCarousel({ qaAnalysis, perQuestionData }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const total = qaAnalysis.length;
  const current = qaAnalysis[activeIdx] || {};
  const questionData = perQuestionData[activeIdx] || {};

  const goPrev = () => setActiveIdx((p) => Math.max(0, p - 1));
  const goNext = () => setActiveIdx((p) => Math.min(total - 1, p + 1));

  return (
    <div className="flex flex-col gap-5">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={activeIdx === 0}
          className="p-2 rounded-lg border-2 border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-slate-500">
          Question {current.question_number || activeIdx + 1} / {total}
        </span>
        <button
          onClick={goNext}
          disabled={activeIdx === total - 1}
          className="p-2 rounded-lg border-2 border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Question & Answer */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
          Question
        </p>
        <p className="text-sm font-semibold text-slate-800 leading-snug">
          {current.question_text || questionData.question_text || "N/A"}
        </p>
      </div>

      <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
        <p className="text-[10px] font-black uppercase tracking-wider text-violet-400 mb-1">
          Your Answer
        </p>
        <p className="text-sm text-slate-700 leading-snug">
          {current.user_answer || questionData.user_answer || "No answer recorded."}
        </p>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-white border-bold text-center">
          <Target size={16} className="text-blue-500 mx-auto mb-1" />
          <span className="text-xl font-black text-slate-800 block">
            {current.scores?.relevancy_score ?? "-"}
          </span>
          <span className="text-[10px] font-bold text-slate-400">Relevancy</span>
        </div>
        <div className="p-4 bg-white border-bold text-center">
          <Star size={16} className="text-amber-500 mx-auto mb-1" />
          <span className="text-xl font-black text-slate-800 block">
            {current.scores?.star_structure_score ?? "-"}
          </span>
          <span className="text-[10px] font-bold text-slate-400">STAR Method</span>
        </div>
        <div className="p-4 bg-white border-bold text-center">
          <MessageSquare size={16} className="text-green-500 mx-auto mb-1" />
          <span className="text-xl font-black text-slate-800 block">
            {current.scores?.overall_answer_score ?? "-"}
          </span>
          <span className="text-[10px] font-bold text-slate-400">Overall</span>
        </div>
      </div>

      {/* Feedback */}
      {current.feedback && (
        <div className="flex flex-col gap-3">
          {current.feedback.strengths && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-wider text-green-500 mb-1">
                Strengths
              </p>
              <p className="text-xs text-green-800 leading-relaxed">
                {current.feedback.strengths}
              </p>
            </div>
          )}
          {current.feedback.weaknesses && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-wider text-red-400 mb-1">
                Areas to Improve
              </p>
              <p className="text-xs text-red-700 leading-relaxed">
                {current.feedback.weaknesses}
              </p>
            </div>
          )}
          {current.feedback.recommended_answer_improvement && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-500 mb-1">
                Recommended Improvement
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">
                {current.feedback.recommended_answer_improvement}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
