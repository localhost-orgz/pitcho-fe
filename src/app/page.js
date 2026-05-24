"use client";

import { useState } from "react";

export default function Home() {
  // Manual trigger states
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [isCoughing, setIsCoughing] = useState(false);
  const [isSneezing, setIsSneezing] = useState(false);
  const [isYawning, setIsYawning] = useState(false);

  // Automatic loop states (toggles)
  const [autoBlink, setAutoBlink] = useState(false);
  const [autoWave, setAutoWave] = useState(false);
  const [autoCough, setAutoCough] = useState(false);
  const [autoSneeze, setAutoSneeze] = useState(false);
  const [autoYawn, setAutoYawn] = useState(false);

  // Trigger handlers
  const triggerBlink = () => {
    if (!autoBlink && !isBlinking) {
      setIsBlinking(true);
    }
  };

  const triggerWave = () => {
    if (!autoWave && !isWaving) {
      setIsWaving(true);
    }
  };

  const triggerCough = () => {
    if (!autoCough && !isCoughing) {
      setIsCoughing(true);
    }
  };

  const triggerSneeze = () => {
    if (!autoSneeze && !isSneezing) {
      setIsSneezing(true);
    }
  };

  const triggerYawn = () => {
    if (!autoYawn && !isYawning) {
      setIsYawning(true);
    }
  };

  // Determine active SVG animation classes
  let eyeClass = "eye";
  if (autoBlink) {
    eyeClass += " loop-blink";
  } else if (isBlinking) {
    eyeClass += " animate-blink";
  }

  let armClass = "left-arm";
  if (autoWave) {
    armClass += " loop-wave";
  } else if (isWaving) {
    armClass += " animate-wave";
  }

  let headClass = "head";
  if (autoCough) {
    headClass += " loop-cough";
  } else if (autoSneeze) {
    headClass += " loop-sneeze";
  } else if (autoYawn) {
    headClass += " loop-yawn";
  } else if (isCoughing) {
    headClass += " animate-cough";
  } else if (isSneezing) {
    headClass += " animate-sneeze";
  } else if (isYawning) {
    headClass += " animate-yawn";
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 text-white font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Container Card */}
      <div className="w-full max-w-5xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col lg:flex-row items-center gap-8">
        
        {/* Left Side: Character SVG Viewport */}
        <div className="w-full lg:w-3/5 relative flex items-center justify-center bg-slate-950/50 rounded-2xl p-4 border border-slate-850 shadow-inner overflow-hidden aspect-video lg:aspect-auto lg:h-[450px]">
          <svg
            width="667"
            height="507"
            viewBox="0 0 667 507"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full max-w-[500px] lg:max-w-full max-h-[400px] object-contain transition-all"
          >
            <style>{`
              /* --- Base Animations: Keyframes --- */
              
              /* Infinite Loop Blink (5s rhythm) */
              @keyframes keyframes-blink-loop {
                0%, 90%, 94%, 98%, 100% { transform: scaleY(1); }
                92%, 96% { transform: scaleY(0.1); }
              }
              /* Manual Single Blink */
              @keyframes keyframes-blink-single {
                0%, 100% { transform: scaleY(1); }
                30%, 70% { transform: scaleY(0.1); }
              }
              
              /* Infinite Loop Wave (4s rhythm) */
              @keyframes keyframes-wave-loop {
                0%, 70%, 100% { transform: rotate(0deg); }
                75%, 85%, 95% { transform: rotate(-12deg); }
                80%, 90% { transform: rotate(-3deg); }
              }
              /* Manual Single Wave */
              @keyframes keyframes-wave-single {
                0%, 100% { transform: rotate(0deg); }
                25%, 75% { transform: rotate(-12deg); }
                50% { transform: rotate(-3deg); }
              }
              
              /* Infinite Loop Cough (6s rhythm) */
              @keyframes keyframes-cough-loop {
                0%, 74%, 86%, 100% { transform: translate(0, 0) rotate(0deg); }
                76%, 80% { transform: translate(-3px, 12px) rotate(-3deg); }
                78%, 82% { transform: translate(-1px, 4px) rotate(-1deg); }
              }
              /* Manual Single Cough */
              @keyframes keyframes-cough-single {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                25%, 65% { transform: translate(-3px, 12px) rotate(-3deg); }
                45%, 85% { transform: translate(-1px, 4px) rotate(-1deg); }
              }
              
              /* Infinite Loop Sneeze (7s rhythm) */
              @keyframes keyframes-sneeze-loop {
                0%, 80%, 100% { transform: translate(0, 0) rotate(0deg); }
                88% { transform: translate(2px, -10px) rotate(5deg); }
                90% { transform: translate(-6px, 25px) rotate(-8deg); }
                93% { transform: translate(-1px, 6px) rotate(-2deg); }
              }
              /* Manual Single Sneeze */
              @keyframes keyframes-sneeze-single {
                0% { transform: translate(0, 0) rotate(0deg); }
                40% { transform: translate(2px, -10px) rotate(5deg); }
                50% { transform: translate(-6px, 25px) rotate(-8deg); }
                65% { transform: translate(-1px, 6px) rotate(-2deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
              }
              
              /* Infinite Loop Yawn (9s rhythm) */
              @keyframes keyframes-yawn-loop {
                0%, 70%, 100% { transform: translate(0, 0) rotate(0deg); }
                79%, 91% { transform: translate(0, -15px) rotate(4deg); }
              }
              /* Manual Single Yawn */
              @keyframes keyframes-yawn-single {
                0% { transform: translate(0, 0) rotate(0deg); }
                30%, 70% { transform: translate(0, -15px) rotate(4deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
              }
              
              /* Eye Squeeze during Cough (infinite loop) */
              @keyframes keyframes-squeeze-loop {
                0%, 74%, 86%, 100% { transform: scaleY(1); }
                76%, 78%, 80%, 82% { transform: scaleY(0.1); }
              }
              /* Eye Squeeze during Cough (single action) */
              @keyframes keyframes-squeeze-single {
                0%, 100% { transform: scaleY(1); }
                25%, 45%, 65%, 85% { transform: scaleY(0.1); }
              }
              
              /* Eye Squeeze during Sneeze (infinite loop) */
              @keyframes keyframes-squeeze-sneeze-loop {
                0%, 25%, 29%, 33%, 80%, 100% { transform: scaleY(1); }
                27%, 31%, 84%, 93% { transform: scaleY(0.1); }
                96% { transform: scaleY(0.5); }
              }
              /* Eye Squeeze during Sneeze (single action) */
              @keyframes keyframes-squeeze-sneeze-single {
                0% { transform: scaleY(1); }
                20%, 65% { transform: scaleY(0.1); }
                80% { transform: scaleY(0.5); }
                100% { transform: scaleY(1); }
              }
              
              /* Eye Squeeze during Yawn (infinite loop) */
              @keyframes keyframes-squeeze-yawn-loop {
                0%, 25%, 29%, 33%, 70%, 100% { transform: scaleY(1); }
                27%, 31% { transform: scaleY(0.1); }
                76%, 93% { transform: scaleY(0.1); }
              }
              /* Eye Squeeze during Yawn (single action) */
              @keyframes keyframes-squeeze-yawn-single {
                0%, 100% { transform: scaleY(1); }
                25%, 75% { transform: scaleY(0.1); }
              }

              /* Mouth Yawn Scale (infinite loop) */
              @keyframes keyframes-yawn-mouth-loop {
                0%, 70%, 100% { transform: scale(1); }
                79%, 91% { transform: scale(1.8, 8); }
              }
              /* Mouth Yawn Scale (single action) */
              @keyframes keyframes-yawn-mouth-single {
                0%, 100% { transform: scale(1); }
                30%, 70% { transform: scale(1.8, 8); }
              }

              /* --- Dynamic Class Selectors --- */
              
              /* Loops */
              .loop-blink {
                animation: keyframes-blink-loop 5s infinite;
                transform-box: fill-box;
                transform-origin: center;
              }
              .loop-wave {
                animation: keyframes-wave-loop 4s ease-in-out infinite;
                transform-origin: 527px 283px;
              }
              .loop-cough {
                animation: keyframes-cough-loop 6s ease-in-out infinite;
                transform-origin: 330px 260px;
              }
              .loop-cough .eye {
                animation: keyframes-squeeze-loop 6s ease-in-out infinite;
                transform-box: fill-box;
                transform-origin: center;
              }
              .loop-sneeze {
                animation: keyframes-sneeze-loop 7s ease-in-out infinite;
                transform-origin: 330px 260px;
              }
              .loop-sneeze .eye {
                animation: keyframes-squeeze-sneeze-loop 7s ease-in-out infinite;
                transform-box: fill-box;
                transform-origin: center;
              }
              .loop-yawn {
                animation: keyframes-yawn-loop 9s ease-in-out infinite;
                transform-origin: 330px 260px;
              }
              .loop-yawn .eye {
                animation: keyframes-squeeze-yawn-loop 9s ease-in-out infinite;
                transform-box: fill-box;
                transform-origin: center;
              }
              .loop-yawn .mouth {
                animation: keyframes-yawn-mouth-loop 9s ease-in-out infinite;
                transform-box: fill-box;
                transform-origin: center;
              }

              /* Manual Triggers */
              .animate-blink {
                animation: keyframes-blink-single 0.3s ease-in-out;
                transform-box: fill-box;
                transform-origin: center;
              }
              .animate-wave {
                animation: keyframes-wave-single 1s ease-in-out;
                transform-origin: 527px 283px;
              }
              .animate-cough {
                animation: keyframes-cough-single 1.2s ease-in-out;
                transform-origin: 330px 260px;
              }
              .animate-cough .eye {
                animation: keyframes-squeeze-single 1.2s ease-in-out;
                transform-box: fill-box;
                transform-origin: center;
              }
              .animate-sneeze {
                animation: keyframes-sneeze-single 1.5s ease-in-out;
                transform-origin: 330px 260px;
              }
              .animate-sneeze .eye {
                animation: keyframes-squeeze-sneeze-single 1.5s ease-in-out;
                transform-box: fill-box;
                transform-origin: center;
              }
              .animate-yawn {
                animation: keyframes-yawn-single 3s ease-in-out;
                transform-origin: 330px 260px;
              }
              .animate-yawn .eye {
                animation: keyframes-squeeze-yawn-single 3s ease-in-out;
                transform-box: fill-box;
                transform-origin: center;
              }
              .animate-yawn .mouth {
                animation: keyframes-yawn-mouth-single 3s ease-in-out;
                transform-box: fill-box;
                transform-origin: center;
              }
            `}</style>

            {/* Torso/Shoulders */}
            <path
              d="M243.078 302.24V481.24C272.078 500.074 348.778 526.44 423.578 481.24V302.24L527.078 303.605C546.278 289.497 535.078 270.616 527.078 262.939L411.578 254.74C401.087 255.42 387.48 256.169 372.578 256.801C337.378 296.85 305.245 274.352 293.578 258.096C276.682 257.719 262.448 256.71 254.078 254.74L136.578 264.24C127.495 270.824 116.678 286.44 135.078 302.24H243.078Z"
              fill="#34CACA"
            />
            {/* Right Arm/Hand (Viewer Left) */}
            <path
              d="M12.5779 273.24C0.577822 274.74 -9.42215 304.74 15.0779 304.74L135.078 302.24C116.678 286.44 127.495 270.824 136.578 264.24L12.5779 273.24Z"
              fill="#F3D3BD"
            />
            {/* Neck Shadow */}
            <path
              d="M372.578 256.801C346.997 257.888 317.598 258.632 293.578 258.096C305.245 274.352 337.378 296.85 372.578 256.801Z"
              fill="#F8CE9F"
            />
            {/* Left Arm/Hand (Viewer Right) */}
            <path
              className={armClass}
              d="M651.078 305.24C666.578 307.74 676.578 279.74 651.078 271.74L527.078 262.939C535.078 270.616 546.278 289.497 527.078 303.605L651.078 305.24Z"
              fill="#F3D3BD"
              onAnimationEnd={handleWaveEnd}
            />
            {/* Head Group (Face, Hair, Eyes, Mouth) */}
            <g className={headClass} onAnimationEnd={handleHeadAnimationEnd}>
              {/* Face Skin */}
              <path
                d="M284.078 260.74C231.278 259.94 209.078 220.073 204.578 200.24C152.178 30.6401 354.744 51.2401 462.578 82.7401C468.244 102.907 476.178 154.54 462.578 199.74C448.978 244.94 406.244 259.24 386.578 260.74C374.411 261.073 336.878 261.54 284.078 260.74Z"
                fill="#FADCB7"
              />
              {/* Hair */}
              <path
                d="M218.078 198.24L220.578 136.74C235.778 131.54 242.911 116.907 244.578 110.24C308.578 135.44 394.578 120.74 429.578 110.24C429.578 124.64 442.244 133.24 448.578 135.74C446.744 163.74 447.078 215.34 463.078 197.74C479.078 180.14 484.078 120.074 484.578 92.2402C504.578 76.2402 511.078 56.2402 513.078 44.7402C515.078 33.2402 510.078 11.2402 508.078 17.7402C506.078 24.2402 472.078 45.2402 482.578 32.7402C493.078 20.2402 475.078 -9.25976 473.578 3.74024C472.378 14.1402 449.411 30.0735 438.078 36.7401C440.244 22.5734 441.478 -1.95992 429.078 13.2401C413.578 32.2401 394.578 40.7402 357.578 29.7399C301.978 14.5399 273.411 30.7401 266.078 40.7402C229.278 21.9402 200.078 61.5735 190.078 83.7402C185.744 90.9068 178.178 112.14 182.578 139.74C188.078 174.24 191.078 175.24 201.578 198.24C209.978 216.64 216.078 205.907 218.078 198.24Z"
                fill="#333333"
                stroke="black"
                stroke-opacity="0.24"
              />
              {/* Left Eye */}
              <circle
                className={eyeClass}
                cx="283.578"
                cy="166.24"
                r="11.5"
                fill="black"
                onAnimationEnd={handleBlinkEnd}
              />
              {/* Right Eye */}
              <circle
                className={eyeClass}
                cx="381.578"
                cy="166.24"
                r="11.5"
                fill="black"
              />
              {/* Resting/Animating Mouth */}
              <ellipse
                className="mouth"
                cx="332.5"
                cy="215"
                rx="8"
                ry="1"
                fill="#333333"
              />
            </g>
          </svg>
        </div>

        {/* Right Side: Control Panel Center */}
        <div className="w-full lg:w-2/5 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-emerald-400 via-amber-400 via-rose-400 to-cyan-400 bg-clip-text text-transparent uppercase">
              Interactive Avatar
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-medium leading-relaxed">
              Trigger actions manually on command, or toggle them to run continuously in the background.
            </p>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Section 1: Manual Action Buttons */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Manual Trigger Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              {/* Blink Action */}
              <button
                onClick={triggerBlink}
                disabled={autoBlink || isBlinking}
                className="group relative w-full px-4 py-3 bg-indigo-600/10 hover:bg-indigo-600/20 active:scale-[0.98] disabled:bg-slate-850 disabled:text-slate-600 disabled:scale-100 border border-indigo-500/20 disabled:border-slate-800 text-indigo-300 font-bold rounded-2xl flex items-center justify-between transition-all duration-100 cursor-pointer"
              >
                <span className="text-sm">
                  {autoBlink ? "Auto" : isBlinking ? "Blinking..." : "Blink"}
                </span>
                <span className="h-2 w-2 rounded-full bg-indigo-400 group-hover:scale-125 transition-transform" />
              </button>

              {/* Wave Action */}
              <button
                onClick={triggerWave}
                disabled={autoWave || isWaving}
                className="group relative w-full px-4 py-3 bg-emerald-600/10 hover:bg-emerald-600/20 active:scale-[0.98] disabled:bg-slate-850 disabled:text-slate-600 disabled:scale-100 border border-emerald-500/20 disabled:border-slate-800 text-emerald-300 font-bold rounded-2xl flex items-center justify-between transition-all duration-100 cursor-pointer"
              >
                <span className="text-sm">
                  {autoWave ? "Auto" : isWaving ? "Waving..." : "Wave"}
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
              </button>

              {/* Cough Action */}
              <button
                onClick={triggerCough}
                disabled={autoCough || isCoughing}
                className="group relative w-full px-4 py-3 bg-amber-600/10 hover:bg-amber-600/20 active:scale-[0.98] disabled:bg-slate-850 disabled:text-slate-600 disabled:scale-100 border border-amber-500/20 disabled:border-slate-800 text-amber-300 font-bold rounded-2xl flex items-center justify-between transition-all duration-100 cursor-pointer"
              >
                <span className="text-sm">
                  {autoCough ? "Auto" : isCoughing ? "Coughing..." : "Cough"}
                </span>
                <span className="h-2 w-2 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
              </button>

              {/* Sneeze Action */}
              <button
                onClick={triggerSneeze}
                disabled={autoSneeze || isSneezing}
                className="group relative w-full px-4 py-3 bg-rose-600/10 hover:bg-rose-600/20 active:scale-[0.98] disabled:bg-slate-850 disabled:text-slate-600 disabled:scale-100 border border-rose-500/20 disabled:border-slate-800 text-rose-300 font-bold rounded-2xl flex items-center justify-between transition-all duration-100 cursor-pointer"
              >
                <span className="text-sm">
                  {autoSneeze ? "Auto" : isSneezing ? "Sneezing..." : "Sneeze"}
                </span>
                <span className="h-2 w-2 rounded-full bg-rose-400 group-hover:scale-125 transition-transform" />
              </button>

              {/* Yawn Action */}
              <button
                onClick={triggerYawn}
                disabled={autoYawn || isYawning}
                className="group relative w-full px-4 py-3 bg-cyan-600/10 hover:bg-cyan-600/20 active:scale-[0.98] disabled:bg-slate-850 disabled:text-slate-600 disabled:scale-100 border border-cyan-500/20 disabled:border-slate-800 text-cyan-300 font-bold rounded-2xl flex items-center justify-between transition-all duration-100 cursor-pointer"
              >
                <span className="text-sm">
                  {autoYawn ? "Auto" : isYawning ? "Yawning..." : "Yawn"}
                </span>
                <span className="h-2 w-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-850" />

          {/* Section 2: Continuous Toggle Switches */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Continuous Loop Settings (Toggles)
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {/* Auto Blink Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950/30 rounded-2xl border border-slate-850">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-slate-200">Auto Eye Blink</span>
                  <span className="text-[10px] text-slate-500">Blinks naturally every 5s</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBlink}
                    onChange={(e) => {
                      setAutoBlink(e.target.checked);
                      if (e.target.checked) setIsBlinking(false);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Auto Wave Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950/30 rounded-2xl border border-slate-850">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-slate-200">Auto Hand Wave</span>
                  <span className="text-[10px] text-slate-500">Waves hand friendly every 4s</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoWave}
                    onChange={(e) => {
                      setAutoWave(e.target.checked);
                      if (e.target.checked) setIsWaving(false);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Auto Cough Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950/30 rounded-2xl border border-slate-850">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-slate-200">Auto Coughing</span>
                  <span className="text-[10px] text-slate-500">Coughs organically every 6s</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCough}
                    onChange={(e) => {
                      setAutoCough(e.target.checked);
                      if (e.target.checked) setIsCoughing(false);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Auto Sneeze Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950/30 rounded-2xl border border-slate-850">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-slate-200">Auto Sneezing</span>
                  <span className="text-[10px] text-slate-500">Sneezes organically every 7s</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSneeze}
                    onChange={(e) => {
                      setAutoSneeze(e.target.checked);
                      if (e.target.checked) setIsSneezing(false);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              {/* Auto Yawn Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950/30 rounded-2xl border border-slate-850 sm:col-span-2 lg:col-span-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-slate-200">Auto Yawning</span>
                  <span className="text-[10px] text-slate-500">Yawns organically every 9s</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoYawn}
                    onChange={(e) => {
                      setAutoYawn(e.target.checked);
                      if (e.target.checked) setIsYawning(false);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  // Animation end reset callback handlers
  function handleBlinkEnd(e) {
    if (e.animationName === "keyframes-blink-single") {
      setIsBlinking(false);
    }
  }

  function handleWaveEnd(e) {
    if (e.animationName === "keyframes-wave-single") {
      setIsWaving(false);
    }
  }

  // Combined head animation end handler
  function handleHeadAnimationEnd(e) {
    if (e.animationName === "keyframes-cough-single") {
      setIsCoughing(false);
    } else if (e.animationName === "keyframes-sneeze-single") {
      setIsSneezing(false);
    } else if (e.animationName === "keyframes-yawn-single") {
      setIsYawning(false);
    }
  }
}
