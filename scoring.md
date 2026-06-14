# Perbaikan Sistem Penilaian Pitcho

## Ringkasan Masalah

Tiga masalah utama di sistem penilaian sekarang:

1. **Presentation – Pace score step-function** → Beda 1 WPM bisa beda 15 poin, sangat tidak adil
2. **Presentation – Filler & Efficiency score tidak proporsional terhadap durasi** → 5 filler words dalam 2 menit vs 10 menit harusnya beda dampaknya
3. **Interview – `overall_interview_score` 100% dari AI backend**, tidak mempertimbangkan delivery metrics (focus, pace) yang sudah dikumpulkan. Skor terlalu bergantung pada konten saja, tidak mencerminkan performa bicara secara keseluruhan

> [!IMPORTANT]
> **CONSTRAINT**: Field yang dikirim ke `saveSession()` (history save) **TIDAK BOLEH BERUBAH** — field name dan tipe data harus tetap sama persis.
>
> Fields yang dilindungi:
>
> - Presentation: `practice_type`, `document_id`, `name`, `distraction_intensity`, `audience_type`, `session_length`, `transcript`, `distract_count`, `total_distract_duration`, `total_duration`, `wpm`, `efficiency_score`, `overall_score`, `filler_incidents`, `word_findings`, `interview_details`, `distraction_clips`
> - Interview: `name`, `practice_type`, `document_id`, `job_title`, `job_desc`, `question_count`, `distract_count`, `total_distract_duration`, `total_duration`, `wpm`, `efficiency_score`, `overall_score`, `filler_incidents`, `word_findings`, `interview_details`, `distraction_clips`

## Proposed Changes

### `src/utils/scoring.js` [MODIFY]

Perbaiki 3 fungsi scoring inti:

1. **`calcPaceScore`** → Ganti dari step-function menjadi **Gaussian/parabola curve** dengan puncak di 140 WPM, smooth decay ke samping
2. **`calcFillerScore`** → Ganti threshold absolute menjadi **per-menit rate** (fillers per minute), lebih proporsional terhadap durasi sesi
3. **`calcEfficiencyScore`** → Ganti threshold absolute menjadi **rate per 100 kata**, lebih fair untuk sesi panjang vs pendek
4. **`calculateSessionScore`** → Update signature untuk menerima `sessionDurationSeconds` dari sessionData (sudah ada), dipakai oleh filler per-menit

Bobot tetap sama: `focus: 0.4, pace: 0.25, filler: 0.2, efficiency: 0.15`

### `src/app/interview/(sidebar)/result/page.js` [MODIFY]

**Tambahkan Delivery Score** untuk interview. Data sudah tersedia di `perQuestionData`:

- `distract_duration_seconds` per question (ada)
- `wpm` per question (ada)
- `answer_duration_seconds` per question (ada)

Formula baru:

```
Interview Final Score = (AI Content Score × 65%) + (Delivery Score × 35%)
Delivery Score       = (Focus Score × 50%) + (Pace Score × 50%)
```

- Ini hanya mengubah nilai `overallScore` yang **ditampilkan ke user** dan yang **dikirim ke backend** sebagai `overall_score`
- Tidak mengubah nama field apapun — field `overall_score` tetap ada, hanya nilainya lebih akurat

**Import**: Tambahkan `import { calcFocusScore, calcPaceScore } from "@/utils/scoring"`

**Display**: Tambahkan breakdown kecil di Score Overview — tampilkan `Content Score` dan `Delivery Score` terpisah supaya user paham komponen nilainya

### `src/app/presentation/result/page.js` [NO CHANGE]

Tidak perlu perubahan — sudah menggunakan `calculateSessionScore` dari `scoring.js`. Otomatis dapat manfaat dari perbaikan di `scoring.js`.

## Verification Plan

### Manual Verification

- Buka presentation result → cek overall score untuk sesi WPM 119 vs 120 tidak lagi beda ekstrem
- Buka interview result → cek score tidak lagi 100% dari AI skor (ada komponen delivery)
- Pastikan history save tidak error (tidak ada missing/renamed field)
