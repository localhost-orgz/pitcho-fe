"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { TrendingUp, BarChart3, Calendar } from "lucide-react";
import HeroBanner from "@/components/Progress/HeroBanner";
import TimeRangeFilter from "@/components/Progress/TimeRangeFilter";
import GrowthTimeline from "@/components/Progress/GrowthTimeline";
import SkillGrowthCard from "@/components/Progress/SkillGrowthCard";
import StreakRing from "@/components/Progress/StreakRing";
import ConsistencyHeatmap from "@/components/UI/ConsistencyHeatmap";
import SessionHistoryList from "@/components/Progress/SessionHistoryList";
import BadgeGrid from "@/components/Progress/BadgeGrid";
import BadgeUnlockOverlay from "@/components/Progress/BadgeUnlockOverlay";
import FocusArea from "@/components/Progress/FocusArea";
import { MOCK_DATA } from "./mockData";
import { BADGE_DEFINITIONS } from "@/lib/badgeDefinitions";

// ── Mock unlock state for static display ──────────────────────
const MOCK_UNLOCKED = {
  "first-step": "2026-03-10",
  "on-a-roll": "2026-03-14",
  "focused-speaker": "2026-04-02",
  "smooth-talker": "2026-04-18",
  "1min-speaker": "2026-03-12",
  "5min-speaker": "2026-04-25",
  "first-interview": "2026-05-01",
  "getting-better": "2026-05-08",
};

// Some badges get mock progress for visual variety
const MOCK_PROGRESS = {
  "weekly-warrior": { current: 4, target: 7 },
  "laser-focus": { current: 2, target: 3 },
  "fluent-speaker": { current: 1, target: 3 },
  "perfect-pace": { current: 1, target: 3 },
  "job-seeker": { current: 6, target: 10 },
  "marathon-presenter": { current: 3, target: 10 },
  "consistent-rhythm": { current: 2, target: 5 },
  "breakthrough": { current: 1, target: 1 }, // 100% done but not unlocked (edge case demo)
};

// ── Build badge display data from definitions ─────────────────
function buildBadgeDisplayData(definitions, unlockedMap, progressMap) {
  return definitions.map((def) => ({
    id: def.id,
    name: def.name,
    description: def.description,
    icon: def.icon,
    category: def.category,
    level: def.level,
    color: def.color,
    unlocked: !!unlockedMap[def.id],
    unlockedDate: unlockedMap[def.id] || null,
    progress: progressMap[def.id] || null,
    criteria: def.description,
  }));
}

export default function ProgressV2Page() {
  // ── State ──────────────────────────────────────────────────
  const [ready, setReady] = useState(false);
  const [timeRange, setTimeRange] = useState("all");
  const [mode, setMode] = useState("all");
  const [activeMetric, setActiveMetric] = useState("focus");
  const [highlightedSkill, setHighlightedSkill] = useState(null);
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [demoUnlockBadges, setDemoUnlockBadges] = useState(null); // for unlock overlay demo

  // Guard for SSR (localStorage not available)
  useEffect(() => {
    setReady(true);
  }, []);

  // ── Data (mock — will be backend later) ────────────────────
  const data = useMemo(() => MOCK_DATA, []);

  // ── Badge display data (from definitions + mock unlock state)
  const badgeDisplayData = useMemo(
    () => buildBadgeDisplayData(BADGE_DEFINITIONS, MOCK_UNLOCKED, MOCK_PROGRESS),
    []
  );

  // ── Filter sessions by time range + mode ────────────────────
  const filteredSessions = useMemo(() => {
    let sessions = data.sessions;

    // Mode filter
    if (mode !== "all") {
      sessions = sessions.filter((s) => s.mode === mode);
    }

    // Time range filter
    const now = new Date();
    switch (timeRange) {
      case "week": {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        sessions = sessions.filter((s) => new Date(s.date) >= weekAgo);
        break;
      }
      case "month": {
        sessions = sessions.filter((s) => {
          const d = new Date(s.date);
          return d.getMonth() === monthIndex && d.getFullYear() === year;
        });
        break;
      }
      case "3months": {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        sessions = sessions.filter((s) => new Date(s.date) >= threeMonthsAgo);
        break;
      }
      default:
        // "all" — no filter
        break;
    }

    return sessions;
  }, [data.sessions, timeRange, mode, monthIndex, year]);

  // ── Average scores for the filtered set ──────────────────────
  const averageScores = useMemo(() => {
    if (filteredSessions.length === 0) {
      return { focus: 0, pace: 0, filler: 0, efficiency: 0 };
    }
    const sum = { focus: 0, pace: 0, filler: 0, efficiency: 0 };
    filteredSessions.forEach((s) => {
      sum.focus += s.scores.focus;
      sum.pace += s.scores.pace;
      sum.filler += s.scores.filler;
      sum.efficiency += s.scores.efficiency;
    });
    return {
      focus: Math.round(sum.focus / filteredSessions.length),
      pace: Math.round(sum.pace / filteredSessions.length),
      filler: Math.round(sum.filler / filteredSessions.length),
      efficiency: Math.round(sum.efficiency / filteredSessions.length),
    };
  }, [filteredSessions]);

  // ── Heatmap data for selected month ──────────────────────────
  const heatmapSessions = useMemo(() => {
    const map = {};
    data.sessions.forEach((s) => {
      const d = new Date(s.date);
      if (d.getMonth() === monthIndex && d.getFullYear() === year) {
        const day = d.getDate();
        map[day] = (map[day] || 0) + 1;
      }
    });
    return map;
  }, [data.sessions, monthIndex, year]);

  // ── Handlers ────────────────────────────────────────────────
  const handleMonthChange = useCallback(
    (delta) => {
      let newMonth = monthIndex + delta;
      let newYear = year;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      setMonthIndex(newMonth);
      setYear(newYear);
    },
    [monthIndex, year]
  );

  const handleSkillClick = useCallback(
    (skillKey) => {
      setHighlightedSkill(highlightedSkill === skillKey ? null : skillKey);
      setActiveMetric(skillKey);
    },
    [highlightedSkill]
  );

  // ── Empty state (no sessions at all) ─────────────────────────
  const isEmpty = data.sessions.length === 0;
  const isFilteredEmpty = filteredSessions.length === 0 && !isEmpty;

  // ── Loading skeleton ─────────────────────────────────────────
  if (!ready) {
    return (
      <div className="w-full min-h-screen pb-12 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-2xl mb-5" />
        <div className="h-10 bg-slate-200 rounded-xl w-64 mb-5" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="h-80 bg-slate-200 rounded-2xl" />
          <div className="h-80 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ── Full empty state (new user) ──────────────────────────────
  if (isEmpty) {
    return (
      <div className="w-full min-h-screen pb-12">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Your Progress
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Track your speaking journey and see how you&apos;re improving over time.
          </p>
        </div>

        <div className="bg-white rounded-2xl border-bold px-5 py-16 flex flex-col items-center gap-4">
          <div className="p-6 bg-indigo-50 rounded-full">
            <BarChart3 size={48} className="text-indigo-300" />
          </div>
          <h2 className="text-xl font-black text-slate-400">
            Your progress journey starts here!
          </h2>
          <p className="text-sm text-slate-400 max-w-md text-center font-medium">
            Complete your first presentation or interview session to see your
            scores, streaks, and improvement trends.
          </p>
          <a
            href="/presentation/setup"
            className="mt-2 inline-flex items-center gap-2 bg-main text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-[0_4px_0_#0266cc] active:translate-y-[4px] active:shadow-[0_0_0_#0266cc] transition-all cursor-pointer hover:bg-main/90"
          >
            <TrendingUp size={16} />
            Start Your First Practice
          </a>
        </div>
      </div>
    );
  }

  // ── Main page ────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Your Progress
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Track your speaking journey and see how you&apos;re improving over time.
        </p>
      </div>

      {/* Hero Banner */}
      <div className="mb-5">
        <HeroBanner
          summary={data.summary}
          growth={data.growth}
          level={data.level}
          streak={data.streak}
        />
      </div>

      {/* Time Range Filter */}
      <div className="mb-5">
        <TimeRangeFilter
          range={timeRange}
          onRangeChange={setTimeRange}
          year={year}
          monthIndex={monthIndex}
          onMonthChange={handleMonthChange}
          mode={mode}
          onModeChange={setMode}
        />
      </div>

      {/* Filtered-empty state */}
      {isFilteredEmpty && (
        <div className="bg-white rounded-2xl border-bold px-5 py-10 flex flex-col items-center gap-3 mb-5">
          <Calendar size={40} className="text-slate-200" />
          <p className="text-sm font-bold text-slate-400 text-center">
            No sessions in this period. Try a different time range or mode.
          </p>
        </div>
      )}

      {/* Row 1: Growth Timeline + Skill Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Growth Timeline */}
        <div className="lg:col-span-7">
          <GrowthTimeline
            sessions={filteredSessions}
            activeMetric={activeMetric}
            onMetricChange={setActiveMetric}
          />
        </div>

        {/* Skill Growth Cards */}
        <div className="lg:col-span-5">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.skills).map(([key, skillData]) => (
              <SkillGrowthCard
                key={key}
                skillKey={key}
                data={skillData}
                isActive={highlightedSkill === key}
                onClick={() => handleSkillClick(key)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Consistency Heatmap + Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Heatmap */}
        <div className="lg:col-span-8 bg-white rounded-2xl border-bold px-5 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="font-extrabold text-slate-800 text-sm">
                Consistency
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                Keep it up! Consistency is the key to improvement.
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200" /> 0
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-sky-200 border border-sky-300" /> 1
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-sky-400 border border-sky-500" /> 2
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-sky-600" /> 3+
              </span>
            </div>
          </div>
          <ConsistencyHeatmap
            year={year}
            month={monthIndex}
            sessionData={heatmapSessions}
          />
        </div>

        {/* Streak */}
        <div className="lg:col-span-4 bg-white rounded-2xl border-bold px-5 py-5">
          <StreakRing
            current={data.streak.current}
            best={data.streak.best}
            practicedToday={data.streak.practicedToday}
          />
        </div>
      </div>

      {/* Row 3: Session History (full width) */}
      <div className="mb-5">
        <SessionHistoryList
          sessions={filteredSessions}
          averageScores={averageScores}
        />
      </div>

      {/* Row 4: Badges + Focus Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-3">
          <BadgeGrid badges={badgeDisplayData} />
          {/* Demo: preview unlock animation */}
          <button
            onClick={() =>
              setDemoUnlockBadges([
                badgeDisplayData.find((b) => b.id === "weekly-warrior"),
              ])
            }
            className="text-[10px] font-bold text-slate-400 hover:text-main underline cursor-pointer bg-transparent border-0"
          >
            Preview unlock animation →
          </button>
        </div>
        <div className="lg:col-span-5">
          <FocusArea skills={data.skills} focusArea={data.focusArea} />
        </div>
      </div>

      {/* Badge unlock celebration overlay */}
      <BadgeUnlockOverlay
        badges={demoUnlockBadges || []}
        onDismiss={() => setDemoUnlockBadges(null)}
      />
    </div>
  );
}
