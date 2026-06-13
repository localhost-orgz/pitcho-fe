# Detail Session Page - Data Mapping & UI Requirements

## 1. Summary Metrics

Pastikan data pada bagian summary mengambil data dari field berikut:

* **Overall Score**

  * Ambil langsung dari field `overallScore` pada API.

* **Total Filler Words**

  * Hitung secara matematis dari jumlah item pada `fillerIncidents`.

* **Total Distracted**

  * Ambil dari field `totalDistractDuration`.

* **Average WPM**

  * Ambil dari field `wpm`.

---

## 2. Eye Tracking Tab

Data untuk tab **Eye Tracking** diambil dari `distractionCases`.

### Yang perlu ditampilkan:

* Media player untuk memutar recording.
* List seluruh distraction case yang terjadi.
* Setiap item menampilkan:

  * `type`
  * `duration`
* User dapat memilih distraction case tertentu dan langsung memutar bagian terkait dari recording.

---

## 3. Pace & Tempo Tab

* Implementasi saat ini sudah benar.
* Data diambil dari field `wpm`.

---

## 4. Filler Words Tab

Data diambil dari `fillerIncidents`.

### Requirement:

* Gunakan UI yang sama persis seperti yang digunakan pada:

  * Presentation Result
  * Interview Result
* Mapping data mengikuti struktur yang sudah ada pada halaman result tersebut.

---

## 5. Wordiness Tab

Data diambil dari `wordFindings`.

### Yang perlu ditampilkan:

* Jenis issue yang ditemukan

  * Contoh: repetition, redundancy, dll.
* Kata atau frasa yang terdeteksi.
* Rekomendasi perbaikan.
* Transcript context.
* Coach tips.

---

## 6. Interview Details Tab (Conditional)

Tab ini hanya muncul jika:

```ts
session.type === "interview"
```

### Requirement:

* Tambahkan tab baru bernama **Interview Details**.
* UI dan behavior sama seperti halaman **Interview Result**.
* User dapat melihat feedback AI menggunakan format carousel yang sudah ada pada halaman tersebut.
* Gunakan data dan struktur yang sama dengan implementasi Interview Result saat ini.

---

## Catatan

Saat ini response API sudah benar dan tidak perlu diubah.

Fokus pengerjaan adalah memperbaiki mapping data pada halaman Detail Session agar seluruh komponen mengambil data dari field API yang sesuai seperti yang dijelaskan di atas.
