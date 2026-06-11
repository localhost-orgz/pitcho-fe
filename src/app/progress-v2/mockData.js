// ── Mock data matching the Progress page data contract ──────
// Replace with real backend data when available

const TODAY = new Date();

function daysAgo(n) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function formatDate(n) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Generate 24 realistic sessions spanning ~3 months
function generateSessions() {
  const modes = ["presentation", "presentation", "presentation", "interview"]; // weighted
  const topics = [
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

  const sessions = [];
  // Generate sessions going back ~90 days with some gaps (not every day)
  const daysWithSessions = [
    0, 1, 2, 4, 5, 7, 9, 10, 12, 14, 16, 17, 19, 21, 24, 25, 27, 30, 33, 37, 42, 48, 55, 65
  ];

  daysWithSessions.forEach((daysBack, idx) => {
    const mode = modes[idx % modes.length];
    const isPresentation = mode === "presentation";

    // Scores generally improve over time (earlier = lower, later = higher)
    const progress = idx / (daysWithSessions.length - 1); // 0 to 1
    const baseScore = 55 + Math.round(progress * 35); // 55 to 90
    const noise = Math.round((Math.random() - 0.5) * 16); // -8 to +8
    const overallScore = Math.min(100, Math.max(40, baseScore + noise));

    // Sub-scores with similar improvement trend
    const focusBase = 50 + Math.round(progress * 42) + Math.round((Math.random() - 0.5) * 14);
    const paceBase = 55 + Math.round(progress * 25) + Math.round((Math.random() - 0.5) * 12);
    const fillerBase = 40 + Math.round(progress * 40) + Math.round((Math.random() - 0.5) * 18);
    const efficiencyBase = 48 + Math.round(progress * 35) + Math.round((Math.random() - 0.5) * 14);

    const scores = {
      focus: Math.min(100, Math.max(25, focusBase)),
      pace: Math.min(100, Math.max(30, paceBase)),
      filler: Math.min(100, Math.max(20, fillerBase)),
      efficiency: Math.min(100, Math.max(25, efficiencyBase)),
    };

    const duration = isPresentation ? [180, 300, 600, 300, 420][idx % 5] : [600, 900, 720, 480, 540][idx % 5];
    const wordCount = isPresentation
      ? Math.round(duration * 2.2 + (Math.random() - 0.5) * 100)
      : Math.round(duration * 1.8 + (Math.random() - 0.5) * 80);

    // Generate filler words matching the filler score
    const fillerRate = Math.max(0, (100 - scores.filler) / 100 * 0.12); // 0-12% filler rate
    const fillerCount = Math.round(wordCount * fillerRate);
    const fillerWords = [];
    const fillerOptions = ["um", "uh", "like", "you know", "I mean", "sort of", "kind of", "actually", "basically", "literally"];
    for (let i = 0; i < Math.min(fillerCount, 20); i++) {
      fillerWords.push({
        word: fillerOptions[i % fillerOptions.length],
        timestamp: Math.round(Math.random() * duration),
      });
    }

    // Look-away events — fewer as focus improves
    const lookAwayCount = Math.max(0, Math.round((100 - scores.focus) / 100 * 8) + Math.round((Math.random() - 0.5) * 2));
    const lookAwayEvents = [];
    for (let i = 0; i < lookAwayCount; i++) {
      lookAwayEvents.push({
        timestamp: Math.round(Math.random() * duration),
        type: Math.random() > 0.5 ? "head" : "eye",
        duration: parseFloat((Math.random() * 3 + 0.5).toFixed(1)),
      });
    }

    sessions.push({
      id: `sess_${String(idx).padStart(3, "0")}`,
      date: daysAgo(daysBack),
      formattedDate: formatDate(daysBack),
      mode,
      overallScore,
      scores,
      duration,
      wordCount,
      averageWpm: Math.round(110 + Math.random() * 60),
      fillerWords,
      lookAwayEvents,
      totalDistractedTime: lookAwayEvents.reduce((sum, e) => sum + e.duration, 0),
      transcript: isPresentation
        ? "Thank you all for joining today. I want to walk you through our latest product metrics and share some exciting updates... The key takeaway here is that we've seen a 40% increase in user engagement since the last quarter. Looking at the data, we can identify three main drivers of this growth. First, our new onboarding flow has reduced drop-off by 25%. Second, the referral program has brought in 1,200 new users. And third, our content marketing efforts are finally paying dividends. I'd like to open the floor for questions now."
        : "I believe my experience aligns well with this role. In my previous position, I led a team of five engineers through a complete platform migration... One of the challenges we faced was managing stakeholder expectations while maintaining sprint velocity. I implemented a bi-weekly demo cadence that kept everyone aligned. The result was a successful migration completed two weeks ahead of schedule with zero production incidents.",
      topic: topics[idx % topics.length],
    });
  });

  return sessions;
}

const SESSIONS = generateSessions();

// Compute derived data from sessions
function computeMockData() {
  const sessions = SESSIONS;
  const latest = sessions[0];
  const first = sessions[sessions.length - 1];

  const overallImprovement = first
    ? Math.round(((latest.overallScore - first.overallScore) / Math.max(first.overallScore, 1)) * 100)
    : 0;

  // Average scores from last 5 sessions
  const recent5 = sessions.slice(0, 5);
  const avgScores = {
    focus: Math.round(recent5.reduce((s, r) => s + r.scores.focus, 0) / recent5.length),
    pace: Math.round(recent5.reduce((s, r) => s + r.scores.pace, 0) / recent5.length),
    filler: Math.round(recent5.reduce((s, r) => s + r.scores.filler, 0) / recent5.length),
    efficiency: Math.round(recent5.reduce((s, r) => s + r.scores.efficiency, 0) / recent5.length),
  };

  // Starting scores from first 5 sessions
  const first5 = sessions.slice(-5);
  const startingScores = {
    focus: Math.round(first5.reduce((s, r) => s + r.scores.focus, 0) / first5.length),
    pace: Math.round(first5.reduce((s, r) => s + r.scores.pace, 0) / first5.length),
    filler: Math.round(first5.reduce((s, r) => s + r.scores.filler, 0) / first5.length),
    efficiency: Math.round(first5.reduce((s, r) => s + r.scores.efficiency, 0) / first5.length),
  };

  // Trend arrays for sparklines (last 10 sessions, oldest first)
  const recent10 = sessions.slice(0, 10).reverse();
  const trends = {
    focus: recent10.map(s => s.scores.focus),
    pace: recent10.map(s => s.scores.pace),
    filler: recent10.map(s => s.scores.filler),
    efficiency: recent10.map(s => s.scores.efficiency),
  };

  // Per-skill improvement
  const skillImprovement = {
    focus: Math.round(((avgScores.focus - startingScores.focus) / Math.max(startingScores.focus, 1)) * 100),
    pace: Math.round(((avgScores.pace - startingScores.pace) / Math.max(startingScores.pace, 1)) * 100),
    filler: Math.round(((avgScores.filler - startingScores.filler) / Math.max(startingScores.filler, 1)) * 100),
    efficiency: Math.round(((avgScores.efficiency - startingScores.efficiency) / Math.max(startingScores.efficiency, 1)) * 100),
  };

  // Session dates for heatmap (current month)
  const currentMonth = TODAY.getMonth();
  const currentYear = TODAY.getFullYear();
  const heatmapData = {};
  sessions.forEach(s => {
    const d = new Date(s.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      heatmapData[d.getDate()] = (heatmapData[d.getDate()] || 0) + 1;
    }
  });

  // Weakest skill
  const skillEntries = Object.entries(avgScores);
  skillEntries.sort((a, b) => a[1] - b[1]);
  const weakestSkill = skillEntries[0][0];

  // Badges
  const badges = [
    { id: "smooth", label: "Smooth Speaker", desc: "Speak with minimal filler words", icon: "Mic", color: "purple", unlocked: true, unlockedDate: "2026-05-10", criteria: "Achieve filler score ≥ 90 in 3+ sessions" },
    { id: "eye", label: "Eye Contact Pro", desc: "Maintain 80%+ eye contact", icon: "Eye", color: "emerald", unlocked: true, unlockedDate: "2026-04-22", criteria: "Achieve focus score ≥ 80 in 5+ sessions" },
    { id: "focus", label: "Focus Keeper", desc: "Complete drills under distraction", icon: "Flame", color: "amber", unlocked: true, unlockedDate: "2026-06-02", criteria: "Complete 10 sessions with medium+ distraction" },
    { id: "learner", label: "Consistent Learner", desc: "Practice 5 days in a row", icon: "Calendar", color: "sky", unlocked: true, unlockedDate: "2026-03-15", criteria: "Maintain a 5-day streak" },
    { id: "clear", label: "Clear Communicator", desc: "Deliver optimal speaking pace", icon: "AudioLines", color: "indigo", unlocked: true, unlockedDate: "2026-05-28", criteria: "Achieve pace score ≥ 85 in 5+ sessions" },
    { id: "survivor", label: "Distraction Survivor", desc: "Survive high-intensity distractions", icon: "Shield", color: "rose", unlocked: false, progress: { current: 4, target: 10 }, criteria: "Complete 10 sessions with high distraction" },
    { id: "master", label: "High Pressure Master", desc: "Score 85+ under high noise", icon: "Zap", color: "orange", unlocked: false, progress: { current: 2, target: 5 }, criteria: "Score ≥ 85 in 5 high-distraction sessions" },
    { id: "story", label: "Storyteller", desc: "Use storytelling in practice", icon: "BookOpen", color: "teal", unlocked: false, progress: { current: 1, target: 5 }, criteria: "Complete 5 storytelling-focused sessions" },
    { id: "confident", label: "Confident Speaker", desc: "Reach 90%+ overall score", icon: "Smile", color: "pink", unlocked: false, progress: { current: 2, target: 5 }, criteria: "Score ≥ 90 in 5 sessions" },
    { id: "ace", label: "Presentation Ace", desc: "Complete 50 total sessions", icon: "Trophy", color: "yellow", unlocked: false, progress: { current: 24, target: 50 }, criteria: "Complete 50 presentation sessions" },
  ];

  // Focus area tips by skill
  const tipsMap = {
    focus: [
      "Try practicing in shorter bursts (3-5 min) to build eye-contact endurance gradually.",
      "Place a small sticker or dot near your camera as a focal point reminder.",
      "Practice in front of a mirror for 2 minutes daily — it builds self-awareness.",
    ],
    pace: [
      "Aim for 120-160 WPM. Record a 2-minute speech and count your words to check.",
      "If you speak too fast, try the 'pause and breathe' method — pause for 2 seconds between sentences.",
      "Use a metronome app set to 140 BPM while practicing to internalize ideal pace.",
    ],
    filler: [
      "Replace 'um' with silence — a 1-second pause sounds more confident than a filler word.",
      "Record yourself speaking for 3 minutes, then count every filler word. Awareness is the first step.",
      "Practice the '3-second rule': when you feel an 'um' coming, pause, breathe for 3 seconds, then continue.",
    ],
    efficiency: [
      "Before each practice, write down your 3 key points. Stick to them — avoid tangents.",
      "Record and transcribe a session. Highlight sentences that can be said in fewer words.",
      "Try the 'elevator pitch' exercise: explain your topic in 30 seconds, then 15, then 8.",
    ],
  };

  // Overall grade
  const overallAvg = Math.round(recent5.reduce((s, r) => s + r.overallScore, 0) / recent5.length);
  let grade;
  if (overallAvg >= 90) grade = "A";
  else if (overallAvg >= 80) grade = "B";
  else if (overallAvg >= 70) grade = "C";
  else if (overallAvg >= 60) grade = "D";
  else grade = "F";

  return {
    summary: {
      overallScore: overallAvg,
      grade,
      totalSessions: sessions.length,
      totalPracticeMinutes: Math.round(sessions.reduce((s, r) => s + r.duration, 0) / 60),
      firstSessionDate: first?.date || TODAY.toISOString(),
    },
    growth: {
      overallImprovement,
      trendDirection: overallImprovement >= 5 ? "up" : overallImprovement <= -5 ? "down" : "steady",
    },
    level: { current: 12, title: "Focused Communicator", xp: 820, xpToNext: 1200 },
    streak: { current: 12, best: 21, practicedToday: true },
    skills: {
      focus:    { current: avgScores.focus, starting: startingScores.focus, trend: trends.focus, improvement: skillImprovement.focus },
      pace:     { current: avgScores.pace, starting: startingScores.pace, trend: trends.pace, improvement: skillImprovement.pace },
      filler:   { current: avgScores.filler, starting: startingScores.filler, trend: trends.filler, improvement: skillImprovement.filler },
      efficiency: { current: avgScores.efficiency, starting: startingScores.efficiency, trend: trends.efficiency, improvement: skillImprovement.efficiency },
    },
    sessions,
    heatmapData,
    currentMonth,
    currentYear,
    badges,
    focusArea: {
      weakestSkill,
      tips: tipsMap[weakestSkill],
    },
  };
}

export const MOCK_DATA = computeMockData();
export { SESSIONS };
