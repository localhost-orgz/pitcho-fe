"use client";

import { useState } from "react";
import { AlertCircle, HeartPulse, MessageSquare, Target } from "lucide-react";

// ── Icons (inline SVG helpers) ──────────────────────────────────────────────
const IconStar = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const IconCheck = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconArrowRight = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconUsers = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconActivity = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconAward = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);
const IconTarget = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const IconBrain = (props) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14" />
  </svg>
);
const IconTrendingUp = (props) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconMic = (props) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const IconZap = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconTwitter = (props) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);
const IconLinkedin = (props) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const IconChevronDown = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    {...props}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconInstagram = (props) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="navbar sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100/80 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
      <div className="navInner max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <a
          href="#"
          className="logo flex items-center gap-2 no-underline shrink-0"
        >
          <div className="logoIcon w-9 h-9 bg-gradient-to-br from-[#0388ff] to-[#005fd3] rounded-lg flex items-center justify-center text-white shadow-sm">
            <IconMic />
          </div>
          <span className="logoText text-[1.2rem] font-bold text-slate-900 tracking-tight">
            Pitcho
          </span>
        </a>

        {/* Nav links */}
        <ul className="navLinks hidden md:flex list-none gap-8 m-0 p-0 justify-center">
          <li>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 no-underline"
            >
              Cara Kerja
            </a>
          </li>
          <li>
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 no-underline"
            >
              Fitur
            </a>
          </li>
          <li>
            <a
              href="#educators"
              className="text-sm font-medium text-slate-600 no-underline"
            >
              Buat Pengajar
            </a>
          </li>
          <li>
            <a
              href="#pricing"
              className="text-sm font-medium text-slate-600 no-underline"
            >
              Harga
            </a>
          </li>
          <li>
            <a
              href="#resources"
              className="text-sm font-medium text-slate-600 no-underline"
            >
              Resources
            </a>
          </li>
          <li>
            <a
              href="#faq"
              className="text-sm font-medium text-slate-600 no-underline"
            >
              FAQ
            </a>
          </li>
        </ul>

        {/* CTA buttons */}
        <div className="navCta hidden md:flex items-center gap-4 shrink-0">
          <a
            href="#"
            className="inline-flex items-center text-sm font-medium text-slate-600 no-underline"
          >
            Masuk
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 bg-[#0388ff] text-white font-semibold text-sm py-2.5 px-5 rounded-lg no-underline"
          >
            Mulai Gratis <IconArrowRight />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger flex md:hidden flex-col justify-center items-center w-8 h-8 relative bg-none border-none cursor-pointer p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-0.5 bg-slate-700 rounded-sm transition-all duration-300 absolute ${mobileOpen ? "rotate-45" : "-translate-y-1.5"}`}
          />
          <span
            className={`block w-5 h-0.5 bg-slate-700 rounded-sm transition-all duration-300 absolute ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-slate-700 rounded-sm transition-all duration-300 absolute ${mobileOpen ? "-rotate-45" : "translate-y-1.5"}`}
          />
        </button>
      </div>

      {mobileOpen && (
        <div className="mobileMenu md:hidden flex flex-col gap-1 border-t border-slate-100 py-3 px-4 bg-white/95 backdrop-blur-md absolute top-full left-0 right-0 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <a
            href="#how-it-works"
            className="text-[0.95rem] font-medium text-slate-700 rounded-lg no-underline py-2.5 px-3"
          >
            Cara Kerja
          </a>
          <a
            href="#features"
            className="text-[0.95rem] font-medium text-slate-700 rounded-lg no-underline py-2.5 px-3"
          >
            Fitur
          </a>
          <a
            href="#educators"
            className="text-[0.95rem] font-medium text-slate-700 rounded-lg no-underline py-2.5 px-3"
          >
            Buat Pengajar
          </a>
          <a
            href="#pricing"
            className="text-[0.95rem] font-medium text-slate-700 rounded-lg no-underline py-2.5 px-3"
          >
            Harga
          </a>
          <a
            href="#resources"
            className="text-[0.95rem] font-medium text-slate-700 rounded-lg no-underline py-2.5 px-3"
          >
            Resources
          </a>
          <a
            href="#faq"
            className="text-[0.95rem] font-medium text-slate-700 rounded-lg no-underline py-2.5 px-3"
          >
            FAQ
          </a>
          <div className="pt-2 px-3 pb-1 flex flex-col gap-2">
            <a
              href="#"
              className="inline-flex items-center justify-center text-sm font-medium text-slate-700 rounded-lg py-2.5"
            >
              Masuk
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-1.5 bg-[#0388ff] text-white font-semibold text-sm py-2.5 px-5 rounded-lg no-underline"
            >
              Mulai Gratis <IconArrowRight />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Hero Section ────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="hero max-w-[800px] mx-auto pt-16 px-5 pb-12 md:pt-24 md:px-6 md:pb-20 flex flex-col items-center text-center">
      <div className="flex flex-col items-center">
        <h1 className="heroTitle text-[clamp(2.2rem,5vw,3.6rem)] font-black leading-[1.15] text-[#0f1d35] mt-0 mx-0 mb-6 tracking-[-0.02em]">
          Latihan ngomong.
          <br />
          Lawan gangguan.
          <br />
          <span className="heroAccent text-[#fabf24]">Makin jago</span> lewat feedback.
        </h1>

        <p className="heroDesc text-[1.05rem] text-[#5a7090] leading-[1.7] mb-8 max-w-[620px] mx-auto">
          Pitcho bantu kamu asah skill ngomong lewat simulasi yang kerasa nyata,
          plus feedback dari AI yang beneran bikin kamu makin luwes.
        </p>

        <div className="heroBtns flex gap-3.5 flex-wrap mb-10 justify-center">
          <a
            href="#"
            className="btnHeroPrimary inline-flex items-center gap-2 bg-[#0388ff] text-white font-extrabold text-base py-3.5 px-7 rounded-xl no-underline shadow-[0_4px_20px_rgba(3,136,255,0.3)]"
          >
            Coba Latihan Gratis <IconArrowRight />
          </a>
          <a
            href="#how-it-works"
            className="btnHeroSecondary inline-flex items-center gap-2 text-[#0f1d35] font-bold text-base py-[13px] px-6 rounded-xl border-2 border-[#d5dff5] bg-white no-underline"
          >
            Lihat Demo
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Pain Points Section ─────────────────────────────────────────────────────
const painPoints = [
  {
    icon: AlertCircle,
    colorClass:
      "bg-red-50/50 text-red-500 border-red-100/40 shadow-sm shadow-red-500/5",
    title: "Gangguan di mana-mana",
    desc: "Ruangan rame, orang motong ngomong, ada yang main HP. Kamu nggak bisa ngontrol itu semua. Tapi kamu bisa siap-siap.",
  },
  {
    icon: HeartPulse,
    colorClass:
      "bg-amber-50/50 text-amber-500 border-amber-100/40 shadow-sm shadow-amber-500/5",
    title: "Gugup tiba-tiba",
    desc: "Udah kuasai materi, udah latihan berkali-kali. Giliran tampil di depan orang, eh malah blank dan lupa semuanya.",
  },
  {
    icon: MessageSquare,
    colorClass:
      "bg-indigo-50/50 text-indigo-500 border-indigo-100/40 shadow-sm shadow-indigo-500/5",
    title: "Nggak ada yang ngasih tahu",
    desc: "Kebanyakan kita nggak sadar apa yang salah pas ngomong. Nggak ada yang ngingetin, nggak ada yang ngebenerin.",
  },
  {
    icon: Target,
    colorClass:
      "bg-emerald-50/50 text-emerald-500 border-emerald-100/40 shadow-sm shadow-emerald-500/5",
    title: "Latihan itu kuncinya",
    desc: "Latihan yang pas dan terstruktur bisa bikin presentasi sesulit apa pun jadi ajang buat ningkatin pede.",
  },
];

function PainSection() {
  return (
    <section className="painSection bg-[#f7f9ff] py-18 px-6 text-center">
      <div className="sectionLabel inline-block text-[0.72rem] font-bold tracking-[0.12em] text-[#fabf24] uppercase mb-3">
        INI PENTING
      </div>
      <h2 className="painTitle text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold text-[#0f1d35] leading-[1.3] mb-13">
        Kebanyakan orang tahu mau ngomong apa.
        <br />
        Tapi gugup pas momennya{" "}
        <em className="italic text-[#0388ff]">beneran</em>{" "}
        penting.
      </h2>
      <div className="painGrid grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-7 max-w-[1100px] mx-auto">
        {painPoints.map((p, i) => (
          <div
            key={i}
            className="painCard bg-white rounded-[18px] py-7 px-5.5 text-center shadow-[0_2px_16px_rgba(3,136,255,0.06)]"
          >
            <div
              className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center border ${p.colorClass}`}
            >
              <p.icon size={28} strokeWidth={1.8} />
            </div>
            <h3 className="painCardTitle text-[0.95rem] font-extrabold text-[#0f1d35] mb-2">
              {p.title}
            </h3>
            <p className="painCardDesc text-[0.82rem] text-[#6880a0] leading-[1.6]">
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Feature Highlight Section ───────────────────────────────────────────────
const featureHighlights = [
  {
    icon: <IconBrain />,
    title: "Gangguan Realistis",
    desc: "Ada suara berisik, HP bunyi, orang batuk. Pokoknya hal-hal yang bikin kamu ke-distract di dunia nyata, tapi di sini aman buat latihan.",
  },
  {
    icon: <IconZap />,
    title: "Feedback dari AI",
    desc: "Begitu sesi selesai, langsung dikasih tahu: cara ngomongmu gimana, nadanya pas apa nggak, lancar apa terbata, gesturmu oke apa enggak.",
  },
  {
    icon: <IconActivity />,
    title: "Pantau Progress",
    desc: "Liat sendiri gimana skillmu naik dari waktu ke waktu. Ada data lengkap dan saran yang nyambung sama kebutuhan kamu.",
  },
  {
    icon: <IconTrendingUp />,
    title: "Pede Beneran",
    desc: "Latihan di skenario yang makin lama makin susah. Liat sendiri skill ngomongmu naik level demi level.",
  },
];

function FeaturesSection() {
  return (
    <section className="featuresSection bg-white py-20 px-6" id="features">
      <div className="featuresInner max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <div className="featuresLeft flex-1 min-w-0">
          <div className="sectionLabelBlue inline-block text-[0.72rem] font-bold tracking-[0.12em] text-[#0388ff] uppercase mb-3">
            YANG BIKIN BEDA
          </div>
          <h2 className="featuresTitle text-[clamp(1.6rem,3vw,2.4rem)] font-black text-[#0f1d35] leading-tight mb-4.5 tracking-[-0.02em]">
            Simulasi yang kerasa nyata.
            <br />
            Feedback yang personal.
            <br />
            <span className="heroAccent text-[#fabf24]">Hasil yang keliatan.</span>
          </h2>
          <p className="featuresDesc text-[0.95rem] text-[#5a7090] leading-[1.7] mb-7 max-w-full lg:max-w-[380px]">
            Kami gabungin skenario dunia nyata sama tools yang bikin kamu terus
            improve. Semuanya didukung AI yang ngerti banget gimana caranya
            komunikasi yang oke.
          </p>
          <a
            href="#"
            className="btnPrimary inline-flex items-center gap-1.5 bg-[#0388ff] text-white font-bold text-[0.88rem] py-2.5 px-5 rounded-[10px] no-underline shadow-[0_4px_12px_rgba(3,136,255,0.28)] whitespace-nowrap"
            style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}
          >
            Lihat Fitur Lengkap <IconArrowRight />
          </a>
        </div>

        <div className="featuresRight flex-1 min-w-0 flex flex-col gap-4.5 w-full">
          {featureHighlights.map((f, i) => (
            <div
              key={i}
              className="featureCard flex items-start gap-4 bg-[#f7f9ff] rounded-[14px] py-4.5 px-5 border-[1.5px] border-transparent"
            >
              <div className="featureCardIcon w-11 h-11 bg-gradient-to-br from-[#0388ff] to-[#005fd3] rounded-xl flex items-center justify-center text-white shrink-0">
                {f.icon}
              </div>
              <div>
                <h4 className="featureCardTitle text-[0.95rem] font-extrabold text-[#0f1d35] mb-1">
                  {f.title}
                </h4>
                <p className="featureCardDesc text-[0.83rem] text-[#6880a0] leading-[1.5]">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ── How It Works Section ────────────────────────────────────────────────────
const steps = [
  {
    num: "1",
    title: "Pilih Mode",
    desc: "Mau latihan presentasi atau wawancara? Pilih aja sesuai kebutuhan kamu.",
    color: "#0388ff",
    imgSrc: "/step1.png",
  },
  {
    num: "2",
    title: "Atur Sesi",
    desc: "Setting kamera, tentuin seberapa intens dan susah skenarionya.",
    color: "#fabf24",
    imgSrc: "/step2.png",
  },
  {
    num: "3",
    title: "Mulai Simulasi",
    desc: "Ngobrol, bikin kesalahan sampe ngulang-ngulang, hadapi gangguan — semua terjadi langsung.",
    color: "#0388ff",
    imgSrc: "/step3.png",
  },
  {
    num: "4",
    title: "Evaluasi & Asah Lagi",
    desc: "Terima feedback dari AI dan tips yang bisa langsung kamu praktekkin.",
    color: "#fabf24",
    imgSrc: "/step1.png",
  },
];

function HowItWorksSection() {
  return (
    <section
      className="howSection bg-[#f7f9ff] py-20 px-6 text-center"
      id="how-it-works"
    >
      <div className="sectionLabelBlue inline-block text-[0.72rem] font-bold tracking-[0.12em] text-[#0388ff] uppercase mb-3">
        CARA KERJA
      </div>
      <h2 className="sectionTitle text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold text-[#0f1d35] leading-snug mb-4 text-center">
        Langkah gampang biar makin
        <br />jago ngomong
      </h2>

      <div className="stepsGrid max-w-[1100px] mt-13 mx-auto mb-0 grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-7">
        {steps.map((s, i) => (
          <div
            key={i}
            className="stepCard bg-white rounded-[18px] pt-0 px-0 pb-7 text-center shadow-[0_2px_16px_rgba(3,136,255,0.06)] overflow-hidden"
          >
            <div className="stepImgContainer w-full h-[130px] overflow-hidden bg-slate-50">
              <img
                src={s.imgSrc}
                alt={`Langkah ${s.num}: ${s.title}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="stepNum w-9 h-9 rounded-full text-white text-base font-black flex items-center justify-center mt-[18px] mx-auto mb-3"
              style={{ background: s.color }}
            >
              {s.num}
            </div>
            <h3 className="stepTitle text-[0.95rem] font-extrabold text-[#0f1d35] mb-2 px-4">
              {s.title}
            </h3>
            <p className="stepDesc text-[0.82rem] text-[#6880a0] leading-[1.55] px-4">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}


// ── FAQ Section ──────────────────────────────────────────────────────────────
const faqItems = [
  {
    q: "Apa sih Pitcho itu?",
    a: "Pitcho itu semacam pelatih ngomong pribadi yang pakai AI. Kamu bakal simulasi ngomong di depan audiens — bisa presentasi, bisa wawancara — lengkap sama gangguannya: suara bising, notifikasi HP, kejadian nggak terduga. Abis sesi, kamu langsung dikasih tahu apa yang udah oke dan apa yang masih perlu diasah.",
  },
  {
    q: "Gimana AI-nya ngasih feedback?",
    a: "AI kami ngecek ucapanmu langsung pas kamu lagi ngomong. Yang dicek: kecepatan ngomong, kata-kata filler (kayak 'anu', 'eee'), naik-turun nada, kontak mata lewat kamera, sampai gimana kamu ngadepin gangguan. Begitu kelar, kamu dapet laporan lengkap plus tips yang tinggal dipraktikkin.",
  },
  {
    q: "Perlu alat khusus nggak?",
    a: "Nggak perlu yang aneh-aneh. Cukup laptop atau HP yang ada kamera sama mik-nya. Kalo pakai headphone sih lebih enak, tapi ya nggak wajib juga.",
  },
  {
    q: "Gratis atau bayar?",
    a: "Langsung coba aja dulu, gratis kok. Nggak perlu masukin kartu kredit atau yang ribet-ribet. Nanti kalo udah cocok dan pengen akses lebih banyak, ada paket premium dengan skenario tambahan, analitik lebih detail, dan latihan sepuasnya.",
  },
  {
    q: "Bisa buat latihan wawancara kerja?",
    a: "Bisa banget. Ada mode Wawancara khusus yang nyimulasikan pertanyaan-pertanyaan umum, follow-up, dan situasi yang bikin deg-degan. Kamu bakal dilatih mikir cepat dan jawab dengan pede di kondisi yang semirip mungkin sama aslinya.",
  },
  {
    q: "Data aku aman nggak?",
    a: "Tenang, aman. Sebisa mungkin video dan suaramu diproses langsung di perangkatmu sendiri, nggak diunggah ke mana-mana. Kami nggak pernah ngeshare sesi latihanmu ke siapa pun. Kalo kamu mau hapus semua data, tinggal hapus aja kapan aja.",
  },
  {
    q: "Bedanya sama latihan depan kaca?",
    a: "Cermin nggak bakal motong kamu pas lagi ngomong, nggak bisa nilai nada dan kecepatanmu, apalagi ngasih masukan yang jelas. Pitcho bikin suasana yang nggak tertebak dan penuh tekanan — mirip kayak komunikasi beneran — terus ngasih tahu kamu mesti improve di bagian mana.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="faqSection bg-white py-20 px-6" id="faq">
      <div className="faqInner max-w-[740px] mx-auto">
        <div className="sectionLabelBlue inline-block text-[0.72rem] font-bold tracking-[0.12em] text-[#0388ff] uppercase mb-3">
          FAQ
        </div>
        <h2 className="sectionTitle text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold text-[#0f1d35] leading-snug mb-3">
          Yang sering ditanyain
        </h2>
        <p className="faqSubtitle text-[0.95rem] text-[#5a7090] leading-[1.7] mb-10">
          Hal-hal yang biasanya muncul sebelum mulai latihan pertama.
        </p>

        <div className="faqList flex flex-col gap-3">
          {faqItems.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="faqItem bg-[#f7f9ff] rounded-[14px] border-[1.5px] border-transparent"
              >
                <button
                  onClick={() => toggle(i)}
                  className="faqTrigger w-full flex items-center justify-between gap-4 text-left bg-none border-none cursor-pointer py-5 px-6"
                  aria-expanded={isOpen}
                >
                  <span className="faqQuestion text-[0.95rem] font-extrabold text-[#0f1d35] leading-[1.4] pr-2">
                    {item.q}
                  </span>
                  <span
                    className={`faqIcon shrink-0 text-[#0388ff] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  >
                    <IconChevronDown />
                  </span>
                </button>
                <div
                  className={`faqAnswer overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="faqAnswerText text-[0.88rem] text-[#6880a0] leading-[1.7] px-6 pb-5 -mt-0.5">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────────
const footerLinks = {
  Produk: ["Mode Presentasi", "Mode Wawancara", "Feedback AI", "Pantau Kemajuan"],
  Bantuan: ["Pusat Bantuan", "Video Tutorial", "Tips Public Speaking", "Komunitas"],
  Perusahaan: ["Tentang Kami", "Blog", "Karir", "Hubungi Kami"],
};

function Footer() {
  return (
    <footer className="footer bg-[#0f1d35] pt-14 px-6 pb-6">
      <div className="footerInner max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 lg:gap-10 pb-12 border-b border-white/8">
        <div className="footerBrand">
          <a
            href="#"
            className="logo flex items-center gap-2 no-underline shrink-0 mb-1"
          >
            <img
              src="/logo-text-white.svg"
              alt="Pitcho"
              className="h-10 w-auto"
            />
          </a>
          <p className="footerTagline text-[0.85rem] text-white/50 leading-[1.6] mt-3 mx-0 mb-5 max-w-[240px]">
            Latihan ngomong. Lawan gangguan. Makin jago lewat feedback.
          </p>
          <div className="socialLinks flex gap-3">
            <a
              href="#"
              aria-label="Twitter"
              className="w-9 h-9 rounded-[8px] bg-white/8 flex items-center justify-center text-white/60 no-underline"
            >
              <IconTwitter />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="w-9 h-9 rounded-[8px] bg-white/8 flex items-center justify-center text-white/60 no-underline"
            >
              <IconInstagram />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="w-9 h-9 rounded-[8px] bg-white/8 flex items-center justify-center text-white/60 no-underline"
            >
              <IconLinkedin />
            </a>
          </div>
        </div>

        {Object.entries(footerLinks).map(([section, links]) => (
          <div key={section} className="footerCol">
            <h4 className="footerColTitle text-[0.82rem] font-bold text-white/50 uppercase tracking-[0.1em] mb-4">
              {section}
            </h4>
            <ul className="footerColLinks list-none p-0 m-0 flex flex-col gap-2.5">
              {links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-white/65 no-underline"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footerBottom max-w-[1100px] mt-6 mx-auto mb-0 flex flex-col md:flex-row items-center justify-between flex-wrap gap-3 text-[0.8rem] text-white/35 text-center">
        <span>© 2026 Pitcho. Hak cipta dilindungi.</span>
        <div className="footerBottomLinks flex gap-6">
          <a
            href="#"
            className="text-white/35 no-underline"
          >
            Kebijakan Privasi
          </a>
          <a
            href="#"
            className="text-white/35 no-underline"
          >
            Syarat & Ketentuan
          </a>
        </div>
      </div>
    </footer>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="page font-sans text-[#1a2d50] bg-white overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <PainSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
