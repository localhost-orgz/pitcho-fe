// ── Badge Definitions Registry ──────────────────────────────────
//
// Visual design follows badge-design.md:
//   - White card + 3D double-layer flat-top hexagon
//   - 4 adaptive colors: green / orange / purple / gray (locked)
//   - White filled icon centered in hexagon
//   - Bold name + "Level X" / "Locked" label below
//
// Color mapping:
//   green  → consistency, focus, presentation (growth / steady habits)
//   orange → pace, fluency, improvement     (energy / skill mastery)
//   purple → interview, elite               (premium / high achievement)
//   gray   → locked / unavailable

// ── Color palette ──────────────────────────────────────────────
export const BADGE_COLORS = {
  green: {
    name: "Green",
    top: "#4caf1e",
    bottom: "#2e7d00",
    shadow: "#a0c060",
    bg: "bg-[#4caf1e]",
    text: "text-[#2e7d00]",
    soft: "bg-green-50",
  },
  orange: {
    name: "Orange",
    top: "#f5a623",
    bottom: "#c47d00",
    shadow: "#e8c880",
    bg: "bg-[#f5a623]",
    text: "text-[#c47d00]",
    soft: "bg-amber-50",
  },
  purple: {
    name: "Purple",
    top: "#9b59f5",
    bottom: "#6a25d0",
    shadow: "#c0a0f0",
    bg: "bg-[#9b59f5]",
    text: "text-[#6a25d0]",
    soft: "bg-purple-50",
  },
  gray: {
    name: "Gray",
    top: "#888888",
    bottom: "#555555",
    shadow: "#c0c0c0",
    bg: "bg-[#888888]",
    text: "text-[#555555]",
    soft: "bg-slate-50",
  },
};

// ── Category → color mapping ───────────────────────────────────
const CAT_COLOR = {
  consistency: "green",
  focus: "green",
  presentation: "green",
  pace: "orange",
  fluency: "orange",
  improvement: "orange",
  interview: "purple",
  elite: "purple",
};

// ── Badge definitions ──────────────────────────────────────────
export const BADGE_DEFINITIONS = [
  // ═══════════════════════════════════════════════════════════
  // CONSISTENCY — green
  // ═══════════════════════════════════════════════════════════
  {
    id: "first-step",
    name: "First Step",
    description: "Complete your very first practice session",
    icon: "Footprints",
    category: "consistency",
    level: 1,
    color: "green",
    condition: (ctx) => ctx.totalSessions >= 1,
    progress: (ctx) => ({
      current: Math.min(ctx.totalSessions, 1),
      target: 1,
    }),
  },
  {
    id: "on-a-roll",
    name: "On a Roll",
    description: "Practice 3 days in a row",
    icon: "Flame",
    category: "consistency",
    level: 2,
    color: "green",
    condition: (ctx) => ctx.consecutiveDays >= 3,
    progress: (ctx) => ({
      current: Math.min(ctx.consecutiveDays, 3),
      target: 3,
    }),
  },
  {
    id: "weekly-warrior",
    name: "Weekly Warrior",
    description: "Practice 7 consecutive days",
    icon: "CalendarCheck",
    category: "consistency",
    level: 3,
    color: "green",
    condition: (ctx) => ctx.consecutiveDays >= 7,
    progress: (ctx) => ({
      current: Math.min(ctx.consecutiveDays, 7),
      target: 7,
    }),
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "Practice 30 consecutive days",
    icon: "Zap",
    category: "consistency",
    level: 4,
    color: "green",
    condition: (ctx) => ctx.consecutiveDays >= 30,
    progress: (ctx) => ({
      current: Math.min(ctx.consecutiveDays, 30),
      target: 30,
    }),
  },

  // ═══════════════════════════════════════════════════════════
  // FOCUS — green
  // ═══════════════════════════════════════════════════════════
  {
    id: "focused-speaker",
    name: "Focused Speaker",
    description: "Keep distracted time under 10% in a session",
    icon: "Eye",
    category: "focus",
    level: 1,
    color: "green",
    condition: (ctx) => {
      const s = ctx.currentSession;
      if (!s) return false;
      const pct =
        (s.analytics.distractedDurationSeconds /
          s.analytics.sessionDurationSeconds) *
        100;
      return pct < 10;
    },
    progress: (ctx) => {
      const s = ctx.currentSession;
      if (!s) return { current: 0, target: 10 };
      const pct =
        (s.analytics.distractedDurationSeconds /
          s.analytics.sessionDurationSeconds) *
        100;
      return { current: Math.round(Math.max(0, 10 - pct)), target: 10 };
    },
  },
  {
    id: "laser-focus",
    name: "Laser Focus",
    description: "Keep distracted time under 5% in a session",
    icon: "Crosshair",
    category: "focus",
    level: 2,
    color: "green",
    condition: (ctx) => {
      const s = ctx.currentSession;
      if (!s) return false;
      const pct =
        (s.analytics.distractedDurationSeconds /
          s.analytics.sessionDurationSeconds) *
        100;
      return pct < 5;
    },
    progress: (ctx) => {
      const s = ctx.currentSession;
      if (!s) return { current: 0, target: 100 };
      const pct =
        (s.analytics.distractedDurationSeconds /
          s.analytics.sessionDurationSeconds) *
        100;
      return { current: Math.round(Math.max(0, 5 - pct) * 20), target: 100 };
    },
  },
  {
    id: "iron-mind",
    name: "Iron Mind",
    description: "Keep distracted time under 2% in a session",
    icon: "Brain",
    category: "focus",
    level: 3,
    color: "green",
    condition: (ctx) => {
      const s = ctx.currentSession;
      if (!s) return false;
      const pct =
        (s.analytics.distractedDurationSeconds /
          s.analytics.sessionDurationSeconds) *
        100;
      return pct < 2;
    },
    progress: (ctx) => {
      const s = ctx.currentSession;
      if (!s) return { current: 0, target: 100 };
      const pct =
        (s.analytics.distractedDurationSeconds /
          s.analytics.sessionDurationSeconds) *
        100;
      return { current: Math.round(Math.max(0, 2 - pct) * 50), target: 100 };
    },
  },
  {
    id: "unshakeable",
    name: "Unshakeable",
    description: "Complete a hard-mode session with under 3% distracted time",
    icon: "Shield",
    category: "focus",
    level: 4,
    color: "green",
    condition: (ctx) => {
      const s = ctx.currentSession;
      if (!s || s.distractionLevel !== "hard") return false;
      const pct =
        (s.analytics.distractedDurationSeconds /
          s.analytics.sessionDurationSeconds) *
        100;
      return pct < 3;
    },
    progress: (ctx) => {
      const hardSessions = ctx.sessionHistory.filter(
        (s) => s.distractionLevel === "hard"
      );
      const qualified = hardSessions.filter((s) => {
        const pct =
          (s.analytics.distractedDurationSeconds /
            s.analytics.sessionDurationSeconds) *
          100;
        return pct < 3;
      });
      return { current: qualified.length, target: 1 };
    },
  },

  // ═══════════════════════════════════════════════════════════
  // FLUENCY — orange
  // ═══════════════════════════════════════════════════════════
  {
    id: "smooth-talker",
    name: "Smooth Talker",
    description: "Keep filler words under 5 per 100 words",
    icon: "MessageCircle",
    category: "fluency",
    level: 1,
    color: "orange",
    condition: (ctx) => {
      const s = ctx.currentSession;
      if (!s || !s.analytics.totalWords) return false;
      const rate =
        (s.analytics.fillerWordCount / s.analytics.totalWords) * 100;
      return rate < 5;
    },
    progress: (ctx) => {
      const s = ctx.currentSession;
      if (!s || !s.analytics.totalWords)
        return { current: 0, target: 5 };
      const rate =
        (s.analytics.fillerWordCount / s.analytics.totalWords) * 100;
      return { current: Math.round(Math.max(0, 5 - rate)), target: 5 };
    },
  },
  {
    id: "fluent-speaker",
    name: "Fluent Speaker",
    description: "Keep filler words under 3 per 100 words",
    icon: "Mic",
    category: "fluency",
    level: 2,
    color: "orange",
    condition: (ctx) => {
      const s = ctx.currentSession;
      if (!s || !s.analytics.totalWords) return false;
      const rate =
        (s.analytics.fillerWordCount / s.analytics.totalWords) * 100;
      return rate < 3;
    },
    progress: (ctx) => {
      const s = ctx.currentSession;
      if (!s || !s.analytics.totalWords)
        return { current: 0, target: 100 };
      const rate =
        (s.analytics.fillerWordCount / s.analytics.totalWords) * 100;
      return {
        current: Math.round(Math.max(0, 3 - rate) * 33.3),
        target: 100,
      };
    },
  },
  {
    id: "crystal-clear",
    name: "Crystal Clear",
    description: "Keep filler words under 1 per 100 words",
    icon: "Sparkles",
    category: "fluency",
    level: 3,
    color: "orange",
    condition: (ctx) => {
      const s = ctx.currentSession;
      if (!s || !s.analytics.totalWords) return false;
      const rate =
        (s.analytics.fillerWordCount / s.analytics.totalWords) * 100;
      return rate < 1;
    },
    progress: (ctx) => {
      const s = ctx.currentSession;
      if (!s || !s.analytics.totalWords)
        return { current: 0, target: 100 };
      const rate =
        (s.analytics.fillerWordCount / s.analytics.totalWords) * 100;
      return {
        current: Math.round(Math.max(0, 1 - rate) * 100),
        target: 100,
      };
    },
  },

  // ═══════════════════════════════════════════════════════════
  // PACE — orange
  // ═══════════════════════════════════════════════════════════
  {
    id: "perfect-pace",
    name: "Perfect Pace",
    description: "Speak at 120–160 WPM for 3 consecutive sessions",
    icon: "Gauge",
    category: "pace",
    level: 1,
    color: "orange",
    condition: (ctx) => {
      const recent = ctx.sessionHistory.slice(0, 3);
      if (recent.length < 3) return false;
      return recent.every(
        (s) => s.analytics.averageWPM >= 120 && s.analytics.averageWPM <= 160
      );
    },
    progress: (ctx) => {
      const recent = ctx.sessionHistory.slice(0, 3);
      const inRange = recent.filter(
        (s) => s.analytics.averageWPM >= 120 && s.analytics.averageWPM <= 160
      );
      return { current: inRange.length, target: 3 };
    },
  },
  {
    id: "consistent-rhythm",
    name: "Consistent Rhythm",
    description: "Achieve pace score above 90 for 5 sessions",
    icon: "AudioLines",
    category: "pace",
    level: 2,
    color: "orange",
    condition: (ctx) => {
      return ctx.sessionsWithPaceAbove(90) >= 5;
    },
    progress: (ctx) => ({
      current: Math.min(ctx.sessionsWithPaceAbove(90), 5),
      target: 5,
    }),
  },

  // ═══════════════════════════════════════════════════════════
  // PRESENTATION — green
  // ═══════════════════════════════════════════════════════════
  {
    id: "1min-speaker",
    name: "1-Minute Speaker",
    description: "Complete a 1-minute presentation",
    icon: "Timer",
    category: "presentation",
    level: 1,
    color: "green",
    condition: (ctx) => {
      return ctx.presentationsOfDuration(1) >= 1;
    },
    progress: (ctx) => ({
      current: Math.min(ctx.presentationsOfDuration(1), 1),
      target: 1,
    }),
  },
  {
    id: "5min-speaker",
    name: "5-Minute Speaker",
    description: "Complete a 5-minute presentation",
    icon: "Clock",
    category: "presentation",
    level: 2,
    color: "green",
    condition: (ctx) => {
      return ctx.presentationsOfDuration(5) >= 1;
    },
    progress: (ctx) => ({
      current: Math.min(ctx.presentationsOfDuration(5), 1),
      target: 1,
    }),
  },
  {
    id: "15min-speaker",
    name: "15-Minute Speaker",
    description: "Complete a 15-minute presentation",
    icon: "Hourglass",
    category: "presentation",
    level: 3,
    color: "green",
    condition: (ctx) => {
      return ctx.presentationsOfDuration(15) >= 1;
    },
    progress: (ctx) => ({
      current: Math.min(ctx.presentationsOfDuration(15), 1),
      target: 1,
    }),
  },
  {
    id: "marathon-presenter",
    name: "Marathon Presenter",
    description: "Complete ten 15-minute presentations",
    icon: "Medal",
    category: "presentation",
    level: 4,
    color: "green",
    condition: (ctx) => {
      return ctx.presentationsOfDuration(15) >= 10;
    },
    progress: (ctx) => ({
      current: Math.min(ctx.presentationsOfDuration(15), 10),
      target: 10,
    }),
  },

  // ═══════════════════════════════════════════════════════════
  // INTERVIEW — purple
  // ═══════════════════════════════════════════════════════════
  {
    id: "first-interview",
    name: "First Interview",
    description: "Complete your first interview session",
    icon: "Briefcase",
    category: "interview",
    level: 1,
    color: "purple",
    condition: (ctx) => ctx.interviewCount >= 1,
    progress: (ctx) => ({
      current: Math.min(ctx.interviewCount, 1),
      target: 1,
    }),
  },
  {
    id: "job-seeker",
    name: "Job Seeker",
    description: "Complete 10 interview sessions",
    icon: "Search",
    category: "interview",
    level: 2,
    color: "purple",
    condition: (ctx) => ctx.interviewCount >= 10,
    progress: (ctx) => ({
      current: Math.min(ctx.interviewCount, 10),
      target: 10,
    }),
  },
  {
    id: "technical-challenger",
    name: "Technical Challenger",
    description: "Complete a technical interview session",
    icon: "Code2",
    category: "interview",
    level: 3,
    color: "purple",
    condition: (ctx) => {
      return ctx.sessionHistory.some(
        (s) => s.mode === "interview" && s.interviewType === "technical"
      );
    },
    progress: (ctx) => {
      const tech = ctx.sessionHistory.filter(
        (s) => s.mode === "interview" && s.interviewType === "technical"
      );
      return { current: Math.min(tech.length, 1), target: 1 };
    },
  },
  {
    id: "hr-ready",
    name: "HR Ready",
    description: "Score above 85 on a behavioral interview",
    icon: "Users",
    category: "interview",
    level: 2,
    color: "purple",
    condition: (ctx) => {
      return ctx.sessionHistory.some(
        (s) =>
          s.mode === "interview" &&
          s.interviewType === "behavioral" &&
          s.overallScore > 85
      );
    },
    progress: (ctx) => {
      const behavioral = ctx.sessionHistory.filter(
        (s) => s.mode === "interview" && s.interviewType === "behavioral"
      );
      const best = behavioral.reduce(
        (max, s) => Math.max(max, s.overallScore),
        0
      );
      return { current: Math.min(best, 85), target: 85 };
    },
  },
  {
    id: "case-solver",
    name: "Case Solver",
    description: "Score above 85 on a situational interview",
    icon: "Puzzle",
    category: "interview",
    level: 2,
    color: "purple",
    condition: (ctx) => {
      return ctx.sessionHistory.some(
        (s) =>
          s.mode === "interview" &&
          s.interviewType === "situational" &&
          s.overallScore > 85
      );
    },
    progress: (ctx) => {
      const sit = ctx.sessionHistory.filter(
        (s) => s.mode === "interview" && s.interviewType === "situational"
      );
      const best = sit.reduce((max, s) => Math.max(max, s.overallScore), 0);
      return { current: Math.min(best, 85), target: 85 };
    },
  },

  // ═══════════════════════════════════════════════════════════
  // IMPROVEMENT — orange
  // ═══════════════════════════════════════════════════════════
  {
    id: "getting-better",
    name: "Getting Better",
    description: "Improve your overall score by 10 points from last session",
    icon: "TrendingUp",
    category: "improvement",
    level: 1,
    color: "orange",
    condition: (ctx) => {
      if (!ctx.previousSession) return false;
      return (
        ctx.currentSession.overallScore - ctx.previousSession.overallScore >= 10
      );
    },
    progress: (ctx) => {
      if (!ctx.previousSession) return { current: 0, target: 10 };
      const delta =
        ctx.currentSession.overallScore - ctx.previousSession.overallScore;
      return { current: Math.min(Math.max(0, delta), 10), target: 10 };
    },
  },
  {
    id: "breakthrough",
    name: "Breakthrough",
    description: "Improve your overall score by 20 points from last session",
    icon: "Rocket",
    category: "improvement",
    level: 2,
    color: "orange",
    condition: (ctx) => {
      if (!ctx.previousSession) return false;
      return (
        ctx.currentSession.overallScore - ctx.previousSession.overallScore >= 20
      );
    },
    progress: (ctx) => {
      if (!ctx.previousSession) return { current: 0, target: 20 };
      const delta =
        ctx.currentSession.overallScore - ctx.previousSession.overallScore;
      return { current: Math.min(Math.max(0, delta), 20), target: 20 };
    },
  },
  {
    id: "comeback",
    name: "Comeback",
    description: "Bounce back from below 60 to above 80 in the next session",
    icon: "Heart",
    category: "improvement",
    level: 3,
    color: "orange",
    condition: (ctx) => {
      if (!ctx.previousSession) return false;
      return (
        ctx.previousSession.overallScore < 60 &&
        ctx.currentSession.overallScore > 80
      );
    },
    progress: (ctx) => {
      if (!ctx.previousSession) return { current: 0, target: 80 };
      if (ctx.previousSession.overallScore >= 60)
        return { current: 0, target: 0 };
      return {
        current: Math.min(ctx.currentSession.overallScore, 80),
        target: 80,
      };
    },
  },

  // ═══════════════════════════════════════════════════════════
  // ELITE — purple
  // ═══════════════════════════════════════════════════════════
  {
    id: "presentation-master",
    name: "Presentation Master",
    description: "Score above 90 on a 15-minute presentation",
    icon: "Trophy",
    category: "elite",
    level: 4,
    color: "purple",
    condition: (ctx) => {
      const long = ctx.sessionHistory.filter(
        (s) =>
          s.mode === "presentation" &&
          s.duration >= 840 &&
          s.duration <= 960
      );
      return long.some((s) => s.overallScore > 90);
    },
    progress: (ctx) => {
      const long = ctx.sessionHistory.filter(
        (s) =>
          s.mode === "presentation" &&
          s.duration >= 840 &&
          s.duration <= 960
      );
      const best = long.reduce((max, s) => Math.max(max, s.overallScore), 0);
      return { current: Math.min(best, 90), target: 90 };
    },
  },
  {
    id: "interview-master",
    name: "Interview Master",
    description: "Score above 90 on any interview session",
    icon: "Award",
    category: "elite",
    level: 4,
    color: "purple",
    condition: (ctx) => {
      return ctx.sessionHistory.some(
        (s) => s.mode === "interview" && s.overallScore > 90
      );
    },
    progress: (ctx) => {
      const interviews = ctx.sessionHistory.filter(
        (s) => s.mode === "interview"
      );
      const best = interviews.reduce(
        (max, s) => Math.max(max, s.overallScore),
        0
      );
      return { current: Math.min(best, 90), target: 90 };
    },
  },
  {
    id: "distraction-master",
    name: "Distraction Master",
    description: "Score above 95 focus on hard-mode",
    icon: "Swords",
    category: "elite",
    level: 4,
    color: "purple",
    condition: (ctx) => {
      return ctx.sessionHistory.some(
        (s) =>
          s.distractionLevel === "hard" && s.breakdown.focus > 95
      );
    },
    progress: (ctx) => {
      const hard = ctx.sessionHistory.filter(
        (s) => s.distractionLevel === "hard"
      );
      const best = hard.reduce(
        (max, s) => Math.max(max, s.breakdown.focus),
        0
      );
      return { current: Math.min(best, 95), target: 95 };
    },
  },
  {
    id: "communication-expert",
    name: "Communication Expert",
    description: "Score above 90 in all four skills within a single session",
    icon: "Crown",
    category: "elite",
    level: 5,
    color: "purple",
    condition: (ctx) => {
      const b = ctx.currentSession?.breakdown;
      if (!b) return false;
      return b.focus > 90 && b.pace > 90 && b.filler > 90 && b.efficiency > 90;
    },
    progress: (ctx) => {
      const b = ctx.currentSession?.breakdown;
      if (!b) return { current: 0, target: 4 };
      const above = [
        b.focus > 90,
        b.pace > 90,
        b.filler > 90,
        b.efficiency > 90,
      ].filter(Boolean).length;
      return { current: above, target: 4 };
    },
  },
];

// ── Category metadata ──────────────────────────────────────────
export const CATEGORY_META = {
  consistency: {
    label: "Consistency",
    icon: "Calendar",
    color: "green",
    description: "Building habits, one session at a time",
  },
  focus: {
    label: "Focus",
    icon: "Crosshair",
    color: "green",
    description: "Resisting distractions like a pro",
  },
  fluency: {
    label: "Fluency",
    icon: "Mic",
    color: "orange",
    description: "Speaking smooth, clear, and confident",
  },
  pace: {
    label: "Speaking Pace",
    icon: "Gauge",
    color: "orange",
    description: "Finding your perfect rhythm",
  },
  presentation: {
    label: "Presentation",
    icon: "MonitorPlay",
    color: "green",
    description: "Commanding the stage",
  },
  interview: {
    label: "Interview",
    icon: "Briefcase",
    color: "purple",
    description: "Nailing every question",
  },
  improvement: {
    label: "Improvement",
    icon: "TrendingUp",
    color: "orange",
    description: "Growth through deliberate practice",
  },
  elite: {
    label: "Elite",
    icon: "Crown",
    color: "purple",
    description: "The pinnacle of speaking mastery",
  },
};

// ── Helpers ────────────────────────────────────────────────────
export function getBadgeById(id) {
  return BADGE_DEFINITIONS.find((b) => b.id === id);
}

export function getBadgesByCategory(category) {
  return BADGE_DEFINITIONS.filter((b) => b.category === category);
}

export function getBadgeColor(badge) {
  return BADGE_COLORS[badge.color] || BADGE_COLORS.green;
}
