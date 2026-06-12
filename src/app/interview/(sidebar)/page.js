"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Download,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function InterviewSetupPage() {
  // Set beautiful body background on mount
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#f3f7fd";
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  // Card 1: Interview Profile states
  const [uploadedFile, setUploadedFile] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Card 2: Question Preferences states
  const [questionTypes, setQuestionTypes] = useState(["Behavioral"]);
  const [questionCount, setQuestionCount] = useState("3");
  const [customQuestionCount, setCustomQuestionCount] = useState("");

  const toggleQuestionType = (type) => {
    setQuestionTypes((prev) => {
      if (prev.includes(type)) {
        // Don't allow removing the last selected type
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  };

  // Equipment Check states
  const [cameraStatus, setCameraStatus] = useState("unchecked");
  const [micStatus, setMicStatus] = useState("unchecked");

  // Check permissions on mount
  useEffect(() => {
    async function checkPermissions() {
      try {
        if (navigator.permissions) {
          const camPerm = await navigator.permissions.query({ name: "camera" });
          if (camPerm.state === "granted") setCameraStatus("ready");
          else if (camPerm.state === "denied") setCameraStatus("denied");

          const micPerm = await navigator.permissions.query({
            name: "microphone",
          });
          if (micPerm.state === "granted") setMicStatus("ready");
          else if (micPerm.state === "denied") setMicStatus("denied");
        }
      } catch {
        // permissions API not supported, keep unchecked
      }
    }
    checkPermissions();
  }, []);

  // Hardware permission logic
  const handleAllowCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraStatus("ready");
    } catch (err) {
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setCameraStatus("denied");
      } else {
        setCameraStatus("error");
      }
    }
  }, []);

  const handleAllowMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicStatus("ready");
    } catch (err) {
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setMicStatus("denied");
      } else {
        setMicStatus("error");
      }
    }
  }, []);

  // PDF upload handlers (same pattern as presentation setup)
  const extractPdfPageCount = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target.result;
          const arr = new Uint8Array(buffer);
          const decoder = new TextDecoder("ascii");
          const text = decoder.decode(arr);

          let maxPages = 0;
          const countRegex = /\/Count\s*(\d+)/g;
          let match;
          while ((match = countRegex.exec(text)) !== null) {
            const val = parseInt(match[1], 10);
            if (val > maxPages) {
              maxPages = val;
            }
          }

          if (maxPages > 0) {
            resolve(maxPages);
            return;
          }

          const pageRegex = /\/Type\s*\/Page\b/g;
          const pageMatches = text.match(pageRegex);
          if (pageMatches) {
            resolve(pageMatches.length);
            return;
          }

          resolve(1);
        } catch (err) {
          console.error("Error parsing PDF pages:", err);
          resolve(1);
        }
      };
      reader.onerror = () => resolve(1);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFile = async (file) => {
    if (!file) return;

    // 1. Validate file type (PDF only)
    const isPDF =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPDF) {
      alert("Only PDF files are allowed. Other file formats cannot be uploaded.");
      return;
    }

    // 2. Validate file size (max 4MB)
    const maxSizeBytes = 4 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(
        "The uploaded file exceeds the 4MB limit. Please upload a file below 4MB.",
      );
      return;
    }

    setRawFile(file);
    setUploadError("");

    // 3. Extract page count and calculate size
    const pages = await extractPdfPageCount(file);
    const sizeInKB = (file.size / 1024).toFixed(0) + " KB";

    setUploadedFile({
      name: file.name,
      pages: pages,
      size: sizeInKB,
    });
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, []);

  const handleRemoveCV = () => {
    setUploadedFile(null);
    setRawFile(null);
    setUploadError("");
  };

  // ── Start Interview: validate, submit, navigate ────────────
  const handleStartInterview = useCallback(async () => {
    // Validate job title (required)
    const trimmedTitle = jobTitle.trim();
    if (!trimmedTitle) {
      alert("Please enter a job title before starting the interview.");
      return;
    }

    // Validate at least one question type selected
    if (questionTypes.length === 0) {
      alert("Please select at least one question type.");
      return;
    }

    // Validate camera/mic readiness
    if (cameraStatus !== "ready" || micStatus !== "ready") {
      alert(
        "Please allow access to your camera and microphone before starting the interview.",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData();
      if (rawFile) {
        formData.append("file", rawFile);
      }
      formData.append("question_type", JSON.stringify(questionTypes));
      formData.append(
        "number_of_question",
        questionCount === "other" ? customQuestionCount : questionCount,
      );
      formData.append("job_title", trimmedTitle);
      if (jobDescription.trim()) {
        formData.append("job_desc", jobDescription.trim());
      }

      const res = await fetch(
        "https://pitcho-be.vercel.app/api/interview/upload",
        {
          method: "POST",
          headers: {
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NmFiNDI1NS1mZGUwLTRiNWEtOWM0Zi1iMjRkMTRmNDA2ZjkiLCJlbWFpbCI6ImZhemFtdW10YXpyYW1hZGhhbkBnbWFpbC5jb20iLCJpYXQiOjE3ODEyNTA0MDEsImV4cCI6MTc4MTg1NTIwMX0.SkI5ausTOZaooyrk2MfL2g4q3ODvSyQambsG5guAI0M"
          },
          body: formData,
        },
      );

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(errorText || `Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Interview upload response:", data);

      // Save to sessionStorage for the session page
      sessionStorage.setItem("interview_configured", "true");
      sessionStorage.setItem("interview_questions", JSON.stringify(data));

      router.push("/interview/session");
    } catch (error) {
      console.error("Error starting interview:", error);
      setSubmitError(
        error.message ||
          "Failed to generate interview questions. Please try again.",
      );
      setIsSubmitting(false);
    }
  }, [
    rawFile,
    jobTitle,
    jobDescription,
    questionTypes,
    questionCount,
    customQuestionCount,
    cameraStatus,
    micStatus,
    router,
  ]);

  // Equipment status renderer (from presentation setup)
  const renderDeviceStatus = (status, type) => {
    if (status === "ready") {
      return (
        <div className="flex items-center gap-2">
          <Check size={12} className="text-green-500" />
          <span className="text-xs text-slate-500">
            {type === "camera" ? "Camera is Working" : "Microphone is Working"}
          </span>
        </div>
      );
    }
    if (status === "error") {
      return (
        <div className="flex items-center gap-2">
          <AlertTriangle size={12} className="text-amber-500" />
          <span className="text-xs text-amber-600">Device Error</span>
        </div>
      );
    }
    if (status === "denied") {
      return (
        <div className="flex items-center gap-2">
          <X size={12} className="text-red-500" />
          <span className="text-xs text-red-500">Permission Denied</span>
          <button
            onClick={type === "camera" ? handleAllowCamera : handleAllowMic}
            className="text-xs font-semibold text-main hover:underline ml-1"
          >
            Allow Access
          </button>
        </div>
      );
    }
    // unchecked
    return (
      <div className="flex items-center gap-2">
        <X size={12} className="text-orange-400" />
        <span className="text-xs text-slate-400">Not Checked Yet</span>
        <button
          onClick={type === "camera" ? handleAllowCamera : handleAllowMic}
          className="text-xs font-semibold text-main hover:underline ml-1"
        >
          Allow Access
        </button>
      </div>
    );
  };

  // Dropdown option data lists
  const questionTypeOptions = [
    { key: "Behavioral", desc: "About your past experience" },
    { key: "Technical", desc: "Role-specific knowledge" },
    { key: "Situational", desc: "Problem solving scenarios" },
  ];

  const questionCountOptions = [
    { key: "3", desc: "Short" },
    { key: "5", desc: "Recommended" },
    { key: "other", desc: "Set custom" },
  ];

  return (
    <div className="w-full min-h-screen pb-16 font-sans text-slate-800">
      {/* Hidden file input for real upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Interview Setup</h1>
          <p className="text-slate-500">
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
                The more details you provide, the more realistic your mock
                interview will be.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
        {/* Card 1: Interview Profile */}
        <div className="w-full px-4 py-6 bg-white border-bold flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="text-white bg-main w-7 h-7 text-sm font-semibold flex justify-center items-center rounded-full">
              1
            </div>
            <div className="flex flex-col">
              <h4 className="font-bold">Interview Profile</h4>
              <span className="text-sm font-semibold text-slate-500">
                Upload your CV/Resume
              </span>
            </div>
          </div>

          {/* CV upload box */}
          {uploadedFile ? (
            <>
              <div className="w-full p-4 bg-main/5 border border-main rounded-lg mt-5 flex items-center gap-3">
                <Image
                  src={"/pdf.svg"}
                  height={100}
                  alt="file type"
                  width={100}
                  className="w-9 h-auto"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{uploadedFile.name}</span>
                  <span className="text-xs text-slate-500">{`${uploadedFile.pages} pages • ${uploadedFile.size}  `}</span>
                </div>
              </div>

              {/* Upload / Replace buttons */}
              <div className="w-full mt-3 flex items-center justify-between">
                <button
                  onClick={handleUploadClick}
                  className="flex items-center gap-2 border-2 rounded-lg text-xs font-bold py-2 px-4 cursor-pointer"
                >
                  <Download size={15} />
                  Upload file
                </button>
                <span
                  onClick={handleRemoveCV}
                  className="font-bold text-main text-sm cursor-pointer"
                >
                  Replace File
                </span>
              </div>
            </>
          ) : (
            <>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={handleUploadClick}
                className={`w-full p-6 mt-5 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
                  dragActive
                    ? "border-main bg-main/10"
                    : "border-slate-300 hover:border-main hover:bg-main/5"
                }`}
              >
                <Upload size={24} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-600">
                  Drag & drop your file here
                </span>
                <span className="text-xs text-slate-400">
                  or click to browse (PDF only, max 4MB)
                </span>
              </div>

              <div className="w-full mt-3 flex items-center justify-between">
                <button
                  onClick={handleUploadClick}
                  className="flex items-center gap-2 border-2 rounded-lg text-xs font-bold py-2 px-4 cursor-pointer"
                >
                  <Download size={15} />
                  Upload file
                </button>
              </div>
            </>
          )}

          {/* Upload error display */}
          {uploadError && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-2.5 rounded-xl">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold leading-normal">
                {uploadError}
              </p>
            </div>
          )}

          {/* Job Title input */}
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-sm font-bold text-slate-500">
              Job Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Frontend Developer, Product Manager"
              className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none focus:border-main transition-colors"
            />
          </div>

          {/* Job Description input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-500">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description or key responsibilities..."
              rows={4}
              className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none focus:border-main transition-colors resize-none"
            />
          </div>

          {/* Info Banner */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-start gap-2 text-main bg-main/10 p-2.5 rounded-xl">
            <Sparkles size={16} className="shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold leading-normal">
              We'll analyze your CV to generate role-specific interview
              questions tailored to your experience.
            </p>
          </div>
        </div>

        {/* Card 2: Question Preferences */}
        <div className="w-full p-5 bg-white border-bold flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="text-white bg-main w-7 h-7 text-sm font-semibold flex justify-center items-center rounded-full">
              2
            </div>
            <div className="flex flex-col">
              <h4 className="font-bold">Question Preferences</h4>
              <span className="text-xs font-bold text-slate-400 mt-0.5">
                Customize the interview focus
              </span>
            </div>
          </div>

          {/* Question Type selection */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">
                Question Type
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Select at least one
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {questionTypeOptions.map((q) => {
                const isSelected = questionTypes.includes(q.key);
                return (
                  <button
                    key={q.key}
                    onClick={() => toggleQuestionType(q.key)}
                    className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                      isSelected
                        ? "border-main bg-main/10 text-main"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700"
                    }`}
                  >
                    <div
                      className={`size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-main border-main"
                          : "border-slate-300"
                      }`}
                    >
                      {isSelected && (
                        <Check size={12} className="text-white" strokeWidth={3} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{q.key}</span>
                      <span className="text-[9.5px] text-slate-400 leading-tight">
                        {q.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Questions selection */}
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-sm font-bold text-slate-500">
              Number of Questions
            </span>
            <div className="grid grid-cols-3 gap-2">
              {questionCountOptions.map((count) => {
                const isActive = questionCount === count.key;
                return (
                  <button
                    key={count.key}
                    onClick={() => setQuestionCount(count.key)}
                    className={`py-2.5 px-1 rounded-xl border-2 flex flex-col items-center transition-all cursor-pointer text-center ${
                      isActive
                        ? "border-main bg-main/10 text-main"
                        : "border-slate-200 hover:border-slate-350 text-slate-700"
                    }`}
                  >
                    <span className="text-sm font-bold">
                      {count.key === "other" ? "..." : count.key}
                    </span>
                    <span className="text-[9.5px] font-medium text-slate-400 mt-0.5 leading-tight">
                      {count.desc}
                    </span>
                  </button>
                );
              })}
            </div>
            {questionCount === "other" && (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={customQuestionCount}
                  onChange={(e) => setCustomQuestionCount(e.target.value)}
                  placeholder="Enter number..."
                  min="1"
                  className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none focus:border-main transition-colors"
                />
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Equipment Check */}
        <div className="w-full px-4 py-6 bg-white border-bold flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="text-white bg-main w-7 h-7 text-sm font-semibold flex justify-center items-center rounded-full">
              3
            </div>
            <div className="flex flex-col">
              <h4 className="font-bold">Equipment Check</h4>
              <span className="text-sm font-semibold text-slate-500">
                Make sure everything is ready to go
              </span>
            </div>
          </div>

          {/* content */}
          <div className="w-full mt-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <div className="p-1.5 bg-main/10 rounded-full">
                  <Wifi className="text-main" size={12} />
                </div>
                <span className="font-semibold text-sm">
                  Internet Connection
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={12} className="text-green-500" />
                <span className="text-xs text-slate-500">Internet is Good</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <div className="p-1.5 bg-main/10 rounded-full">
                  <Camera className="text-main" size={12} />
                </div>
                <span className="font-semibold text-sm">Camera</span>
              </div>
              {renderDeviceStatus(cameraStatus, "camera")}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <div className="p-1.5 bg-main/10 rounded-full">
                  <Mic className="text-main" size={12} />
                </div>
                <span className="font-semibold text-sm">Microphone</span>
              </div>
              {renderDeviceStatus(micStatus, "mic")}
            </div>
          </div>
        </div>
      </div>

      {/* What to Expect section */}
      <div className="w-full grid grid-cols-3">
        <div className="w-full col-span-3 p-5 pb-7 bg-white border-bold mt-6">
          <div className="">
            <h3 className="font-bold text-lg">What to Expect?</h3>
          </div>
          <div className="col-span-2 bg-white w-full flex justify-evenly gap-5 mt-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-indigo-500/20">
                <FileText
                  className="text-indigo-500"
                  strokeWidth={2}
                  size={18}
                />
              </div>
              <div className="flex flex-col gap-1">
                <h6 className="font-bold text-sm">Realistic Questions</h6>
                <p className="text-sm">
                  AI generates role-specific questions based on your profile and
                  target role.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-yellow-500/20">
                <Play className="text-yellow-500" strokeWidth={2} size={18} />
              </div>
              <div className="flex flex-col gap-1">
                <h6 className="font-bold text-sm">Live Simulation</h6>
                <p className="text-sm">
                  Practice in a real interview environment with your selected
                  settings.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-green-500/20">
                <Lightbulb
                  className="text-green-500"
                  strokeWidth={2}
                  size={18}
                />
              </div>
              <div className="flex flex-col gap-1">
                <h6 className="font-bold text-sm">Live Feedback</h6>
                <p className="text-sm">
                  Get AI feedback on your answers, delivery, and communication.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <Settings className="text-blue-500" strokeWidth={2} size={18} />
              </div>
              <div className="flex flex-col gap-1">
                <h6 className="font-bold text-sm">Performance Insight</h6>
                <p className="text-sm">
                  Receive a detailed report with actionable tips to improve.
                </p>
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
            <svg
              width="68"
              height="68"
              viewBox="0 0 68 68"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Antenna */}
              <circle cx="34" cy="9" r="4" fill="#0388ff" />
              <line
                x1="34"
                y1="13"
                x2="34"
                y2="20"
                stroke="#0388ff"
                strokeWidth="3"
              />

              {/* Ears */}
              <rect x="7" y="29" width="6" height="14" rx="3" fill="#fabf24" />
              <rect x="55" y="29" width="6" height="14" rx="3" fill="#fabf24" />

              {/* Head Body */}
              <rect
                x="11"
                y="19"
                width="46"
                height="34"
                rx="10"
                fill="#0388ff"
              />

              {/* Screen Face */}
              <rect
                x="17"
                y="24"
                width="34"
                height="24"
                rx="6"
                fill="#1e293b"
              />

              {/* Eyes */}
              <circle cx="27" cy="34" r="4" fill="#60a5fa" />
              <circle cx="27" cy="34" r="1.5" fill="white" />
              <circle cx="41" cy="34" r="4" fill="#60a5fa" />
              <circle cx="41" cy="34" r="1.5" fill="white" />

              {/* Cheeks */}
              <circle cx="22" cy="40" r="2" fill="#ef4444" opacity="0.6" />
              <circle cx="46" cy="40" r="2" fill="#ef4444" opacity="0.6" />

              {/* Happy Mouth */}
              <path
                d="M31 41 Q34 44 37 41"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="font-extrabold text-slate-800 text-sm md:text-base">
              You're all set! 🥳
            </span>
            <span className="text-xs text-slate-500 font-bold leading-normal mt-0.5">
              We'll start the interview with a warm welcome and explain the
              guidelines.
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleStartInterview}
              disabled={isSubmitting}
              className="h-11 bg-[#58cc02] hover:bg-[#58a700] text-white font-extrabold text-xs px-5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_0_#58a700] active:translate-y-[4px] active:shadow-[0_0_0_#58a700] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_#58a700]"
            >
              <Play size={15} fill="white" />
              <span>
                {isSubmitting ? "Generating..." : "Start Interview"}
              </span>
            </button>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">
            You can't pause or restart once begun.
          </span>
        </div>
      </div>
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
            <Loader2 size={40} className="text-main animate-spin" />
            <p className="text-sm font-bold text-slate-700 text-center">
              Generating your interview questions...
            </p>
            <div className="w-full space-y-2">
              <div className="h-2 bg-slate-100 rounded animate-pulse" />
              <div className="h-2 bg-slate-100 rounded animate-pulse w-4/5" />
              <div className="h-2 bg-slate-100 rounded animate-pulse w-3/5" />
            </div>
          </div>
        </div>
      )}

      {/* Submit Error Toast */}
      {submitError && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-red-700">
                Failed to Start Interview
              </p>
              <p className="text-[10px] text-red-600">{submitError}</p>
              <button
                onClick={() => setSubmitError("")}
                className="text-[10px] font-bold text-red-700 underline self-start mt-1 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
