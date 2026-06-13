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

// ── API helpers ───────────────────────────────────────────────

/**
 * Normalize a session object from the API into the shape expected
 * by the progress page components.
 */
function normalizeSession(raw) {
  const date = raw.createdAt || raw.date || raw.created_at || new Date().toISOString();
  const dateObj = new Date(date);
  const formattedDate = isNaN(dateObj.getTime())
    ? ""
    : dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  const mode = raw.practiceType || raw.type || raw.mode || "presentation";
  const overallScore = raw.score ?? raw.overallScore ?? raw.overall_score ?? 0;
  const duration = raw.totalDuration ?? raw.duration ?? raw.sessionDuration ?? raw.session_duration ?? 0;
  const topic = raw.name || raw.topic || raw.title || "";

  const scores = {
    focus: raw.scores?.focus ?? raw.focusScore ?? raw.focus_score ?? 0,
    pace: raw.scores?.pace ?? raw.paceScore ?? raw.pace_score ?? 0,
    filler: raw.scores?.filler ?? raw.fillerScore ?? raw.filler_score ?? 0,
    efficiency: raw.scores?.efficiency ?? raw.clarityScore ?? raw.efficiency_score ?? 0,
  };

  return {
    id: raw.id || raw._id || raw.sessionId || String(Math.random()),
    date,
    formattedDate,
    mode,
    overallScore,
    scores,
    duration,
    topic,
    wordCount: raw.wordCount ?? raw.word_count ?? raw.totalWords ?? 0,
    averageWpm: raw.averageWpm ?? raw.average_wpm ?? raw.wpm ?? 0,
    fillerWords: raw.fillerWords ?? raw.filler_words ?? [],
    lookAwayEvents: raw.lookAwayEvents ?? raw.look_away_events ?? [],
    totalDistractedTime:
      raw.totalDistractedTime ??
      raw.total_distracted_time ??
      raw.distractedDurationSeconds ??
      0,
    transcript: raw.transcript || "",
  };
}

/**
 * Build available month list from an array of session objects.
 * Returns array of { name, monthIndex, year } sorted newest first.
 */
function buildMonthsFromSessions(sessions) {
  const monthSet = new Map();
  sessions.forEach((s) => {
    const d = new Date(s.date);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!monthSet.has(key)) {
      monthSet.set(key, {
        name: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
      });
    }
  });
  return Array.from(monthSet.values()).sort(
    (a, b) => b.year - a.year || b.monthIndex - a.monthIndex,
  );
}

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
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(-1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // ── Session history from API ──────────────────────────────────
  const [apiSessions, setApiSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState(null);

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
        // Handle multiple response shapes
        const badges = data.badges || data.data?.badges || data.data || [];
        setFetchedBadgeStates(badges);
      } catch (err) {
        setBadgesError(err.message || "Failed to load badges");
      } finally {
        setBadgesLoading(false);
      }
    }
    fetchBadges();
  }, []);

  useEffect(() => {
    async function fetchSessions() {
      try {
        setSessionsLoading(true);
        setSessionsError(null);
        const res = await fetch("/api/history");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.error || `Failed to fetch sessions (${res.status})`,
          );
        }
        const data = await res.json();
        // Handle both array and { data: [...] } envelope
        const raw = Array.isArray(data) ? data : data.data ?? [];
        const normalized = raw.map(normalizeSession);
        // Sort newest first
        normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
        setApiSessions(normalized);
      } catch (err) {
        setSessionsError(err.message || "Failed to load sessions");
      } finally {
        setSessionsLoading(false);
      }
    }
    fetchSessions();
  }, []);

  // Background color
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#ffffff";
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  // ── Build month list from API sessions ──────────────────────
  const availableMonths = useMemo(() => buildMonthsFromSessions(apiSessions), [apiSessions]);

  // Reset selected month + page when available months change
  useEffect(() => {
    setSelectedMonthIndex(-1);
    setCurrentPage(1);
  }, [apiSessions]);

  // Reset page when month changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonthIndex]);

  const activeMonth = selectedMonthIndex === -1 ? null : (availableMonths[selectedMonthIndex] || null);

  // ── Filter sessions by selected month ───────────────────────
  const filteredSessions = useMemo(() => {
    if (!activeMonth) return apiSessions;
    return apiSessions.filter((s) => {
      const d = new Date(s.date);
      if (isNaN(d.getTime())) return false;
      return (
        d.getMonth() === activeMonth.monthIndex &&
        d.getFullYear() === activeMonth.year
      );
    });
  }, [apiSessions, activeMonth]);

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

  // ── Streak data (all-time, client-only to avoid hydration mismatch) ──
  const [streakData, setStreakData] = useState({
    current: 0,
    best: 0,
    practicedToday: false,
    weeklyHistory: [],
  });

  useEffect(() => {
    if (apiSessions.length === 0) return;
    const { practicedToday, weeklyHistory } =
      computeWeeklyHistory(apiSessions);
    const { current, best } = computeStreak(apiSessions);
    setStreakData({ current, best, practicedToday, weeklyHistory });
  }, [apiSessions]);

  // ── Badge display data ──────────────────────────────────────
  const badgeDisplayData = useMemo(() => {
    // Always build from definitions so all badges show even when API is empty
    if (!fetchedBadgeStates || fetchedBadgeStates.length === 0) {
      // Return all badges as locked
      return buildBadgeDisplayData(BADGE_DEFINITIONS, {}, {});
    }
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
  const heatmapYear = useMemo(() => {
    if (apiSessions.length === 0) return new Date().getFullYear();
    // Use the newest session's year
    const dates = apiSessions.map((s) => new Date(s.date)).filter((d) => !isNaN(d.getTime()));
    if (dates.length === 0) return new Date().getFullYear();
    return dates.reduce((a, b) => (a > b ? a : b)).getFullYear();
  }, [apiSessions]);

  const fullYearDailyData = useMemo(() => {
    const map = {};
    apiSessions.forEach((s) => {
      const d = new Date(s.date);
      if (isNaN(d.getTime())) return;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${day}`;
      map[dateStr] = (map[dateStr] || 0) + s.duration;
    });
    return map;
  }, [apiSessions]);

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
        {availableMonths.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-bold rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar size={14} className="text-slate-400" />
              {activeMonth?.name || "All Sessions"}
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border-bold shadow-lg z-20 overflow-hidden rounded-lg max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedMonthIndex(-1);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-bold border-b border-slate-100 transition-colors ${
                    selectedMonthIndex === -1
                      ? "bg-sky-50 text-main"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  All Sessions
                </button>
                {availableMonths.map((month, idx) => (
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
        )}
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
              {apiSessions.length}
            </span>
            <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5">
              Total Sessions
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
