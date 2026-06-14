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
  const date =
    raw.createdAt || raw.date || raw.created_at || new Date().toISOString();
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
  const duration =
    raw.totalDuration ??
    raw.duration ??
    raw.sessionDuration ??
    raw.session_duration ??
    0;
  const topic = raw.name || raw.topic || raw.title || "";

  const scores = {
    focus: raw.scores?.focus ?? raw.focusScore ?? raw.focus_score ?? 0,
    pace: raw.scores?.pace ?? raw.paceScore ?? raw.pace_score ?? 0,
    filler: raw.scores?.filler ?? raw.fillerScore ?? raw.filler_score ?? 0,
    efficiency:
      raw.scores?.efficiency ?? raw.clarityScore ?? raw.efficiency_score ?? 0,
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

  // ── Streak current data from API ──────────────────────────────
  const [streakCurrent, setStreakCurrent] = useState(null);
  const [streakCurrentLoading, setStreakCurrentLoading] = useState(true);
  const [streakCurrentError, setStreakCurrentError] = useState(null);

  // ── Streak week data from API ─────────────────────────────────
  const [streakWeek, setStreakWeek] = useState(null);
  const [streakWeekLoading, setStreakWeekLoading] = useState(true);
  const [streakWeekError, setStreakWeekError] = useState(null);

  // ── Streak year data from API ─────────────────────────────────
  const [streakYear, setStreakYear] = useState(null);
  const [streakYearLoading, setStreakYearLoading] = useState(true);
  const [streakYearError, setStreakYearError] = useState(null);

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
        const raw = Array.isArray(data) ? data : (data.data ?? []);
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

  // ── Fetch current streak data ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function fetchStreakCurrent() {
      try {
        setStreakCurrentLoading(true);
        setStreakCurrentError(null);
        const res = await fetch("/api/streak/current");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.error || `Failed to fetch streak (${res.status})`,
          );
        }
        const data = await res.json();
        if (cancelled) return;
        // Normalize: handle { streak } (backend) or { current, best } or { data: {...} }
        const raw = data.data ?? data;
        setStreakCurrent({
          current: raw.streak ?? raw.current ?? 0,
          best: raw.best ?? 0,
        });
      } catch (err) {
        if (!cancelled)
          setStreakCurrentError(err.message || "Failed to load streak");
      } finally {
        if (!cancelled) setStreakCurrentLoading(false);
      }
    }
    fetchStreakCurrent();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Fetch weekly streak data ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function fetchStreakWeek() {
      try {
        setStreakWeekLoading(true);
        setStreakWeekError(null);
        const res = await fetch("/api/streak/week");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.error || `Failed to fetch week streak (${res.status})`,
          );
        }
        const data = await res.json();
        if (cancelled) return;
        // Normalize: handle { weekStreak: [{date, practiced}] } or { practicedToday, weeklyHistory }
        const raw = data.data ?? data;
        // Support weekStreak array format from backend
        const weekStreakArr = Array.isArray(raw.weekStreak)
          ? raw.weekStreak
          : null;
        const today = (() => {
          const n = new Date();
          const y = n.getFullYear();
          const m = String(n.getMonth() + 1).padStart(2, "0");
          const d = String(n.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        })();
        const practicedToday = weekStreakArr
          ? (weekStreakArr.find((d) => d.date === today)?.practiced ?? false)
          : (raw.practicedToday ?? false);
        const weeklyHistory = weekStreakArr
          ? weekStreakArr.map((entry) => {
              const d = new Date(entry.date + "T00:00:00");
              const day = d.toLocaleDateString("en-US", { weekday: "short" });
              const isToday = entry.date === today;
              const status = isToday
                ? entry.practiced
                  ? "today-done"
                  : "today-pending"
                : entry.practiced
                  ? "done"
                  : "missed";
              return { day, status };
            })
          : Array.isArray(raw.weeklyHistory)
            ? raw.weeklyHistory
            : [];
        setStreakWeek({ practicedToday, weeklyHistory });
      } catch (err) {
        if (!cancelled)
          setStreakWeekError(err.message || "Failed to load weekly streak");
      } finally {
        if (!cancelled) setStreakWeekLoading(false);
      }
    }
    fetchStreakWeek();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Fetch yearly streak / heatmap data ─────────────────────────
  const heatmapYear = useMemo(() => {
    if (apiSessions.length === 0) return new Date().getFullYear();
    // Use the newest session's year
    const dates = apiSessions
      .map((s) => new Date(s.date))
      .filter((d) => !isNaN(d.getTime()));
    if (dates.length === 0) return new Date().getFullYear();
    return dates.reduce((a, b) => (a > b ? a : b)).getFullYear();
  }, [apiSessions]);

  useEffect(() => {
    let cancelled = false;
    async function fetchStreakYear() {
      try {
        setStreakYearLoading(true);
        setStreakYearError(null);
        const url = heatmapYear
          ? `/api/streak/year?year=${heatmapYear}`
          : "/api/streak/year";
        const res = await fetch(url);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.error || `Failed to fetch yearly streak (${res.status})`,
          );
        }
        const data = await res.json();
        if (cancelled) return;
        // Normalize: handle { yearStreak: [{date, minutes}] } or { dailyData: {...} }
        const raw = data.data ?? data;
        let dailyData = {};
        if (Array.isArray(raw.yearStreak)) {
          // Convert array of { date, minutes } to { "YYYY-MM-DD": seconds }
          raw.yearStreak.forEach(({ date, minutes }) => {
            if (date) dailyData[date] = Math.round((minutes ?? 0) * 60);
          });
        } else if (raw.dailyData && typeof raw.dailyData === "object") {
          dailyData = raw.dailyData;
        }
        setStreakYear({ dailyData });
      } catch (err) {
        if (!cancelled)
          setStreakYearError(err.message || "Failed to load yearly data");
      } finally {
        if (!cancelled) setStreakYearLoading(false);
      }
    }
    fetchStreakYear();
    return () => {
      cancelled = true;
    };
  }, [heatmapYear]);

  // Background color
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#ffffff";
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  // ── Build month list from API sessions ──────────────────────
  const availableMonths = useMemo(
    () => buildMonthsFromSessions(apiSessions),
    [apiSessions],
  );

  // Reset selected month + page when available months change
  useEffect(() => {
    setSelectedMonthIndex(-1);
    setCurrentPage(1);
  }, [apiSessions]);

  // Reset page when month changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonthIndex]);

  const activeMonth =
    selectedMonthIndex === -1
      ? null
      : availableMonths[selectedMonthIndex] || null;

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
      </div>

      {/* ─── Row 1: Stats Widgets ─── */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Day Streak */}
        {streakCurrentLoading ? (
          <div className="bg-white rounded-2xl border-bold px-4 py-4 flex items-center gap-3.5 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
            <div className="flex flex-col min-w-0 gap-1">
              <div className="h-5 w-8 bg-slate-200 rounded" />
              <div className="h-2.5 w-16 bg-slate-100 rounded" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-bold px-4 py-4 flex items-center gap-3.5 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
              <Flame size={20} className="text-orange-500 fill-orange-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-black text-slate-800 leading-none">
                {streakCurrent?.current ?? 0}
              </span>
              <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5">
                Day Streak
              </span>
            </div>
          </div>
        )}

        {/* Sessions */}
        {sessionsLoading ? (
          <div className="bg-white rounded-2xl border-bold px-4 py-4 flex items-center gap-3.5 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
            <div className="flex flex-col min-w-0 gap-1">
              <div className="h-5 w-8 bg-slate-200 rounded" />
              <div className="h-2.5 w-20 bg-slate-100 rounded" />
            </div>
          </div>
        ) : (
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
        )}

        {/* Badges */}
        {badgesLoading ? (
          <div className="bg-white rounded-2xl border-bold px-4 py-4 flex items-center gap-3.5 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
            <div className="flex flex-col min-w-0 gap-1">
              <div className="h-5 w-8 bg-slate-200 rounded" />
              <div className="h-2.5 w-12 bg-slate-100 rounded" />
            </div>
          </div>
        ) : (
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
        )}
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
            dailyData={streakYear?.dailyData ?? {}}
            loading={streakYearLoading}
          />
        </div>

        {/* StreakRing */}
        <div className="lg:col-span-4 bg-white rounded-2xl border-bold px-5 py-5">
          <StreakRing
            current={streakCurrent?.current ?? 0}
            best={streakCurrent?.best ?? 0}
            practicedToday={streakWeek?.practicedToday ?? false}
            weeklyHistory={streakWeek?.weeklyHistory ?? []}
            loading={streakCurrentLoading || streakWeekLoading}
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
            loading={sessionsLoading}
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
