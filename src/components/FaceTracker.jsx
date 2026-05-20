"use client";

import { useEffect, useState, useRef } from "react";
import FaceTrackerModal from "./FaceTrackerModal";
import { useFaceTracker } from "../hooks/useFaceTracker";

export default function FaceTracker() {
  const tracker = useFaceTracker();
  const {
    status,
    lookAwayCount,
    isFaceDetected,
    detectionMode,
    recordedVideoUrl,
    lookAwayEvents,
    currentDevX,
    currentDevY,
    settings,
    setSettings,
    startRecording,
    runDetectionLoop,
    stopTracker,
    setLookAwayCount,
    clearRecording,
  } = tracker;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [enableSound, setEnableSound] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  // Review View States
  const [showReview, setShowReview] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'recording'
  const [playingClip, setPlayingClip] = useState(null); // { id, start, end }

  const videoRef = useRef(null);
  const reviewVideoRef = useRef(null);
  const previousCountRef = useRef(0);
  const playingClipRef = useRef(null);

  // Play browser synthesizer beep for audio warning
  const playBeep = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); 
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      console.warn("Audio Context playback blocked or failed:", e);
    }
  };

  // Play beep whenever lookAwayCount increases
  useEffect(() => {
    if (enableSound && lookAwayCount > previousCountRef.current) {
      playBeep();
    }
    previousCountRef.current = lookAwayCount;
  }, [lookAwayCount, enableSound]);

  // Session duration timer
  useEffect(() => {
    let interval;
    if (isSessionActive && status !== "ready" && status !== "error") {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, status]);

  // Start tracking callback from modal
  const handleStartTracking = (modalVideoElement) => {
    setIsModalOpen(false);
    setIsSessionActive(true);
    setShowReview(false);
    setSessionTime(0);
    setLookAwayCount(0);
    setPlayingClip(null);
    playingClipRef.current = null;
    clearRecording();

    // Switch stream over to our main page video element
    setTimeout(() => {
      if (videoRef.current && modalVideoElement.srcObject) {
        videoRef.current.srcObject = modalVideoElement.srcObject;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            // Start detection loop for tracking
            runDetectionLoop(videoRef.current, "tracking");
            // Start recording AFTER the video element is playing
            startRecording();
          }).catch(err => console.error("Error starting video in dashboard:", err));
        };
      }
    }, 100);
  };

  const handleStopSession = async () => {
    await stopTracker();
    setIsSessionActive(false);
    setShowReview(true);
    setActiveTab("overview");
  };

  const handleNewSession = () => {
    clearRecording();
    setShowReview(false);
    setIsModalOpen(true);
  };

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Plays a ~10-second clip centered on the look-away event
  const handlePlayClip = (event) => {
    const duration = sessionTime;
    const start = Math.max(0, event.timestamp - 5);
    // Give 5 seconds after the gaze shift to review their response
    const end = Math.min(duration, event.timestamp + 5); 
    
    playingClipRef.current = { id: event.id, start, end };
    setPlayingClip({ id: event.id, start, end });
    setActiveTab("recording");

    setTimeout(() => {
      if (reviewVideoRef.current) {
        reviewVideoRef.current.currentTime = start;
        reviewVideoRef.current.play().catch(e => console.log("Clip play failed:", e));
      }
    }, 150);
  };

  // Monitors the playback time and pauses the video player when a clip ends
  const handleVideoTimeUpdate = (e) => {
    const clip = playingClipRef.current;
    if (clip) {
      if (e.target.currentTime >= clip.end) {
        e.target.pause();
        playingClipRef.current = null;
        setPlayingClip(null);
      }
    }
  };

  // Focus quality rating calculation
  const calculateFocusScore = () => {
    if (sessionTime === 0) return 100;
    // Each look away subtracts 8 points, capped at 0-100
    return Math.max(0, 100 - lookAwayCount * 8);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Setup Modal */}
      <FaceTrackerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          stopTracker();
        }}
        tracker={tracker}
        onStartTracking={handleStartTracking}
      />

      {/* Review view at the end of the session */}
      {showReview ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 text-white space-y-8 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                Focus Guard Reports
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">Session Complete</h1>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReview(false);
                  clearRecording();
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-2.5 px-5 rounded-xl text-sm transition"
              >
                Dashboard
              </button>
              <button
                onClick={handleNewSession}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl text-sm shadow-md shadow-indigo-600/20 transition"
              >
                Start New Session
              </button>
            </div>
          </div>

          {/* Session Overview Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-zinc-800/40 border border-zinc-800/80 rounded-2xl p-5">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total Duration</span>
              <div className="text-3xl font-bold mt-2 text-zinc-100 font-mono">{formatTime(sessionTime)}</div>
            </div>
            
            <div className="bg-zinc-800/40 border border-zinc-800/80 rounded-2xl p-5">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Look Away Count</span>
              <div className={`text-3xl font-bold mt-2 font-mono ${lookAwayCount > 0 ? "text-red-400" : "text-emerald-400"}`}>
                {lookAwayCount}
              </div>
            </div>

            <div className="bg-zinc-800/40 border border-zinc-800/80 rounded-2xl p-5">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Focus Quality Score</span>
              <div className={`text-3xl font-bold mt-2 font-mono ${
                calculateFocusScore() >= 80 ? "text-emerald-400" : calculateFocusScore() >= 50 ? "text-amber-400" : "text-red-400"
              }`}>
                {calculateFocusScore()}%
              </div>
            </div>
          </div>

          {/* Tabs bar */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all ${
                activeTab === "overview"
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Session Logs ({lookAwayEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("recording")}
              className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all ${
                activeTab === "recording"
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Video Recording Review
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === "overview" ? (
              <div className="space-y-4">
                {lookAwayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg">Perfect Focus!</h3>
                    <p className="text-zinc-500 text-sm max-w-xs mt-1">You didn't look away from the camera a single time this session.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden border border-zinc-800 rounded-2xl">
                    <table className="w-full text-left text-sm text-zinc-300">
                      <thead className="bg-zinc-800/40 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-800">
                        <tr>
                          <th className="py-4 px-6">Timestamp</th>
                          <th className="py-4 px-6">Violation Type</th>
                          <th className="py-4 px-6 text-right">Interactive Review</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/80">
                        {lookAwayEvents.map((event) => (
                          <tr key={event.id} className="hover:bg-zinc-800/20 transition-colors">
                            <td className="py-4 px-6 font-mono font-medium text-zinc-400">
                              {formatTime(event.timestamp)}
                            </td>
                            <td className="py-4 px-6 font-medium text-zinc-200">
                              {event.type}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => handlePlayClip(event)}
                                className="inline-flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold py-1.5 px-3 rounded-lg transition"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Play Clip (10s)</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Video Player Column */}
                <div className="md:col-span-2 space-y-4">
                  {recordedVideoUrl ? (
                    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black aspect-video relative group shadow-lg">
                      <video
                        ref={reviewVideoRef}
                        src={recordedVideoUrl}
                        controls
                        onTimeUpdate={handleVideoTimeUpdate}
                        className="h-full w-full object-contain"
                      />
                      
                      {/* Gaze shift clip overlay banner */}
                      {playingClip && (
                        <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold py-1.5 px-3 rounded-full flex items-center gap-2 shadow-md animate-pulse">
                          <span className="h-2 w-2 bg-white rounded-full" />
                          <span>Reviewing Look-Away Clip ({formatTime(playingClip.start)} - {formatTime(playingClip.end)})</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center aspect-video rounded-2xl border border-dashed border-zinc-800 text-zinc-500 text-sm">
                      Video recording is processing...
                    </div>
                  )}

                  {recordedVideoUrl && (
                    <div className="flex gap-3">
                      <a
                        href={recordedVideoUrl}
                        download={`focus-session-${Date.now()}.webm`}
                        className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold py-2 px-4 rounded-xl transition"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download Session (WebM)</span>
                      </a>
                      
                      {playingClip && (
                        <button
                          onClick={() => {
                            if (reviewVideoRef.current) {
                              reviewVideoRef.current.pause();
                            }
                            playingClipRef.current = null;
                            setPlayingClip(null);
                          }}
                          className="inline-flex items-center gap-2 bg-red-950/20 border border-red-900/40 hover:bg-red-900/30 text-red-400 text-xs font-semibold py-2 px-4 rounded-xl transition"
                        >
                          Cancel Clip Mode
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Timeline Seek panel Column */}
                <div className="bg-zinc-800/30 border border-zinc-850 rounded-2xl p-4 space-y-4 flex flex-col max-h-[360px] overflow-hidden">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Play Look-Away Moments</h4>
                  
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {lookAwayEvents.length === 0 ? (
                      <div className="text-zinc-500 text-xs text-center py-10">No events logged</div>
                    ) : (
                      lookAwayEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handlePlayClip(event)}
                          className={`w-full text-left border p-3 rounded-xl transition flex justify-between items-center group ${
                            playingClip?.id === event.id
                              ? "bg-indigo-950/30 border-indigo-500/50"
                              : "bg-zinc-800/40 hover:bg-zinc-800/90 border-zinc-800 hover:border-zinc-700/80"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="text-xs font-semibold text-zinc-300 font-mono flex items-center gap-1.5">
                              <span>At {formatTime(event.timestamp)}</span>
                              {playingClip?.id === event.id && (
                                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-500 truncate max-w-[150px]">
                              {event.type}
                            </div>
                          </div>
                          
                          <span className="text-[10px] text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform duration-200">
                            Play Clip &rarr;
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Regular Tracking Dashboard Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Left Side: Stats and Tracking Control */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
              
              {/* Warning visual border glow */}
              {status === "warning" && (
                <div className="absolute inset-0 border-2 border-red-500 rounded-3xl pointer-events-none animate-pulse" />
              )}

              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
                    Live Focus Guard
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Gaze Monitor</h1>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      detectionMode === "eye" ? "bg-violet-500/20 text-violet-400" : "bg-indigo-500/20 text-indigo-400"
                    }`}>
                      {detectionMode === "eye" ? "Eye Mode" : "Head Mode"}
                    </span>
                  </div>
                </div>

                {/* Status pill badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  status === "tracking"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : status === "warning"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    status === "tracking" ? "bg-emerald-400" : status === "warning" ? "bg-red-400" : "bg-zinc-500"
                  }`} />
                  {status === "tracking" ? "Monitoring Active" : status === "warning" ? "Looking Away!" : "Inactive"}
                </div>
              </div>

              {/* Scorecard grids */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Session timer */}
                <div className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Session Duration</span>
                  <span className="text-3xl font-mono font-bold mt-2 text-zinc-100">
                    {formatTime(sessionTime)}
                  </span>
                </div>

                {/* Look-away counter */}
                <div className={`border rounded-2xl p-5 flex flex-col justify-between transition-colors duration-300 ${
                  status === "warning" 
                    ? "bg-red-950/20 border-red-900/50" 
                    : "bg-zinc-800/40 border-zinc-800"
                }`}>
                  <span className="text-xs text-zinc-400 font-medium">Look Away Count</span>
                  <span className={`text-3xl font-mono font-bold mt-2 transition-colors duration-300 ${
                    lookAwayCount > 0 ? "text-red-400" : "text-emerald-400"
                  }`}>
                    {lookAwayCount}
                  </span>
                </div>

              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {!isSessionActive ? (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all duration-200"
                  >
                    Start Tracking Session
                  </button>
                ) : (
                  <button
                    onClick={handleStopSession}
                    className="w-full bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 font-semibold py-4 px-6 rounded-2xl transition-all duration-200"
                  >
                    Stop Session & Review
                  </button>
                )}
              </div>

            </div>

            {/* Dynamic settings and feedback panel */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white space-y-6">
              <h3 className="text-lg font-bold text-zinc-100">Sensitivity Calibration</h3>
              
              <div className="space-y-4">
                {/* Yaw setting */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400 font-medium">
                    <span>{detectionMode === "eye" ? "Horizontal Eye Limit" : "Horizontal Gaze Limit (Yaw)"}</span>
                    <span className="font-mono">{settings.thresholdX}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.25"
                    step="0.01"
                    value={settings.thresholdX}
                    onChange={(e) => setSettings(prev => ({ ...prev, thresholdX: parseFloat(e.target.value) }))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Pitch setting */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400 font-medium">
                    <span>{detectionMode === "eye" ? "Vertical Eye Limit" : "Vertical Gaze Limit (Pitch)"}</span>
                    <span className="font-mono">{settings.thresholdY}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.25"
                    step="0.01"
                    value={settings.thresholdY}
                    onChange={(e) => setSettings(prev => ({ ...prev, thresholdY: parseFloat(e.target.value) }))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Debounce setting */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400 font-medium">
                    <span>Look-Away Debounce Delay</span>
                    <span className="font-mono">{settings.debounceMs}ms</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="3000"
                    step="250"
                    value={settings.debounceMs}
                    onChange={(e) => setSettings(prev => ({ ...prev, debounceMs: parseInt(e.target.value) }))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>

              {/* Real-time calibration diagnostics */}
              {isSessionActive && (
                <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-zinc-800/20 border border-zinc-800/50 p-3 rounded-xl space-y-1">
                    <div className="text-zinc-500">{detectionMode === "eye" ? "Horizontal Eye Dev" : "Yaw Deviation"}</div>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-sm font-semibold text-zinc-300">{currentDevX}</span>
                      <span className="text-[10px] text-zinc-500">Limit: {settings.thresholdX}</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${currentDevX > settings.thresholdX ? 'bg-red-500' : 'bg-indigo-400'}`}
                        style={{ width: `${Math.min((currentDevX / settings.thresholdX) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-zinc-800/20 border border-zinc-800/50 p-3 rounded-xl space-y-1">
                    <div className="text-zinc-500">{detectionMode === "eye" ? "Vertical Eye Dev" : "Pitch Deviation"}</div>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-sm font-semibold text-zinc-300">{currentDevY}</span>
                      <span className="text-[10px] text-zinc-500">Limit: {settings.thresholdY}</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${currentDevY > settings.thresholdY ? 'bg-red-500' : 'bg-indigo-400'}`}
                        style={{ width: `${Math.min((currentDevY / settings.thresholdY) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Right Side: Camera View & Options Panel */}
          <div className="space-y-6">
            
            {/* Camera Frame Preview Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-zinc-100">Camera Feed</span>
                <button 
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
              </div>

              {showPreview ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-zinc-800 shadow-inner">
                  {isSessionActive ? (
                    <video
                      ref={videoRef}
                      className="h-full w-full object-cover transform scale-x-[-1]"
                      muted
                      playsInline
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs">
                      Camera inactive
                    </div>
                  )}
                  
                  {/* Status indicator overlay */}
                  {isSessionActive && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-mono text-zinc-300 border border-white/5 flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        isFaceDetected ? "bg-emerald-400" : "bg-red-400 animate-pulse"
                      }`} />
                      {isFaceDetected ? "Face Tracked" : "Searching Face"}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center bg-zinc-800/10 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs">
                  Camera preview hidden to save performance.
                </div>
              )}
            </div>

            {/* Settings / General Toggle Options */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white space-y-4">
              <h3 className="text-sm font-bold text-zinc-100">Feedback Options</h3>
              
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-200 font-medium group-hover:text-white transition">Audio Alerts</span>
                    <span className="text-[10px] text-zinc-500">Beep sound when looking away</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableSound}
                    onChange={(e) => setEnableSound(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                </label>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
