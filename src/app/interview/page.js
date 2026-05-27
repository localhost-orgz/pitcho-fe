"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  HelpCircle,
  Lightbulb,
  Upload,
  Check,
  X,
  AlertTriangle,
  Camera,
  Mic,
  Wifi,
  Play,
  FileText,
  ChevronDown,
  Eye,
  Settings,
  CircleHelp,
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";

export default function InterviewSetupPage() {
  // Set beautiful body background on mount
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#f3f7fd";
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  // Card 1: Resume Profile states
  const [uploadedFile, setUploadedFile] = useState({
    name: "Alex_Tan_CV.pdf",
    pages: 2,
    size: "240 KB",
  });
  const [targetRole, setTargetRole] = useState("Product Manager");
  const [experienceLevel, setExperienceLevel] = useState("2-3 Years");
  const [targetIndustry, setTargetIndustry] = useState("Technology");

  // Card 2: Question Preferences states
  const [questionType, setQuestionType] = useState("Behavioral");
  const [difficultyLevel, setDifficultyLevel] = useState("Medium");
  const [questionCount, setQuestionCount] = useState("15");

  // Card 3: Interview Environment states
  const [interviewStyle, setInterviewStyle] = useState("Formal");
  const [interviewerPersona, setInterviewerPersona] = useState("Professional Recruiter");
  const [distractionIntensity, setDistractionIntensity] = useState("Medium");

  // Card 4: Session Settings states
  const [timeLimit, setTimeLimit] = useState("60 sec");
  const [feedbackFocus, setFeedbackFocus] = useState([
    "Communication Clarity",
    "Answer Structure",
    "Confidence & Tone",
    "Filler Words",
    "Eye Contact",
    "Pace & Pauses",
  ]);
  const [language, setLanguage] = useState("English (US)");

  // Equipment Check states
  const [cameraStatus, setCameraStatus] = useState("ready");
  const [micStatus, setMicStatus] = useState("ready");
  const [internetStatus, setInternetStatus] = useState("ready");

  // Handlers for CV upload simulation
  const handleUploadCV = () => {
    setUploadedFile({
      name: "Alex_Tan_CV.pdf",
      pages: 2,
      size: "240 KB",
    });
  };

  const handleRemoveCV = () => {
    setUploadedFile(null);
  };

  // Hardware permission logic
  const handleAllowCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraStatus("ready");
    } catch {
      setCameraStatus("denied");
    }
  }, []);

  const handleAllowMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicStatus("ready");
    } catch {
      setMicStatus("denied");
    }
  }, []);

  const toggleFeedbackFocus = (item) => {
    if (feedbackFocus.includes(item)) {
      setFeedbackFocus(feedbackFocus.filter((f) => f !== item));
    } else {
      setFeedbackFocus([...feedbackFocus, item]);
    }
  };

  // Dropdown option data lists
  const roles = ["Product Manager", "Software Engineer", "Data Analyst", "Consultant", "UX Designer", "Marketing Manager"];
  const experienceLevels = ["Entry Level", "1-2 Years", "2-3 Years", "3-5 Years", "5+ Years"];
  const industries = ["Technology", "Finance", "Healthcare", "Consulting", "Education", "Consumer Goods"];
  
  const questionTypes = [
    { key: "Behavioral", desc: "About your past experience" },
    { key: "Technical", desc: "Role-specific knowledge" },
    { key: "Situational", desc: "Problem solving scenarios" },
    { key: "Mixed", desc: "A combination of all types" },
  ];

  const difficultyLevels = [
    { key: "Easy", desc: "Basic questions" },
    { key: "Medium", desc: "Standard level" },
    { key: "Hard", desc: "Advanced level" },
  ];

  const questionCounts = [
    { key: "10", desc: "Short" },
    { key: "15", desc: "Recommended" },
    { key: "20", desc: "Comprehensive" },
    { key: "Custom", desc: "Set custom" },
  ];

  const styles = [
    { key: "Formal", desc: "Traditional one-on-one" },
    { key: "Casual", desc: "Friendly and conversational" },
    { key: "Panel", desc: "Multiple interviewers" },
  ];

  const personas = [
    { 
      name: "Professional Recruiter", 
      desc: "Experienced recruiter with a professional and detail-oriented approach.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
    },
    { 
      name: "Technical Lead", 
      desc: "Pragmatic developer diving deep into your stack, systems, and logic.",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200"
    },
    { 
      name: "Executive Director", 
      desc: "High-level manager looking for strategic fit, leadership, and long-term vision.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200"
    }
  ];

  const distractions = [
    { key: "Low", desc: "Minimal distractions" },
    { key: "Medium", desc: "Moderate distractions" },
    { key: "High", desc: "Lots of distractions" },
  ];

  const timeLimits = ["45 sec", "60 sec", "90 sec", "120 sec"];

  const focuses = [
    "Communication Clarity",
    "Answer Structure",
    "Confidence & Tone",
    "Filler Words",
    "Eye Contact",
    "Pace & Pauses",
  ];

  const selectedPersonaObj = personas.find(p => p.name === interviewerPersona) || personas[0];

  return (
    <div className="w-full min-h-screen pb-16 font-sans text-slate-800">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors mb-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Interview Setup
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Let's personalize your mock interview experience
          </p>
        </div>

        {/* Top Right Buttons & Tips */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button className="flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition-all cursor-pointer">
            <HelpCircle size={18} className="text-slate-400" />
            <span>How it works</span>
          </button>
          
          <div className="flex items-center gap-3 p-3 bg-violet-50 border border-violet-100 rounded-2xl max-w-sm">
            <div className="p-2 bg-violet-100 rounded-xl shrink-0">
              <Lightbulb size={20} className="text-violet-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-violet-800">Tip</span>
              <p className="text-[11px] text-violet-600 font-bold leading-normal">
                The more details you provide, the more realistic your mock interview will be.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
        
        {/* Card 1: Interview Profile */}
        <div className="w-full p-5 bg-white border-bold flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-main text-white w-7 h-7 text-xs font-black flex justify-center items-center rounded-full shrink-0">
              1
            </div>
            <div className="flex flex-col">
              <h4 className="font-extrabold text-slate-900 leading-tight">Interview Profile</h4>
              <span className="text-xs font-bold text-slate-400 mt-0.5">Tell us about yourself</span>
            </div>
          </div>

          {/* CV upload box */}
          {uploadedFile ? (
            <div className="w-full mt-2">
              <div className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/10 p-2 rounded-lg text-red-500 shrink-0 font-black text-[10px]">
                    PDF
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-slate-800 line-clamp-1">
                      {uploadedFile.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {uploadedFile.pages} pages • {uploadedFile.size}
                    </span>
                  </div>
                </div>
                <div className="p-1 bg-emerald-500/20 text-emerald-600 rounded-full shrink-0">
                  <Check size={14} strokeWidth={3} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 px-1">
                <button 
                  onClick={handleUploadCV}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline"
                >
                  Upload Resume
                </button>
                <button 
                  onClick={handleRemoveCV}
                  className="text-xs font-black text-main hover:text-sky-600 transition-colors"
                >
                  Replace File
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full mt-2">
              <button
                onClick={handleUploadCV}
                className="w-full p-5 border-2 border-dashed border-slate-350 hover:border-main rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-sky-50/30 transition-all cursor-pointer"
              >
                <Upload size={22} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Drag & drop resume</span>
                <span className="text-[10px] text-slate-400">PDF, DOCX max 10MB</span>
              </button>
            </div>
          )}

          {/* Profile Details Dropdowns */}
          <div className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Target Role
              </label>
              <div className="relative">
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full py-2.5 pl-3.5 pr-10 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-800 appearance-none focus:outline-none focus:border-main transition-colors cursor-pointer"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Experience Level
              </label>
              <div className="relative">
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full py-2.5 pl-3.5 pr-10 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-800 appearance-none focus:outline-none focus:border-main transition-colors cursor-pointer"
                >
                  {experienceLevels.map((exp) => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Target Industry
              </label>
              <div className="relative">
                <select
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className="w-full py-2.5 pl-3.5 pr-10 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-800 appearance-none focus:outline-none focus:border-main transition-colors cursor-pointer"
                >
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-start gap-2 text-violet-600 bg-violet-50/50 p-2.5 rounded-xl">
            <Sparkles size={16} className="shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold leading-normal">
              We'll generate role-specific questions based on your profile and target role.
            </p>
          </div>
        </div>

        {/* Card 2: Question Preferences */}
        <div className="w-full p-5 bg-white border-bold flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-main text-white w-7 h-7 text-xs font-black flex justify-center items-center rounded-full shrink-0">
              2
            </div>
            <div className="flex flex-col">
              <h4 className="font-extrabold text-slate-900 leading-tight">Question Preferences</h4>
              <span className="text-xs font-bold text-slate-400 mt-0.5">Customize the interview focus</span>
            </div>
          </div>

          {/* Question Type selection */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Question Type
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {questionTypes.map((q) => {
                const isActive = questionType === q.key;
                return (
                  <button
                    key={q.key}
                    onClick={() => setQuestionType(q.key)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-start gap-1 transition-all cursor-pointer text-left ${
                      isActive 
                        ? "border-violet-500 bg-violet-50/30 text-violet-900" 
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-extrabold">{q.key}</span>
                      {isActive && <div className="size-1.5 rounded-full bg-violet-600" />}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 leading-tight">
                      {q.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Level selection */}
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Difficulty Level
            </span>
            <div className="grid grid-cols-3 gap-2">
              {difficultyLevels.map((d) => {
                const isActive = difficultyLevel === d.key;
                return (
                  <button
                    key={d.key}
                    onClick={() => setDifficultyLevel(d.key)}
                    className={`py-2 px-1.5 rounded-xl border-2 flex flex-col items-center transition-all cursor-pointer text-center ${
                      isActive 
                        ? "border-violet-500 bg-violet-50/30 text-violet-900" 
                        : "border-slate-200 hover:border-slate-350 text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-extrabold">{d.key}</span>
                    <span className="text-[9px] font-bold text-slate-400 mt-0.5 whitespace-nowrap">
                      {d.desc.split(" ")[0]} level
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Questions selection */}
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Number of Questions
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {questionCounts.map((count) => {
                const isActive = questionCount === count.key;
                return (
                  <button
                    key={count.key}
                    onClick={() => setQuestionCount(count.key)}
                    className={`py-2 px-1 rounded-xl border-2 flex flex-col items-center transition-all cursor-pointer text-center ${
                      isActive 
                        ? "border-violet-500 bg-violet-50/30 text-violet-900" 
                        : "border-slate-200 hover:border-slate-350 text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-black">{count.key}</span>
                    <span className="text-[8px] font-bold text-slate-400 mt-0.5 leading-tight">
                      {count.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 3: Interview Environment */}
        <div className="w-full p-5 bg-white border-bold flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-main text-white w-7 h-7 text-xs font-black flex justify-center items-center rounded-full shrink-0">
              3
            </div>
            <div className="flex flex-col">
              <h4 className="font-extrabold text-slate-900 leading-tight">Interview Environment</h4>
              <span className="text-xs font-bold text-slate-400 mt-0.5">Set the simulation experience</span>
            </div>
          </div>

          {/* Interview Style selection */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Interview Style
            </span>
            <div className="grid grid-cols-3 gap-2">
              {styles.map((s) => {
                const isActive = interviewStyle === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setInterviewStyle(s.key)}
                    className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer text-center h-16 ${
                      isActive 
                        ? "border-violet-500 bg-violet-50/30 text-violet-900" 
                        : "border-slate-200 hover:border-slate-350 text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-extrabold">{s.key}</span>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 leading-tight max-w-[70px]">
                      {s.desc.split(" ").slice(-1)[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interviewer Persona Selection dropdown */}
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Interviewer Persona
            </span>
            
            {/* Display active persona detail card */}
            <div className="relative">
              <select
                value={interviewerPersona}
                onChange={(e) => setInterviewerPersona(e.target.value)}
                className="w-full py-2.5 pl-3.5 pr-10 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-800 appearance-none focus:outline-none focus:border-main transition-colors cursor-pointer mb-2"
              >
                {personas.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Persona preview element */}
            <div className="flex items-center gap-3.5 p-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
              <img 
                src={selectedPersonaObj.avatar} 
                alt={selectedPersonaObj.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" 
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-black text-slate-850">{selectedPersonaObj.name}</span>
                <p className="text-[10px] text-slate-400 leading-normal font-bold">
                  {selectedPersonaObj.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Distraction Intensity selection */}
          <div className="flex flex-col gap-2 mt-auto">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Distraction Intensity
            </span>
            <div className="grid grid-cols-3 gap-2">
              {distractions.map((d) => {
                const isActive = distractionIntensity === d.key;
                return (
                  <button
                    key={d.key}
                    onClick={() => setDistractionIntensity(d.key)}
                    className={`py-2 px-1.5 rounded-xl border-2 flex flex-col items-center transition-all cursor-pointer text-center ${
                      isActive 
                        ? "border-violet-500 bg-violet-50/30 text-violet-900" 
                        : "border-slate-200 hover:border-slate-350 text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-extrabold">{d.key}</span>
                    <span className="text-[9px] font-bold text-slate-400 mt-0.5">
                      {d.desc.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 4: Session Settings */}
        <div className="w-full p-5 bg-white border-bold flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-main text-white w-7 h-7 text-xs font-black flex justify-center items-center rounded-full shrink-0">
              4
            </div>
            <div className="flex flex-col">
              <h4 className="font-extrabold text-slate-900 leading-tight">Session Settings</h4>
              <span className="text-xs font-bold text-slate-400 mt-0.5">Finalize your session</span>
            </div>
          </div>

          {/* Time per Question */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Time per Question
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {timeLimits.map((t) => {
                const isActive = timeLimit === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTimeLimit(t)}
                    className={`py-2 px-1 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer text-center ${
                      isActive 
                        ? "border-violet-500 bg-violet-50/30 text-violet-950" 
                        : "border-slate-200 hover:border-slate-350 text-slate-600"
                    }`}
                  >
                    <span className="text-xs font-extrabold">{t}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Focus List Checklist */}
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Feedback Focus
            </span>
            <div className="flex flex-col gap-1.5 max-h-[190px] overflow-y-auto pr-1">
              {focuses.map((item) => {
                const isChecked = feedbackFocus.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleFeedbackFocus(item)}
                    className="flex items-center justify-between p-2.5 border border-slate-200/80 rounded-xl hover:bg-slate-50/50 cursor-pointer text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-0.5 rounded ${isChecked ? "bg-violet-600 text-white" : "border-2 border-slate-300 text-transparent"}`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="text-xs font-extrabold text-slate-700">{item}</span>
                    </div>
                    {/* Reorder drag handle decoration */}
                    <div className="flex flex-col gap-[2px]">
                      <div className="size-[2px] rounded-full bg-slate-300" />
                      <div className="size-[2px] rounded-full bg-slate-300" />
                      <div className="size-[2px] rounded-full bg-slate-300" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language selection dropdown */}
          <div className="flex flex-col gap-1.5 mt-auto">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Language
            </span>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full py-2.5 pl-3.5 pr-10 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-800 appearance-none focus:outline-none focus:border-main transition-colors cursor-pointer"
              >
                <option value="English (US)">English (US)</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                <option value="日本語">日本語</option>
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Expectation & Equipment Checks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        
        {/* What to Expect Card */}
        <div className="lg:col-span-2 p-5 bg-white border-bold">
          <h3 className="font-extrabold text-lg text-slate-900">What to Expect</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-violet-100 text-violet-600 shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-850">Realistic Questions</span>
                <p className="text-[11px] text-slate-400 font-bold leading-normal mt-0.5">
                  AI generates role-specific questions based on your profile and target role.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                <Play size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-850">Live Simulation</span>
                <p className="text-[11px] text-slate-400 font-bold leading-normal mt-0.5">
                  Practice in a real interview environment with your selected settings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-amber-100 text-amber-600 shrink-0">
                <Lightbulb size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-850">Smart Feedback</span>
                <p className="text-[11px] text-slate-400 font-bold leading-normal mt-0.5">
                  Get AI feedback on your answers, delivery, and communication.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-sky-100 text-sky-600 shrink-0">
                <Settings size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-850">Performance Insights</span>
                <p className="text-[11px] text-slate-400 font-bold leading-normal mt-0.5">
                  Receive a detailed report with actionable tips to improve.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Check Card */}
        <div className="p-5 bg-white border-bold flex flex-col gap-4">
          <h3 className="font-extrabold text-lg text-slate-900">Equipment Check</h3>
          
          <div className="flex flex-col gap-3 mt-1.5">
            {/* Camera check */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 text-slate-500 rounded-xl shrink-0">
                  <Camera size={16} />
                </div>
                <span className="text-xs font-extrabold text-slate-700">Camera</span>
              </div>
              {cameraStatus === "ready" ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-500 font-bold">Camera is working</span>
                  <div className="size-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]">✓</div>
                </div>
              ) : (
                <button onClick={handleAllowCamera} className="text-xs font-black text-main hover:underline">
                  Check camera
                </button>
              )}
            </div>

            {/* Microphone check */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 text-slate-500 rounded-xl shrink-0">
                  <Mic size={16} />
                </div>
                <span className="text-xs font-extrabold text-slate-700">Microphone</span>
              </div>
              {micStatus === "ready" ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-500 font-bold">Microphone is working</span>
                  <div className="size-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]">✓</div>
                </div>
              ) : (
                <button onClick={handleAllowMic} className="text-xs font-black text-main hover:underline">
                  Check mic
                </button>
              )}
            </div>

            {/* Internet check */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 text-slate-500 rounded-xl shrink-0">
                  <Wifi size={16} />
                </div>
                <span className="text-xs font-extrabold text-slate-700">Internet Connection</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-500 font-bold">Connection is stable</span>
                <div className="size-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]">✓</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Main Button Row Banner */}
      <div className="w-full mt-6 bg-[#EDF3FF] border-bold p-5 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 text-left">
          {/* Cute Inline SVG Robot Mascot */}
          <div className="shrink-0 scale-90 md:scale-100">
            <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Antenna */}
              <circle cx="34" cy="9" r="4" fill="#0388ff" />
              <line x1="34" y1="13" x2="34" y2="20" stroke="#0388ff" strokeWidth="3" />
              
              {/* Ears */}
              <rect x="7" y="29" width="6" height="14" rx="3" fill="#fabf24" />
              <rect x="55" y="29" width="6" height="14" rx="3" fill="#fabf24" />
              
              {/* Head Body */}
              <rect x="11" y="19" width="46" height="34" rx="10" fill="#0388ff" />
              
              {/* Screen Face */}
              <rect x="17" y="24" width="34" height="24" rx="6" fill="#1e293b" />
              
              {/* Eyes */}
              <circle cx="27" cy="34" r="4" fill="#60a5fa" />
              <circle cx="27" cy="34" r="1.5" fill="white" />
              <circle cx="41" cy="34" r="4" fill="#60a5fa" />
              <circle cx="41" cy="34" r="1.5" fill="white" />
              
              {/* Cheeks */}
              <circle cx="22" cy="40" r="2" fill="#ef4444" opacity="0.6" />
              <circle cx="46" cy="40" r="2" fill="#ef4444" opacity="0.6" />
              
              {/* Happy Mouth */}
              <path d="M31 41 Q34 44 37 41" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="font-extrabold text-slate-800 text-sm md:text-base">You're all set! 🥳</span>
            <span className="text-xs text-slate-500 font-bold leading-normal mt-0.5">
              We'll start the interview with a warm welcome and explain the guidelines.
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-3">
            <button className="h-[44px] bg-white border-2 border-violet-200 hover:border-violet-300 text-violet-600 font-extrabold text-xs px-5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:translate-y-0.5">
              <Eye size={15} />
              <span>Preview Questions</span>
            </button>
            
            <button className="h-[44px] bg-[#58cc02] hover:bg-[#58a700] text-white font-extrabold text-xs px-5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_0_#58a700] active:translate-y-[4px] active:shadow-[0_0_0_#58a700]">
              <Play size={15} fill="white" />
              <span>Start Interview</span>
            </button>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">
            You can't pause or restart once begun.
          </span>
        </div>
      </div>
    </div>
  );
}
