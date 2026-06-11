# Pitcho — Product Requirements Document (PRD)
> **Source of truth:** Compiled by direct inspection of the live codebase as of June 2026.  
> Every status, dependency, and gap is derived from actual source files — not design assumptions.

---

## Table of Contents
1. [Product Overview](#1-product-overview)
2. [Architecture Summary](#2-architecture-summary)
3. [Feature: Landing Page](#3-feature-landing-page)
4. [Feature: Studio Dashboard](#4-feature-studio-dashboard)
5. [Feature: Presentation Mode — Setup](#5-feature-presentation-mode--setup)
6. [Feature: Presentation Mode — Session](#6-feature-presentation-mode--session)
7. [Feature: Presentation Mode — Result & Analytics](#7-feature-presentation-mode--result--analytics)
8. [Feature: Interview Mode — Setup](#8-feature-interview-mode--setup)
9. [Feature: Interview Mode — Session](#9-feature-interview-mode--session)
10. [Feature: Progress Dashboard](#10-feature-progress-dashboard)
11. [Feature: Challenges](#11-feature-challenges)
12. [Feature: Resources](#12-feature-resources)
13. [Feature: Try-Session Sandbox](#13-feature-try-session-sandbox)
14. [Cross-Cutting Systems](#14-cross-cutting-systems)
15. [Dependency Map](#15-dependency-map)

---

## 1. Product Overview

Pitcho is a browser-based AI speaking coach that helps users practise and improve public speaking and interview communication. It simulates realistic environments (classroom, audience distractions, interview panel) and provides objective performance feedback through computer-vision eye tracking (MediaPipe), real-time speech recognition (Web Speech API), and backend speech analysis (AssemblyAI via a Vercel-hosted API).

**Primary user goals:**
- Reduce filler words and improve speaking pace.
- Build eye-contact consistency under pressure.
- Prepare for job interviews with CV-tailored AI questions.
- Track improvement over time via XP, streaks, and session history.

---

## 2. Architecture Summary

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, `"use client"` pages) |
| Styling | Tailwind CSS (utility-first, custom `border-bold` class, `bg-main` token = `#0388ff`) |
| Computer Vision | `@mediapipe/tasks-vision` — FaceLandmarker (478-point, GPU delegate) loaded from CDN |
| Speech (live) | Web Speech API (`SpeechRecognition`), language `id-ID` |
| Speech (analysis) | POST audio blob → `https://pitcho-be.vercel.app/api/speech/analyze` |
| Interview AI | POST CV PDF → `https://pitcho-be.vercel.app/api/interview/upload` |
| Session persistence | `localStorage` keys: `pitcho_session_data`, `pitcho_speech_analysis`, `pitcho_setup_config`; video blob stored in IndexedDB via `idb-keyval` |
| State management | React hooks + `useRef`/`useState`; no global store |

---

## 3. Feature: Landing Page

**Route:** `/`  
**File:** `src/app/page.js`

### Purpose
Marketing and onboarding entry point. Communicates product value and guides new users into their first session.

### User Flow
1. User arrives at `/`.
2. Sees an animated hero section with a 3D-style avatar/mascot.
3. Hero text cycles through three animated states driven by buttons labelled *Distracted*, *Confident*, *Focused*.
4. Clicks **Start Practicing** → navigates to `/studio` (the main dashboard).
5. Scrolls to see feature highlights, testimonials, and CTA sections (static content).

### Technical Dependencies
- `useState` to track which animation state is active (`distracted | confident | focused`).
- CSS-driven avatar animation states toggled via class names.
- Next.js `Link` for navigation.

### Current Status
✅ Fully implemented as a static/animated marketing page.  
The animation trigger buttons and avatar states are functional.

### Missing Functionality
- No user authentication — any state (streak, XP) is anonymous and device-local.
- No A/B testing or analytics instrumentation on CTAs.
- "Testimonials" and feature-highlight sections are hardcoded static content with placeholder images.

---

## 4. Feature: Studio Dashboard

**Route:** `/studio`  
**File:** `src/app/studio/page.js`

### Purpose
Central hub after login. Surfaces quick-start actions for both practice modes, a summary of recent speaking performance, and motivational progress widgets.

### User Flow
1. User lands on `/studio` (linked from sidebar navigation or landing page CTA).
2. Sees personalized welcome banner (hardcoded name "Faza").
3. Sees two mode cards: **Presentation Mode** (→ `/presentation/setup`) and **Interview Mode** (→ `/interview/setup`).
4. Reviews **Your Speaking Summary** — three metric tiles (Eye Contact %, Filler Words, Speaking Pace) each with a mini sparkline chart.
5. Browses **Recent Sessions** carousel — 5 hardcoded sessions with scores, topics, dates, and short feedback; navigable via left/right chevrons and dot indicators.
6. Desktop sidebar shows streak (12 days), goals (5 completed), achievements (8 unlocked) — all hardcoded.

### Technical Dependencies
- `PerformanceCircle` component (SVG arc gauge).
- `MiniLineChart` component (inline SVG sparkline).
- `useState` for carousel index and slide direction.
- `animate-slide-fade-in-left/right` custom Tailwind animation classes.

### Current Status
⚠️ **UI is complete and polished but all data is hardcoded.**  
- Metrics (88% eye contact, 4 filler words, 125 WPM) are static constants.
- Recent sessions are a static array of 5 objects.
- Streak, goals, achievements are hardcoded numbers.

### Missing Functionality
- **Data binding:** All summary metrics should be computed from `localStorage` session history.
- **Dynamic session list:** Recent sessions should be read from persisted session data.
- **User profile:** Welcome banner name is hardcoded as "Faza" — needs user identity source.
- **Achievements system:** Backend or local logic to unlock badges is not yet connected.

---

## 5. Feature: Presentation Mode — Setup

**Route:** `/presentation/setup`  
**File:** `src/app/presentation/setup/page.js`

### Purpose
Configuration wizard before a presentation practice session. Lets the user define what they'll present, choose the simulation environment, and confirm device readiness.

### User Flow
1. User arrives from Studio or sidebar.
2. **Card 1 — Presentation Material:** Upload a PDF (drag-and-drop or click). File is validated (PDF only, max 4MB). Page count is extracted client-side by parsing raw PDF bytes. A `POST /api/presentation/upload` request sends the file to the backend and stores the JSON response in state.
3. **Card 2 — Simulation Environment:** User picks an audience type: *Classroom*, *Boardroom*, *Online Meeting*, or *Custom*. Then picks duration: 5 min, 10 min, 15 min, or custom. Then selects distraction intensity: None → Moderate → High.
4. **Card 3 — Equipment Check:** Camera and microphone permissions are checked. Browser Permissions API is queried on mount. Buttons trigger `getUserMedia` to grant access. Internet connection shown as always-good (static).
5. User clicks **Start Session** → config is persisted to `localStorage` (`pitcho_setup_config`) → navigates to `/presentation/session`.

### Technical Dependencies
- `useCallback`, `useRef`, `useState`, `useEffect`.
- `FileReader` + manual `/Count` regex to parse PDF page count.
- `navigator.mediaDevices.getUserMedia` for camera/mic permission checks.
- `navigator.permissions.query` for passive permission state reading.
- External API: `https://pitcho-be.vercel.app/api/presentation/upload`.
- `localStorage.setItem("pitcho_setup_config", JSON.stringify({...}))`.

### Current Status
✅ Core flow is fully functional.
- File upload and validation work.
- Permission checks work.
- Config persistence works.
- All four environment options render correctly.

### Missing Functionality
- **PDF upload response:** The backend response from `/api/presentation/upload` is stored in state (`setUploadResponse(data)`) but **never actually used** during the session — key points and cue cards in the session page are hardcoded.
- **Custom duration:** The custom duration input field exists but needs validation (min/max enforcement).
- **Distraction scheduler:** The "Distraction Intensity" selection is persisted but the actual scheduling logic in the session page does not read this value to modulate frequency.
- **Simulation preview:** No preview of what the selected audience environment looks like before starting.

---

## 6. Feature: Presentation Mode — Session

**Route:** `/presentation/session`  
**File:** `src/app/presentation/session/page.js`

### Purpose
The core practice runtime. Simulates a presentation environment with a virtual audience, live eye-tracking, speech monitoring, randomized distractions, and session recording.

### User Flow
1. Page loads, reads `pitcho_setup_config` from `localStorage`. Redirects to `/presentation/setup` if missing.
2. **Initialization:** MediaPipe FaceLandmarker model loads from CDN. Camera starts. Audio stream acquired separately for recording.
3. **Calibration overlay** appears: user looks at the camera → "Calibrate Eyes" button activates → 40 frames sampled → baseline gaze ratios computed → overlay dismissed.
4. Session timer starts (hardcoded 10 minutes, configurable via setup but not yet wired).
5. **Main layout:**
   - Left column: `classroom.png` background with live facecam PiP overlay; eye-tracking status badge pulses orange when distracted.
   - Right panel: Cue card tabs (slide content, notes, key points); distraction log sidebar.
6. **Eye Tracking:** `useFaceTracker` hook runs a `requestAnimationFrame` loop calling MediaPipe `detectForVideo`. Deviation from calibrated baseline triggers look-away events after a debounce (1200ms for eye mode, 1500ms for head mode). Events logged with timestamp and duration.
7. **Speech Tracking:** `useSpeechTracker` starts the Web Speech API (`recognition.lang = "id-ID"`). Continuously restarts on silence. Counts words per 20%-segment of session duration. Computes live WPM.
8. **Distraction Engine:** `useDistractionEngine` schedules audio/visual distractions (coughing, phone buzzing, side conversations) based on a configurable interval. Triggered via injected `distractionsRef` array. Plays audio files from `public/`.
9. **Recording:** `MediaRecorder` records the combined video+audio stream to WebM chunks. A separate audio-only recorder captures for backend analysis.
10. **End Session:** User clicks "End Session". `stopTracker()` returns `{ videoBlob, audioBlob }`. `stopListening()` returns final speech stats. Both are persisted to storage. Router pushes to `/presentation/result`.

### Technical Dependencies
- `useFaceTracker` hook (MediaPipe, dual-mode: head / iris tracking).
- `useSpeechTracker` hook (Web Speech API).
- `useDistractionEngine` hook (audio playback scheduler).
- `MediaRecorder` API for video+audio recording.
- `idb-keyval` for IndexedDB video blob storage.
- `localStorage` for session metadata: `pitcho_session_data`, `pitcho_speech_analysis`.
- `sessionStorage.getItem("presentation_configured")` guard check.

### Current Status
✅ Eye tracking (both head-pose and iris modes), calibration, and look-away event logging are fully implemented.  
✅ Speech recognition, segmented WPM, and live feedback work.  
✅ Recording (video + audio-only) is implemented.  
⚠️ **Key content is hardcoded:** Slide key points, notes, and cue cards are static strings, not loaded from the uploaded PDF.

### Missing Functionality
- **PDF content integration:** Cue cards / key points should be generated from the backend response to `/api/presentation/upload`, stored at setup time. Currently all are static text about "remote work."
- **Distraction intensity wiring:** Distraction frequency is not read from `pitcho_setup_config.distractionIntensity`.
- **Session duration wiring:** Timer is hardcoded to 600 seconds, not read from setup config.
- **Slide navigation:** No mechanism to advance between slides from cue card panel.
- **Real-time score HUD:** No live score overlay during the session.
- **"End Session" flow completion:** The End Session button renders but its `onClick` handler needs to be verified as fully wired through to storage and navigation.

---

## 7. Feature: Presentation Mode — Result & Analytics

**Route:** `/presentation/result`  
**File:** `src/app/presentation/result/page.js`

### Purpose
Post-session debrief. Shows computed performance scores, detailed speech analysis from the backend, look-away event timeline, and allows video clip review.

### User Flow
1. Page loads, reads `pitcho_session_data` and `pitcho_speech_analysis` from `localStorage`.
2. Calls `calculateSessionScore(sessionData, analysisData)` from `src/utils/scoring.js`.
3. Displays:
   - **Overall Score** (weighted composite, 0–100, with color-coded grade label).
   - **Score Breakdown:** Four sub-score tiles (Focus, Pace, Filler, Efficiency) with progress arcs.
   - **Speech Analysis Detail:** Filler words list with timestamps, redundant phrases (word efficiency), full transcript.
   - **Eye Contact Timeline:** Chronological list of look-away events with type and duration.
   - **Session Recording Playback:** Video loaded from IndexedDB blob URL. Clicking a look-away event timestamp seeks the video to that moment.
4. A "Redo Session" button returns to `/presentation/setup`.
5. XP award is displayed (hardcoded logic) and a share/export CTA (static).

### Technical Dependencies
- `calculateSessionScore()` from `src/utils/scoring.js`.
- `localStorage.getItem("pitcho_session_data")` → `{ sessionDuration, totalWordCount, averageWpm, totalDistractedTime, lookAwayEvents, speechSegments }`.
- `localStorage.getItem("pitcho_speech_analysis")` → `{ analysis: { filler_words: { total_filler_count, instances }, word_efficiency: { findings } } }`.
- IndexedDB (`idb-keyval`) for video blob retrieval.
- `PerformanceCircle` component for arc gauges.

### Current Status
✅ Scoring engine (`scoring.js`) is fully implemented with documented weights.  
✅ Result page correctly reads from both `localStorage` keys and renders conditionally.  
✅ Video playback with timeline-seek is implemented.  
⚠️ If `pitcho_speech_analysis` is `null` (backend failed or audio unavailable), filler and efficiency scores fall back gracefully to 100.

### Missing Functionality
- **XP persistence:** XP earned from the result page is shown in the UI but not written to any persistent store (no connection to Progress or Studio XP counter).
- **Session history:** Sessions are not appended to a list — each session overwrites the same `localStorage` key; no multi-session history is maintained.
- **Share / Export:** Buttons exist but have no `onClick` implementation.
- **Recommendations engine:** "Tips for improvement" section is rendered but content is hardcoded advice strings, not dynamically generated from score breakdown.
- **Backend speech analysis failure UX:** No distinct error state shown when the API call failed; silent fallback to default scores only.

---

## 8. Feature: Interview Mode — Setup

**Route:** `/interview/setup` (rendered via `/interview/(sidebar)/page.js`)  
**File:** `src/app/interview/(sidebar)/page.js`

### Purpose
Configuration for AI mock interview. User provides their CV and target role so the backend can generate tailored interview questions.

### User Flow
1. User arrives at `/interview/setup`.
2. **Card 1 — Interview Profile:**
   - Upload CV/Resume as PDF (drag-and-drop or click, max 4MB).
   - Page count extracted client-side.
   - PDF posted to `https://pitcho-be.vercel.app/api/interview/upload` — response stored in state.
   - Job Title input (required) and Job Description textarea.
3. **Card 2 — Question Preferences:**
   - Multi-select question types: Behavioral, Technical, Situational (at least one required).
   - Question count: 3, 5, or custom number.
4. **Card 3 — Equipment Check:** Same camera/mic permission flow as presentation setup.
5. **"Start Interview" banner** at the bottom with a robot mascot SVG illustration.
6. Clicking Start → stores config to `sessionStorage` key `interview_configured` → navigates to `/interview/session`.

### Technical Dependencies
- Same PDF upload logic as presentation setup (shared `extractPdfPageCount` implementation, duplicated).
- `navigator.permissions`, `navigator.mediaDevices.getUserMedia`.
- External API: `https://pitcho-be.vercel.app/api/interview/upload`.
- `sessionStorage.setItem("interview_configured", "true")`.

### Current Status
✅ UI complete: CV upload, job title/description inputs, question type toggles, question count selector.  
✅ CV is successfully POSTed to the backend.  
⚠️ Backend response (`uploadResponse`) is stored in state but **not forwarded to the session page**.

### Missing Functionality
- **Config persistence to session:** Job title, description, question types, count, and upload response are not persisted (e.g., `sessionStorage`) for the session page to consume.
- **Questions not pre-fetched:** The session page shows a single hardcoded question. Questions should be fetched/derived from the upload response before navigating.
- **CV extraction display:** No preview of what was extracted from the CV before starting.
- **"How it works" modal:** Button exists but has no `onClick` handler.
- **Duplicate code:** PDF extraction logic is duplicated from `presentation/setup/page.js` — should be extracted to a shared utility.

---

## 9. Feature: Interview Mode — Session

**Route:** `/interview/session`  
**File:** `src/app/interview/session/page.js`

### Purpose
AI mock interview runtime. Presents questions one-by-one with eye-tracking active, simulating a real interview environment.

### User Flow
1. Page checks `sessionStorage.getItem("interview_configured")` — redirects to `/interview/setup` if missing.
2. Camera starts, MediaPipe FaceLandmarker loads (eye tracking mode: `"eye"`).
3. Calibration overlay appears (identical to presentation session flow).
4. After calibration, session timer starts (10 minutes hardcoded).
5. **Left panel:** Classroom/interview background (`classroom.png`) with live facecam PiP. Eye-tracking status badge and orange glow when distracted.
6. **Right panel:** Single question displayed ("If your team had different opinions…" — hardcoded). Key points timeline below. Tip card at bottom.
7. "End Session" button in header — currently renders but onClick is not fully implemented (no navigation/storage handling visible in the file).

### Technical Dependencies
- `useFaceTracker` hook (full feature set, same as presentation session).
- `useInternetSpeed` local hook (simulated, 3-second random walk around 48.2 Mbps).
- `useSessionTimer` local hook (increments every second while `sessionRunning` is true).
- `sessionStorage` for guard check.

### Current Status
⚠️ **Eye-tracking, calibration, and session timer are functional.**  
❌ **The interview-specific features are not implemented:**
  - Questions are hardcoded — no integration with uploaded CV or backend response.
  - Question navigation (next/previous) is present in UI constants (`KEY_POINTS` array) but is not connected to actual interview questions.
  - "End Session" button has no handler — session cannot be properly closed.
  - No speech tracking (no `useSpeechTracker` used in this page).
  - No recording.
  - No result/debrief page for interviews.

### Missing Functionality
- Full integration with interview question data from setup.
- Per-question answer recording and speech analysis.
- Question navigation controls.
- End session → result flow.
- AI-generated feedback per answer.
- `useSpeechTracker` integration for speaking pace feedback during answers.

---

## 10. Feature: Progress Dashboard

**Route:** `/progress`  
**File:** `src/app/progress/page.js`

### Purpose
Gamified longitudinal progress view. Shows XP level, streak, badges earned, skill-specific metrics over time, and weekly goals.

### User Flow
1. User navigates to `/progress` from sidebar.
2. Sees XP progress bar, current level (Level 5 "Confident Speaker"), and weekly XP earned.
3. **Streak section:** 12-day streak with a weekly calendar grid (Mon–Sun dots). "Protect your streak" CTA button.
4. **Badges section:** Six badge cards showing earned/not-earned state with titles, descriptions, and XP value (e.g., "Eye Master", "Streak Warrior", "First Speech"). Hardcoded states.
5. **Skill Progress:** Three metric cards (Eye Contact, Speech Pace, Clarity) with current value, trend arrow, target, and a horizontal bar + mini sparkline. Data hardcoded.
6. **Weekly Goals:** Three goal cards with progress bars (hardcoded at 2/3 complete, 1/5 sessions, 0/1 challenge).

### Technical Dependencies
- Lucide icon library.
- Tailwind CSS utility classes.
- `useState` for any interactive toggles (none currently active).

### Current Status
⚠️ **UI is complete and detailed but 100% static.**  
All values (XP: 2450, streak: 12, badge states, skill scores) are hardcoded constants within the component.

### Missing Functionality
- **Data source:** Must read from a persistent session history store (none currently exists).
- **XP accumulation:** No write path exists from session results to XP counter.
- **Streak computation:** Streak is not computed from actual session dates.
- **Badge unlocking:** No logic evaluates whether badge criteria have been met.
- **Skill trend calculation:** Sparkline data is static arrays; should derive from session history.
- **Weekly goal tracking:** Not computed from actual session count or challenge completion.

---

## 11. Feature: Challenges

**Route:** `/challenges`  
**File:** `src/app/challenges/page.js`

### Purpose
Gamified challenge system. Users complete structured speaking challenges to earn XP and Pitcho Points.

### User Flow
1. User navigates to `/challenges` from sidebar.
2. Header shows Day Streak (12) and Pitcho Points (2,450) — hardcoded.
3. Hero banner with "New challenges, new you!" CTA and "See How It Works" button.
4. **Filter tabs:** All Challenges / Speaking Skills / Focus & Confidence / Consistency / Advanced. Clicking a tab updates `activeTab` state; the challenge list is **not filtered** (tabs are UI-only).
5. **Featured Challenges grid:** 3 cards with title, description, XP reward, progress ("0 / 1"), and badge (Popular / New / Trending). Static.
6. **All Challenges list:** 5 rows, each with icon, title, description, category tag, XP, and progress. "Weekly Streak" row has a real progress bar (3/5, 60%). All others at 0/1.
7. Bottom rewards banner with "View Rewards" CTA — no `onClick`.

### Technical Dependencies
- `useState` for `activeTab`.
- Lucide icons.

### Current Status
⚠️ **UI complete, fully static, no logic.**

### Missing Functionality
- **Tab filtering:** `activeTab` state is set but challenges are not filtered by category.
- **Challenge completion detection:** No system evaluates whether session data satisfies challenge criteria (e.g., "speak 2 min without filler words").
- **Progress persistence:** Challenge progress is hardcoded; no write path from session results.
- **"See How It Works" & "View Rewards" actions:** Buttons have no handlers.
- **XP award on challenge completion:** Not implemented.

---

## 12. Feature: Resources

**Route:** `/resources`  
**File:** `src/app/resources/page.js`

### Purpose
Content library for self-directed learning — articles, guides, and downloadable templates to improve speaking and communication skills.

### User Flow
1. User navigates to `/resources` from sidebar.
2. Header with "Keep learning!" motivational card.
3. **Browse by Category:** 5 category cards (Speaking Basics, Presentation Skills, Interview Prep, Mindset & Confidence, Voice & Delivery) with item counts. Clicking does nothing (no routing).
4. **Featured for you:** 3 article cards with title, description, read time, and category tag. Static.
5. **Guides & Articles:** 4 article rows with image placeholder, title, description, read time. Static.
6. **Templates & Tools:** 4 template cards with download button. No `onClick` on download buttons.
7. Bottom motivational banner with "Explore more resources" CTA — no handler.

### Technical Dependencies
- Lucide icons. Entirely static content.

### Current Status
❌ **Purely static UI. No content is loaded, no navigation works.**

### Missing Functionality
- Actual article/guide content or CMS integration.
- Category filtering.
- Template download links.
- Personalization ("Featured for you" is not personalized).
- Article reading view.

---

## 13. Feature: Try-Session Sandbox

**Route:** `/try-session`  
**File:** `src/app/try-session/page.js`

### Purpose
Developer/demo tool for testing the session simulation. Plays a pre-recorded video (`/Pitcho.mp4`) with synchronized distraction cues (a cough sound at the 8-second mark) to demonstrate what a real session looks and feels like.

### User Flow
1. User navigates to `/try-session` (accessible from landing page or direct URL).
2. Dark-themed UI ("Try Session Sandbox"). Video player loads `/Pitcho.mp4`.
3. **Controls:**
   - Play/Pause, Restart, Mute/Unmute.
   - Custom seek slider.
   - **Loop Intro toggle (0s–7s):** Keeps playhead between 0–7s; resets on `timeupdate`.
   - **Jump to Cough Effect:** Seeks to 8.0s, disables loop if active, triggers `/cough.mp3` audio.
4. **Live Session Telemetry panel:** Shows loop mode status and current playhead position.
5. **Session Segment Status:** Changes based on `currentTime` — "Normal Presentation Pitch" (0–7s), "Transition Phase" (7–8s), "Coughing Distraction Active" (8s+).
6. Toast notifications confirm actions (loop enable/disable, seek).

### Technical Dependencies
- `useRef` for `videoRef`, `hasCoughedRef`.
- `useState` for playback state and UI.
- `useEffect` for toast auto-dismiss.
- HTML5 `<video>` element with `onTimeUpdate`.
- `Audio()` constructor for cough sound.

### Current Status
✅ Fully functional as a standalone demo/sandbox tool.

### Missing Functionality
- Not linked from main app navigation (only accessible via direct URL or landing page demo button).
- Limited to a single hardcoded video; not configurable.
- No integration with live eye tracking or speech analysis.

---

## 14. Cross-Cutting Systems

### 14.1 Navigation / Layout

**Files:** `src/app/layout.js`, `src/components/layout/Sidebar.js` (inferred from Studio page's import structure)

- The main app shell renders a persistent left sidebar (Pitcho logo, nav links: Studio, Presentation, Interview, Progress, Challenges, Resources).
- The sidebar is implemented but its exact active-state logic and responsive mobile behavior need verification.
- Pages under `/presentation/session` and `/interview/session` bypass the sidebar (full-screen layout).

### 14.2 Scoring Engine

**File:** `src/utils/scoring.js`

| Sub-score | Weight | Formula |
|---|---|---|
| Focus | 40% | `100 - (distractedSecs / sessionSecs) × 100` |
| Pace | 25% | Rule-based WPM buckets (120–160 = 100, 100–120/160–180 = 85, etc.) |
| Filler | 20% | Rule-based filler rate per 100 words (0–2% = 100, 3–4% = 90, etc.) |
| Efficiency | 15% | Rule-based redundancy rate per 100 words (0–1% = 100, 2–3% = 90, etc.) |

**Status:** ✅ Fully implemented and tested via direct import into the result page.

### 14.3 Face Tracking Hook (`useFaceTracker`)

**File:** `src/hooks/useFaceTracker.js`

- Loads MediaPipe FaceLandmarker (float16, GPU delegate) from CDN.
- Dual detection modes: `"head"` (nose–eye-corner ratio) and `"eye"` (iris-center ratio, 478-landmark model).
- Calibration: samples 40 frames to compute gaze baseline.
- Look-away detection: debounced (1200–1500ms) deviation threshold check.
- Records: Video (WebM, combined video+audio) and audio-only (WebM/Opus) streams separately.
- Returns: `lookAwayCount`, `lookAwayEvents[]`, `totalDistractedTime`, recording control functions.

### 14.4 Speech Tracker Hook (`useSpeechTracker`)

**File:** `src/hooks/useSpeechTracker.js`

- Uses Web Speech API (`SpeechRecognition`, lang `id-ID`).
- Auto-restarts on silence (150ms delay).
- Splits session into 5 equal time segments; tracks word count per segment.
- Computes live WPM and average WPM.
- Returns final `{ transcript, totalWordCount, averageWpm, speechSegments }` on `stopListening()`.

### 14.5 Speech Analysis Utility (`analyzeSpeech`)

**File:** `src/utils/speechAnalysis.js`

- Converts recorded WebM/Opus audio blob to WAV (manual RIFF header construction using Web Audio API — no external deps).
- POSTs WAV file to `https://pitcho-be.vercel.app/api/speech/analyze`.
- Returns JSON with `analysis.filler_words` and `analysis.word_efficiency`.

### 14.6 Data Persistence Strategy

| Data | Storage | Key |
|---|---|---|
| Setup config | `localStorage` | `pitcho_setup_config` |
| Session metrics | `localStorage` | `pitcho_session_data` |
| Speech analysis result | `localStorage` | `pitcho_speech_analysis` |
| Video blob | IndexedDB (idb-keyval) | `pitcho_video_blob` |
| Interview guard flag | `sessionStorage` | `interview_configured` |

**Gap:** There is no session history list. Each session overwrites the same keys. Historical analysis across sessions is not possible with the current architecture.

---

## 15. Dependency Map

```
Landing Page (/)
  └─→ Studio Dashboard (/studio)
        ├─→ Presentation Setup (/presentation/setup)
        │     └─→ Presentation Session (/presentation/session)
        │           ├── useFaceTracker (MediaPipe, Camera, Recording)
        │           ├── useSpeechTracker (Web Speech API)
        │           ├── useDistractionEngine (Audio playback)
        │           └─→ Presentation Result (/presentation/result)
        │                 ├── scoring.js (calculateSessionScore)
        │                 ├── localStorage: pitcho_session_data
        │                 └── localStorage: pitcho_speech_analysis
        │
        └─→ Interview Setup (/interview/setup)
              └─→ Interview Session (/interview/session)
                    ├── useFaceTracker (MediaPipe, Camera)
                    ├── [NO useSpeechTracker — missing]
                    └── [NO result page — missing]

Standalone Routes (sidebar nav):
  /progress     — Static UI, no data source
  /challenges   — Static UI, no logic
  /resources    — Static UI, no content
  /try-session  — Functional demo sandbox
```

---

*End of PRD — Last updated from codebase inspection: June 2026*
