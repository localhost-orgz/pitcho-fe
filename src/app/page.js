"use client";

import FaceTracker from "../components/FaceTracker";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col justify-between font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Header / Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              P
            </div>
            <span className="font-bold text-white tracking-tight">Pitcho Focus</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
            <span className="hidden sm:inline bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md">V1.0.0</span>
            <a 
              href="https://github.com/google/mediapipe" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-white transition flex items-center gap-1"
            >
              <span>Powered by MediaPipe</span>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main content body hosting the face tracker */}
      <main className="flex-1 flex flex-col justify-center py-10 md:py-16">
        <div className="max-w-4xl mx-auto w-full px-4 text-center mb-6">
          <h2 className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">Attention Keeper</h2>
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl mt-1">
            Stay Focused on the Camera
          </h1>
          <p className="mt-3 text-lg text-zinc-400 max-w-xl mx-auto">
            Train yourself to maintain focus. Our intelligent local gaze monitor notifies you immediately whenever you look away.
          </p>
        </div>

        <FaceTracker />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/20 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>&copy; {new Date().getFullYear()} Pitcho Gaze Guard. All processing runs 100% locally.</div>
          <div className="flex gap-4 text-zinc-400">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <span>&bull;</span>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

