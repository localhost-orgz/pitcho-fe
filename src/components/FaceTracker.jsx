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

  // UI state variables
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [enableSound, setEnableSound] = useState(true);
  
  // Topic and Duration inline edits
  const [topic, setTopic] = useState("Dampak Media Sosial terhadap Kesehatan Mental Remaja");
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [tempTopic, setTempTopic] = useState(topic);

  const [targetDuration, setTargetDuration] = useState("3 - 5 menit");
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [tempDuration, setTempDuration] = useState(targetDuration);

  // Review screen states
  const [showReview, setShowReview] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState("overview"); // 'overview' | 'recording'
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

  // Play beep warning whenever lookAwayCount increases
  useEffect(() => {
    if (enableSound && lookAwayCount > previousCountRef.current) {
      playBeep();
    }
    previousCountRef.current = lookAwayCount;
  }, [lookAwayCount, enableSound]);

  // Session duration timer
  useEffect(() => {
    let interval;
    if (isSessionActive && !isPaused && status !== "ready" && status !== "error") {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, isPaused, status]);

  // Handle start session callback from modal
  const handleStartTracking = (modalVideoElement) => {
    setIsModalOpen(false);
    setIsSessionActive(true);
    setIsPaused(false);
    setShowReview(false);
    setSessionTime(0);
    setLookAwayCount(0);
    setPlayingClip(null);
    playingClipRef.current = null;
    clearRecording();

    // Switch camera stream to our hidden video element in page
    setTimeout(() => {
      if (videoRef.current && modalVideoElement.srcObject) {
        videoRef.current.srcObject = modalVideoElement.srcObject;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            // Start detection loop
            runDetectionLoop(videoRef.current, "tracking");
            // Start recording after video plays
            startRecording();
          }).catch(err => console.error("Error starting video in dashboard:", err));
        };
      }
    }, 150);
  };

  const handleStopSession = async () => {
    await stopTracker();
    setIsSessionActive(false);
    setIsPaused(false);
    setShowReview(true);
    setActiveReviewTab("overview");
  };

  const handleTogglePause = () => {
    if (!videoRef.current) return;
    if (isPaused) {
      videoRef.current.play().then(() => {
        setIsPaused(false);
      }).catch(e => console.error("Error resuming video:", e));
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleNewSession = () => {
    clearRecording();
    setShowReview(false);
    setIsModalOpen(true);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handlePlayClip = (event) => {
    const duration = sessionTime;
    const start = Math.max(0, event.timestamp - 5);
    const end = Math.min(duration, event.timestamp + 5); 
    
    playingClipRef.current = { id: event.id, start, end };
    setPlayingClip({ id: event.id, start, end });
    setActiveReviewTab("recording");

    setTimeout(() => {
      if (reviewVideoRef.current) {
        reviewVideoRef.current.currentTime = start;
        reviewVideoRef.current.play().catch(e => console.log("Clip play failed:", e));
      }
    }, 150);
  };

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

  const calculateFocusScore = () => {
    if (sessionTime === 0) return 100;
    return Math.max(0, 100 - lookAwayCount * 8);
  };

  // Calculates needle slide position [10% to 90%] dynamically
  const getNeedlePosition = () => {
    if (!isSessionActive) return 50; 
    if (!isFaceDetected) return 20;  // warning state (left)
    if (status === "warning") {
      const dev = Math.max(currentDevX, currentDevY);
      const limit = Math.max(settings.thresholdX, settings.thresholdY);
      const ratio = limit > 0 ? Math.min(dev / limit, 2) : 1.5;
      return Math.max(10, 35 - (ratio - 1) * 25);
    } else {
      const dev = Math.max(currentDevX, currentDevY);
      const limit = Math.max(settings.thresholdX, settings.thresholdY);
      const ratio = limit > 0 ? Math.min(dev / limit, 1) : 0.2;
      return 90 - ratio * 25;
    }
  };

  const needlePosition = getNeedlePosition();

  // Save edit handlers
  const saveTopic = () => {
    setTopic(tempTopic);
    setIsEditingTopic(false);
  };

  const saveDuration = () => {
    setTargetDuration(tempDuration);
    setIsEditingDuration(false);
  };

  return (
    <div className="w-full space-y-8">
      
      {/* Onboarding / Setup Modal */}
      <FaceTrackerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          stopTracker();
        }}
        tracker={tracker}
        onStartTracking={handleStartTracking}
      />

      {/* ─── Review View Mode (Session Ended Report) ─── */}
      {showReview ? (
        <div className="bg-white border-2 border-zinc-200 border-b-4 rounded-3xl p-6 md:p-8 space-y-8 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
            <div>
              <span className="text-xs font-bold text-[#1e5399] uppercase tracking-wider">Presenta Guard Reports</span>
              <h1 className="text-3xl font-black text-zinc-900 mt-1">Latihan Selesai</h1>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReview(false);
                  clearRecording();
                }}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold py-3 px-5 rounded-2xl text-sm border-2 border-zinc-200 border-b-4 hover:border-b-2 active:border-b-0 hover:translate-y-[2px] active:translate-y-[4px] cursor-pointer transition-all duration-100"
              >
                Dashboard
              </button>
              <button
                onClick={handleNewSession}
                className="bg-[#1e5399] hover:bg-[#1b4a87] text-white font-extrabold py-3 px-5 rounded-2xl text-sm border-b-4 border-[#153d70] hover:border-b-2 active:border-b-0 hover:translate-y-[2px] active:translate-y-[4px] cursor-pointer shadow-xs transition-all duration-100"
              >
                Mulai Latihan Baru
              </button>
            </div>
          </div>

          {/* Session Overview Stats Cards (Duolingo-styled 3D cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Total Duration */}
            <div className="bg-[#e8f3ff] border-2 border-[#1899d6] border-b-4 rounded-2xl p-5 flex flex-col items-center text-center">
              <span className="text-xs text-zinc-550 font-bold uppercase tracking-wider">Durasi Latihan</span>
              <div className="text-3xl font-black mt-2 text-[#1899d6] font-mono">{formatTime(sessionTime)}</div>
            </div>
            
            {/* Look Away Count */}
            <div className={`border-2 border-b-4 rounded-2xl p-5 flex flex-col items-center text-center ${
              lookAwayCount > 0 
                ? "bg-orange-50 border-orange-500 text-orange-700" 
                : "bg-emerald-50 border-emerald-500 text-emerald-700"
            }`}>
              <span className="text-xs text-zinc-550 font-bold uppercase tracking-wider">Beralih Pandangan</span>
              <div className="text-3xl font-black mt-2 font-mono">
                {lookAwayCount} Kali
              </div>
            </div>

            {/* Focus Quality Score */}
            <div className="bg-[#e8f8f0] border-2 border-[#58cc02] border-b-4 rounded-2xl p-5 flex flex-col items-center text-center">
              <span className="text-xs text-zinc-550 font-bold uppercase tracking-wider">Skor Kualitas Fokus</span>
              <div className="text-3xl font-black mt-2 text-[#58cc02] font-mono">
                {calculateFocusScore()}%
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b-2 border-zinc-200 gap-4">
            <button
              onClick={() => setActiveReviewTab("overview")}
              className={`pb-3 px-4 text-sm font-black border-b-4 transition-all duration-150 cursor-pointer ${
                activeReviewTab === "overview"
                  ? "border-[#1e5399] text-[#1e5399]"
                  : "border-transparent text-zinc-400 hover:text-zinc-650"
              }`}
            >
              Catatan Gangguan ({lookAwayEvents.length})
            </button>
            <button
              onClick={() => setActiveReviewTab("recording")}
              className={`pb-3 px-4 text-sm font-black border-b-4 transition-all duration-150 cursor-pointer ${
                activeReviewTab === "recording"
                  ? "border-[#1e5399] text-[#1e5399]"
                  : "border-transparent text-zinc-400 hover:text-zinc-650"
              }`}
            >
              Putar Ulang Video Rekaman
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeReviewTab === "overview" ? (
              <div className="space-y-4">
                {lookAwayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 border-2 border-emerald-300">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-black text-xl text-zinc-900">Fokus Sempurna!</h3>
                    <p className="text-zinc-550 text-sm font-semibold max-w-xs mt-1">Kamu berhasil mempertahankan kontak mata 100% dengan kamera sepanjang presentasi.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden border-2 border-zinc-200 rounded-2xl">
                    <table className="w-full text-left text-sm text-zinc-700">
                      <thead className="bg-zinc-50 text-xs font-extrabold uppercase text-zinc-500 border-b-2 border-zinc-200">
                        <tr>
                          <th className="py-4 px-6">Waktu Kejadian</th>
                          <th className="py-4 px-6">Detail Pelanggaran</th>
                          <th className="py-4 px-6 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 font-medium">
                        {lookAwayEvents.map((event) => (
                          <tr key={event.id} className="hover:bg-zinc-50/60 transition-colors">
                            <td className="py-4 px-6 font-mono font-bold text-[#1e5399]">
                              {formatTime(event.timestamp)}
                            </td>
                            <td className="py-4 px-6 font-bold text-zinc-800">
                              {event.type}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => handlePlayClip(event)}
                                className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#1e5399] text-xs font-extrabold py-2 px-3.5 rounded-xl border border-blue-200 transition"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                </svg>
                                <span>Putar Klip (10s)</span>
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
                    <div className="overflow-hidden rounded-2xl border-2 border-zinc-200 bg-zinc-950 aspect-video relative group">
                      <video
                        ref={reviewVideoRef}
                        src={recordedVideoUrl}
                        controls
                        onTimeUpdate={handleVideoTimeUpdate}
                        className="h-full w-full object-contain"
                      />
                      
                      {playingClip && (
                        <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-black py-2 px-4 rounded-full flex items-center gap-2 shadow-md animate-pulse">
                          <span className="h-2 w-2 bg-white rounded-full" />
                          <span>Memutar Kejadian Gaze Shift ({formatTime(playingClip.start)} - {formatTime(playingClip.end)})</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-zinc-300 text-zinc-550 text-sm font-semibold">
                      Memuat file rekaman video...
                    </div>
                  )}

                  {recordedVideoUrl && (
                    <div className="flex gap-3">
                      <a
                        href={recordedVideoUrl}
                        download={`latihan-presenta-${Date.now()}.webm`}
                        className="inline-flex items-center gap-2 bg-zinc-150 hover:bg-zinc-200 text-zinc-700 text-xs font-extrabold py-2 px-4 rounded-xl transition border border-zinc-250"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Unduh File Latihan (WebM)</span>
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
                          className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-650 text-xs font-extrabold py-2 px-4 rounded-xl transition cursor-pointer"
                        >
                          Batalkan Mode Klip
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Timeline Seek panel Column */}
                <div className="bg-zinc-50 border-2 border-zinc-200 rounded-2xl p-4 space-y-4 flex flex-col max-h-[360px] overflow-hidden">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Putar Klip Kejadian</h4>
                  
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {lookAwayEvents.length === 0 ? (
                      <div className="text-zinc-400 text-xs font-bold text-center py-10">Tidak ada gangguan terdeteksi</div>
                    ) : (
                      lookAwayEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handlePlayClip(event)}
                          className={`w-full text-left border-2 p-3.5 rounded-xl transition flex justify-between items-center group cursor-pointer ${
                            playingClip?.id === event.id
                              ? "bg-blue-50 border-blue-400"
                              : "bg-white hover:bg-zinc-150 border-zinc-200"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="text-xs font-black text-zinc-800 font-mono flex items-center gap-1.5">
                              <span>Menit {formatTime(event.timestamp)}</span>
                              {playingClip?.id === event.id && (
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-550 truncate max-w-[140px] font-bold">
                              {event.type}
                            </div>
                          </div>
                          
                          <span className="text-[10px] text-[#1e5399] font-extrabold group-hover:translate-x-0.5 transition-transform duration-200">
                            Mulai &rarr;
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
        /* ─── Active/Inactive Session Simulator View ─── */
        <div className="space-y-8 animate-fade-in">
          
          {/* Main Classroom Screen Viewport Container */}
          <div className="relative aspect-video w-full overflow-hidden rounded-[32px] bg-zinc-950 border-2 border-zinc-200 border-b-8 flex items-center justify-center shadow-lg">
            
            {/* Background webcam video element - must remain running in the DOM but hidden */}
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover transform scale-x-[-1] opacity-0 pointer-events-none"
              muted
              playsInline
            />

            {/* Inactive State: Dark Viewport with a big golden Start Button */}
            {!isSessionActive && (
              <div className="text-center flex flex-col items-center justify-center p-8 z-10">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="group flex flex-col items-center gap-4 bg-[#ffd15c] text-[#78350f] font-black border-2 border-amber-400 border-b-8 hover:border-b-4 hover:translate-y-[4px] active:translate-y-[8px] active:border-b-0 px-8 py-5 rounded-[24px] cursor-pointer transition-all duration-100 shadow-md text-lg tracking-wide uppercase"
                >
                  <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-md group-hover:scale-110 transition-transform">
                    <svg className="h-7 w-7 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Mulai Latihan Baru</span>
                </button>
                <p className="text-zinc-500 text-xs font-bold mt-4 tracking-wide">
                  Gaze & Eye Tracker akan mendeteksi ketika kamu mengalihkan pandangan.
                </p>
              </div>
            )}

            {/* Active Session Overlays */}
            {isSessionActive && (
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 pointer-events-none">
                
                {/* Top Section overlays */}
                <div className="flex justify-between items-start w-full">
                  
                  {/* Top-Left: Pause button & Elapsed Timer */}
                  <div className="flex flex-col items-start gap-3 pointer-events-auto">
                    <button 
                      onClick={handleTogglePause}
                      className="h-12 w-12 rounded-full bg-[#ffd15c] border-2 border-amber-400 border-b-6 hover:border-b-4 hover:translate-y-[2px] active:translate-y-[6px] active:border-b-0 text-[#78350f] flex items-center justify-center font-extrabold shadow-md transition-all cursor-pointer"
                    >
                      {isPaused ? (
                        <svg className="h-6 w-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      )}
                    </button>
                    
                    <div className="bg-black/60 backdrop-blur-md border border-white/20 text-white font-extrabold font-mono text-xs px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-md">
                      <div className="h-2 w-2 rounded-full bg-[#1e5399] animate-pulse" />
                      <span>{formatTime(sessionTime)}</span>
                    </div>
                  </div>

                  {/* Top-Center: Gaze Attention rating bar gauge */}
                  <div className="flex flex-col items-center gap-1 w-full max-w-xs md:max-w-sm ml-auto mr-auto">
                    <div className="flex justify-between w-full text-[10px] font-black text-white/90 px-1 uppercase tracking-wider">
                      <span className="text-orange-400">Bosan</span>
                      <span className="text-emerald-400">Tertarik</span>
                    </div>
                    <div className="relative w-full h-3 bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-400 rounded-full border border-white/25">
                      {/* Pointer/Needle */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-6.5 h-6.5 bg-white border-2 border-zinc-600 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out"
                        style={{ left: `calc(${needlePosition}% - 13px)` }}
                      >
                        <div className="w-2 h-2 bg-zinc-700 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Top-Right: Hidden placeholder for symmetry */}
                  <div className="w-12 h-12"></div>
                </div>

                {/* Bottom Section overlays */}
                <div className="flex justify-between items-end w-full">
                  
                  {/* Bottom-Center: Microphone live wave capsule wrapper */}
                  <div className="bg-black/60 backdrop-blur-md border border-white/20 text-white px-4 py-2.5 rounded-2xl flex items-center gap-3.5 shadow-md mx-auto pointer-events-auto">
                    {/* Microphone icon */}
                    <svg className="h-5 w-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    
                    {/* Visualizer Soundbars */}
                    <div className="flex items-end gap-1 h-5 w-16">
                      <div className={`w-1 rounded-full bg-white transition-all duration-100 ${isPaused ? "h-1.5" : "h-5 origin-bottom animate-wave-1"}`} />
                      <div className={`w-1 rounded-full bg-white transition-all duration-100 ${isPaused ? "h-1" : "h-5 origin-bottom animate-wave-2"}`} />
                      <div className={`w-1 rounded-full bg-white transition-all duration-100 ${isPaused ? "h-2" : "h-5 origin-bottom animate-wave-3"}`} />
                      <div className={`w-1 rounded-full bg-white transition-all duration-100 ${isPaused ? "h-1.5" : "h-5 origin-bottom animate-wave-4"}`} />
                      <div className={`w-1 rounded-full bg-white transition-all duration-100 ${isPaused ? "h-2.5" : "h-5 origin-bottom animate-wave-5"}`} />
                      <div className={`w-1 rounded-full bg-white transition-all duration-100 ${isPaused ? "h-1" : "h-5 origin-bottom animate-wave-6"}`} />
                    </div>
                  </div>

                  {/* Bottom-Right: Yellow Selesai Rekam button */}
                  <div className="pointer-events-auto">
                    <button 
                      onClick={handleStopSession}
                      className="bg-[#ffd15c] text-[#78350f] border-2 border-amber-400 border-b-6 hover:border-b-4 hover:translate-y-[2px] active:translate-y-[6px] active:border-b-0 font-extrabold px-6 py-3 rounded-2xl flex items-center gap-3 shadow-md hover:bg-[#ffe082] cursor-pointer transition-all duration-100"
                    >
                      <div className="h-3.5 w-3.5 bg-red-600 rounded-sm" />
                      <span className="tracking-wide text-sm font-black uppercase">Selesai Rekam</span>
                    </button>
                  </div>
                </div>

                {/* Looking away warning glow */}
                {(status === "warning" || !isFaceDetected) && !isPaused && (
                  <div className="absolute inset-0 border-4 border-red-500 rounded-[28px] pointer-events-none animate-pulse" />
                )}

              </div>
            )}
          </div>

          {/* ─── Lower Metrics Grid (4 Cards Row) ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Topik Presentasi */}
            <div className="bg-white border-2 border-zinc-200 border-b-4 rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-[160px]">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-600 rounded-2xl p-3 shrink-0 flex items-center justify-center">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Topik Presentasi</h3>
                  
                  {isEditingTopic ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={tempTopic}
                        onChange={(e) => setTempTopic(e.target.value)}
                        className="w-full text-xs font-bold border-2 border-zinc-200 rounded-xl p-2 focus:border-blue-400 focus:outline-hidden"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button onClick={saveTopic} className="text-[10px] font-extrabold bg-[#1e5399] text-white px-2.5 py-1.5 rounded-lg border-b-2 border-blue-800">Simpan</button>
                        <button onClick={() => { setTempTopic(topic); setIsEditingTopic(false); }} className="text-[10px] font-extrabold bg-zinc-100 text-zinc-650 px-2.5 py-1.5 rounded-lg border-2 border-zinc-200">Batal</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-extrabold text-zinc-700 leading-relaxed mt-1 line-clamp-3">
                      {topic}
                    </p>
                  )}
                </div>
              </div>

              {!isEditingTopic && (
                <button 
                  onClick={() => setIsEditingTopic(true)}
                  className="text-xs font-extrabold text-[#1e5399] hover:underline self-start mt-2"
                >
                  Ubah Topik
                </button>
              )}
            </div>

            {/* Card 2: Durasi Target */}
            <div className="bg-white border-2 border-zinc-200 border-b-4 rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-[160px]">
              <div className="flex items-start gap-4">
                <div className="bg-cyan-100 text-cyan-600 rounded-2xl p-3 shrink-0 flex items-center justify-center">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Durasi Target</h3>
                  
                  {isEditingDuration ? (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        value={tempDuration}
                        onChange={(e) => setTempDuration(e.target.value)}
                        className="w-full text-xs font-bold border-2 border-zinc-200 rounded-xl p-2 focus:border-cyan-400 focus:outline-hidden"
                      />
                      <div className="flex gap-2">
                        <button onClick={saveDuration} className="text-[10px] font-extrabold bg-[#1e5399] text-white px-2.5 py-1.5 rounded-lg border-b-2 border-blue-800">Simpan</button>
                        <button onClick={() => { setTempDuration(targetDuration); setIsEditingDuration(false); }} className="text-[10px] font-extrabold bg-zinc-100 text-zinc-650 px-2.5 py-1.5 rounded-lg border-2 border-zinc-200">Batal</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-extrabold text-zinc-700 mt-2">
                      {targetDuration}
                    </p>
                  )}
                </div>
              </div>

              {!isEditingDuration && (
                <button 
                  onClick={() => setIsEditingDuration(true)}
                  className="text-xs font-extrabold text-[#1e5399] hover:underline self-start mt-2"
                >
                  Ubah Durasi
                </button>
              )}
            </div>

            {/* Card 3: Penilaian Fokus */}
            <div className="bg-white border-2 border-zinc-200 border-b-4 rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-[160px]">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 text-purple-600 rounded-2xl p-3 shrink-0 flex items-center justify-center">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Penilaian Fokus</h3>
                  <ul className="text-xs font-extrabold text-zinc-600 mt-2 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                      <span>Konten</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                      <span>Struktur</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                      <span>Penggunaan Bahasa</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                      <span>Penampilan</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 4: Hasil Latihan */}
            <div className="bg-white border-2 border-zinc-200 border-b-4 rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-[160px]">
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 text-amber-600 rounded-2xl p-3 shrink-0 flex items-center justify-center">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Hasil Latihan</h3>
                  
                  {sessionTime > 0 && lookAwayCount > 0 ? (
                    <div className="mt-2">
                      <span className="text-lg font-black text-[#58cc02]">{calculateFocusScore()}%</span>
                      <span className="text-[10px] font-bold text-zinc-550 block leading-tight mt-0.5">Fokus Latihan Terakhir</span>
                    </div>
                  ) : (
                    <p className="text-[11px] font-semibold text-zinc-500 leading-relaxed mt-2">
                      Setelah selesai, hasil evaluasi akan muncul di sini.
                    </p>
                  )}
                </div>
              </div>

              {/* Checklist visual report badge */}
              <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl p-2.5 mt-2">
                <div className="bg-[#e8f8f0] text-emerald-500 rounded-full p-1 shrink-0">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={35}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-[9px] text-zinc-500 font-extrabold leading-tight">
                  Tingkatkan kemampuan presentasimu!
                </div>
              </div>
            </div>

          </div>

          {/* Dynamic settings & feedback controls collapsible for calibration */}
          <div className="bg-white border-2 border-zinc-200 border-b-4 rounded-3xl p-6 text-zinc-900 space-y-6 shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-zinc-900">Kalibrasi Sensitivitas Pendeteksi</h3>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${
                detectionMode === "eye" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
              }`}>
                Mode Pelacakan: {detectionMode === "eye" ? "Mata" : "Kepala"}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Limit X setting */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-550 font-bold">
                  <span>Batas Deviasi Horizontal (X)</span>
                  <span className="font-mono font-black">{settings.thresholdX}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.25"
                  step="0.01"
                  value={settings.thresholdX}
                  onChange={(e) => setSettings(prev => ({ ...prev, thresholdX: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#1e5399]"
                />
              </div>

              {/* Limit Y setting */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-550 font-bold">
                  <span>Batas Deviasi Vertikal (Y)</span>
                  <span className="font-mono font-black">{settings.thresholdY}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.25"
                  step="0.01"
                  value={settings.thresholdY}
                  onChange={(e) => setSettings(prev => ({ ...prev, thresholdY: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#1e5399]"
                />
              </div>

              {/* Debounce delay setting */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-555 font-bold">
                  <span>Jeda Toleransi Beralih Fokus</span>
                  <span className="font-mono font-black">{settings.debounceMs}ms</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="250"
                  value={settings.debounceMs}
                  onChange={(e) => setSettings(prev => ({ ...prev, debounceMs: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#1e5399]"
                />
              </div>
            </div>

            {/* Diagnostic stats */}
            {isSessionActive && !isPaused && (
              <div className="pt-4 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono font-bold">
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-1">
                  <div className="text-zinc-500">{detectionMode === "eye" ? "Deviasi Horizontal Mata" : "Deviasi Horizontal Kepala"}</div>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-sm font-black text-[#1e5399]">{currentDevX}</span>
                    <span className="text-[10px] text-zinc-400">Batas: {settings.thresholdX}</span>
                  </div>
                  <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-100 ${currentDevX > settings.thresholdX ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min((currentDevX / settings.thresholdX) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-1">
                  <div className="text-zinc-500">{detectionMode === "eye" ? "Deviasi Vertikal Mata" : "Deviasi Vertikal Kepala"}</div>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-sm font-black text-[#1e5399]">{currentDevY}</span>
                    <span className="text-[10px] text-zinc-400">Batas: {settings.thresholdY}</span>
                  </div>
                  <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-100 ${currentDevY > settings.thresholdY ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min((currentDevY / settings.thresholdY) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Feedback options: Beep Toggle */}
          <div className="bg-white border-2 border-zinc-200 border-b-4 rounded-3xl p-5 shadow-xs flex items-center justify-between text-zinc-900">
            <div className="flex flex-col">
              <span className="text-sm text-zinc-800 font-extrabold">Peringatan Suara Latar</span>
              <span className="text-xs font-semibold text-zinc-550">Mengeluarkan bunyi 'beep' saat kamu beralih pandangan</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={enableSound}
                onChange={(e) => setEnableSound(e.target.checked)} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#58cc02]"></div>
            </label>
          </div>

        </div>
      )}

    </div>
  );
}
