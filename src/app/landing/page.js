"use client";

import { useState } from "react";
import styles from "./landing.module.css";

// ── Icons (inline SVG helpers) ──────────────────────────────────────────────
const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconActivity = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconAward = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);
const IconTarget = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const IconBrain = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14" />
  </svg>
);
const IconTrendingUp = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconMic = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const IconZap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconTwitter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);
const IconLinkedin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
);
const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// ── Dummy Image Placeholder ─────────────────────────────────────────────────
function DummyImg({ width, height, label, className, style }) {
  return (
    <div
      className={`${styles.dummyImg} ${className || ""}`}
      style={{ width, height, ...style }}
      aria-label={label}
    >
      <span className={styles.dummyImgLabel}>{label || "Image"}</span>
    </div>
  );
}

// ── Avatar Dummies ──────────────────────────────────────────────────────────
function AvatarDummy({ size = 36, color }) {
  return (
    <div
      className={styles.avatarDummy}
      style={{ width: size, height: size, background: color }}
    />
  );
}

// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        {/* Logo */}
        <a href="#" className={styles.logo}>
          <div className={styles.logoIcon}>
            <IconMic />
          </div>
          <span className={styles.logoText}>Presenta</span>
        </a>

        {/* Nav links */}
        <ul className={styles.navLinks}>
          <li><a href="#how-it-works">How it Works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#educators">For Educators</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#resources">Resources</a></li>
        </ul>

        {/* CTA buttons */}
        <div className={styles.navCta}>
          <a href="#" className={styles.btnOutline}>Log in</a>
          <a href="#" className={styles.btnPrimary}>
            Get Started Free <IconArrowRight />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <a href="#how-it-works">How it Works</a>
          <a href="#features">Features</a>
          <a href="#educators">For Educators</a>
          <a href="#pricing">Pricing</a>
          <a href="#resources">Resources</a>
          <a href="#" className={styles.btnPrimary}>Get Started Free</a>
        </div>
      )}
    </nav>
  );
}

// ── Hero Section ────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroLeft}>
        <div className={styles.heroBadge}>
          <IconZap />
          <span>AI-Powered Speaking Simulator</span>
        </div>

        <h1 className={styles.heroTitle}>
          Practice speaking.<br />
          Face distractions.<br />
          <span className={styles.heroAccent}>Grow</span> with feedback.
        </h1>

        <p className={styles.heroDesc}>
          Presenta helps you build real-world communication skills through immersive
          simulations and AI-powered feedback that actually makes you better.
        </p>

        <div className={styles.heroBtns}>
          <a href="#" className={styles.btnHeroPrimary}>
            Start Free Practice <IconArrowRight />
          </a>
          <a href="#how-it-works" className={styles.btnHeroSecondary}>
            Watch Demo
          </a>
        </div>

        {/* Social proof row */}
        <div className={styles.heroSocial}>
          <div className={styles.heroAvatars}>
            {[
              "#4f8ef7", "#f7a14f", "#4fcb8e", "#e56af7"
            ].map((c, i) => (
              <AvatarDummy key={i} size={32} color={c} />
            ))}
          </div>
          <div className={styles.heroRating}>
            <div className={styles.heroStars}>
              {[...Array(5)].map((_, i) => (
                <span key={i} className={styles.starIcon}><IconStar /></span>
              ))}
            </div>
            <span className={styles.heroRatingText}>
              Trusted by <strong>10,000+</strong> learners
            </span>
          </div>
        </div>
      </div>

      <div className={styles.heroRight}>
        {/* Main hero illustration dummy */}
        <div className={styles.heroImgWrapper}>
          <DummyImg
            width="100%"
            height="320px"
            label="Hero Illustration — Person presenting with AI feedback"
            className={styles.heroMainImg}
          />
          {/* Floating cards */}
          <div className={`${styles.floatCard} ${styles.floatCard1}`}>
            <span className={styles.floatCardIcon}>🎯</span>
            <span>Eye Contact: <strong>92%</strong></span>
          </div>
          <div className={`${styles.floatCard} ${styles.floatCard2}`}>
            <span className={styles.floatCardIcon}>🧠</span>
            <span>AI Feedback Ready</span>
          </div>
          <div className={`${styles.floatCard} ${styles.floatCard3}`}>
            <span className={styles.floatCardIcon}>📈</span>
            <span>Score: <strong>+18pts</strong></span>
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
    <section className={styles.painSection}>
      <div className={styles.sectionLabel}>WHAT MATTERS</div>
      <h2 className={styles.painTitle}>
        Most people know what to say.<br />
        But struggle when it <em>really</em> matters.
      </h2>
      <div className={styles.painGrid}>
        {painPoints.map((p, i) => (
          <div key={i} className={styles.painCard}>
            <DummyImg
              width="80px"
              height="80px"
              label={`Illustration: ${p.title}`}
              className={styles.painCardImg}
            />
            <h3 className={styles.painCardTitle}>{p.title}</h3>
            <p className={styles.painCardDesc}>{p.desc}</p>
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
    <section className={styles.featuresSection} id="features">
      <div className={styles.featuresInner}>
        <div className={styles.featuresLeft}>
          <div className={styles.sectionLabelBlue}>WHAT MAKES US DIFFERENT</div>
          <h2 className={styles.featuresTitle}>
            Realistic simulation.<br />
            Personalized feedback.<br />
            <span className={styles.heroAccent}>Real results.</span>
          </h2>
          <p className={styles.featuresDesc}>
            We pair you with real-world scenarios and give you the tools to improve,
            all backed by AI that truly understands the nuances of great communication.
          </p>
          <a href="#" className={styles.btnPrimary} style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
            Explore Features <IconArrowRight />
          </a>
        </div>

        <div className={styles.featuresRight}>
          {featureHighlights.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureCardIcon}>{f.icon}</div>
              <div>
                <h4 className={styles.featureCardTitle}>{f.title}</h4>
                <p className={styles.featureCardDesc}>{f.desc}</p>
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
    <section className={styles.statsBanner}>
      <div className={styles.statsGrid}>
        {stats.map((s, i) => (
          <div key={i} className={styles.statItem}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
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
    <section className={styles.howSection} id="how-it-works">
      <div className={styles.sectionLabelBlue}>HOW IT WORKS</div>
      <h2 className={styles.sectionTitle}>
        Simple steps to become<br />a better communicator
      </h2>

      <div className={styles.stepsGrid}>
        {steps.map((s, i) => (
          <div key={i} className={styles.stepCard}>
            <div className={styles.stepImgDummy}>
              <DummyImg
                width="100%"
                height="120px"
                label={`Step ${s.num}: ${s.title}`}
                className={styles.stepImg}
              />
            </div>
            <div className={styles.stepNum} style={{ background: s.color }}>
              {s.num}
            </div>
            <h3 className={styles.stepTitle}>{s.title}</h3>
            <p className={styles.stepDesc}>{s.desc}</p>
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
    <section className={styles.testimonialsSection}>
      <div className={styles.sectionLabelBlue}>LEARNER STORIES</div>
      <h2 className={styles.sectionTitle}>
        Real people. Real progress.
      </h2>
      <div className={styles.testimonialsGrid}>
        {testimonials.map((t, i) => (
          <div key={i} className={styles.testimonialCard}>
            <span className={styles.quoteIcon}>"</span>
            <p className={styles.testimonialQuote}>{t.quote}</p>
            <div className={styles.testimonialAuthor}>
              <AvatarDummy size={40} color={t.avatar} />
              <div>
                <div className={styles.testimonialName}>{t.name}</div>
                <div className={styles.testimonialRole}>{t.role}</div>
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
    <section className={styles.ctaBanner}>
      <div className={styles.ctaContent}>
        <div className={styles.ctaText}>
          <h2 className={styles.ctaTitle}>
            Ready to <span className={styles.ctaAccent}>boost</span> your<br />
            speaking skills?
          </h2>
          <p className={styles.ctaDesc}>
            Start your free practice today and see for yourself how
            reward-confident communication begins here.
          </p>
          <a href="#" className={styles.btnCta}>
            Join Free Practice
          </a>
          <p className={styles.ctaNote}>No credit card required · Cancel anytime</p>
        </div>
        <div className={styles.ctaIllustration}>
          <DummyImg
            width="200px"
            height="200px"
            label="CTA Illustration — Confident speaker thumbs up"
            className={styles.ctaImg}
          />
          <div className={styles.ctaSpeechBubble}>You've got this! 🎉</div>
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
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <a href="#" className={styles.logo}>
            <div className={styles.logoIcon} style={{ width: 28, height: 28, fontSize: 13 }}>
              <IconMic />
            </div>
            <span className={styles.logoText}>Presenta</span>
          </a>
          <p className={styles.footerTagline}>
            Practice speaking. Face distractions. Grow with feedback.
          </p>
          <div className={styles.socialLinks}>
            <a href="#" aria-label="Twitter"><IconTwitter /></a>
            <a href="#" aria-label="Instagram"><IconInstagram /></a>
            <a href="#" aria-label="LinkedIn"><IconLinkedin /></a>
          </div>
        </div>

        {Object.entries(footerLinks).map(([section, links]) => (
          <div key={section} className={styles.footerCol}>
            <h4 className={styles.footerColTitle}>{section}</h4>
            <ul className={styles.footerColLinks}>
              {links.map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={styles.footerBottom}>
        <span>© 2024 Presenta. All rights reserved.</span>
        <div className={styles.footerBottomLinks}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className={styles.page}>
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
