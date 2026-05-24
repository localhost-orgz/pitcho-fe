<div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans selection:bg-[#d8f3dc] selection:text-[#1b4332]">
      {/* ─── Top Header Navbar ─── */}
      <header className="border-b-4 border-zinc-200 bg-white sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#1e5399] to-[#3b82f6] flex items-center justify-center text-white shadow-[0_4px_0_#153d70] border-b-2 border-white/20">
              {/* Mic Icon */}
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-2xl text-[#1e5399] tracking-tight block leading-tight">
                Presenta
              </span>
              <span className="text-xs font-semibold text-zinc-550 block">
                Belajar Presentasi Jadi Mudah
              </span>
            </div>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-3 bg-white border-2 border-zinc-200 border-b-4 hover:border-b-2 active:border-b-0 hover:translate-y-[2px] active:translate-y-[4px] px-4 py-2 rounded-2xl cursor-pointer transition-all duration-100"
            >
              {/* Profile Avatar (Andi) */}
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white border-2 border-white font-bold text-sm shadow-xs overflow-hidden">
                <svg
                  className="h-7 w-7 mt-1.5 text-orange-950/70"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-bold text-sm text-zinc-700">Hai, Andi</span>
              <svg
                className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border-2 border-zinc-200 bg-white shadow-xl py-2 z-50 animate-fade-in font-medium text-sm text-zinc-700">
                <div className="px-4 py-2 border-b border-zinc-100 text-xs font-bold text-zinc-400 uppercase">
                  Menu Pengguna
                </div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setActiveTab("beranda");
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 hover:text-[#1e5399] transition font-bold"
                >
                  Dashboard Saya
                </button>
                <a
                  href="#"
                  className="block px-4 py-2.5 hover:bg-zinc-50 transition"
                >
                  Pengaturan Profil
                </a>
                <div className="border-t border-zinc-100 my-1"></div>
                <button
                  onClick={() => alert("Logout demo!")}
                  className="w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 transition font-bold"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Body Layout (Sidebar + Content) ─── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            {/* Sidebar Navigation Tabs */}
            <nav className="flex flex-col gap-2">
              {/* Beranda (Home) */}
              <button
                onClick={() => setActiveTab("beranda")}
                className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-100 border-2 border-transparent ${
                  activeTab === "beranda"
                    ? "bg-[#1e5399] text-white border-b-4 border-[#153d70] shadow-[0_2px_4px_rgba(30,83,153,0.15)]"
                    : "bg-white text-zinc-650 hover:bg-zinc-50 border-zinc-200 border-b-4 hover:border-b-2 active:border-b-0 hover:translate-y-[2px] active:translate-y-[4px]"
                }`}
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Beranda</span>
              </button>

              {/* Latihan Baru (New Practice) */}
              <button
                onClick={() => setActiveTab("latihan_baru")}
                className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-100 border-2 border-transparent ${
                  activeTab === "latihan_baru"
                    ? "bg-[#1e5399] text-white border-b-4 border-[#153d70]"
                    : "bg-white text-zinc-650 hover:bg-zinc-50 border-zinc-200 border-b-4 hover:border-b-2 active:border-b-0 hover:translate-y-[2px] active:translate-y-[4px]"
                }`}
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Latihan Baru</span>
              </button>

              {/* Riwayat Latihan */}
              <button
                onClick={() => setActiveTab("riwayat")}
                className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-100 border-2 border-transparent ${
                  activeTab === "riwayat"
                    ? "bg-[#1e5399] text-white border-b-4 border-[#153d70]"
                    : "bg-white text-zinc-650 hover:bg-zinc-50 border-zinc-200 border-b-4 hover:border-b-2 active:border-b-0 hover:translate-y-[2px] active:translate-y-[4px]"
                }`}
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Riwayat Latihan</span>
              </button>

              {/* Materi */}
              <button
                onClick={() => setActiveTab("materi")}
                className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-100 border-2 border-transparent ${
                  activeTab === "materi"
                    ? "bg-[#1e5399] text-white border-b-4 border-[#153d70]"
                    : "bg-white text-zinc-650 hover:bg-zinc-50 border-zinc-200 border-b-4 hover:border-b-2 active:border-b-0 hover:translate-y-[2px] active:translate-y-[4px]"
                }`}
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span>Materi</span>
              </button>

              {/* Laporan */}
              <button
                onClick={() => setActiveTab("laporan")}
                className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-100 border-2 border-transparent ${
                  activeTab === "laporan"
                    ? "bg-[#1e5399] text-white border-b-4 border-[#153d70]"
                    : "bg-white text-zinc-650 hover:bg-zinc-50 border-zinc-200 border-b-4 hover:border-b-2 active:border-b-0 hover:translate-y-[2px] active:translate-y-[4px]"
                }`}
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
                  />
                </svg>
                <span>Laporan</span>
              </button>
            </nav>
          </div>

          {/* ─── Tips Presentasi Card ─── */}
          <div className="bg-[#fffdf2] border-2 border-[#fcd34d] border-b-4 rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-3 text-zinc-800">
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 text-amber-500 rounded-lg p-1.5">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-sm text-amber-700 tracking-tight">
                Tips Presentasi
              </h3>
            </div>

            <p className="text-xs font-semibold leading-relaxed text-zinc-600">
              {tips[tipIndex]}
            </p>

            <button
              onClick={cycleTip}
              className="text-xs font-bold text-[#1e5399] hover:underline flex items-center gap-1 group self-start"
            >
              <span>Selengkapnya</span>
              <span className="group-hover:translate-x-1 transition-transform">
                &rarr;
              </span>
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1">
          {activeTab === "beranda" ? (
            <FaceTracker />
          ) : (
            /* Duolingo Placeholder view for other tabs */
            <div className="bg-white border-2 border-zinc-200 border-b-4 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[500px] animate-fade-in">
              <div className="h-24 w-24 rounded-full bg-[#e8f3ff] text-[#1e5399] flex items-center justify-center mb-6 border-2 border-dashed border-[#1e5399]/30">
                <svg
                  className="h-12 w-12 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">
                Fitur Sedang Dikembangkan!
              </h1>
              <p className="mt-4 text-zinc-550 text-base max-w-md font-semibold leading-relaxed">
                Halaman{" "}
                <span className="text-[#1e5399] font-bold capitalize">
                  "{activeTab.replace("_", " ")}"
                </span>{" "}
                sedang dirancang dengan penuh cinta dan energi Duolingo! Silakan
                gunakan tab{" "}
                <span className="text-[#1e5399] font-bold">Beranda</span> untuk
                mencoba simulator presentasi.
              </p>
              <button
                onClick={() => setActiveTab("beranda")}
                className="mt-8 bg-[#1e5399] text-white border-b-4 border-[#153d70] hover:border-b-2 hover:translate-y-[2px] active:translate-y-[4px] active:border-b-0 font-extrabold px-6 py-3 rounded-2xl text-sm transition-all cursor-pointer"
              >
                Kembali ke Beranda
              </button>
            </div>
          )}

          {/* ─── Footer ─── */}
          <footer className="mt-8 border-t border-zinc-200 py-6 text-center text-xs font-semibold text-zinc-400">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                &copy; {new Date().getFullYear()} Presenta. Semua hak
                dilindungi.
              </div>
              <div className="flex gap-4">
                <a href="#" className="hover:text-zinc-650 transition">
                  Kebijakan Privasi
                </a>
                <span>&bull;</span>
                <a href="#" className="hover:text-zinc-650 transition">
                  Syarat & Ketentuan
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
