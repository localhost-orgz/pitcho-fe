# Pitcho

**Latihan ngomong. Lawan gangguan. Makin jago lewat feedback.** — Pelatih komunikasi berbasis AI yang menciptakan simulasi presentasi dan wawancara kerja dengan lingkungan serealistis mungkin, lengkap dengan analisis performa dan rekomendasi yang bisa langsung dipraktikkan.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/Lisensi-MIT-green?style=for-the-badge)](./LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)](https://pitcho-fe.vercel.app)

---

## ✨ Fitur Unggulan

- 🎯 **Simulasi Presentasi Interaktif** — Berlatih presentasi di depan kelas virtual dengan video *classroom* yang bereaksi. AI akan memicu gangguan (batuk, HP berbunyi, botol jatuh) sesuai tingkat kesulitan yang dipilih.
- 🤖 **Wawancara Kerja Berbasis AI** — Upload CV kamu dan AI akan membuatkan pertanyaan wawancara yang relevan. Dukung tipe Behavioral, Technical, Situational, dan Case Study dengan suara TTS bahasa Indonesia.
- 👁️ **Pelacakan Tatapan Mata Real-Time** — Teknologi *computer vision* MediaPipe Face Landmarker mendeteksi apakah kamu melihat kamera atau malah melengos, lengkap dengan pencatatan durasi dan *timeline* kejadian.
- 🎙️ **Analisis Bicara Mendalam** — Rekaman suara diproses untuk menghitung *filler words* ("anu", "eee"), kecepatan bicara (WPM), dan redundansi kata. Hasil analisis dari AssemblyAI dikombinasikan dengan metrik *delivery* lokal.
- 📊 **Skor Performa Multi-Dimensi** — Skor keseluruhan dihitung dari empat dimensi: **Focus** (40%), **Pace** (25%), **Filler** (20%), dan **Efficiency** (15%) menggunakan kurva Gaussian yang adil untuk semua durasi sesi.
- 🏅 **Sistem Badge & Gamifikasi** — 24+ lencana dalam 8 kategori (Consistency, Focus, Fluency, Pace, Presentation, Interview, Improvement, Elite) yang terbuka seiring progres latihan kamu.
- 🔥 **Pelacakan Streak & Konsistensi** — Pantau *heatmap* latihan harian, mingguan, dan tahunan. Lihat kapan kamu paling konsisten dan dapatkan *streak* latihan berturut-turut.
- 🎓 **Tantangan & Sumber Belajar** — Ikuti tantangan terstruktur untuk mengasah skill spesifik, dan akses kumpulan materi public speaking yang dikurasi.

---

## 🛠 Tech Stack

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-16.2.6-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Computer Vision & Speech
![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10-0097A7?style=for-the-badge&logo=google&logoColor=white)
![AssemblyAI](https://img.shields.io/badge/AssemblyAI-Speech_Analysis-5A00FF?style=for-the-badge&logo=assemblyai&logoColor=white)
![ElevenLabs](https://img.shields.io/badge/ElevenLabs-TTS-6366F1?style=for-the-badge&logo=elevenlabs&logoColor=white)
![Web Speech API](https://img.shields.io/badge/Web_Speech_API-STT/TTS-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)

### UI & Styling
![Radix UI](https://img.shields.io/badge/Radix_UI-Primitives-161618?style=for-the-badge&logo=radixui&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide-Icons-F56565?style=for-the-badge&logo=lucide&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-New_York-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

### Backend & API
![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google-OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)

### Codec & Media
![WebCodecs](https://img.shields.io/badge/WebCodecs-AAC_Encoder-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![mp4-muxer](https://img.shields.io/badge/mp4--muxer-5.2-FF6B00?style=for-the-badge&logo=mp4&logoColor=white)

---

## 🚀 Cara Menjalankan

### Prasyarat

- **Node.js** versi 18.17 atau lebih tinggi
- **npm** versi 9 atau lebih tinggi
- Kamera dan mikrofon (untuk mode latihan)
- Akun di layanan eksternal berikut (opsional, untuk deployment penuh):
  - [AssemblyAI](https://www.assemblyai.com/) — API key untuk analisis bicara
  - [ElevenLabs](https://elevenlabs.io/) — API key untuk Text-to-Speech

### Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/fazamumtaz/pitcho-fe.git
cd pitcho-fe

# 2. Install dependensi
npm install

# 3. Salin file environment
cp .env.example .env.local   # jika .env.example tersedia
# atau buat file .env.local secara manual (lihat tabel di bawah)

# 4. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

### Scripts

| Perintah         | Deskripsi                                      |
| ---------------- | ---------------------------------------------- |
| `npm run dev`    | Menjalankan server development dengan Turbopack  |
| `npm run build`  | Build production ke folder `.next/`            |
| `npm run start`  | Menjalankan server production hasil build      |
| `npm run lint`   | Menjalankan ESLint untuk memeriksa kode        |

### Environment Variables

Buat file `.env.local` di root project dengan variabel berikut:

| Variabel                         | Deskripsi                                          | Contoh                                   |
| -------------------------------- | -------------------------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_ASSEMBLYAI_API_KEY` | API Key AssemblyAI untuk speech-to-text & analisis | `e4de91e7...`                            |
| `ELEVENLABS_API_KEY`             | API Key ElevenLabs untuk Text-to-Speech            | `sk_139c84de...`                         |

> ⚠️ **Penting:** `ELEVENLABS_API_KEY` hanya boleh diset di server-side (tidak pernah diawali `NEXT_PUBLIC_`). File `.env` sudah termasuk di `.gitignore` — jangan commit API key ke repositori publik.

---

## 📂 Struktur Project

```
pitcho-fe/
├── src/
│   ├── app/                          # Next.js App Router (pages + API)
│   │   ├── (auth)/                   #   Halaman login, signup, OAuth callback
│   │   ├── api/                      #   API routes (BFF proxy)
│   │   │   ├── assemblyai-token/     #     Token AssemblyAI untuk client
│   │   │   ├── auth/                 #     Google OAuth, signin, signup
│   │   │   ├── badges/               #     Data badge pengguna
│   │   │   ├── history/              #     Riwayat sesi latihan
│   │   │   ├── streak/               #     Data streak (current, week, year)
│   │   │   └── tts/                  #     Proxy ElevenLabs (API key aman)
│   │   ├── challenges/               #   Halaman tantangan terstruktur
│   │   ├── interview/                #   Mode wawancara kerja
│   │   │   ├── (sidebar)/            #     Setup & hasil wawancara
│   │   │   └── session/              #     Sesi wawancara live
│   │   ├── practice/                 #   Halaman latihan bebas
│   │   ├── presentation/             #   Mode presentasi
│   │   │   ├── setup/                #     Upload materi & konfigurasi sesi
│   │   │   ├── session/              #     Sesi presentasi live + video
│   │   │   └── result/               #     Hasil & analisis performa
│   │   ├── profile/                  #   Profil pengguna
│   │   ├── progress/                 #   Dashboard progres (versi 1)
│   │   ├── progress-v2/              #   Dashboard progres (versi 2, terbaru)
│   │   ├── resources/                #   Materi pembelajaran public speaking
│   │   ├── studio/                   #   Dashboard utama setelah login
│   │   ├── session/                  #   Detail sesi historis
│   │   ├── layout.js                 #   Root layout (font, auth, tour)
│   │   ├── page.js                   #   Landing page / marketing
│   │   └── middleware.js             #   Auth guard (redirect jika belum login)
│   ├── components/
│   │   ├── Auth/                     #   Komponen otentikasi (Google btn, dll)
│   │   ├── Progress/                 #   Komponen dashboard progres
│   │   │   ├── BadgeGrid.jsx         #     Grid lencana yang sudah dibuka
│   │   │   ├── BadgeIcon.jsx         #     Ikon lencana heksagonal 3D
│   │   │   ├── ConsistencyHeatmap.jsx#     Heatmap kalender latihan
│   │   │   ├── GrowthTimeline.jsx    #     Timeline perkembangan skor
│   │   │   ├── HeroBanner.jsx        #     Banner progres utama
│   │   │   ├── SessionHistoryList.jsx#     Daftar sesi terdahulu
│   │   │   └── StreakRing.jsx        #     Cincin progres streak
│   │   ├── Tour/                     #   Sistem onboarding interaktif
│   │   ├── UI/                       #   Komponen UI generik (button, chart)
│   │   ├── AppShell.jsx              #   Shell layout dengan sidebar
│   │   ├── BottomBar.jsx             #   Navigasi bawah (mobile)
│   │   ├── DocumentLibrary.jsx       #   Perpustakaan dokumen yang diupload
│   │   ├── FaceTracker.jsx           #   Tampilan face tracking overlay
│   │   ├── FaceTrackerModal.jsx      #   Modal kalibrasi & setup kamera
│   │   ├── MobileHeader.jsx          #   Header untuk tampilan mobile
│   │   ├── Providers.jsx             #   Provider context (auth, dll)
│   │   └── Sidebar.jsx               #   Navigasi samping (desktop)
│   ├── contexts/
│   │   └── AuthContext.js            #   Context otentikasi global
│   ├── hooks/                        #   Custom React hooks
│   │   ├── useAuth.js                #     Hook akses data pengguna
│   │   ├── useDistractionEngine.js   #     Orkestrator jadwal gangguan
│   │   ├── useDistractionSchedule.js #     Generator jadwal acak gangguan
│   │   ├── useFaceTracker.js         #     Face/eye tracking (MediaPipe)
│   │   ├── useInterviewVideoController.js # Video state machine wawancara
│   │   ├── useSpeechTracker.js       #     Speech recognition real-time
│   │   ├── useTTS.js                 #     Hook Text-to-Speech (ElevenLabs + fallback)
│   │   └── useVideoController.js     #     Video state machine presentasi
│   ├── lib/
│   │   ├── api.js                    #     Axios client + fungsi backend API
│   │   ├── badgeDefinitions.js       #     Definisi 24+ lencana gamifikasi
│   │   ├── distractionUtils.js       #     Generator jadwal & timeline video
│   │   ├── elevenlabs.js             #     Service TTS ElevenLabs (client-side)
│   │   ├── history.js                #     Service riwayat sesi
│   │   └── utils.js                  #     Utilitas (cn, formatter, dll)
│   └── utils/
│       ├── clipExtractor.js          #     Ekstrak klip video dari timeline
│       ├── scoring.js                #     Engine skoring multi-dimensi
│       ├── speechAnalysis.js         #     Upload & analisis rekaman suara
│       └── videoStorage.js           #     Penyimpanan video ke IndexedDB
├── public/                           # Aset statis (logo, gambar, favicon)
├── .gitignore                        # Aturan ignore Git
├── components.json                   # Konfigurasi shadcn/ui
├── eslint.config.mjs                 # Konfigurasi ESLint
├── jsconfig.json                     # Path alias (`@/` → `src/`)
├── next.config.mjs                   # Konfigurasi Next.js 16
├── package.json                      # Dependensi dan script
├── postcss.config.mjs                # Konfigurasi PostCSS (Tailwind)
└── PRD.md                            # Product Requirements Document
```

---

## 📸 Screenshot / Demo

| Fitur | Tampilan |
|---|---|
| Landing Page | `[placeholder screenshot]` |
| Studio Dashboard | `[placeholder screenshot]` |
| Setup Presentasi | `[placeholder screenshot]` |
| Sesi Presentasi Live | `[placeholder screenshot]` |
| Hasil & Analisis Skor | `[placeholder screenshot]` |
| Setup Wawancara | `[placeholder screenshot]` |
| Sesi Wawancara dengan TTS | `[placeholder screenshot]` |
| Dashboard Progres | `[placeholder screenshot]` |
| Koleksi Lencana | `[placeholder screenshot]` |
| Halaman Tantangan | `[placeholder screenshot]` |

> **Catatan:** Ganti placeholder di atas dengan screenshot asli aplikasi sebelum dikumpulkan. Gunakan gambar PNG resolusi tinggi yang menunjukkan antarmuka dalam bahasa Indonesia.

---

## 🏆 Konteks Kompetisi

### Masalah Nyata yang Diselesaikan

Di Indonesia, kemampuan komunikasi publik dan wawancara kerja sering kali menjadi penghalang utama dalam pengembangan karier. Survei menunjukkan bahwa **glossophobia** (ketakutan berbicara di depan umum) memengaruhi hingga 75% populasi. Mahasiswa yang akan sidang skripsi, profesional yang harus presentasi ke klien, hingga pencari kerja yang menghadapi panel interview — semuanya menghadapi masalah yang sama: **gugup, kehilangan fokus saat ada gangguan, dan tidak adanya umpan balik yang objektif dan terukur.**

Pitcho hadir untuk mengisi celah ini. Tidak seperti latihan di depan cermin atau rekaman video biasa, Pitcho menyediakan lingkungan simulasi yang **mensimulasikan tekanan dan gangguan dunia nyata** — lengkap dengan analisis performa berbasis AI yang memberikan skor dan saran perbaikan spesifik pada empat dimensi komunikasi: kontak mata, kecepatan bicara, kata pengisi (*filler words*), dan efisiensi bahasa.

### Target Pengguna dan Dampak

Aplikasi ini dirancang untuk tiga segmen utama:

1. **Mahasiswa dan Fresh Graduate** — Berlatih presentasi skripsi, sidang proposal, dan wawancara kerja pertama. Sistem skoring dan *streak* memberikan motivasi untuk terus berlatih.
2. **Profesional dan Pencari Kerja** — Mengasah kemampuan presentasi bisnis, *pitching* ide ke investor, dan menghadapi wawancara teknis maupun behavioral. Fitur upload CV memungkinkan AI membuatkan pertanyaan yang benar-benar relevan dengan latar belakang pengguna.
3. **Pelatih dan Institusi Pendidikan** — Dashboard progres yang komprehensif dapat digunakan untuk memantau perkembangan peserta didik secara objektif.

Dengan antarmuka berbahasa Indonesia dan TTS suara pria Indonesia yang natural, Pitcho menghilangkan hambatan bahasa yang sering muncul di *tool* sejenis buatan luar negeri.

### Relevansi dengan SDGs

Pitcho berkontribusi langsung pada **SDG 4 (Quality Education)** — menyediakan akses ke pelatihan keterampilan komunikasi yang berkualitas dan personal, tanpa batasan geografis maupun biaya sewa pelatih profesional. Fitur *free tier* memungkinkan siapa pun dengan laptop dan koneksi internet mulai berlatih tanpa biaya. Selain itu, fokus pada keterampilan wawancara kerja mendukung **SDG 8 (Decent Work and Economic Growth)** dengan meningkatkan kesiapan angkatan kerja muda Indonesia dalam bersaing di pasar kerja nasional maupun global.

---

## 👥 Tim / Pembuat

**Fazam Um Taz** — [fazamumtazramadhan@gmail.com](mailto:fazamumtazramadhan@gmail.com)

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](./LICENSE). Lihat file `LICENSE` untuk informasi selengkapnya.

---

<p align="center">
  <b>Dibuat dengan ❤️ untuk Lomba — © 2026 Pitcho</b>
</p>
