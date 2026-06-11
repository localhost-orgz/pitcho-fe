"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Play,
  Clock,
  Mic,
  Eye,
  Timer,
  FileText,
  AlertTriangle,
} from "lucide-react";

const SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "highest", label: "Highest Score" },
  { key: "longest", label: "Longest" },
];

function scoreToColor(score) {
  const clamped = Math.max(0, Math.min(100, score));
  const hue = (clamped / 100) * 120;
  return `hsl(${hue}, 80%, 50%)`;
}

function formatDuration(seconds) {
  if (!seconds) return "0m";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function MiniScoreBar({ label, score, color, avg, maxScore = 100 }) {
  const barWidth = (score / maxScore) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-slate-500 w-14 text-right shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${barWidth}%`, backgroundColor: color }}
        />
        {/* Average marker */}
        {avg != null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-400"
            style={{ left: `${(avg / maxScore) * 100}%` }}
            title={`Your average: ${avg}%`}
          />
        )}
      </div>
      <span className="text-[10px] font-extrabold text-slate-700 w-8 text-right">
        {score}
      </span>
      {avg != null && (
        <span className="text-[9px] font-medium w-12 text-right" style={{ color: score >= avg ? "#10b981" : "#ef4444" }}>
          {score >= avg ? "+" : ""}{score - avg} vs avg
        </span>
      )}
    </div>
  );
}

export default function SessionHistoryList({ sessions, averageScores }) {
  const [expandedId, setExpandedId] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [showTranscript, setShowTranscript] = useState(null);

  const sortedSessions = useMemo(() => {
    const sorted = [...sessions];
    switch (sortBy) {
      case "highest":
        sorted.sort((a, b) => b.overallScore - a.overallScore);
        break;
      case "longest":
        sorted.sort((a, b) => b.duration - a.duration);
        break;
      default: // newest
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return sorted;
  }, [sessions, sortBy]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setShowTranscript(null);
  };

  // Empty state
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-bold px-5 py-10 flex flex-col items-center gap-3">
        <FileText size={40} className="text-slate-200" />
        <p className="text-sm font-bold text-slate-400 text-center">
          No sessions yet — your first one awaits!
        </p>
        <a
          href="/presentation/setup"
          className="text-xs font-extrabold text-main hover:underline"
        >
          Start Your First Practice →
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-bold flex flex-col">
      {/* Header with sort controls */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-extrabold text-slate-800 text-sm">
          Session History
        </h3>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                sortBy === opt.key
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Session rows */}
      <div className="divide-y divide-slate-50">
        {sortedSessions.map((session) => {
          const isExpanded = expandedId === session.id;
          const modeColor =
            session.mode === "presentation"
              ? "bg-blue-50 text-blue-600 border-blue-200"
              : "bg-purple-50 text-purple-600 border-purple-200";

          // Generate one-line insight
          const topScore = Object.entries(session.scores).sort((a, b) => b[1] - a[1])[0];
          const insightMap = {
            focus: "Excellent eye contact",
            pace: "Great speaking pace",
            filler: "Minimal filler words",
            efficiency: "Very clear delivery",
          };
          const insight = insightMap[topScore[0]] || "Solid performance";

          return (
            <div key={session.id} className="group">
              {/* Main row */}
              <button
                onClick={() => toggleExpand(session.id)}
                className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer text-left"
              >
                {/* Date */}
                <span className="text-xs font-bold text-slate-600 w-[85px] shrink-0">
                  {session.formattedDate}
                </span>

                {/* Mode badge */}
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${modeColor}`}
                >
                  {session.mode === "presentation" ? "Presentation" : "Interview"}
                </span>

                {/* Score */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-sm font-black"
                    style={{ color: scoreToColor(session.overallScore) }}
                  >
                    {session.overallScore}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">/100</span>
                </div>

                {/* Insight */}
                <span className="text-xs text-slate-500 font-medium truncate flex-1 hidden sm:block">
                  {insight} · {session.fillerWords?.length || 0} filler words
                </span>

                {/* Duration */}
                <span className="text-[10px] text-slate-400 font-bold shrink-0 flex items-center gap-1">
                  <Clock size={10} />
                  {formatDuration(session.duration)}
                </span>

                {/* Expand icon */}
                <div className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Expanded deep-dive panel */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 bg-slate-50/50 border-t border-slate-100 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left: Score breakdown */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
                        Score Breakdown
                      </span>
                      <MiniScoreBar
                        label="Focus"
                        score={session.scores.focus}
                        color="#3b82f6"
                        avg={averageScores?.focus}
                      />
                      <MiniScoreBar
                        label="Pace"
                        score={session.scores.pace}
                        color="#10b981"
                        avg={averageScores?.pace}
                      />
                      <MiniScoreBar
                        label="Filler"
                        score={session.scores.filler}
                        color="#f59e0b"
                        avg={averageScores?.filler}
                      />
                      <MiniScoreBar
                        label="Clarity"
                        score={session.scores.efficiency}
                        color="#8b5cf6"
                        avg={averageScores?.efficiency}
                      />

                      {/* Key stats */}
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {[
                          { icon: Mic, label: "Words", value: session.wordCount },
                          { icon: Timer, label: "WPM", value: session.averageWpm },
                          { icon: Eye, label: "Distracted", value: `${Math.round(session.totalDistractedTime || 0)}s` },
                        ].map((stat, i) => (
                          <div key={i} className="bg-white rounded-xl p-2 border border-slate-100 flex items-center gap-1.5">
                            <stat.icon size={12} className="text-slate-400" />
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-700">{stat.value}</span>
                              <span className="text-[9px] text-slate-400 font-medium">{stat.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex flex-col gap-3">
                      {/* Topic */}
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
                          Topic
                        </span>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">
                          {session.topic || "Untitled Session"}
                        </p>
                      </div>

                      {/* Filler word highlights */}
                      {session.fillerWords && session.fillerWords.length > 0 && (
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                            <AlertTriangle size={10} />
                            Filler Words ({session.fillerWords.length})
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {session.fillerWords.slice(0, 10).map((fw, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200"
                              >
                                &ldquo;{fw.word}&rdquo; at {formatDuration(fw.timestamp)}
                              </span>
                            ))}
                            {session.fillerWords.length > 10 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{session.fillerWords.length - 10} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Look-away timeline */}
                      {session.lookAwayEvents && session.lookAwayEvents.length > 0 && (
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
                            Eye Contact Timeline
                          </span>
                          <div className="relative h-4 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            {session.lookAwayEvents.map((evt, i) => (
                              <div
                                key={i}
                                className="absolute top-0 h-full bg-red-400/60 rounded-full"
                                style={{
                                  left: `${(evt.timestamp / session.duration) * 100}%`,
                                  width: `${Math.max((evt.duration / session.duration) * 100, 0.5)}%`,
                                }}
                                title={`${evt.type} at ${formatDuration(evt.timestamp)} (${evt.duration}s)`}
                              />
                            ))}
                          </div>
                          <span className="text-[9px] text-slate-400 font-medium mt-0.5 block">
                            {session.lookAwayEvents.length} look-away events
                          </span>
                        </div>
                      )}

                      {/* Transcript toggle */}
                      <div>
                        <button
                          onClick={() =>
                            setShowTranscript(
                              showTranscript === session.id ? null : session.id
                            )
                          }
                          className="flex items-center gap-1 text-[10px] font-extrabold text-main hover:underline cursor-pointer"
                        >
                          <FileText size={10} />
                          {showTranscript === session.id ? "Hide" : "View"} Transcript
                        </button>
                        {showTranscript === session.id && session.transcript && (
                          <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5 p-2.5 bg-white rounded-xl border border-slate-100 italic">
                            &ldquo;{session.transcript.substring(0, 300)}
                            {session.transcript.length > 300 ? "..." : ""}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Redo button */}
                      <a
                        href={session.mode === "presentation" ? "/presentation/setup" : "/interview/setup"}
                        className="self-start flex items-center gap-1.5 text-[10px] font-extrabold text-main bg-main/10 px-3 py-1.5 rounded-lg hover:bg-main/20 transition-colors mt-1"
                      >
                        <Play size={10} />
                        Redo Similar Session
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
