"use client";

import { useState } from "react";

// ── Icons (inline SVG helpers) ──────────────────────────────────────────────
const IconStar = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const IconCheck = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconArrowRight = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconUsers = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconActivity = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconAward = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);
const IconTarget = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const IconBrain = (props) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14" />
  </svg>
);
const IconTrendingUp = (props) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconMic = (props) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const IconZap = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconTwitter = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);
const IconLinkedin = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
);
const IconInstagram = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// ── Dummy Image Placeholder ─────────────────────────────────────────────────
function DummyImg({ width, height, label, className, style }) {
  return (
    <div
      className={`dummyImg bg-gradient-to-br from-[#e8eef9] to-[#d0dcf5] rounded-[14px] flex items-center justify-center relative overflow-hidden border-[1.5px] border-dashed border-[#b0c0e0] ${className || ""}`}
      style={{ width, height, ...style }}
      aria-label={label}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          background: "repeating-linear-gradient(45deg, transparent, transparent 10px, #0388ff 10px, #0388ff 20px)"
        }}
      />
      <span className={`dummyImgLabel text-[0.72rem] font-semibold text-[#7090c0] text-center py-2 px-3 relative z-[1] leading-[1.4]`}>
        {label || "Image"}
      </span>
    </div>
  );
}

// ── Avatar Dummies ──────────────────────────────────────────────────────────
function AvatarDummy({ size = 36, color }) {
  return (
    <div
      className="avatarDummy rounded-full border-[2.5px] border-white -ml-2 first:ml-0 shrink-0"
      style={{ width: size, height: size, background: color }}
    />
  );
}

// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="navbar sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-[#e8eef9] shadow-[0_1px_8px_rgba(3,136,255,0.06)]">
      <div className="navInner max-w-[1200px] mx-auto px-6 h-16 flex items-center gap-8">
        {/* Logo */}
        <a href="#" className="logo flex items-center gap-2 no-underline shrink-0">
          <div className="logoIcon w-9 h-9 bg-gradient-to-br from-[#0388ff] to-[#005fd3] rounded-[10px] flex items-center justify-center text-white">
            <IconMic />
          </div>
          <span className="logoText text-[1.15rem] font-extrabold text-[#0f1d35] tracking-[-0.02em]">Presenta</span>
        </a>

        {/* Nav links */}
        <ul className="navLinks hidden md:flex list-none gap-7 m-0 p-0 flex-1">
          <li><a href="#how-it-works" className="text-sm font-semibold text-[#4a5f80] no-underline transition-colors duration-150 hover:text-[#0388ff]">How it Works</a></li>
          <li><a href="#features" className="text-sm font-semibold text-[#4a5f80] no-underline transition-colors duration-150 hover:text-[#0388ff]">Features</a></li>
          <li><a href="#educators" className="text-sm font-semibold text-[#4a5f80] no-underline transition-colors duration-150 hover:text-[#0388ff]">For Educators</a></li>
          <li><a href="#pricing" className="text-sm font-semibold text-[#4a5f80] no-underline transition-colors duration-150 hover:text-[#0388ff]">Pricing</a></li>
          <li><a href="#resources" className="text-sm font-semibold text-[#4a5f80] no-underline transition-colors duration-150 hover:text-[#0388ff]">Resources</a></li>
        </ul>

        {/* CTA buttons */}
        <div className="navCta hidden md:flex items-center gap-2.5 shrink-0">
          <a href="#" className="btnOutline inline-flex items-center gap-1.5 text-[#0f1d35] font-semibold text-[0.88rem] py-2.5 px-[18px] rounded-[10px] border-[1.5px] border-[#d5dff5] bg-transparent no-underline transition-[border-color,color] duration-200 hover:border-[#0388ff] hover:text-[#0388ff]">Log in</a>
          <a href="#" className="btnPrimary inline-flex items-center gap-1.5 bg-[#0388ff] text-white font-bold text-[0.88rem] py-2.5 px-5 rounded-[10px] no-underline transition-[background,transform,box-shadow] duration-200 shadow-[0_4px_12px_rgba(3,136,255,0.28)] whitespace-nowrap hover:bg-[#0271d6] hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(3,136,255,0.38)]">
            Get Started Free <IconArrowRight />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger flex md:hidden flex-col gap-[5px] bg-none border-none cursor-pointer p-1 ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-[22px] h-[2px] bg-[#0f1d35] rounded-[2px] transition-all duration-200" />
          <span className="block w-[22px] h-[2px] bg-[#0f1d35] rounded-[2px] transition-all duration-200" />
          <span className="block w-[22px] h-[2px] bg-[#0f1d35] rounded-[2px] transition-all duration-200" />
        </button>
      </div>

      {mobileOpen && (
        <div className="mobileMenu flex flex-col gap-0 border-t border-[#e8eef9] py-4 px-6 bg-white">
          <a href="#how-it-works" className="text-[0.95rem] font-semibold text-[#1a2d50] no-underline py-3 border-b border-[#f0f4fc] last:border-b-0 last:mt-2">How it Works</a>
          <a href="#features" className="text-[0.95rem] font-semibold text-[#1a2d50] no-underline py-3 border-b border-[#f0f4fc] last:border-b-0 last:mt-2">Features</a>
          <a href="#educators" className="text-[0.95rem] font-semibold text-[#1a2d50] no-underline py-3 border-b border-[#f0f4fc] last:border-b-0 last:mt-2">For Educators</a>
          <a href="#pricing" className="text-[0.95rem] font-semibold text-[#1a2d50] no-underline py-3 border-b border-[#f0f4fc] last:border-b-0 last:mt-2">Pricing</a>
          <a href="#resources" className="text-[0.95rem] font-semibold text-[#1a2d50] no-underline py-3 border-b border-[#f0f4fc] last:border-b-0 last:mt-2">Resources</a>
          <a href="#" className="btnPrimary inline-flex items-center gap-1.5 bg-[#0388ff] text-white font-bold text-[0.88rem] py-2.5 px-5 rounded-[10px] no-underline transition-[background,transform,box-shadow] duration-200 shadow-[0_4px_12px_rgba(3,136,255,0.28)] whitespace-nowrap hover:bg-[#0271d6] hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(3,136,255,0.38)] w-full justify-center">Get Started Free</a>
        </div>
      )}
    </nav>
  );
}

// ── Hero Section ────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="hero max-w-[1200px] mx-auto pt-12 px-5 pb-10 md:pt-20 md:px-6 md:pb-15 flex flex-col md:flex-row items-center gap-9 md:gap-14 text-center md:text-left">
      <div className="heroLeft flex-1 min-w-0">
        <div className="heroBadge inline-flex items-center gap-1.5 bg-gradient-to-r from-[#eef5ff] to-[#fff8e6] border border-[#d0e4ff] rounded-full py-1.5 px-3.5 text-[0.78rem] font-bold text-[#0388ff] mb-6">
          <IconZap className="text-[#fabf24]" />
          <span>AI-Powered Speaking Simulator</span>
        </div>

        <h1 className="heroTitle text-[clamp(2rem,4.5vw,3.2rem)] font-black leading-[1.15] text-[#0f1d35] mt-0 mx-0 mb-5 tracking-[-0.02em]">
          Practice speaking.<br />
          Face distractions.<br />
          <span className="heroAccent text-[#fabf24]">Grow</span> with feedback.
        </h1>

        <p className="heroDesc text-[1.02rem] text-[#5a7090] leading-[1.7] mb-8 max-w-full md:max-w-[460px] mx-auto md:mx-0">
          Presenta helps you build real-world communication skills through immersive
          simulations and AI-powered feedback that actually makes you better.
        </p>

        <div className="heroBtns flex gap-3.5 flex-wrap mb-9 justify-center md:justify-start">
          <a href="#" className="btnHeroPrimary inline-flex items-center gap-2 bg-[#0388ff] text-white font-extrabold text-base py-3.5 px-7 rounded-xl no-underline transition-[background,transform,box-shadow] duration-200 shadow-[0_4px_20px_rgba(3,136,255,0.3)] hover:bg-[#0271d6] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(3,136,255,0.4)]">
            Start Free Practice <IconArrowRight />
          </a>
          <a href="#how-it-works" className="btnHeroSecondary inline-flex items-center gap-2 text-[#0f1d35] font-bold text-base py-[13px] px-6 rounded-xl border-2 border-[#d5dff5] bg-white no-underline transition-[border-color,transform] duration-200 hover:border-[#0388ff] hover:-translate-y-0.5">
            Watch Demo
          </a>
        </div>

        {/* Social proof row */}
        <div className="heroSocial flex items-center gap-3.5 flex-wrap justify-center md:justify-start">
          <div className="heroAvatars flex items-center">
            {[
              "#4f8ef7", "#f7a14f", "#4fcb8e", "#e56af7"
            ].map((c, i) => (
              <AvatarDummy key={i} size={32} color={c} />
            ))}
          </div>
          <div className="heroRating flex flex-col gap-0.5">
            <div className="heroStars flex gap-0.5 text-[#fabf24]">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="starIcon flex"><IconStar /></span>
              ))}
            </div>
            <span className="heroRatingText text-[0.82rem] text-[#7090b0]">
              Trusted by <strong className="text-[#0f1d35] font-bold">10,000+</strong> learners
            </span>
          </div>
        </div>
      </div>

      <div className="heroRight flex-1 min-w-0 w-full md:w-auto">
        {/* Main hero illustration dummy */}
        <div className="heroImgWrapper relative">
          <DummyImg
            width="100%"
            height="320px"
            label="Hero Illustration — Person presenting with AI feedback"
            className="heroMainImg min-h-[320px] rounded-[20px] border-2 border-dashed border-[#b0c8f0]"
          />
          {/* Floating cards */}
          <div className="floatCard floatCard1 absolute bg-white rounded-[12px] shadow-[0_4px_20px_rgba(3,136,255,0.15)] py-2.5 px-3.5 flex items-center gap-2 text-[0.82rem] font-semibold text-[#0f1d35] whitespace-nowrap animate-float-bob bottom-6 left-[-20px]" style={{ animationDelay: "0s" }}>
            <span className="floatCardIcon text-[1.1rem]">🎯</span>
            <span>Eye Contact: <strong className="font-bold">92%</strong></span>
          </div>
          <div className="floatCard floatCard2 absolute bg-white rounded-[12px] shadow-[0_4px_20px_rgba(3,136,255,0.15)] py-2.5 px-3.5 flex items-center gap-2 text-[0.82rem] font-semibold text-[#0f1d35] whitespace-nowrap animate-float-bob top-5 right-[-16px]" style={{ animationDelay: "0.8s" }}>
            <span className="floatCardIcon text-[1.1rem]">🧠</span>
            <span>AI Feedback Ready</span>
          </div>
          <div className="floatCard floatCard3 absolute bg-white rounded-[12px] shadow-[0_4px_20px_rgba(3,136,255,0.15)] py-2.5 px-3.5 flex items-center gap-2 text-[0.82rem] font-semibold text-[#0f1d35] whitespace-nowrap animate-float-bob bottom-[70px] right-[-10px]" style={{ animationDelay: "1.5s" }}>
            <span className="floatCardIcon text-[1.1rem]">📈</span>
            <span>Score: <strong className="font-bold">+18pts</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pain Points Section ─────────────────────────────────────────────────────
const painPoints = [
  {
    icon: "😵",
    title: "Distractions happen in real life",
    desc: "Crowded rooms, interruptions, people not paying attention. You can't control them. But you can prepare for it.",
  },
  {
    icon: "😟",
    title: "Nerves get in the way",
    desc: "You know your topic, you've rehearsed, yet when the moment comes your confidence drops. Experience builds it back.",
  },
  {
    icon: "💬",
    title: "Feedback is hard to get",
    desc: "Most of the time, you don't even know what you're doing wrong. There's no mirror, no one to tell you.",
  },
  {
    icon: "🏋️",
    title: "Practice makes progress",
    desc: "With the right practice and structure, you can turn any presentation into a confidence-building exercise.",
  },
];

function PainSection() {
  return (
    <section className="painSection bg-[#f7f9ff] py-18 px-6 text-center">
      <div className="sectionLabel inline-block text-[0.72rem] font-bold tracking-[0.12em] text-[#fabf24] uppercase mb-3">WHAT MATTERS</div>
      <h2 className="painTitle text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold text-[#0f1d35] leading-[1.3] mb-13">
        Most people know what to say.<br />
        But struggle when it <em className="italic text-[#0388ff]">really</em> matters.
      </h2>
      <div className="painGrid grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-7 max-w-[1100px] mx-auto">
        {painPoints.map((p, i) => (
          <div key={i} className="painCard bg-white rounded-[18px] py-7 px-5.5 text-center shadow-[0_2px_16px_rgba(3,136,255,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_6px_24px_rgba(3,136,255,0.12)]">
            <DummyImg
              width="80px"
              height="80px"
              label={`Illustration: ${p.title}`}
              className="painCardImg w-20 h-20 mx-auto mb-4 rounded-full"
            />
            <h3 className="painCardTitle text-[0.95rem] font-extrabold text-[#0f1d35] mb-2">{p.title}</h3>
            <p className="painCardDesc text-[0.82rem] text-[#6880a0] leading-[1.6]">{p.desc}</p>
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
    title: "Realistic Distractions",
    desc: "Face audience noise, phone interruptions, and unexpected events in a safe, controlled environment.",
  },
  {
    icon: <IconZap />,
    title: "AI-Powered Feedback",
    desc: "Get instant analysis on your delivery, tone, fluency, and body language after every session.",
  },
  {
    icon: <IconActivity />,
    title: "Track Your Progress",
    desc: "See your improvement over time with detailed analytics and personalized suggestions.",
  },
  {
    icon: <IconTrendingUp />,
    title: "Build Real Confidence",
    desc: "Train in increasingly challenging scenarios and watch your speaking skills soar.",
  },
];

function FeaturesSection() {
  return (
    <section className="featuresSection bg-white py-20 px-6" id="features">
      <div className="featuresInner max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <div className="featuresLeft flex-1 min-w-0">
          <div className="sectionLabelBlue inline-block text-[0.72rem] font-bold tracking-[0.12em] text-[#0388ff] uppercase mb-3">WHAT MAKES US DIFFERENT</div>
          <h2 className="featuresTitle text-[clamp(1.6rem,3vw,2.4rem)] font-black text-[#0f1d35] leading-tight mb-4.5 tracking-[-0.02em]">
            Realistic simulation.<br />
            Personalized feedback.<br />
            <span className="heroAccent text-[#fabf24]">Real results.</span>
          </h2>
          <p className="featuresDesc text-[0.95rem] text-[#5a7090] leading-[1.7] mb-7 max-w-full lg:max-w-[380px]">
            We pair you with real-world scenarios and give you the tools to improve,
            all backed by AI that truly understands the nuances of great communication.
          </p>
          <a href="#" className="btnPrimary inline-flex items-center gap-1.5 bg-[#0388ff] text-white font-bold text-[0.88rem] py-2.5 px-5 rounded-[10px] no-underline transition-[background,transform,box-shadow] duration-200 shadow-[0_4px_12px_rgba(3,136,255,0.28)] whitespace-nowrap hover:bg-[#0271d6] hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(3,136,255,0.38)]" style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
            Explore Features <IconArrowRight />
          </a>
        </div>

        <div className="featuresRight flex-1 min-w-0 flex flex-col gap-4.5 w-full">
          {featureHighlights.map((f, i) => (
            <div key={i} className="featureCard flex items-start gap-4 bg-[#f7f9ff] rounded-[14px] py-4.5 px-5 border-[1.5px] border-transparent transition-[transform,box-shadow,border-color] duration-200 hover:translate-x-1 hover:border-[#0388ff20] hover:shadow-[0_4px_18px_rgba(3,136,255,0.08)]">
              <div className="featureCardIcon w-11 h-11 bg-gradient-to-br from-[#0388ff] to-[#005fd3] rounded-xl flex items-center justify-center text-white shrink-0">{f.icon}</div>
              <div>
                <h4 className="featureCardTitle text-[0.95rem] font-extrabold text-[#0f1d35] mb-1">{f.title}</h4>
                <p className="featureCardDesc text-[0.83rem] text-[#6880a0] leading-[1.5]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Stats Banner ────────────────────────────────────────────────────────────
const stats = [
  { icon: <IconUsers />, value: "10,000+", label: "Active Learners" },
  { icon: <IconActivity />, value: "50,000+", label: "Sessions Completed" },
  { icon: <IconStar />, value: "4.8/5", label: "Platform Rating" },
  { icon: <IconTarget />, value: "95%", label: "See Improvement" },
];

function StatsBanner() {
  return (
    <section className="statsBanner bg-gradient-to-br from-[#0388ff] to-[#0057cc] py-10 px-6">
      <div className="statsGrid max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s, i) => (
          <div key={i} className="statItem flex flex-col items-center gap-1.5 text-white">
            <div className="statIcon w-11 h-11 bg-white/18 rounded-full flex items-center justify-center mb-1">{s.icon}</div>
            <div className="statValue text-[2rem] font-black leading-none">{s.value}</div>
            <div className="statLabel text-[0.82rem] font-semibold opacity-85">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── How It Works Section ────────────────────────────────────────────────────
const steps = [
  {
    num: "1",
    title: "Choose Your Mode",
    desc: "Pick Presentation or Interview simulation based on your goals.",
    color: "#0388ff",
  },
  {
    num: "2",
    title: "Set Up Your Session",
    desc: "Calibrate your camera, choose scenario intensity and difficulty.",
    color: "#fabf24",
  },
  {
    num: "3",
    title: "Start the Simulation",
    desc: "Speak, make mistakes, handle distractions in real-time.",
    color: "#0388ff",
  },
  {
    num: "4",
    title: "Review & Improve",
    desc: "Get AI feedback and actionable tips to level up your skills.",
    color: "#fabf24",
  },
];

function HowItWorksSection() {
  return (
    <section className="howSection bg-[#f7f9ff] py-20 px-6 text-center" id="how-it-works">
      <div className="sectionLabelBlue inline-block text-[0.72rem] font-bold tracking-[0.12em] text-[#0388ff] uppercase mb-3">HOW IT WORKS</div>
      <h2 className="sectionTitle text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold text-[#0f1d35] leading-snug mb-4 text-center">
        Simple steps to become<br />a better communicator
      </h2>

      <div className="stepsGrid max-w-[1100px] mt-13 mx-auto mb-0 grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-7">
        {steps.map((s, i) => (
          <div key={i} className="stepCard bg-white rounded-[18px] pt-0 px-0 pb-7 text-center shadow-[0_2px_16px_rgba(3,136,255,0.06)] overflow-hidden relative transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(3,136,255,0.12)]">
            <div className="stepImgDummy w-full h-[130px] overflow-hidden">
              <DummyImg
                width="100%"
                height="120px"
                label={`Step ${s.num}: ${s.title}`}
                className="stepImg rounded-none! w-full! h-[130px]! border-none!"
              />
            </div>
            <div className="stepNum w-9 h-9 rounded-full text-white text-base font-black flex items-center justify-center mt-[18px] mx-auto mb-3" style={{ background: s.color }}>
              {s.num}
            </div>
            <h3 className="stepTitle text-[0.95rem] font-extrabold text-[#0f1d35] mb-2 px-4">{s.title}</h3>
            <p className="stepDesc text-[0.82rem] text-[#6880a0] leading-[1.55] px-4">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Testimonials Section ────────────────────────────────────────────────────
const testimonials = [
  {
    quote:
      "Presenta helped me overcome my stage fright. The distractions felt so real but the practice made me ready for anything new!",
    name: "Michelle A.",
    role: "University Student",
    avatar: "#4f8ef7",
  },
  {
    quote:
      "The feedback is incredibly accurate. I can now exactly what I need to improve and track my progress every week.",
    name: "Rudy Pratama",
    role: "Sales Manager",
    avatar: "#fabf24",
  },
  {
    quote:
      "As an educator, I use Presenta with my students. Their confidence and presentation skills improved dramatically!",
    name: "Nadia F.",
    role: "School Teacher",
    avatar: "#4fcb8e",
  },
];

function TestimonialsSection() {
  return (
    <section className="testimonialsSection bg-white py-20 px-6 text-center">
      <div className="sectionLabelBlue inline-block text-[0.72rem] font-bold tracking-[0.12em] text-[#0388ff] uppercase mb-3">LEARNER STORIES</div>
      <h2 className="sectionTitle text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold text-[#0f1d35] leading-snug mb-4 text-center">
        Real people. Real progress.
      </h2>
      <div className="testimonialsGrid max-w-[1100px] mt-12 mx-auto mb-0 grid grid-cols-1 md:grid-cols-3 gap-7">
        {testimonials.map((t, i) => (
          <div key={i} className="testimonialCard bg-[#f7f9ff] rounded-[18px] py-8 px-7 text-left relative border-[1.5px] border-transparent transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(3,136,255,0.1)] hover:border-[#d0e4ff]">
            <span className="quoteIcon text-[3.5rem] leading-none text-[#d0e4ff] font-serif block mb-[-12px]">"</span>
            <p className="testimonialQuote text-[0.92rem] text-[#4a5f80] leading-[1.7] mb-6">{t.quote}</p>
            <div className="testimonialAuthor flex items-center gap-3">
              <AvatarDummy size={40} color={t.avatar} />
              <div>
                <div className="testimonialName text-[0.9rem] font-extrabold text-[#0f1d35]">{t.name}</div>
                <div className="testimonialRole text-[0.78rem] text-[#8098b8]">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── CTA Banner ──────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="ctaBanner bg-gradient-to-br from-[#0f1d35] to-[#1a3260] py-18 px-6">
      <div className="ctaContent max-w-[1000px] mx-auto flex flex-col md:flex-row items-center text-center md:text-left gap-9 md:gap-14">
        <div className="ctaText flex-1">
          <h2 className="ctaTitle text-[clamp(1.8rem,4vw,2.8rem)] font-black text-white leading-tight tracking-[-0.02em]">
            Ready to <span className="ctaAccent text-[#fabf24] italic">boost</span> your<br />
            speaking skills?
          </h2>
          <p className="ctaDesc text-[0.95rem] text-white/70 leading-[1.7] mt-3.5 max-w-full md:max-w-[440px] mx-auto md:mx-0">
            Start your free practice today and see for yourself how
            reward-confident communication begins here.
          </p>
          <a href="#" className="btnCta inline-flex items-center gap-2 bg-[#fabf24] text-[#0f1d35] font-extrabold text-[1.05rem] py-4 px-9 rounded-xl no-underline transition-[background,transform,box-shadow] duration-200 shadow-[0_4px_20px_rgba(250,191,36,0.35)] mt-6 mb-3 hover:bg-[#f5b000] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(250,191,36,0.45)]">
            Join Free Practice
          </a>
          <p className="ctaNote text-[0.8rem] text-white/45 mt-1">No credit card required · Cancel anytime</p>
        </div>
        <div className="ctaIllustration shrink-0 relative">
          <DummyImg
            width="200px"
            height="200px"
            label="CTA Illustration — Confident speaker thumbs up"
            className="ctaImg rounded-[20px]! border-white/15!"
          />
          <div className="ctaSpeechBubble absolute top-[-16px] right-[-16px] bg-[#fabf24] text-[#0f1d35] font-extrabold text-[0.82rem] py-2 px-3.5 rounded-[12px_12px_12px_0] whitespace-nowrap shadow-[0_4px_14px_rgba(250,191,36,0.35)]">You've got this! 🎉</div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────────
const footerLinks = {
  Product: ["How it Works", "Features", "Pricing", "Changelog"],
  Resources: ["Blog", "Docs", "Community", "Careers"],
  Company: ["About", "Press", "Partners", "Contact"],
};

function Footer() {
  return (
    <footer className="footer bg-[#0f1d35] pt-14 px-6 pb-6">
      <div className="footerInner max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 lg:gap-10 pb-12 border-b border-white/8">
        <div className="footerBrand">
          <a href="#" className="logo flex items-center gap-2 no-underline shrink-0 mb-1">
            <div className="logoIcon w-7 h-7 bg-gradient-to-br from-[#0388ff] to-[#005fd3] rounded-[10px] flex items-center justify-center text-white" style={{ width: 28, height: 28 }}>
              <IconMic style={{ width: 13, height: 13 }} />
            </div>
            <span className="logoText text-[1.15rem] font-extrabold text-white tracking-[-0.02em]">Presenta</span>
          </a>
          <p className="footerTagline text-[0.85rem] text-white/50 leading-[1.6] mt-3 mx-0 mb-5 max-w-[240px]">
            Practice speaking. Face distractions. Grow with feedback.
          </p>
          <div className="socialLinks flex gap-3">
            <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-[8px] bg-white/8 flex items-center justify-center text-white/60 transition-[background,color] duration-200 no-underline hover:bg-[#0388ff] hover:text-white"><IconTwitter /></a>
            <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-[8px] bg-white/8 flex items-center justify-center text-white/60 transition-[background,color] duration-200 no-underline hover:bg-[#0388ff] hover:text-white"><IconInstagram /></a>
            <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-[8px] bg-white/8 flex items-center justify-center text-white/60 transition-[background,color] duration-200 no-underline hover:bg-[#0388ff] hover:text-white"><IconLinkedin /></a>
          </div>
        </div>

        {Object.entries(footerLinks).map(([section, links]) => (
          <div key={section} className="footerCol">
            <h4 className="footerColTitle text-[0.82rem] font-bold text-white/50 uppercase tracking-[0.1em] mb-4">{section}</h4>
            <ul className="footerColLinks list-none p-0 m-0 flex flex-col gap-2.5">
              {links.map((l) => (
                <li key={l}><a href="#" className="text-sm text-white/65 no-underline transition-colors duration-150 hover:text-white">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footerBottom max-w-[1100px] mt-6 mx-auto mb-0 flex flex-col md:flex-row items-center justify-between flex-wrap gap-3 text-[0.8rem] text-white/35 text-center">
        <span>© 2024 Presenta. All rights reserved.</span>
        <div className="footerBottomLinks flex gap-6">
          <a href="#" className="text-white/35 no-underline transition-colors duration-150 hover:text-white/70">Privacy Policy</a>
          <a href="#" className="text-white/35 no-underline transition-colors duration-150 hover:text-white/70">Terms of Service</a>
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
        <StatsBanner />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
