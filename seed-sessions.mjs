/**
 * Session Seeder — POSTs 10 dummy session records to /api/history
 *
 * Usage:  node seed-sessions.mjs
 *
 * Set PITCHO_TOKEN env var to override the hardcoded JWT.
 */

const BASE = "https://pitcho-be.vercel.app";
const TOKEN =
  process.env.PITCHO_TOKEN ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NmFiNDI1NS1mZGUwLTRiNWEtOWM0Zi1iMjRkMTRmNDA2ZjkiLCJlbWFpbCI6ImZhemFtdW10YXpyYW1hZGhhbkBnbWFpbC5jb20iLCJpYXQiOjE3ODEyNTA0MDEsImV4cCI6MTc4MTg1NTIwMX0.SkI5ausTOZaooyrk2MfL2g4q3ODvSyQambsG5guAI0M";

// ── Helper: random int in [min, max] ──────────────────────
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Helper: pick random element ───────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Data pools for variety ────────────────────────────────
const NAMES = [
  "Aulia Rahman", "Dewi Sartika", "Bima Prakoso", "Citra Ayu Lestari",
  "Dimas Anugrah", "Eka Nurhayati", "Farhan Maulana", "Gita Safitri",
  "Hendra Gunawan", "Intan Permata",
];

const ROLES = [
  "Backend Engineer", "Frontend Developer", "Fullstack Engineer",
  "DevOps Engineer", "Data Scientist", "Mobile Developer",
  "QA Engineer", "Product Manager", "UI/UX Designer", "Tech Lead",
];

const JOB_DESCS = [
  "Mampu mengembangkan API menggunakan Node.js, memahami ORM seperti Prisma, dan terbiasa dengan database PostgreSQL.",
  "Mahir dalam React, Next.js, dan state management. Terbiasa dengan Tailwind CSS dan component-driven development.",
  "Menguasai infrastruktur cloud AWS/GCP, CI/CD pipelines, Docker, dan Kubernetes.",
  "Berpengalaman membangun model machine learning dengan Python, TensorFlow, dan deployment ke production.",
  "Mampu membangun aplikasi mobile cross-platform dengan Flutter atau React Native.",
];

const AUDIENCES = ["Classroom", "Boardroom", "Conference", "Panel", "Webinar"];
const INTENSITIES = ["Low", "Medium", "High"];
const PRESENTATION_TOPICS = [
  "Arsitektur Microservices", "CI/CD Pipeline Modern", "Design System di Scale",
  "Database Sharding Strategy", "Observability dengan OpenTelemetry", "API Gateway Pattern",
  "Event-Driven Architecture", "Serverless di Production", "Monorepo Strategy", "GraphQL vs REST",
];

const QUESTION_POOLS = [
  { q: "Ceritakan tentang diri Anda dan kenapa tertarik dengan posisi ini?", st: "Mampu menjelaskan latar belakang skill dan kesesuaian teknologi.", wk: "Struktur penutupan agak menggantung." },
  { q: "Apa tantangan teknis paling sulit yang pernah Anda selesaikan?", st: "Problem-solving terstruktur dan terukur dengan baik.", wk: "Kurang menyebutkan metrik keberhasilan." },
  { q: "Bagaimana Anda menangani konflik di dalam tim?", st: "Menunjukkan empathy dan komunikasi yang baik.", wk: "Belum menyertakan contoh konkret." },
  { q: "Ceritakan pengalaman Anda memimpin sebuah proyek.", st: "Leadership dan manajemen stakeholder terlihat jelas.", wk: "Belum menyebutkan timeline dan deliverable." },
  { q: "Bagaimana Anda menjaga kualitas kode dalam tim?", st: "Pemahaman testing dan code review sangat baik.", wk: "Kurang menyebutkan tooling spesifik yang digunakan." },
];

const FILLER_WORDS = ["eee", "uhm", "hmm", "jadi", "gitu"];
const PLEONASM_PAIRS = [
  { orig: "pada saat sekarang ini", rec: "saat ini / sekarang" },
  { orig: "agar supaya", rec: "agar / supaya" },
  { orig: "demi untuk", rec: "demi / untuk" },
  { orig: "adalah merupakan", rec: "adalah / merupakan" },
  { orig: "sejak dari", rec: "sejak / dari" },
];

// ── Build one INTERVIEW payload ───────────────────────────
function buildInterview(name, role, jobDesc, score) {
  const q = pick(QUESTION_POOLS);
  const filler = pick(FILLER_WORDS);
  const pleo = pick(PLEONASM_PAIRS);
  const wpm = rand(100, 150);
  const duration = rand(30, 90);
  const distractCount = rand(1, 5);
  const distractTotal = rand(3, 15);

  const answer = `Halo nama saya ${name}, saya seorang ${role.toLowerCase()}. Saya sangat tertarik bergabung karena perusahaan ini banyak menggunakan tech stack yang relevan, ${filler}, yang mana itu adalah keahlian utama saya ${pleo.orig}.`;

  return {
    practice_type: "INTERVIEW",
    document_id: crypto.randomUUID(),
    job_title: role,
    job_desc: jobDesc,
    question_count: 1,
    name: "Sesi Interview",
    time_per_question: 60,
    transcript: answer,
    distract_count: distractCount,
    total_distract_duration: distractTotal,
    total_duration: duration,
    wpm,
    efficiency_score: score - rand(3, 8),
    overall_score: score,
    filler_incidents: [
      {
        word: filler,
        context_text: `yang relevan, ${filler}, yang mana itu adalah keahlian`,
      },
    ],
    word_findings: [
      {
        issue_type: "Pleonasm",
        original_phrase: pleo.orig,
        recommended_phrase: pleo.rec,
        transcript_context: `keahlian utama saya ${pleo.orig}.`,
        coach_tip: `Hindari menggunakan frasa bertumpuk. Gunakan "${pleo.rec}" agar kalimat lebih lugas.`,
      },
    ],
    interview_details: [
      {
        question_number: 1,
        question_text: q.q,
        user_answer: answer,
        relevancy_score: score - rand(0, 5),
        star_structure_score: score - rand(5, 15),
        overall_answer_score: score - rand(0, 8),
        strengths: q.st,
        weaknesses: q.wk,
        recommended_answer: `Halo nama saya ${name}, saya seorang ${role.toLowerCase()}. Saya tertarik bergabung karena kesesuaian tech stack dengan keahlian saya.`,
      },
    ],
  };
}

// ── Build one PRESENTATION payload ────────────────────────
function buildPresentation(name, topic, score) {
  const filler = pick(FILLER_WORDS);
  const pleo = pick(PLEONASM_PAIRS);
  const wpm = rand(110, 160);
  const duration = rand(60, 180);
  const distractCount = rand(2, 8);
  const distractTotal = rand(5, 25);

  const transcript = `Selamat ${pick(["pagi", "siang", "sore"])} semuanya. Hari ini saya ingin mempresentasikan tentang ${topic}. Pertama, kita akan melihat arsitektur yang digunakan. Kedua, kita membahas implementasi teknisnya, ${filler}, ${pleo.orig}.`;

  return {
    practice_type: "PRESENTATION",
    document_id: crypto.randomUUID(),
    job_title: "Presenter",
    job_desc: "Presentasi mengenai topik teknologi dan arsitektur sistem.",
    question_count: 1,
    time_per_question: 60,
    name: topic,
    audio_url: `https://pitcho-documents.supabase.co/storage/v1/object/public/pitcho_documents/user_audio_${rand(100, 999)}.mp3`,
    distraction_intensity: pick(INTENSITIES),
    audience_type: pick(AUDIENCES),
    session_length: rand(3, 10),
    transcript,
    distract_count: distractCount,
    total_distract_duration: distractTotal,
    total_duration: duration,
    wpm,
    efficiency_score: score - rand(2, 10),
    overall_score: score,
    filler_incidents: [
      {
        word: filler,
        context_text: `implementasi teknisnya, ${filler}, ${pleo.orig}`,
      },
    ],
    word_findings: [
      {
        issue_type: "Pleonasm",
        original_phrase: pleo.orig,
        recommended_phrase: pleo.rec,
        transcript_context: `${filler}, ${pleo.orig}.`,
        coach_tip: `Frasa bertumpuk terdeteksi. Gunakan "${pleo.rec}" saja.`,
      },
    ],
    interview_details: [],
  };
}

// ── Post one session ──────────────────────────────────────
async function postSession(payload, index) {
  const label =
    payload.practice_type === "INTERVIEW"
      ? `Interview - ${payload.job_title} (${payload.overall_score})`
      : `Presentation - ${payload.name} (${payload.overall_score})`;

  try {
    const res = await fetch(`${BASE}/api/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (res.ok) {
      console.log(`  ✅ [${index + 1}/10] ${label}`);
    } else {
      console.log(`  ❌ [${index + 1}/10] ${label} → ${res.status} ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.log(`  ❌ [${index + 1}/10] ${label} → ${err.message}`);
  }
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log("\n🌱 Seeding 10 session records to /api/history …\n");

  // Build 10 sessions — alternate interview / presentation
  const sessions = [];
  for (let i = 0; i < 10; i++) {
    const name = NAMES[i];
    const role = ROLES[i];
    const jobDesc = pick(JOB_DESCS);
    const score = rand(68, 92);

    if (i % 2 === 0) {
      // Even → INTERVIEW
      sessions.push(buildInterview(name, role, jobDesc, score));
    } else {
      // Odd → PRESENTATION
      sessions.push(buildPresentation(name, pick(PRESENTATION_TOPICS), score));
    }
  }

  // Fire sequentially to avoid rate-limiting the backend
  for (let i = 0; i < sessions.length; i++) {
    await postSession(sessions[i], i);
  }

  console.log("\n✨ Done — 10 sessions seeded.\n");
}

main();
