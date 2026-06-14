# Pitcho

Pelatih komunikasi berbasis AI — simulasi presentasi dan wawancara kerja dengan lingkungan serealistis mungkin, lengkap dengan analisis performa dan feedback yang bisa langsung dipraktikkan.

---

## ✨ Features

- **Simulasi Presentasi Interaktif** — Latihan presentasi dengan video kelas virtual. AI memicu gangguan real-time (batuk, HP bunyi, botol jatuh) sesuai tingkat kesulitan.
- **Wawancara Kerja Berbasis AI** — Upload CV, AI generate pertanyaan relevan. Dukung tipe Behavioral, Technical, Situational, dan Case Study dengan TTS suara Indonesia.
- **Face & Eye Tracking** — MediaPipe Face Landmarker mendeteksi arah pandangan dan posisi kepala secara real-time, lengkap dengan timeline kejadian.
- **Analisis Bicara** — Rekaman suara dianalisis untuk filler words, kecepatan bicara (WPM), dan redundansi kata via AssemblyAI.
- **Skor Multi-Dimensi** — Empat dimensi penilaian: Focus (40%), Pace (25%), Filler (20%), Efficiency (15%) dengan kurva Gaussian yang adil.
- **Badge & Gamifikasi** — 24+ lencana dalam 8 kategori (Consistency, Focus, Fluency, Pace, Presentation, Interview, Improvement, Elite).
- **Streak & Heatmap** — Pantau konsistensi latihan harian, mingguan, dan tahunan.
- **Dashboard Progres** — Timeline perkembangan skor, riwayat sesi, dan rekomendasi fokus area.

---

## 🛠 Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS 4, Radix UI, shadcn/ui |
| Computer Vision | MediaPipe Face Landmarker (GPU) |
| Speech Analysis | AssemblyAI |
| Text-to-Speech | ElevenLabs (via BFF proxy) + Web Speech API fallback |
| Speech Recognition | Web Speech API (real-time STT) |
| Auth | JWT + Google OAuth |
| Media Encoding | WebCodecs AAC + mp4-muxer |
| Deployment | Vercel |

---

## 🚀 Cara Setup

### Prasyarat

- Node.js 18.17+
- Kamera & mikrofon (untuk mode latihan)

### Instalasi

```bash
git clone https://github.com/fazamumtaz/pitcho-fe.git
cd pitcho-fe
npm install
```

### Environment Variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_ASSEMBLYAI_API_KEY=your_assemblyai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).
