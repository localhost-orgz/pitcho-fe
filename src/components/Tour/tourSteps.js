export const TOUR_STEPS = [
  // ── Step 1: Studio — Presentation card ──────────────────────
  {
    id: 0,
    targetSelector: '[data-tour="presentation-card"]',
    page: "/studio",
    icon: "MonitorPlay",
    title: "Start Your First Practice",
    body: "Click the Presentation Mode card to begin. You'll practice public speaking with virtual audiences and real-time feedback.",
    position: "bottom",
  },

  // ── Step 2: Setup — Upload file area (AUTO-WAIT 5s) ───────────────
  {
    id: 1,
    targetSelector: '[data-tour="upload-area"]',
    page: "/presentation/setup",
    icon: "Upload",
    title: "Upload Your Material",
    body: "Drag & drop your PDF file here or click to browse. Pitcho will extract slides and generate AI speaking notes. The system is uploading a demo file — please wait!",
    position: "right",
    waitDuration: 5,
    countdownLabel: "Processing demo upload",
  },

  // ── Step 3: Setup — Camera & mic check ───────────────────────
  {
    id: 2,
    targetSelector: '[data-tour="equipment-check"]',
    page: "/presentation/setup",
    icon: "Camera",
    title: "Check Your Camera & Mic",
    body: "Click \"Allow Access\" to enable your camera and microphone. You can continue without them, but both are recommended for the best experience.",
    position: "right",
  },

  // ── Step 4: Setup — Simulation config ───────────────────────
  {
    id: 3,
    targetSelector: '[data-tour="simulation-config"]',
    page: "/presentation/setup",
    icon: "Settings",
    title: "Set Difficulty & Audience",
    body: "Choose your distraction intensity, audience type, and session duration. Higher difficulty means more interruptions to test your focus.",
    position: "left",
  },

  // ── Step 5: Setup — Start button ───────────────────────────────
  {
    id: 4,
    targetSelector: '[data-tour="start-button"]',
    page: "/presentation/setup",
    icon: "Play",
    title: "Start Your Session",
    body: "Ready? Click the Start Session button to begin your practice. Make sure your file is uploaded and devices are checked first!",
    position: "top",
  },

  // ── Step 6: Session — Eye calibration ───────────────────────
  {
    id: 5,
    targetSelector: '[data-tour~="eye-calibration"]',
    page: "/presentation/session",
    icon: "ScanFace",
    title: "Calibrate Your Eye Tracking",
    body: "Position your face in the camera and click Calibrate Eyes. This locks your baseline so Pitcho can detect when you look away during practice.",
    position: "bottom",
    blockingCondition: true,
    blockingMessage: "Complete eye calibration to continue",
  },

  // ── Step 7: Session — Distractions (AUTO-WAIT 30s) ──────────
  {
    id: 6,
    targetSelector: '[data-tour~="classroom-video"]',
    page: "/presentation/session",
    icon: "Eye",
    title: "Experience Distractions",
    body: "Your session is now live! Practice presenting for 30 seconds. Watch how distractions like coughing and phone usage appear in this video. Keep your eyes on the camera!",
    position: "left",
    waitDuration: 30, // auto-advance after 30 seconds
    countdownLabel: "Session in progress — auto-advancing in",
  },

  // ── Step 8: Session — Cue card panel ────────────────────────
  {
    id: 7,
    targetSelector: '[data-tour="cue-card-panel"]',
    page: "/presentation/session",
    icon: "ScrollText",
    title: "Your Cue Cards Are Here",
    body: "The right sidebar shows your AI-generated speaking notes. Use the arrows to navigate between slides — each one has talking points and a transition sentence.",
    position: "left",
  },

  // ── Step 9: Session — End session button (BLOCKING) ─────────
  {
    id: 8,
    targetSelector: '[data-tour="end-session-btn"]',
    page: "/presentation/session",
    icon: "StopCircle",
    title: "End Your Session",
    body: "When you're done practicing, click the End Session button. Your video and metrics will be saved and you'll be taken to your results page.",
    position: "left",
    blockingCondition: true,
    blockingMessage: "Click End Session to finish your practice",
  },

  // ── Step 10: Result — Score rings ───────────────────────────
  {
    id: 9,
    targetSelector: '[data-tour="score-rings"]',
    page: "/presentation/result",
    icon: "Trophy",
    title: "See Your Score",
    body: "Your overall performance score appears here. Pitcho evaluates your eye contact, filler words, speaking pace, and confidence to give you a comprehensive rating.",
    position: "bottom",
  },

  // ── Step 11: Result — Metrics tabs ──────────────────────────
  {
    id: 10,
    targetSelector: '[data-tour="metrics-tabs"]',
    page: "/presentation/result",
    icon: "ChartNoAxesCombined",
    title: "Explore Your Metrics",
    body: "Switch between tabs to dive into detailed metrics: Eye Contact tracking, Filler Words analysis, Speaking Pace, and AI-powered feedback. Each tab shows actionable insights to improve.",
    position: "top",
  },
];
