"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Flame,
  Mic,
  Trophy,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ConsistencyHeatmap from "@/components/UI/ConsistencyHeatmap";
import StreakRing from "@/components/Progress/StreakRing";
import SessionHistoryList from "@/components/Progress/SessionHistoryList";
import BadgeGrid from "@/components/Progress/BadgeGrid";
import { BADGE_DEFINITIONS } from "@/lib/badgeDefinitions";

// ── Mock session generation ──────────────────────────────────
// Generates realistic session objects spanning ~3 months
// Adapted from progress-v2/mockData.js
// Uses a seeded PRNG so server and client render identical data.

function createRng(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TOPICS = [
  "Product Launch Pitch",
  "Q1 Financial Review",
  "Team Standup Update",
  "UX Redesign Proposal",
  "Job Interview: Frontend Lead",
  "Sales Deck Walkthrough",
  "Investor Pitch Practice",
  "Conference Talk: AI in Education",
  "Job Interview: Product Manager",
  "Client Onboarding Presentation",
  "Monthly Metrics Review",
  "Hackathon Demo Pitch",
  "Job Interview: Engineering Manager",
  "Board Meeting Update",
  "Job Interview: Startup CTO Role",
  "Marketing Campaign Pitch",
  "Internal Tool Demo",
  "All-Hands Company Update",
  "Job Interview: Senior Developer",
  "Workshop: Public Speaking 101",
];

const FILLER_OPTIONS = [
  "um",
  "uh",
  "like",
  "you know",
  "I mean",
  "sort of",
  "kind of",
  "actually",
  "basically",
  "literally",
];

function generateSessions(rng) {
  const sessions = [];
  // Sessions across May, April, March 2025 (roughly one every ~3 days)
  const dates = [
    { y: 2025, m: 5, d: 1 },
    { y: 2025, m: 5, d: 3 },
    { y: 2025, m: 5, d: 6 },
    { y: 2025, m: 5, d: 9 },
    { y: 2025, m: 5, d: 12 },
    { y: 2025, m: 5, d: 15 },
    { y: 2025, m: 5, d: 18 },
    { y: 2025, m: 5, d: 20 },
    { y: 2025, m: 4, d: 1 },
    { y: 2025, m: 4, d: 4 },
    { y: 2025, m: 4, d: 7 },
    { y: 2025, m: 4, d: 10 },
    { y: 2025, m: 4, d: 13 },
    { y: 2025, m: 4, d: 16 },
    { y: 2025, m: 4, d: 19 },
    { y: 2025, m: 4, d: 22 },
    { y: 2025, m: 4, d: 25 },
    { y: 2025, m: 3, d: 2 },
    { y: 2025, m: 3, d: 5 },
    { y: 2025, m: 3, d: 8 },
    { y: 2025, m: 3, d: 11 },
    { y: 2025, m: 3, d: 14 },
    { y: 2025, m: 3, d: 17 },
    { y: 2025, m: 3, d: 20 },
  ];

  dates.forEach(({ y, m, d }, idx) => {
    const mode = idx % 5 === 0 ? "interview" : "presentation";
    const isPresentation = mode === "presentation";

    // Scores generally improve over time
    const progress = idx / (dates.length - 1); // 0 to 1
    const base = 55 + Math.round(progress * 35);
    const noise = Math.round((rng() - 0.5) * 16);
    const overallScore = Math.min(100, Math.max(40, base + noise));

    const scores = {
      focus: Math.min(
        100,
        Math.max(
          25,
          50 + Math.round(progress * 42) + Math.round((rng() - 0.5) * 14),
        ),
      ),
      pace: Math.min(
        100,
        Math.max(
          30,
          55 + Math.round(progress * 25) + Math.round((rng() - 0.5) * 12),
        ),
      ),
      filler: Math.min(
        100,
        Math.max(
          20,
          40 + Math.round(progress * 40) + Math.round((rng() - 0.5) * 18),
        ),
      ),
      efficiency: Math.min(
        100,
        Math.max(
          25,
          48 + Math.round(progress * 35) + Math.round((rng() - 0.5) * 14),
        ),
      ),
    };

    const duration = isPresentation
      ? [180, 300, 600, 300, 420][idx % 5]
      : [600, 900, 720, 480, 540][idx % 5];
    const wordCount = Math.round(
      duration * (isPresentation ? 2.2 : 1.8) + (rng() - 0.5) * 100,
    );

    // Filler words
    const fillerRate = Math.max(0, ((100 - scores.filler) / 100) * 0.12);
    const fillerCount = Math.round(wordCount * fillerRate);
    const fillerWords = [];
    for (let i = 0; i < Math.min(fillerCount, 15); i++) {
      fillerWords.push({
        word: FILLER_OPTIONS[i % FILLER_OPTIONS.length],
        timestamp: Math.round(rng() * duration),
      });
    }

    // Look-away events
    const lookAwayCount = Math.max(
      0,
      Math.round(((100 - scores.focus) / 100) * 6) +
        Math.round((rng() - 0.5) * 2),
    );
    const lookAwayEvents = [];
    for (let i = 0; i < lookAwayCount; i++) {
      lookAwayEvents.push({
        timestamp: Math.round(rng() * duration),
        type: rng() > 0.5 ? "head" : "eye",
        duration: parseFloat((rng() * 3 + 0.5).toFixed(1)),
      });
    }

    const dateObj = new Date(y, m - 1, d);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    sessions.push({
      id: `sess_${String(idx).padStart(3, "0")}`,
      date: dateObj.toISOString(),
      formattedDate,
      mode,
      overallScore,
      scores,
      duration,
      wordCount,
      averageWpm: Math.round(110 + rng() * 60),
      fillerWords,
      lookAwayEvents,
      totalDistractedTime: lookAwayEvents.reduce(
        (sum, e) => sum + e.duration,
        0,
      ),
      transcript: isPresentation
        ? "Thank you all for joining today. I want to walk you through our latest product metrics and share some exciting updates... The key takeaway here is that we've seen a 40% increase in user engagement since the last quarter. Looking at the data, we can identify three main drivers of this growth."
        : "I believe my experience aligns well with this role. In my previous position, I led a team of five engineers through a complete platform migration... One of the challenges we faced was managing stakeholder expectations while maintaining sprint velocity.",
      topic: TOPICS[idx % TOPICS.length],
    });
  });

  // Sort newest first
  sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
  return sessions;
}

const ALL_SESSIONS = generateSessions(createRng(42));

// ── Month definitions for the dropdown ────────────────────────
const MONTHS = [
  { name: "May 2025", monthIndex: 4, year: 2025 },
  { name: "April 2025", monthIndex: 3, year: 2025 },
  { name: "March 2025", monthIndex: 2, year: 2025 },
];

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

// ── Compute 7-day weekly history for StreakRing ───────────────
function computeWeeklyHistory(sessions) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const practicedToday = sessions.some((s) => {
    const sd = new Date(s.date);
    sd.setHours(0, 0, 0, 0);
    return sd.getTime() === today.getTime();
  });

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const hasSession = sessions.some((s) => s.date.slice(0, 10) === dateStr);
    const isToday = i === 0;
    last7Days.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      status: isToday
        ? practicedToday
          ? "today-done"
          : "today-pending"
        : hasSession
          ? "done"
          : "missed",
    });
  }

  return { practicedToday, weeklyHistory: last7Days };
}

// ── Compute current streak from sessions ──────────────────────
function computeStreak(sessions) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build set of dates that have sessions
  const sessionDates = new Set(
    sessions.map((s) => {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().slice(0, 10);
    }),
  );

  // Count consecutive days going backwards from today
  let current = 0;
  const check = new Date(today);
  while (sessionDates.has(check.toISOString().slice(0, 10))) {
    current++;
    check.setDate(check.getDate() - 1);
  }

  // Count best streak (longest consecutive run in the data)
  let best = 0;
  let run = 0;
  const sortedDates = Array.from(sessionDates).sort();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        run++;
      } else {
        run = 1;
      }
    }
    best = Math.max(best, run);
  }

  // If no session today, the streak might have ended
  // For mock data, if today has a session, streak is current; otherwise maybe 0
  const hasToday = sessionDates.has(today.toISOString().slice(0, 10));
  if (!hasToday && current === 0) {
    // Check if yesterday had one — if so, streak is still alive
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (sessionDates.has(yesterday.toISOString().slice(0, 10))) {
      // Count from yesterday backwards
      let cnt = 0;
      const c = new Date(yesterday);
      while (sessionDates.has(c.toISOString().slice(0, 10))) {
        cnt++;
        c.setDate(c.getDate() - 1);
      }
      current = cnt;
    }
  }

  return {
    current: Math.max(current, hasToday ? 1 : 0),
    best: Math.max(best, current),
  };
}

// ── Main Page Component ───────────────────────────────────────
export default function ProgressPage() {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // ── Badge data from API ───────────────────────────────────────
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [badgesError, setBadgesError] = useState(null);
  const [fetchedBadgeStates, setFetchedBadgeStates] = useState(null);

  useEffect(() => {
    async function fetchBadges() {
      try {
        setBadgesLoading(true);
        setBadgesError(null);
        const res = await fetch("/api/badges/my-badges");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.error || `Failed to fetch badges (${res.status})`,
          );
        }
        const data = await res.json();
        setFetchedBadgeStates(data.badges || []);
      } catch (err) {
        setBadgesError(err.message || "Failed to load badges");
      } finally {
        setBadgesLoading(false);
      }
    }
    fetchBadges();
  }, []);

  // Background color
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#ffffff";
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  // Reset page when month changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonthIndex]);

  const activeMonth = MONTHS[selectedMonthIndex];

  // ── Filter sessions by selected month ───────────────────────
  const filteredSessions = useMemo(() => {
    return ALL_SESSIONS.filter((s) => {
      const d = new Date(s.date);
      return (
        d.getMonth() === activeMonth.monthIndex &&
        d.getFullYear() === activeMonth.year
      );
    });
  }, [activeMonth]);

  // ── Paginated sessions (10 per page) ────────────────────────
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSessions.length / PAGE_SIZE),
  );

  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredSessions.slice(start, start + PAGE_SIZE);
  }, [filteredSessions, currentPage]);

  // ── Average scores for filtered sessions ────────────────────
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

  // ── Improvement percentage (first vs last session in month) ──
  const improvement = useMemo(() => {
    if (filteredSessions.length < 2) return 0;
    const sorted = [...filteredSessions].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
    const first = sorted[0].overallScore;
    const last = sorted[sorted.length - 1].overallScore;
    return first > 0 ? Math.round(((last - first) / first) * 100) : 0;
  }, [filteredSessions]);

  // ── Streak data (all-time, client-only to avoid hydration mismatch) ──
  const [streakData, setStreakData] = useState({
    current: 0,
    best: 0,
    practicedToday: false,
    weeklyHistory: [],
  });

  useEffect(() => {
    const { practicedToday, weeklyHistory } =
      computeWeeklyHistory(ALL_SESSIONS);
    const { current, best } = computeStreak(ALL_SESSIONS);
    setStreakData({ current, best, practicedToday, weeklyHistory });
  }, []);

  // ── Badge display data ──────────────────────────────────────
  const badgeDisplayData = useMemo(() => {
    if (!fetchedBadgeStates) return [];
    const unlockedMap = {};
    const progressMap = {};
    fetchedBadgeStates.forEach((b) => {
      if (b.unlocked) {
        unlockedMap[b.id] = b.unlockedDate || true;
      }
      if (b.progress) {
        progressMap[b.id] = b.progress;
      }
    });
    return buildBadgeDisplayData(BADGE_DEFINITIONS, unlockedMap, progressMap);
  }, [fetchedBadgeStates]);

  const unlockedBadgeCount = useMemo(
    () => badgeDisplayData.filter((b) => b.unlocked).length,
    [badgeDisplayData],
  );

  // ── Full-year daily duration data for heatmap ───────────────
  const fullYearDailyData = useMemo(() => {
    const map = {};
    ALL_SESSIONS.forEach((s) => {
      const d = new Date(s.date);
      if (d.getFullYear() === 2025) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const dateStr = `${y}-${m}-${day}`;
        map[dateStr] = (map[dateStr] || 0) + s.duration;
      }
    });
    return map;
  }, []);

  const heatmapYear = 2025;

  return (
    <div className="w-full min-h-screen pb-12">
      {/* ─── Header Row ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Your Progress
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Track your speaking journey and see how you&apos;re improving over
            time.
          </p>
        </div>

        {/* Month Selector Dropdown */}
        <div className="relative">
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border-bold shadow-lg z-20 overflow-hidden">
              {MONTHS.map((month, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedMonthIndex(idx);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-bold border-b border-slate-100 last:border-0 transition-colors ${
                    selectedMonthIndex === idx
                      ? "bg-sky-50 text-main"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {month.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Row 1: Stats Widgets ─── */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Day Streak */}
        <div className="bg-white rounded-2xl border-bold px-4 py-4 flex items-center gap-3.5 hover:shadow-sm transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
            <Flame size={20} className="text-orange-500 fill-orange-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-black text-slate-800 leading-none">
              {streakData.current}
            </span>
            <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5">
              Day Streak
            </span>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-white rounded-2xl border-bold px-4 py-4 flex items-center gap-3.5 hover:shadow-sm transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
            <Mic size={20} className="text-sky-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-black text-slate-800 leading-none">
              {filteredSessions.length}
            </span>
            <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5">
              Sessions
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl border-bold px-4 py-4 flex items-center gap-3.5 hover:shadow-sm transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Trophy size={20} className="text-amber-500 fill-amber-100" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-black text-slate-800 leading-none">
              {unlockedBadgeCount}
            </span>
            <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5">
              Badges
            </span>
          </div>
        </div>
      </div>

      {/* ─── Row 2: Consistency Heatmap + StreakRing ─── */}
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
            {/* Legend — GitHub green palette */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ebedf0]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#9be9a8]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#40c463]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#30a14e]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#216e39]" />
              <span>More</span>
            </div>
          </div>
          <ConsistencyHeatmap
            year={heatmapYear}
            dailyData={fullYearDailyData}
          />
        </div>

        {/* StreakRing */}
        <div className="lg:col-span-4 bg-white rounded-2xl border-bold px-5 py-5">
          <StreakRing
            current={streakData.current}
            best={streakData.best}
            practicedToday={streakData.practicedToday}
            weeklyHistory={streakData.weeklyHistory}
          />
        </div>
      </div>

      {/* ─── Row 3: Badges + Session History (stacked) ─── */}
      <div className="flex flex-col gap-5">
        {/* Badge Grid — full width */}
        {badgesError ? (
          <div className="rounded-[20px] bg-white border-bold py-10 flex flex-col items-center gap-3">
            <p className="text-sm font-bold text-slate-400">{badgesError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-extrabold text-main hover:underline cursor-pointer bg-transparent border-0"
            >
              Try again
            </button>
          </div>
        ) : (
          <BadgeGrid
            badges={badgeDisplayData}
            loading={badgesLoading}
            maxCols={6}
          />
        )}

        {/* Session History — full width with pagination */}
        <div className="flex flex-col gap-4">
          <SessionHistoryList
            sessions={paginatedSessions}
            averageScores={averageScores}
          />

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 bg-white border-bold rounded-lg text-xs font-extrabold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
                Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all cursor-pointer border-2 ${
                        page === currentPage
                          ? "bg-main text-white border-main shadow-sm"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 bg-white border-bold rounded-lg text-xs font-extrabold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
                <ChevronRight size={14} />
              </button>

              <span className="text-[10px] font-bold text-slate-400 ml-2">
                {filteredSessions.length} sessions · page {currentPage} of{" "}
                {totalPages}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
