"use client";

import {
  Angry,
  Annoyed,
  AlertTriangle,
  Camera,
  Check,
  CircleCheck,
  CircleQuestionMark,
  Download,
  Eye,
  Laugh,
  Loader2,
  Mic,
  ScrollText,
  Smile,
  Upload,
  Wifi,
  X,
  FileText,
  Users,
  Ghost,
  ChartNoAxesCombined,
  MessageCircleCheck,
  Trophy,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import DocumentLibrary from "@/components/DocumentLibrary";
import api from "@/lib/api";

/**
 * Parse the backend upload response into slides.
 * Handles multiple response shapes: { data: [...] }, { slides: [...] }, etc.
 * @returns {{ documentId: string|null, slides: Array }}
 */
function parseUploadResponse(responseData) {
  const documentId =
    responseData.id ||
    responseData.documentId ||
    responseData.document_id ||
    responseData.data?.id ||
    responseData.data?.documentId ||
    responseData.data?.document_id ||
    responseData.meta?.document_id ||
    responseData.meta?.documentId ||
    null;

  let slides = null;
  if (Array.isArray(responseData.data)) {
    slides = responseData.data;
  } else if (responseData.slides) {
    slides = responseData.slides;
  } else if (responseData.data?.slides) {
    slides = responseData.data.slides;
  } else if (responseData.slide) {
    slides = responseData.slide;
  } else if (responseData.data?.slide) {
    slides = responseData.data.slide;
  }

  return { documentId, slides };
}

export default function PresentationSetupPage() {
  const router = useRouter();
  // Card 1: Upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [cueCards, setCueCards] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const fileInputRef = useRef(null);

  // Card 2: Equipment check states
  const [cameraStatus, setCameraStatus] = useState("unchecked");
  const [micStatus, setMicStatus] = useState("unchecked");

  // Card 3: Cue card state
  const [cueCardStatus, setCueCardStatus] = useState("empty");

  // Card 4: Simulation environment states
  const [selectedDistraction, setSelectedDistraction] = useState("low");
  const [selectedAudience, setSelectedAudience] = useState("classroom");
  const [selectedDuration, setSelectedDuration] = useState("1");

  // Card 2: Check permissions on mount
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

    // 1. Validate file type (PDF only, no PPT/PPTX etc.)
    const isPDF =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPDF) {
      alert(
        "Only PDF files are allowed. PPT or other file formats cannot be uploaded.",
      );
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
    setCueCardStatus("loading");

    // 3. Extract page count and calculate size in MB
    const pages = await extractPdfPageCount(file);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";

    setUploadedFile({
      name: file.name,
      pages: pages,
      size: sizeInMB,
    });

    // 4. Hit API
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("fileType", file.type);
      formData.append("pageCount", String(pages));
      formData.append("fileSize", String(file.size));

      // `api` is an Axios instance — res.data is already parsed JSON;
      // .ok and .json() do not exist on Axios responses.
      const res = await api.post("/presentation/upload", formData);

      // Axios only resolves for 2xx; 4xx/5xx throw automatically,
      // so reaching here means the request succeeded.
      console.log("Upload response status:", res.status);
      console.log("Upload response data:", res.data);

      const { documentId, slides } = parseUploadResponse(res.data);

      if (documentId) {
        setUploadedFile((prev) => ({
          ...(prev || {}),
          document_id: documentId,
        }));
      }

      if (slides) {
        const slidesArray = Array.isArray(slides) ? slides : [slides];
        setCueCards(slidesArray);
        setActiveSlideIndex(0);
        setCueCardStatus("ready");
      } else {
        console.error(
          "Missing expected slides data in response. Response payload:",
          res.data,
        );
        throw new Error("Invalid response structure from server");
      }
    } catch (error) {
      // Distinguish network errors from Axios error responses
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to generate speaking notes.";

      console.error("Error uploading presentation:", {
        message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack,
      });

      setUploadError(message);
      setCueCardStatus("error");
    }
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

  const handleStartPresentation = () => {
    if (cameraStatus !== "ready" || micStatus !== "ready") {
      alert(
        "Please verify and allow access to both your camera and microphone before starting the simulation session.",
      );
      return;
    }
    if (cueCardStatus === "loading") {
      return;
    }

    // Save all configurations to localStorage
    localStorage.setItem(
      "pitcho_presentation_file",
      JSON.stringify(uploadedFile),
    );
    localStorage.setItem("pitcho_selected_distraction", selectedDistraction);
    localStorage.setItem("pitcho_selected_audience", selectedAudience);
    localStorage.setItem("pitcho_selected_duration", selectedDuration);
    localStorage.setItem("pitcho_cue_cards", JSON.stringify(cueCards));

    // Navigate to the session page
    router.push("/presentation/session");
  };

  // Handle selecting a document from the library
  const handleSelectFromLibrary = async (doc) => {
    const fileName = doc.fileName || doc.name || "Untitled";
    const pages = doc.pageCount ?? doc.pages ?? "?";
    const fileSize = doc.fileSize ?? doc.size ?? 0;
    const sizeFormatted =
      fileSize > 0
        ? (Number(fileSize) / (1024 * 1024)).toFixed(2) + " MB"
        : "?";

    setUploadedFile({
      name: fileName,
      pages: pages,
      size: sizeFormatted,
      document_id: doc.id || doc._id,
    });
    setRawFile(null);
    setUploadError("");
    setCueCardStatus("loading");

    try {
      const formData = new FormData();
      formData.append("document_id", doc.id || doc._id);
      if (doc.pageCount != null) formData.append("pageCount", String(doc.pageCount));
      if (doc.fileSize != null) formData.append("fileSize", String(doc.fileSize));
      if (doc.fileType) formData.append("fileType", doc.fileType);

      // Use Axios instead of raw fetch for consistency
      const res = await api.post("/presentation/upload", formData);

      console.log("Library re-process response:", res.data);

      const { documentId, slides } = parseUploadResponse(res.data);

      if (documentId) {
        setUploadedFile((prev) => ({
          ...(prev || {}),
          document_id: documentId,
        }));
      }

      if (slides) {
        const slidesArray = Array.isArray(slides) ? slides : [slides];
        setCueCards(slidesArray);
        setActiveSlideIndex(0);
        setCueCardStatus("ready");
      } else {
        throw new Error("Invalid response structure from server");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to generate speaking notes.";

      console.error("Error processing library document:", {
        message,
        status: error.response?.status,
        data: error.response?.data,
      });

      setUploadError(message);
      setCueCardStatus("error");
    }
  };

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

  const distractions = [
    {
      key: "low",
      label: "Low",
      desc: "Minimal distractions",
      icon: Laugh,
      iconClass: "text-slate-500",
      borderClass: "border-slate-400",
    },
    {
      key: "medium",
      label: "Medium",
      desc: "Moderate distractions",
      icon: Annoyed,
      iconClass: "text-yellow-500",
      borderClass: "border-yellow-400",
    },
    {
      key: "High",
      label: "High",
      desc: "Lots distractions",
      icon: Angry,
      iconClass: "text-red-500",
      borderClass: "border-red-400",
    },
  ];

  const durations = ["1", "3", "5", "10", "15"];

  return (
    <div className="w-full min-h-screen">
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Presentation Setup</h1>
        <p className="text-slate-500">
          Prepare your presentation and simulation environment
        </p>
      </div>

      {/* main grid */}
      <div className="w-full mt-10 grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-4">
        {/* card 1: presentation material */}
        <div className="col-span-1 row-span-1 w-full px-4 py-6 rounded-2xl border-bold bg-white">
          <div className="flex items-start gap-3">
            <div className="text-white bg-main w-7 h-7 text-sm font-semibold flex justify-center items-center rounded-full">
              1
            </div>
            <div className="flex flex-col ">
              <h4 className="font-bold">Your Presentation Material</h4>
              <span className="text-sm font-semibold text-slate-500">
                Upload your slides or document
              </span>
            </div>
          </div>

          {/* content */}
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

              {/*  */}
              <div className="w-full mt-3 flex items-center justify-between">
                <button
                  onClick={handleUploadClick}
                  className="flex items-center gap-2 border-2 rounded-lg text-xs font-bold py-2 px-4 cursor-pointer"
                >
                  <Download size={15} />
                  Upload file
                </button>
                <span
                  onClick={handleUploadClick}
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

          {/* Document Library */}
          <hr className="border-slate-100 my-4" />
          <DocumentLibrary
            onSelectDocument={handleSelectFromLibrary}
            disabled={cueCardStatus === "loading"}
          />
        </div>

        {/* card 2: equipemnt check */}
        <div className="col-span-1 row-span-1 lg:row-start-2 w-full px-4 py-6 rounded-2xl border-bold bg-white">
          <div className="flex items-start gap-3">
            <div className="text-white bg-main w-7 h-7 text-sm font-semibold flex justify-center items-center rounded-full">
              2
            </div>
            <div className="flex flex-col ">
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

        {/* card 3: cue card */}
        <div className="col-span-1 lg:row-span-2 w-full px-4 py-5 rounded-2xl border-bold bg-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="text-white bg-main w-7 h-7 text-sm font-semibold flex justify-center items-center rounded-full">
                3
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold">Cue Card (Speaking Guide)</h4>
                <span className="text-sm font-semibold text-slate-500">
                  Your AI-generated speaking notes
                </span>
              </div>
            </div>
          </div>

          {/* content */}
          <div className="w-full mt-5 rounded-xl p-4 border border-amber-200 bg-amber-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full p-2.5 bg-amber-400/20">
                <ScrollText className="text-yellow-500" size={20} />
              </div>
              <span className="font-bold text-sm">Cue Card Preview</span>
            </div>{" "}
            {cueCardStatus === "empty" && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <FileText size={32} className="text-amber-400" />
                <span className="text-sm text-amber-700 font-medium text-center">
                  Upload your presentation first to generate speaking notes
                </span>
              </div>
            )}
            {cueCardStatus === "loading" && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 size={32} className="text-amber-500 animate-spin" />
                <span className="text-sm text-amber-700 font-medium">
                  Generating your speaking notes...
                </span>
                <div className="w-full space-y-3 mt-2">
                  <div className="h-3 bg-amber-200/60 rounded animate-pulse" />
                  <div className="h-3 bg-amber-200/60 rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-amber-200/60 rounded animate-pulse w-3/5" />
                  <div className="h-3 bg-amber-200/60 rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-amber-200/60 rounded animate-pulse w-2/5" />
                </div>
              </div>
            )}
            {cueCardStatus === "ready" &&
              cueCards.length > 0 &&
              (() => {
                const activeSlide = cueCards[activeSlideIndex] || {};
                const isSlideObject =
                  typeof activeSlide === "object" && activeSlide !== null;

                const title = isSlideObject
                  ? activeSlide.title || `Slide ${activeSlideIndex + 1}`
                  : activeSlide;
                const talkingPoints = isSlideObject
                  ? activeSlide.talking_points || []
                  : [];
                const transitionSentence = isSlideObject
                  ? activeSlide.transition_sentence
                  : "";

                return (
                  <div className="flex flex-col gap-4 mt-2">
                    {/* Carousel Header Controls */}
                    <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                      <span className="text-xs font-bold text-amber-800">
                        Slide {activeSlideIndex + 1} of {cueCards.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setActiveSlideIndex((prev) => Math.max(0, prev - 1))
                          }
                          disabled={activeSlideIndex === 0}
                          className="p-1 rounded-md border border-amber-300 bg-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-100/50"
                          title="Previous Slide"
                        >
                          <ChevronLeft size={16} className="text-amber-800" />
                        </button>
                        <button
                          onClick={() =>
                            setActiveSlideIndex((prev) =>
                              Math.min(cueCards.length - 1, prev + 1),
                            )
                          }
                          disabled={activeSlideIndex === cueCards.length - 1}
                          className="p-1 rounded-md border border-amber-300 bg-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-100/50"
                          title="Next Slide"
                        >
                          <ChevronRight size={16} className="text-amber-800" />
                        </button>
                      </div>
                    </div>

                    {/* 1. Slide Title */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-700/80">
                        Slide Title
                      </span>
                      <h5 className="text-sm font-bold text-slate-800 leading-snug bg-white/60 p-2.5 rounded-lg border border-amber-200/40">
                        {title}
                      </h5>
                    </div>

                    {/* 2. Talking Points (Speaking Notes) */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-700/80">
                        Key Speaking Guide
                      </span>
                      <div className="flex flex-col gap-2 bg-white/40 p-3 rounded-lg border border-amber-200/40 min-h-[90px]">
                        {talkingPoints.length > 0 ? (
                          talkingPoints.map((point, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2.5"
                            >
                              <span className="text-amber-500 font-bold shrink-0 mt-0.5">
                                •
                              </span>
                              <span className="text-xs text-slate-700 font-medium leading-relaxed">
                                {point}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No specific talking points generated.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3. Transition Sentence */}
                    {transitionSentence && (
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-700/80">
                          Smooth Bridge/Transition
                        </span>
                        <div className="text-xs text-amber-900 font-medium italic leading-relaxed bg-amber-100/60 p-3 rounded-lg border border-amber-200/60 flex items-start gap-2">
                          <span className="text-amber-500 shrink-0 mt-0.5">
                            🔗
                          </span>
                          <span>"{transitionSentence}"</span>
                        </div>
                      </div>
                    )}

                    {/* Tips banner */}
                    <div className="mt-1 flex items-center gap-2 rounded-lg bg-amber-100/30 px-3 py-2 border border-amber-200/30">
                      <span className="text-amber-500 text-sm">💡</span>
                      <span className="text-[11px] text-amber-800 font-medium leading-normal">
                        Practice explaining this slide using the points. Use the
                        transition sentence before changing slides!
                      </span>
                    </div>
                  </div>
                );
              })()}
            {cueCardStatus === "error" && (
              <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
                <AlertTriangle
                  size={32}
                  className="text-red-500 animate-pulse"
                />
                <span className="text-sm text-red-700 font-medium">
                  {uploadError || "Failed to generate speaking notes."}
                </span>
                <button
                  onClick={() => {
                    if (rawFile) {
                      handleFile(rawFile);
                    }
                  }}
                  className="text-xs font-semibold text-main hover:underline bg-main/5 py-1 px-3 border border-main/20 rounded-md cursor-pointer transition-colors"
                >
                  Retry Generation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* card 4: simulation environment */}
        <div className="col-span-1 lg:row-span-2 w-full px-4 py-5 rounded-2xl border-bold bg-white">
          <div className="flex items-start gap-3">
            <div className="text-white bg-main w-7 h-7 text-sm font-semibold flex justify-center items-center rounded-full">
              4
            </div>
            <div className="flex flex-col ">
              <h4 className="font-bold">Simulation Environment</h4>
              <span className="text-sm font-semibold text-slate-500">
                Customize your virtual audience experience
              </span>
            </div>
          </div>

          {/* main content */}
          <div className="flex flex-col mt-5">
            <div className="flex items-center gap-1">
              <h6 className="text-sm font-bold">Distractions Intensity</h6>
              <div className="relative group flex items-center cursor-pointer">
                <CircleQuestionMark
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  size={15}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 hidden group-hover:block bg-slate-900 text-white text-[11px] font-bold rounded-lg p-2.5 shadow-xl leading-normal text-center z-50">
                  Adjust the frequency and volume of audience sounds, movements,
                  and notifications during your practice.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {distractions.map((d) => {
                const Icon = d.icon;
                const isSelected = selectedDistraction === d.key;
                return (
                  <button
                    key={d.key}
                    onClick={() => setSelectedDistraction(d.key)}
                    className={`relative w-full py-4 flex flex-col justify-center items-center rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? "border-main border-2" : d.borderClass
                    }`}
                  >
                    {isSelected && (
                      <CircleCheck
                        size={18}
                        className="absolute top-1.5 right-1.5 text-main fill-white"
                      />
                    )}
                    <Icon size={20} className={d.iconClass} />
                    <span className="text-xs font-bold mt-2">{d.label}</span>
                    <span className="text-[10px] font-medium text-center text-slate-400">
                      {d.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* audiece type */}
          <div className="flex flex-col mt-5">
            <div className="flex items-center gap-1">
              <h6 className="text-sm font-bold">Audience Type</h6>
              <div className="relative group flex items-center cursor-pointer">
                <CircleQuestionMark
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  size={15}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 hidden group-hover:block bg-slate-900 text-white text-[11px] font-bold rounded-lg p-2.5 shadow-xl leading-normal text-center z-50">
                  Select the virtual environment setting and size of the
                  audience for your presentation simulation.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <button
                onClick={() => setSelectedAudience("classroom")}
                className={`w-full col-span-1 py-4 px-5 flex flex-col justify-center items-center rounded-lg border cursor-pointer transition-colors ${
                  selectedAudience === "classroom"
                    ? "border-main border-2"
                    : "border-slate-300"
                }`}
              >
                <svg
                  width="512"
                  height="512"
                  viewBox="0 0 512 512"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-auto"
                >
                  <path
                    d="M158.312 24.3651C159.468 24.3573 160.624 24.3495 161.816 24.3415C165.022 24.325 168.227 24.3309 171.433 24.3464C174.892 24.3577 178.35 24.3402 181.809 24.3265C188.583 24.3043 195.358 24.3091 202.132 24.3236C207.637 24.3348 213.142 24.3364 218.647 24.3309C219.431 24.3302 220.214 24.3294 221.021 24.3286C222.612 24.327 224.203 24.3254 225.795 24.3238C240.718 24.3095 255.642 24.3259 270.565 24.3528C283.373 24.3751 296.18 24.3712 308.987 24.3482C323.857 24.3214 338.727 24.3109 353.597 24.3262C355.182 24.3278 356.768 24.3294 358.353 24.3309C359.523 24.3321 359.523 24.3321 360.717 24.3333C366.216 24.3376 371.715 24.3303 377.214 24.3185C383.915 24.3045 390.615 24.3083 397.316 24.3349C400.736 24.3481 404.155 24.3532 407.574 24.3367C411.28 24.3231 414.983 24.3401 418.689 24.3651C420.313 24.3484 420.313 24.3484 421.971 24.3313C426.56 24.3916 429.232 24.515 433.169 27.0015C435.551 30.9027 435.682 34.1737 435.601 38.6117C435.606 39.4776 435.61 40.3435 435.614 41.2356C435.623 44.1365 435.595 47.036 435.568 49.9368C435.566 52.0163 435.567 54.0958 435.57 56.1754C435.571 61.8218 435.542 67.4677 435.507 73.114C435.476 79.0144 435.473 84.9147 435.467 90.8151C435.451 101.989 435.41 113.162 435.36 124.336C435.304 137.056 435.277 149.777 435.252 162.497C435.199 188.665 435.112 214.833 435 241C435.758 240.984 436.516 240.968 437.297 240.952C438.289 240.939 439.282 240.927 440.305 240.914C441.289 240.898 442.274 240.882 443.289 240.866C446.598 241.03 448.497 241.831 451 244C453.296 248.591 452.312 255.357 452.35 260.458C452.367 262.066 452.394 263.674 452.432 265.282C452.487 267.602 452.509 269.921 452.524 272.242C452.546 272.959 452.569 273.676 452.592 274.414C452.578 277.808 452.344 279.609 450.078 282.191C445.734 284.744 442.127 284.543 437.174 284.481C436.177 284.484 435.18 284.488 434.154 284.491C430.811 284.498 427.469 284.476 424.126 284.454C421.731 284.453 419.336 284.454 416.941 284.456C411.111 284.457 405.281 284.44 399.451 284.414C392.667 284.386 385.883 284.38 379.098 284.375C366.999 284.366 354.901 284.34 342.802 284.302C331.05 284.265 319.298 284.237 307.546 284.22C306.822 284.219 306.097 284.218 305.351 284.217C301.716 284.211 298.081 284.206 294.446 284.201C264.298 284.16 234.149 284.088 204 284C204 295.55 204 307.1 204 319C206.97 319.33 209.94 319.66 213 320C223.896 323.606 231.593 331.191 236.809 341.191C240.979 351.023 241.832 362.567 238.5 372.813C236.039 378.645 231.839 387.081 226 390C226.895 390.534 227.789 391.067 228.711 391.617C239.562 398.241 248.883 405.581 255 417C255 417.66 255 418.32 255 419C255.66 419 256.32 419 257 419C257.339 417.699 257.339 417.699 257.684 416.371C259.179 412.543 261.269 409.984 264.063 407.063C264.551 406.542 265.04 406.021 265.544 405.485C271.266 399.506 277.366 394.328 285 391C284.437 390.29 284.437 390.29 283.863 389.566C275.739 379.068 270.35 368.685 271.176 355.109C272.768 342.826 278.236 332.685 288 325C298.225 318.441 309.587 316.485 321.5 318.688C332.363 321.48 340.771 327.363 346.824 336.863C353.124 348.624 353.975 358.997 351 372C348.503 379.181 344.247 384.586 339 390C341.051 391.568 343.113 393.076 345.262 394.508C354.033 400.355 362.37 407.298 367 417C367 417.66 367 418.32 367 419C367.66 419 368.32 419 369 419C369.309 418.01 369.309 418.01 369.625 417C375.41 404.379 386.349 396.678 398 390C397.24 389.426 396.479 388.853 395.695 388.262C387.881 381.704 384.424 372.517 383.188 362.625C382.445 351.023 385.806 340.564 393.043 331.418C401.422 322.475 411.56 318.118 423.688 317.625C433.992 317.833 443.481 320.849 451 328C451.688 328.648 452.377 329.297 453.086 329.965C460.126 337.201 464.541 346.198 465.063 356.375C464.757 369.225 460.884 379.623 452 389C451.34 389.33 450.68 389.66 450 390C450.895 390.534 451.789 391.067 452.711 391.617C468.761 401.408 480.091 413.52 485.309 432.027C486.766 438.293 487.184 444.226 487.238 450.633C487.246 451.547 487.255 452.461 487.263 453.403C487.277 455.328 487.287 457.253 487.295 459.177C487.307 461.146 487.327 463.115 487.357 465.084C487.399 467.934 487.416 470.783 487.426 473.633C487.443 474.512 487.461 475.391 487.479 476.297C487.475 477.529 487.475 477.529 487.47 478.786C487.479 479.864 487.479 479.864 487.488 480.965C486.758 484.01 485.461 485.082 483 487C480.338 487.392 478.089 487.538 475.429 487.503C474.659 487.509 473.889 487.515 473.096 487.521C470.5 487.536 467.906 487.522 465.31 487.508C463.437 487.513 461.564 487.519 459.691 487.527C454.531 487.544 449.372 487.535 444.212 487.523C438.652 487.514 433.093 487.528 427.533 487.539C416.637 487.557 405.741 487.553 394.844 487.541C385.991 487.532 377.139 487.531 368.286 487.535C367.027 487.536 365.769 487.537 364.473 487.537C361.917 487.538 359.361 487.54 356.805 487.541C333.502 487.552 310.199 487.541 286.897 487.52C265.615 487.501 244.334 487.502 223.052 487.522C199.153 487.543 175.254 487.551 151.355 487.539C148.808 487.538 146.261 487.537 143.715 487.535C142.461 487.535 141.208 487.534 139.917 487.533C131.071 487.53 122.226 487.536 113.38 487.545C102.605 487.556 91.8299 487.553 81.055 487.532C75.5538 487.522 70.0528 487.517 64.5516 487.531C59.5207 487.543 54.4902 487.536 49.4594 487.515C47.6344 487.51 45.8094 487.513 43.9844 487.522C41.513 487.534 39.0428 487.522 36.5714 487.503C35.8547 487.513 35.138 487.522 34.3995 487.532C30.9924 487.48 29.2789 487.218 26.5587 485.092C24.843 482.789 24.4956 481.775 24.4825 478.944C24.4699 478.155 24.4573 477.367 24.4443 476.554C24.4565 475.282 24.4565 475.282 24.4689 473.984C24.465 473.096 24.4612 472.207 24.4573 471.292C24.4546 469.405 24.4619 467.519 24.4786 465.633C24.4997 462.801 24.479 459.972 24.4532 457.141C24.423 437.694 27.7796 419.786 41.715 405.246C47.9997 399.069 54.2891 394.314 62.0001 390C60.9482 389.319 60.9482 389.319 59.8751 388.625C53.0639 382.406 48.1466 372.754 47.5314 363.484C47.4974 361.907 47.4876 360.328 47.5001 358.75C47.5051 357.92 47.5101 357.089 47.5153 356.233C47.7154 349.125 49.1399 343.069 53.0001 337C53.4791 336.554 53.9582 336.108 54.4517 335.648C58.137 332.13 59.4236 329.455 59.7327 324.348C59.7555 322.089 59.7456 319.829 59.7096 317.57C59.7138 316.332 59.718 315.093 59.7223 313.817C59.7274 311.133 59.7217 308.451 59.6974 305.767C59.6594 301.512 59.6652 297.257 59.677 293.002C59.6938 284.726 59.6658 276.451 59.6336 268.176C59.595 257.665 59.5791 247.155 59.5988 236.644C59.6052 232.426 59.5912 228.21 59.5603 223.992C59.5411 220.73 59.5476 217.469 59.5494 214.207C59.535 213.058 59.5205 211.91 59.5056 210.726C59.5544 200.553 61.6514 190.507 67.5001 182C68.0673 181.154 68.6345 180.309 69.2189 179.438C79.4879 165.385 93.1454 159.226 109.887 156.48C110.914 156.322 111.942 156.163 113 156C112.541 155.466 112.082 154.933 111.609 154.383C101.79 142.459 99.7885 130.085 101 115C103.223 103.506 109.78 93.2039 119 86C124.932 82.379 130.705 79.0995 137.729 78.4158C138.531 78.3351 139.333 78.2545 140.16 78.1714C140.767 78.1148 141.374 78.0583 142 78C141.989 77.4098 141.978 76.8195 141.966 76.2114C141.856 70.0634 141.78 63.9156 141.725 57.7669C141.7 55.4728 141.666 53.1788 141.623 50.885C141.562 47.5859 141.534 44.2879 141.512 40.9883C141.486 39.9642 141.46 38.94 141.434 37.8849C141.433 36.9242 141.433 35.9636 141.432 34.9739C141.421 34.1323 141.41 33.2907 141.399 32.4236C143.553 23.7394 150.992 24.2897 158.312 24.3651ZM156 39C156 51.87 156 64.74 156 78C158.64 78.99 161.28 79.98 164 81C176.75 86.3138 184.544 94.2547 190.254 106.742C194.724 118.236 194.362 130.429 190.352 142.012C188.178 146.817 185.21 150.847 182 155C181.67 155.66 181.34 156.32 181 157C205.159 160.218 205.159 160.218 227.231 153.93C230.115 150.718 232.075 147.108 233.886 143.207C235.742 139.53 238.378 136.526 241 133.375C241.858 132.281 242.712 131.185 243.563 130.086C244.367 129.068 245.171 128.049 246 127C246.411 126.462 246.821 125.924 247.244 125.369C249.875 122.025 252.206 119.97 256.063 118.188C256.899 117.789 257.736 117.391 258.598 116.98C265.892 114.003 272.61 114.38 279.899 117.098C286.408 119.893 290.14 123.605 293 130C295.601 138.247 295.637 145.75 291.723 153.543C287.477 160.571 282.225 166.879 277.051 173.234C274.267 176.655 271.554 180.123 268.875 183.625C268.075 184.67 267.274 185.716 266.449 186.793C265.633 187.862 264.816 188.931 264 190C262.231 192.314 260.46 194.626 258.688 196.938C257.908 197.957 257.128 198.977 256.324 200.027C255.557 201.008 254.79 201.989 254 203C253.34 204.035 252.68 205.069 252.001 206.136C250.316 208.134 249.368 208.905 246.815 209.564C244.085 209.791 241.408 209.831 238.668 209.805C237.676 209.818 236.685 209.832 235.663 209.846C232.504 209.884 229.347 209.88 226.188 209.875C224.042 209.893 221.897 209.914 219.752 209.938C214.501 209.994 209.253 209.996 204 210C204 220.23 204 230.46 204 241C275.61 241 347.22 241 421 241C421 174.34 421 107.68 421 39C333.55 39 246.1 39 156 39ZM123.25 101.816C116.649 109.986 114.277 118.209 114.617 128.668C115.163 133.421 116.496 136.954 119 141C119.413 141.697 119.825 142.395 120.25 143.113C125.143 150.494 132.571 154.66 141 157C151.148 157.98 159.362 156.845 167.688 150.875C175.048 144.801 179.857 136.856 180.813 127.313C181.431 118.144 178.742 110.173 173 103C165.985 95.4938 158.127 91.4816 147.828 90.9063C138.306 91.2219 129.859 94.9566 123.25 101.816ZM258.613 133.207C251.063 141.757 244.049 150.665 237.152 159.746C236.696 160.345 236.24 160.944 235.77 161.561C234.9 162.705 234.034 163.852 233.172 165.001C230.221 168.889 230.221 168.889 228 170C226.426 170.098 224.848 170.133 223.271 170.138C222.273 170.143 221.275 170.149 220.247 170.155C218.598 170.156 218.598 170.156 216.916 170.158C215.184 170.165 215.184 170.165 213.417 170.173C210.902 170.184 208.386 170.192 205.871 170.199C201.886 170.211 197.901 170.23 193.916 170.252C182.582 170.314 171.248 170.368 159.914 170.401C153.657 170.42 147.4 170.449 141.144 170.489C137.836 170.51 134.528 170.524 131.22 170.528C127.519 170.533 123.82 170.556 120.119 170.584C119.036 170.581 117.953 170.577 116.837 170.574C104.99 170.703 94.6886 173.991 85.7697 182.004C78.7397 189.377 73.9193 198.62 73.8419 208.923C73.8321 209.913 73.8223 210.903 73.8122 211.923C73.8065 213.002 73.8007 214.082 73.7948 215.194C73.7849 216.336 73.775 217.478 73.7648 218.654C73.7332 222.431 73.7084 226.208 73.6837 229.984C73.6631 232.602 73.6421 235.219 73.6207 237.837C73.5709 244.024 73.5259 250.211 73.4827 256.398C73.4333 263.443 73.3784 270.487 73.323 277.532C73.2093 292.021 73.1024 306.511 73.0001 321C73.6886 320.858 74.377 320.717 75.0863 320.571C75.9884 320.387 76.8905 320.204 77.8199 320.014C78.7146 319.831 79.6093 319.649 80.5311 319.46C83.1006 318.981 85.5119 318.762 88.1251 318.813C89.2427 318.822 89.2427 318.822 90.3829 318.832C93.946 319.061 97.4583 319.548 101 320C101.003 319.446 101.005 318.892 101.007 318.322C101.066 304.851 101.142 291.381 101.236 277.911C101.281 271.397 101.32 264.883 101.347 258.369C101.373 252.086 101.413 245.803 101.463 239.52C101.48 237.12 101.492 234.719 101.498 232.318C101.507 228.964 101.535 225.609 101.568 222.255C101.566 221.256 101.565 220.256 101.563 219.227C101.576 218.314 101.588 217.401 101.601 216.461C101.606 215.667 101.611 214.874 101.615 214.056C102.104 211.447 102.856 210.538 105 209C108.563 209.063 108.563 209.063 112 210C113.989 212.914 114.246 215.32 114.231 218.793C114.233 219.755 114.234 220.716 114.235 221.707C114.226 222.755 114.217 223.804 114.208 224.884C114.206 226.548 114.206 226.548 114.204 228.246C114.201 230.656 114.194 233.066 114.183 235.476C114.168 239.293 114.17 243.109 114.176 246.926C114.195 257.778 114.202 268.631 114.155 279.483C114.126 286.121 114.133 292.758 114.162 299.396C114.166 301.924 114.157 304.451 114.136 306.979C114.107 310.52 114.121 314.058 114.145 317.599C114.126 318.639 114.107 319.679 114.088 320.751C114.191 327.378 115.553 330.712 120.329 335.359C126.098 341.023 127.74 350.367 128.063 358.133C127.8 370.199 122.609 381.155 114.25 389.813C113.838 390.204 113.425 390.596 113 391C113.678 391.329 114.356 391.657 115.055 391.996C125.138 397.149 132.786 403.792 139.43 412.957C141.128 415.166 142.995 417.069 145 419C145.601 417.966 145.601 417.966 146.215 416.91C153.729 404.49 162.37 397.594 175 391C174.625 390.576 174.25 390.152 173.863 389.715C164.668 379.176 160.038 370.374 160 356C160.754 345.239 165.894 334.98 173.781 327.684C177.56 324.816 181.675 322.898 186 321C187.336 320.338 188.669 319.672 190 319C190.003 318.407 190.005 317.814 190.007 317.202C190.067 302.763 190.142 288.324 190.236 273.886C190.281 266.903 190.32 259.92 190.347 252.938C190.372 246.201 190.413 239.464 190.463 232.728C190.48 230.155 190.492 227.583 190.498 225.011C190.507 221.413 190.535 217.815 190.568 214.216C190.566 212.616 190.566 212.616 190.563 210.984C190.685 201.442 190.685 201.442 194 198C196.116 197.448 196.116 197.448 198.588 197.547C199.517 197.569 200.445 197.592 201.402 197.615C202.405 197.659 203.408 197.704 204.442 197.75C206.574 197.782 208.706 197.812 210.838 197.84C214.195 197.91 217.548 197.999 220.903 198.133C234.023 199.269 234.023 199.269 245.511 194.355C248.207 191.186 250.064 187.67 252 184C253.191 182.388 254.417 180.8 255.688 179.25C256.236 178.546 256.785 177.842 257.35 177.116C258.167 176.069 258.167 176.069 259 175C264.693 167.686 270.378 160.368 276 153C276.557 152.294 277.114 151.587 277.688 150.859C280.423 147.285 282 144.556 282 140C280.409 134.875 278.659 131.753 274 129C267.465 127.218 263.545 128.647 258.613 133.207ZM204 255C204 259.95 204 264.9 204 270C281.22 270 358.44 270 438 270C438 265.05 438 260.1 438 255C360.78 255 283.56 255 204 255ZM67.0001 342C61.8773 349.178 61.0843 356.364 62.0001 365C64.6877 373.879 70.4521 379.236 78.1876 383.938C85.6791 386.025 93.1938 386.245 100.375 383C107.008 379.171 112.243 373.59 114.563 366.195C116.195 358.005 115.268 351.174 111 344C107.081 338.178 101.715 334.466 95.0157 332.383C83.9933 330.289 74.5416 333.753 67.0001 342ZM178 343C173.728 349.265 172.223 356.071 173.406 363.578C175.33 371.043 178.967 376.599 185 381.375C192.415 385.391 200.043 386.271 208.344 384.5C216.315 381.802 221.243 376.33 225 369C227.749 362.378 227.459 355.544 225.281 348.762C222.137 341.783 217.174 336.688 210.188 333.563C197.943 329.283 185.943 332.669 178 343ZM290 343C285.981 348.784 284.6 354.99 285 362C286.974 370.73 290.535 376.883 298.063 381.813C304.31 385.635 310.823 385.65 318 385C324.609 383.155 330.62 379.619 334.442 373.809C338.533 366.359 340.031 359.356 338.125 351C335.689 344.011 330.822 338.354 324.539 334.484C311.877 328.813 298.49 331.981 290 343ZM402.695 341.656C398.427 347.557 396.057 354.728 397 362C398.86 370.441 402.835 377.221 410.188 381.938C416.563 385.647 422.764 385.605 430 385C436.614 383.202 442.629 379.605 446.442 373.809C450.533 366.359 452.031 359.356 450.125 351C447.689 344.011 442.822 338.354 436.539 334.484C424.283 328.994 411.752 331.829 402.695 341.656ZM273.215 417.938C260.007 434.152 263 452.484 263 473C295.34 473 327.68 473 361 473C361.872 439.854 361.872 439.854 346.449 413.324C336.13 403.532 324.009 398.593 309.774 398.785C294.627 399.959 283.321 406.969 273.215 417.938ZM385.215 417.938C372.007 434.152 375 452.484 375 473C407.34 473 439.68 473 473 473C473.872 439.854 473.872 439.854 458.449 413.324C448.13 403.532 436.009 398.593 421.774 398.785C406.627 399.959 395.321 406.969 385.215 417.938ZM51.6603 415.957C36.8655 434.163 39.0001 448.479 39.0001 473C71.3401 473 103.68 473 137 473C137.791 440.512 137.791 440.512 122.688 414.188C118.572 410.356 113.986 407.563 109 405C108.202 404.584 107.404 404.167 106.582 403.738C88.3519 395.683 65.0282 401.641 51.6603 415.957ZM161 419C148.739 436.21 151 450.931 151 473C183.34 473 215.68 473 249 473C249.791 440.512 249.791 440.512 234.688 414.188C230.572 410.356 225.986 407.563 221 405C220.202 404.584 219.404 404.167 218.582 403.738C198.727 394.965 174.421 402.751 161 419Z"
                    fill={
                      selectedAudience === "classroom" ? "#0388ff" : "#62748E"
                    }
                  />
                </svg>

                <span
                  className={`text-xs font-bold mt-2 ${
                    selectedAudience === "classroom"
                      ? "text-main font-bold"
                      : "text-slate-500"
                  }`}
                >
                  Classroom
                </span>
              </button>
              <div className="w-full col-span-1 py-4 px-5 flex flex-col justify-center items-center rounded-lg border border-slate-300 opacity-50 cursor-not-allowed">
                <svg
                  width="512"
                  height="512"
                  viewBox="0 0 512 512"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-auto"
                >
                  <path
                    d="M20.1022 7.49655C21.3432 7.48783 21.3432 7.48783 22.6093 7.47894C25.3999 7.46426 28.1897 7.47826 30.9804 7.49198C32.9939 7.48738 35.0074 7.48103 37.0209 7.47308C42.5682 7.45632 48.1152 7.46466 53.6625 7.47702C59.6394 7.48604 65.6163 7.47212 71.5931 7.4611C82.6299 7.44431 93.6665 7.44581 104.703 7.45675C114.898 7.4668 125.093 7.46944 135.288 7.46466C135.964 7.46435 136.64 7.46405 137.336 7.46373C140.079 7.46249 142.821 7.46121 145.564 7.45989C171.304 7.44765 197.044 7.45876 222.784 7.48028C245.663 7.49926 268.542 7.49756 291.422 7.47843C317.114 7.45703 342.806 7.44852 368.498 7.46088C371.236 7.46217 373.974 7.46342 376.711 7.46466C377.385 7.46497 378.06 7.46529 378.754 7.46561C388.944 7.47017 399.134 7.46484 409.324 7.45474C420.907 7.44332 432.491 7.44651 444.075 7.46786C449.989 7.4784 455.903 7.48244 461.818 7.46926C467.226 7.45739 472.634 7.46381 478.042 7.48517C480.005 7.48966 481.967 7.48732 483.929 7.47767C486.586 7.4656 489.241 7.47789 491.898 7.49655C492.669 7.48719 493.44 7.47783 494.235 7.46818C497.648 7.5165 499.656 7.75688 502.475 9.75144C504.183 12.2692 504.501 13.4685 504.503 16.479C504.514 17.3762 504.524 18.2735 504.535 19.1979C504.526 20.1796 504.517 21.1613 504.508 22.1728C504.517 23.7417 504.517 23.7417 504.527 25.3424C504.543 28.8587 504.53 32.3743 504.517 35.8905C504.523 38.4068 504.53 40.923 504.539 43.4393C504.555 49.571 504.553 55.7024 504.541 61.8341C504.532 66.8169 504.531 71.7995 504.535 76.7823C504.536 77.4911 504.536 78.1999 504.537 78.9301C504.538 80.37 504.54 81.8098 504.541 83.2497C504.552 96.7554 504.539 110.261 504.518 123.767C504.5 135.359 504.503 146.951 504.521 158.543C504.543 172 504.551 185.457 504.539 198.914C504.538 200.348 504.536 201.783 504.535 203.218C504.534 204.276 504.534 204.276 504.533 205.357C504.53 210.334 504.536 215.312 504.545 220.289C504.557 226.987 504.549 233.684 504.525 240.382C504.52 242.844 504.522 245.307 504.531 247.769C504.541 251.122 504.528 254.474 504.508 257.827C504.521 259.3 504.521 259.3 504.535 260.802C504.459 267.291 504.459 267.291 502.311 270.606C499.486 272.31 497.801 272.493 494.508 272.481C492.833 272.489 492.833 272.489 491.125 272.498C489.905 272.483 488.685 272.469 487.429 272.454C486.141 272.455 484.852 272.455 483.525 272.456C479.997 272.457 476.468 272.433 472.94 272.405C469.251 272.38 465.562 272.378 461.873 272.373C454.889 272.361 447.905 272.328 440.921 272.288C431.483 272.235 422.044 272.213 412.606 272.19C397.737 272.152 382.869 272.073 368 272C368 293.12 368 314.24 368 336C362.72 336 357.44 336 352 336C352 299.04 352 262.08 352 224C288.64 224 225.28 224 160 224C160 260.96 160 297.92 160 336C154.72 336 149.44 336 144 336C144 314.88 144 293.76 144 272C129.776 272.07 129.776 272.07 115.266 272.141C109.268 272.161 103.271 272.18 97.2733 272.195C87.7482 272.219 78.2232 272.247 68.6981 272.302C61.7616 272.342 54.8252 272.367 47.8886 272.376C44.2151 272.381 40.542 272.394 36.8687 272.423C32.7694 272.455 28.6706 272.456 24.5712 272.454C22.7413 272.476 22.7413 272.476 20.8745 272.498C19.7583 272.492 18.6421 272.487 17.4921 272.481C16.5224 272.485 15.5527 272.488 14.5536 272.492C11.9999 272 11.9999 272 9.68837 270.606C7.04393 266.525 7.44865 262.591 7.49195 257.827C7.48571 256.781 7.47947 255.735 7.47304 254.657C7.45705 251.141 7.46974 247.626 7.48231 244.109C7.47689 241.593 7.46977 239.077 7.46107 236.561C7.4447 230.429 7.44713 224.297 7.45872 218.166C7.46775 213.183 7.46898 208.2 7.46462 203.218C7.46401 202.509 7.4634 201.8 7.46277 201.07C7.46149 199.63 7.46019 198.19 7.45888 196.75C7.44747 183.244 7.46059 169.739 7.48208 156.233C7.49995 144.641 7.49685 133.049 7.4784 121.457C7.457 108 7.44857 94.543 7.46085 81.086C7.46213 79.6514 7.46338 78.2169 7.46462 76.7823C7.46524 76.0764 7.46586 75.3705 7.46649 74.6433C7.46995 69.6657 7.46411 64.6883 7.45471 59.7107C7.44233 53.013 7.45112 46.3156 7.47428 39.6179C7.47959 37.1556 7.47803 34.6933 7.46923 32.231C7.45835 28.8779 7.47195 25.5258 7.49195 22.1728C7.48303 21.1911 7.47411 20.2094 7.46491 19.1979C7.47535 18.3007 7.48578 17.4034 7.49652 16.479C7.49717 15.705 7.49782 14.931 7.49849 14.1336C9.05587 7.50624 14.2807 7.42587 20.1022 7.49655ZM23.9999 23.9999C23.9999 29.2799 23.9999 34.5599 23.9999 39.9999C84.7199 39.9999 145.44 39.9999 208 39.9999C208 45.2799 208 50.5599 208 55.9999C147.28 55.9999 86.5599 55.9999 23.9999 55.9999C23.9999 122 23.9999 188 23.9999 256C63.5999 256 103.2 256 144 256C144.33 241.48 144.66 226.96 145 212C148.517 208.483 150.196 208.453 155 208C154.867 207.461 154.734 206.922 154.598 206.367C153.53 201.396 152.945 196.666 152.961 191.582C152.951 190.131 152.951 190.131 152.941 188.651C152.939 186.698 152.972 184.745 153.045 182.794C153.027 179.942 152.908 177.708 152 175C149.864 172.939 147.782 171.593 145.174 170.187C140.619 167.7 138.589 163.759 137 159C136.195 151.164 135.896 143.398 141 137C146.54 131.267 151.459 128.678 159.406 128.035C165.855 127.948 170.948 129.959 176 134C181.38 139.41 183.291 144.216 183.375 151.812C183.249 158.898 182.281 163.605 177.316 168.742C174.394 171.369 171.563 173.328 168 175C167.46 186.288 168.542 196.209 172 207C172.984 208.205 172.984 208.205 174.858 208.113C175.648 208.108 176.439 208.103 177.254 208.098C178.535 208.093 178.535 208.093 179.842 208.088C180.74 208.079 181.637 208.071 182.562 208.062C183.464 208.058 184.366 208.053 185.295 208.049C187.53 208.037 189.765 208.02 192 208C192.004 207.41 192.007 206.821 192.011 206.214C192.053 200.032 192.123 193.851 192.207 187.669C192.235 185.368 192.257 183.066 192.271 180.765C192.293 177.44 192.339 174.117 192.391 170.793C192.392 169.778 192.393 168.763 192.394 167.717C192.619 156.546 196.075 147.016 204 139C209.794 134.069 215.627 130.87 223 129C222.035 126.545 221.058 124.123 219.93 121.738C215.56 111.688 215.168 99.3838 218.562 88.9374C223.22 78.3399 231.317 70.5661 242 66.0624C252.718 63.011 266.231 63.6116 276 68.9999C284.571 74.2199 291.767 82.3908 294.562 92.1913C296.24 102.964 296.036 113.196 291 123C290.313 124.993 289.635 126.99 289 129C289.69 129.207 290.379 129.415 291.09 129.629C302.36 133.324 310.343 139.418 316 150C318.935 156.861 319.465 163.196 319.512 170.598C319.539 172.21 319.539 172.21 319.566 173.855C319.62 177.257 319.654 180.66 319.687 184.062C319.721 186.382 319.755 188.702 319.791 191.021C319.875 196.681 319.942 202.34 320 208C326.27 208 332.54 208 339 208C340.485 203.545 340.485 203.545 342 199C342.392 197.824 342.784 196.649 343.187 195.437C344.705 188.729 345.207 181.77 344 175C341.432 171.992 338.517 170.689 335 169C329.051 162.746 328.542 156.827 328.691 148.449C329.28 141.874 331.649 137.985 336.5 133.625C341.973 129.172 347.018 128.095 354 128C360.885 128.764 366.2 131.778 370.75 136.937C375.833 143.856 375.748 150.641 375 159C373.346 165.287 369.259 169.379 364 173C362.672 173.677 361.339 174.345 360 175C359.98 175.609 359.96 176.218 359.94 176.845C359.175 199.172 359.175 199.172 357 208C357.638 208.121 358.276 208.242 358.933 208.367C360.173 208.618 360.173 208.618 361.437 208.875C362.261 209.037 363.085 209.2 363.933 209.367C364.615 209.576 365.297 209.785 366 210C372.864 223.727 367.651 240.656 368 256C407.6 256 447.2 256 488 256C488 190 488 124 488 55.9999C427.28 55.9999 366.56 55.9999 304 55.9999C304 50.7199 304 45.4399 304 39.9999C364.72 39.9999 425.44 39.9999 488 39.9999C488 34.7199 488 29.4399 488 23.9999C334.88 23.9999 181.76 23.9999 23.9999 23.9999ZM236.445 90.9023C232.32 96.8892 232.284 102.949 233 110C234.773 116.645 239.447 121.174 245 125C250.999 127.941 257.883 128.099 264.312 126.383C270.441 123.677 275.239 118.591 278.172 112.609C280.078 106.603 280.064 99.497 277.5 93.6874C274.015 87.7474 268.565 83.0836 262 80.9999C250.565 79.6436 243.822 82.2735 236.445 90.9023ZM213.75 153.437C202.199 167.612 208 193.925 208 208C239.68 208 271.36 208 304 208C306.782 180.658 306.782 180.658 298 153C289.412 144.473 280.917 143.845 269.23 143.832C268.195 143.829 267.159 143.825 266.092 143.822C263.906 143.817 261.72 143.814 259.534 143.815C256.209 143.812 252.885 143.794 249.56 143.775C247.43 143.772 245.299 143.77 243.168 143.769C242.183 143.762 241.199 143.755 240.184 143.748C229.451 143.783 221.221 145.157 213.75 153.437ZM154.625 146.625C152.513 149.712 152.388 151.328 153 155C154.5 157.5 154.5 157.5 157 159C160.672 159.612 162.288 159.487 165.375 157.375C167.487 154.288 167.612 152.672 167 149C165.5 146.5 165.5 146.5 163 145C159.328 144.388 157.712 144.513 154.625 146.625ZM346.625 146.625C344.513 149.712 344.388 151.328 345 155C346.5 157.5 346.5 157.5 349 159C352.672 159.612 354.288 159.487 357.375 157.375C359.487 154.288 359.612 152.672 359 149C357.5 146.5 357.5 146.5 355 145C351.328 144.388 349.712 144.513 346.625 146.625Z"
                    fill="#62748E"
                  />
                  <path
                    d="M80.7618 354.543C90.0572 360.594 97.0568 368.204 100 379C100.213 381.818 100.334 384.499 100.313 387.313C100.307 388.439 100.307 388.439 100.302 389.589C100.153 397.206 98.7608 402.959 94.0001 409C94.6408 409.364 95.2815 409.727 95.9415 410.102C101.465 413.312 106.376 416.577 111 421C111 421.66 111 422.32 111 423C111.66 423 112.32 423 113 423C113.254 422.402 113.508 421.804 113.77 421.188C117.009 415.429 124.35 412.06 130 409C129.381 408.134 128.763 407.268 128.125 406.375C122.499 397.439 122.639 386.126 124.582 375.953C127.703 367.004 134.935 359.706 142.981 354.938C152.228 350.645 164.792 350.052 174.5 353.438C183.948 358.055 191.179 366.061 195.106 375.719C196.169 379.619 196.343 383.301 196.313 387.313C196.309 388.064 196.306 388.815 196.302 389.589C196.153 397.206 194.761 402.959 190 409C190.641 409.364 191.281 409.727 191.942 410.102C197.465 413.312 202.376 416.577 207 421C207 421.66 207 422.32 207 423C207.66 423 208.32 423 209 423C209.254 422.402 209.508 421.804 209.77 421.188C213.009 415.429 220.35 412.06 226 409C225.381 408.134 224.763 407.268 224.125 406.375C218.499 397.439 218.639 386.126 220.582 375.953C223.703 367.004 230.935 359.706 238.981 354.938C248.228 350.645 260.792 350.052 270.5 353.438C279.948 358.055 287.179 366.061 291.106 375.719C292.169 379.619 292.343 383.301 292.313 387.313C292.309 388.064 292.306 388.815 292.302 389.589C292.153 397.206 290.761 402.959 286 409C286.641 409.364 287.281 409.727 287.942 410.102C293.465 413.312 298.376 416.577 303 421C303 421.66 303 422.32 303 423C303.66 423 304.32 423 305 423C305.254 422.402 305.508 421.804 305.77 421.188C309.009 415.429 316.35 412.06 322 409C321.381 408.134 320.763 407.268 320.125 406.375C314.499 397.439 314.639 386.126 316.582 375.953C319.703 367.004 326.935 359.706 334.981 354.938C344.228 350.645 356.792 350.052 366.5 353.438C375.948 358.055 383.179 366.061 387.106 375.719C388.169 379.619 388.343 383.301 388.313 387.313C388.309 388.064 388.306 388.815 388.302 389.589C388.153 397.206 386.761 402.959 382 409C382.641 409.364 383.281 409.727 383.942 410.102C389.465 413.312 394.376 416.577 399 421C399 421.66 399 422.32 399 423C399.66 423 400.32 423 401 423C401.254 422.402 401.508 421.804 401.77 421.188C405.009 415.429 412.35 412.06 418 409C417.381 408.134 416.763 407.268 416.125 406.375C410.499 397.439 410.639 386.126 412.582 375.953C415.703 367.004 422.935 359.706 430.981 354.938C440.228 350.645 452.792 350.052 462.5 353.438C471.948 358.055 479.179 366.061 483.106 375.719C484.169 379.619 484.343 383.301 484.313 387.313C484.309 388.064 484.306 388.815 484.302 389.589C484.153 397.206 482.761 402.959 478 409C478.641 409.364 479.281 409.727 479.942 410.102C491.132 416.606 499.233 423.58 503.351 436.219C504.646 441.767 504.447 447.412 504.434 453.082C504.438 454.427 504.444 455.772 504.45 457.118C504.458 459.919 504.456 462.72 504.446 465.521C504.435 469.107 504.455 472.692 504.484 476.278C504.502 479.048 504.502 481.818 504.496 484.588C504.496 486.551 504.513 488.514 504.53 490.477C504.521 491.669 504.511 492.861 504.502 494.089C504.502 495.661 504.502 495.661 504.501 497.264C503.844 500.852 502.911 501.812 500 504C497.169 504.392 494.728 504.538 491.898 504.503C491.07 504.509 490.243 504.515 489.391 504.521C486.6 504.536 483.81 504.522 481.02 504.508C479.006 504.513 476.993 504.519 474.979 504.527C469.432 504.544 463.885 504.535 458.338 504.523C452.361 504.514 446.384 504.528 440.407 504.539C429.37 504.556 418.333 504.554 407.297 504.543C397.102 504.533 386.907 504.531 376.712 504.535C376.036 504.536 375.36 504.536 374.664 504.536C371.921 504.537 369.179 504.539 366.436 504.54C340.696 504.552 314.956 504.541 289.216 504.52C266.337 504.501 243.458 504.502 220.578 504.522C194.886 504.543 169.194 504.551 143.502 504.539C140.764 504.538 138.026 504.537 135.289 504.535C134.615 504.535 133.94 504.535 133.246 504.534C123.056 504.53 112.866 504.535 102.676 504.545C91.0926 504.557 79.509 504.553 67.9252 504.532C62.0109 504.522 56.0967 504.518 50.1823 504.531C44.774 504.543 39.366 504.536 33.9577 504.515C31.9954 504.51 30.0331 504.513 28.0709 504.522C25.4143 504.534 22.7589 504.522 20.1024 504.503C18.9455 504.517 18.9455 504.517 17.7652 504.532C14.2768 504.482 12.3504 504.264 9.52547 502.139C7.52177 499.329 7.49304 497.557 7.48254 494.121C7.46994 492.935 7.45733 491.75 7.44434 490.529C7.45243 489.249 7.46053 487.97 7.46887 486.652C7.46617 485.317 7.46229 483.981 7.45728 482.646C7.45138 479.844 7.45993 477.042 7.47864 474.241C7.50127 470.679 7.4884 467.118 7.46435 463.556C7.44976 460.795 7.45456 458.033 7.46486 455.271C7.46877 453.329 7.45677 451.386 7.44434 449.444C7.57051 437.361 10.5255 427.819 19.0001 419C23.5782 414.963 28.6487 411.899 34.0001 409C33.3814 408.134 32.7626 407.268 32.1251 406.375C26.4989 397.439 26.6389 386.126 28.5822 375.953C31.7029 367.004 38.9346 359.706 46.9806 354.938C56.7732 350.392 70.8992 349.722 80.7618 354.543ZM47.0001 377.563C44.0941 382.819 43.9277 388.17 45.0001 394C47.2089 399.234 50.6722 403.909 55.8868 406.406C62.1064 408.154 68.7197 408.195 74.4376 405C79.379 401.297 82.4158 397.274 83.5118 391.133C83.8874 384.573 82.8218 380.048 78.754 374.848C74.2591 370.112 70.6229 368.768 64.0626 368.438C56.4109 368.734 51.5741 371.46 47.0001 377.563ZM143 377.563C140.094 382.819 139.928 388.17 141 394C143.209 399.234 146.672 403.909 151.887 406.406C158.106 408.154 164.72 408.195 170.438 405C175.379 401.297 178.416 397.274 179.512 391.133C179.887 384.573 178.822 380.048 174.754 374.848C170.259 370.112 166.623 368.768 160.063 368.438C152.411 368.734 147.574 371.46 143 377.563ZM239 377.563C236.094 382.819 235.928 388.17 237 394C239.209 399.234 242.672 403.909 247.887 406.406C254.106 408.154 260.72 408.195 266.438 405C271.379 401.297 274.416 397.274 275.512 391.133C275.887 384.573 274.822 380.048 270.754 374.848C266.259 370.112 262.623 368.768 256.063 368.438C248.411 368.734 243.574 371.46 239 377.563ZM335 377.563C332.094 382.819 331.928 388.17 333 394C335.209 399.234 338.672 403.909 343.887 406.406C350.106 408.154 356.72 408.195 362.438 405C367.379 401.297 370.416 397.274 371.512 391.133C371.887 384.573 370.822 380.048 366.754 374.848C362.259 370.112 358.623 368.768 352.063 368.438C344.411 368.734 339.574 371.46 335 377.563ZM431 377.563C428.094 382.819 427.928 388.17 429 394C431.209 399.234 434.672 403.909 439.887 406.406C446.106 408.154 452.72 408.195 458.438 405C463.379 401.297 466.416 397.274 467.512 391.133C467.887 384.573 466.822 380.048 462.754 374.848C458.259 370.112 454.623 368.768 448.063 368.438C440.411 368.734 435.574 371.46 431 377.563ZM31.3712 431.641C17.8221 446.659 24.0001 469.509 24.0001 488C50.4001 488 76.8001 488 104 488C106.782 460.658 106.782 460.658 98.0001 433C88.6832 423.75 78.9591 423.813 66.37 423.815C64.2042 423.813 62.0389 423.794 59.8732 423.775C44.3106 423.676 44.3106 423.676 31.3712 431.641ZM127.371 431.641C113.822 446.659 120 469.509 120 488C146.4 488 172.8 488 200 488C202.782 460.658 202.782 460.658 194 433C184.683 423.75 174.959 423.813 162.37 423.815C160.204 423.813 158.039 423.794 155.873 423.775C140.311 423.676 140.311 423.676 127.371 431.641ZM223.371 431.641C209.822 446.659 216 469.509 216 488C242.4 488 268.8 488 296 488C298.782 460.658 298.782 460.658 290 433C280.683 423.75 270.959 423.813 258.37 423.815C256.204 423.813 254.039 423.794 251.873 423.775C236.311 423.676 236.311 423.676 223.371 431.641ZM319.371 431.641C305.822 446.659 312 469.509 312 488C338.4 488 364.8 488 392 488C394.782 460.658 394.782 460.658 386 433C376.683 423.75 366.959 423.813 354.37 423.815C352.204 423.813 350.039 423.794 347.873 423.775C332.311 423.676 332.311 423.676 319.371 431.641ZM415.371 431.641C401.822 446.659 408 469.509 408 488C434.4 488 460.8 488 488 488C490.782 460.658 490.782 460.658 482 433C472.683 423.75 462.959 423.813 450.37 423.815C448.204 423.813 446.039 423.794 443.873 423.775C428.311 423.676 428.311 423.676 415.371 431.641Z"
                    fill="#62748E"
                  />
                </svg>

                <span className="text-xs font-bold text-slate-500 mt-2">
                  Conference
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Coming Soon
                </span>
              </div>
              <div className="w-full col-span-1 py-4 px-5 flex flex-col justify-center items-center rounded-lg border border-slate-300 opacity-50 cursor-not-allowed">
                <svg
                  width="512"
                  height="512"
                  viewBox="0 0 512 512"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-auto"
                >
                  <g clipPath="url(#clip0_403_26)">
                    <path
                      d="M154.103 39.4967C155.363 39.4863 156.622 39.4758 157.92 39.4651C159.32 39.4737 160.721 39.4828 162.121 39.4921C163.607 39.4875 165.092 39.4812 166.578 39.4732C170.666 39.4565 174.753 39.4648 178.841 39.4772C183.248 39.4862 187.654 39.4723 192.06 39.4612C200.694 39.4434 209.329 39.4473 217.963 39.4589C224.978 39.4679 231.994 39.4692 239.009 39.4648C240.007 39.4642 241.004 39.4636 242.032 39.4629C244.058 39.4617 246.084 39.4604 248.11 39.4591C267.121 39.4476 286.132 39.4608 305.143 39.4823C321.465 39.5001 337.787 39.497 354.109 39.4786C373.051 39.4572 391.993 39.4487 410.935 39.461C412.953 39.4623 414.972 39.4636 416.991 39.4648C418.481 39.4657 418.481 39.4657 420.001 39.4667C427.01 39.4701 434.02 39.4643 441.029 39.4549C449.568 39.4437 458.106 39.4467 466.645 39.468C471.004 39.4785 475.363 39.4826 479.722 39.4694C483.709 39.4575 487.696 39.464 491.683 39.4853C493.129 39.4898 494.574 39.4875 496.02 39.4778C497.979 39.4657 499.938 39.4805 501.897 39.4967C503.532 39.4977 503.532 39.4977 505.2 39.4987C508.718 40.1286 509.897 41.1441 512 44.0001C512.501 46.0824 512.501 46.0824 512.503 48.3542C512.514 49.2236 512.524 50.0929 512.535 50.9887C512.526 51.9392 512.517 52.8898 512.508 53.8692C512.517 55.3892 512.517 55.3892 512.527 56.9399C512.543 60.3456 512.53 63.7506 512.518 67.1563C512.523 69.5937 512.53 72.0312 512.539 74.4686C512.555 80.4078 512.553 86.3468 512.541 92.2859C512.532 97.1123 512.531 101.939 512.535 106.765C512.536 107.452 512.537 108.138 512.537 108.846C512.538 110.24 512.54 111.635 512.541 113.03C512.553 126.112 512.539 139.194 512.518 152.277C512.5 163.505 512.503 174.733 512.522 185.961C512.543 198.996 512.551 212.031 512.539 225.066C512.538 226.456 512.537 227.846 512.535 229.235C512.534 230.261 512.534 230.261 512.533 231.307C512.53 236.128 512.536 240.95 512.545 245.771C512.558 252.258 512.549 258.746 512.526 265.233C512.52 267.618 512.522 270.003 512.531 272.388C512.542 275.636 512.528 278.883 512.508 282.131C512.521 283.557 512.521 283.557 512.535 285.011C512.491 288.689 512.365 291.29 510.672 294.587C506.217 296.943 501.696 296.534 496.737 296.481C494.993 296.486 494.993 296.486 493.213 296.491C489.983 296.497 486.755 296.484 483.526 296.464C480.044 296.447 476.562 296.453 473.08 296.456C467.047 296.458 461.014 296.445 454.982 296.423C446.259 296.39 437.537 296.38 428.814 296.375C414.663 296.366 400.512 296.34 386.36 296.302C372.613 296.265 358.866 296.237 345.118 296.22C344.271 296.219 343.424 296.218 342.551 296.217C338.3 296.211 334.05 296.206 329.8 296.201C294.533 296.16 259.267 296.089 224 296C224 290.72 224 285.44 224 280C313.76 280 403.52 280 496 280C496 206.08 496 132.16 496 56.0001C385.12 56.0001 274.24 56.0001 160 56.0001C160 63.9201 160 71.8401 160 80.0001C154.72 80.0001 149.44 80.0001 144 80.0001C143.908 74.9454 143.829 69.8937 143.78 64.8389C143.76 63.1201 143.733 61.4013 143.698 59.6827C143.65 57.2102 143.627 54.7386 143.609 52.2657C143.589 51.4989 143.568 50.7321 143.547 49.942C143.545 46.6166 143.624 44.5026 145.647 41.7966C148.661 39.4956 150.334 39.4989 154.103 39.4967Z"
                      fill="#62748E"
                    />
                    <path
                      d="M281 131C285.933 133.354 290.52 135.864 295 139C294.386 141.951 293.463 144.17 291.883 146.73C291.228 147.797 291.228 147.797 290.561 148.886C290.087 149.645 289.613 150.405 289.125 151.188C288.631 151.987 288.137 152.787 287.628 153.61C283.487 160.284 279.231 166.88 274.945 173.461C265.585 187.849 256.408 202.369 247.314 216.927C246.406 218.36 245.475 219.778 244.527 221.184C243.829 222.236 243.829 222.236 243.117 223.309C242.694 223.93 242.271 224.552 241.835 225.193C240.591 227.885 241.445 229.969 242.359 232.676C244.547 240.615 243.561 248.341 239.875 255.586C234.311 262.749 226.65 267.349 219 272C216.882 273.304 214.765 274.609 212.648 275.914C211.561 276.581 210.474 277.248 209.354 277.935C205.948 280.032 202.553 282.148 199.164 284.273C197.52 285.304 197.52 285.304 195.844 286.355C194.781 287.022 193.719 287.688 192.625 288.375C190.618 289.634 188.61 290.892 186.601 292.148C185.759 292.676 184.917 293.204 184.049 293.748C180.047 296.194 176.636 297.044 172 296C168.309 293.749 165.213 290.878 162 288C160.413 286.644 158.817 285.301 157.22 283.958C155.565 282.565 153.917 281.164 152.269 279.762C148.24 276.345 144.147 273.01 140.047 269.68C138 268 138 268 137 267C136.67 271.29 136.34 275.58 136 280C130.72 280 125.44 280 120 280C119.908 274.945 119.828 269.894 119.78 264.839C119.76 263.12 119.733 261.401 119.698 259.683C119.649 257.21 119.627 254.739 119.609 252.266C119.588 251.499 119.568 250.732 119.547 249.942C119.545 246.436 119.707 244.402 121.798 241.53C124.425 239.705 126.545 239.188 129.746 239.371C134.695 240.752 138.254 244.646 142 248C143.585 249.355 145.181 250.698 146.777 252.041C148.444 253.444 150.105 254.854 151.765 256.266C159.712 263.003 167.849 269.511 176 276C181.147 274.232 185.62 271.369 190.25 268.562C191.565 267.77 191.565 267.77 192.906 266.961C200.819 262.164 208.587 257.158 216.321 252.079C217.82 251.116 219.351 250.204 220.886 249.301C223.443 247.727 224.196 246.893 225 244C224.925 239.815 224.609 237.716 221.875 234.5C218.908 232.952 217.455 232.728 214.203 233.283C207.965 235.314 202.396 239.583 196.892 243.072C186.579 249.379 186.579 249.379 180 248C177.328 245.852 177.328 245.852 175 243C174.149 242.1 173.298 241.2 172.422 240.273C167.141 234.546 162.077 228.729 157.187 222.66C154.274 219.118 151.213 215.726 148.113 212.348C146.781 210.868 145.481 209.358 144.23 207.809C136.814 198.655 127.717 194.61 116.129 193.208C112.897 192.892 109.688 192.864 106.441 192.855C105.733 192.851 105.024 192.848 104.295 192.845C101.979 192.835 99.6631 192.833 97.3474 192.832C95.7213 192.829 94.0952 192.825 92.4691 192.822C89.0709 192.816 85.6727 192.814 82.2744 192.815C77.9394 192.815 73.6046 192.801 69.2697 192.784C65.9143 192.773 62.559 192.771 59.2036 192.771C57.6062 192.77 56.0087 192.766 54.4113 192.758C38.8364 192.558 38.8364 192.558 24.9998 199C24.3398 199 23.6798 199 22.9998 199C18.1272 208.37 16.8505 216.085 16.8386 226.484C16.8337 227.527 16.8287 228.57 16.8236 229.645C16.809 233.085 16.8022 236.525 16.7966 239.965C16.7909 242.361 16.7851 244.757 16.7794 247.153C16.7689 252.172 16.763 257.191 16.7595 262.211C16.754 268.638 16.73 275.065 16.7015 281.492C16.6829 286.439 16.6777 291.386 16.6762 296.334C16.6732 298.703 16.6651 301.073 16.652 303.442C16.6349 306.757 16.6368 310.072 16.6433 313.386C16.6341 314.362 16.6249 315.337 16.6154 316.342C16.6547 322.761 17.314 327.916 21.6873 332.938C25.1213 334.515 28.336 334.648 31.9998 334C35.3088 332.13 36.6508 330.837 38.1126 327.33C39.1021 323.616 39.3066 320.156 39.3186 316.342C39.3337 315.229 39.3337 315.229 39.349 314.093C39.3798 311.659 39.3969 309.224 39.4138 306.789C39.4325 305.094 39.4521 303.398 39.4725 301.703C39.5237 297.254 39.5634 292.806 39.6006 288.357C39.6408 283.812 39.6918 279.268 39.7419 274.723C39.8386 265.815 39.922 256.908 39.9998 248C45.2798 248 50.5598 248 55.9998 248C55.9998 284.96 55.9998 321.92 55.9998 360C50.7198 360 45.4398 360 39.9998 360C39.5048 355.545 39.5048 355.545 38.9998 351C38.0098 351.33 37.0198 351.66 35.9998 352C26.5 352.755 17.9191 353.049 9.99976 347C4.68799 342.173 0.510394 336.706 -0.282623 329.398C-0.397195 326.23 -0.416964 323.075 -0.404297 319.905C-0.41116 318.703 -0.418008 317.5 -0.425079 316.261C-0.4402 312.978 -0.441873 309.695 -0.436157 306.411C-0.433055 303.661 -0.439164 300.91 -0.44519 298.16C-0.459216 291.663 -0.457693 285.167 -0.446289 278.67C-0.434826 271.993 -0.448849 265.316 -0.475677 258.639C-0.497918 252.886 -0.504448 247.133 -0.498596 241.379C-0.495243 237.952 -0.497543 234.526 -0.514862 231.099C-0.529817 227.27 -0.519057 223.441 -0.501953 219.612C-0.511621 218.494 -0.521289 217.376 -0.53125 216.224C-0.42375 204.672 2.98091 195.4 10.9998 187C23.1328 175.417 36.2567 175.384 52.1091 175.434C54.165 175.428 56.2208 175.422 58.2767 175.415C62.5735 175.404 66.87 175.409 71.1667 175.424C76.6347 175.441 82.1016 175.417 87.5695 175.382C91.813 175.36 96.0563 175.362 100.3 175.37C102.314 175.371 104.328 175.364 106.342 175.349C123.079 175.245 136.563 177.08 150 188C150.829 188.626 151.657 189.253 152.511 189.898C155.118 192.1 157.083 194.381 159.187 197.062C162.341 201.001 165.579 204.792 169 208.5C173.253 213.118 177.256 217.892 181.187 222.785C182.961 225.028 182.961 225.028 185 227C189.851 226.78 193.517 224.082 197.5 221.562C203.973 217.506 208.68 214.711 216.562 214.875C218.235 214.902 218.235 214.902 219.941 214.93C220.95 214.953 221.96 214.976 223 215C224.32 215 225.64 215 227 215C228.632 213.308 228.632 213.308 229.961 210.961C230.507 210.082 231.054 209.203 231.617 208.297C232.197 207.333 232.777 206.368 233.375 205.375C234.632 203.341 235.89 201.307 237.148 199.273C237.789 198.228 238.429 197.182 239.089 196.104C242.004 191.368 245.003 186.685 248 182C249.163 180.173 250.326 178.347 251.488 176.52C252.065 175.613 252.642 174.706 253.237 173.772C255.027 170.957 256.816 168.141 258.605 165.324C264.15 156.596 269.704 147.875 275.312 139.188C275.775 138.47 276.237 137.752 276.713 137.012C279.88 132.12 279.88 132.12 281 131Z"
                      fill="#62748E"
                    />
                    <path
                      d="M421 84.0001C422.555 84.526 422.555 84.526 424.141 85.0626C447.488 93.8637 464.014 111.609 474.159 134.013C482.325 153.299 483.503 178.275 476 198C465.896 222.57 448.514 240.713 424 251C401.063 259.38 375.971 258.241 353.73 248.336C332.038 237.723 315.908 219.879 308 197C307.607 195.88 307.214 194.76 306.809 193.606C300.275 171.864 302.409 147.607 312.867 127.538C324.92 105.433 343.159 90.1596 367.125 82.5626C384.228 77.6093 404.213 78.1209 421 84.0001ZM339.875 118.75C329.543 129.371 321 144.826 321 160C341.79 160 362.58 160 384 160C384 139.21 384 118.42 384 97.0001C367.218 97.0001 351.51 107.66 339.875 118.75ZM400 97.0001C399.991 98.3995 399.991 98.3995 399.982 99.8272C399.925 108.612 399.852 117.396 399.764 126.181C399.719 130.697 399.68 135.214 399.654 139.73C399.628 144.088 399.587 148.445 399.537 152.802C399.52 154.466 399.509 156.129 399.502 157.793C399.493 160.121 399.465 162.447 399.432 164.775C399.434 165.811 399.434 165.811 399.437 166.867C399.384 169.53 399.236 171.577 397.925 173.925C394.982 175.569 392.059 175.439 388.775 175.432C388.043 175.443 387.311 175.453 386.557 175.463C384.138 175.494 381.72 175.503 379.301 175.512C377.624 175.529 375.946 175.547 374.269 175.566C369.855 175.614 365.441 175.644 361.027 175.67C356.522 175.699 352.018 175.746 347.514 175.791C338.676 175.877 329.838 175.944 321 176C321.311 177.926 321.624 179.852 321.939 181.778C322.114 182.85 322.288 183.923 322.467 185.028C325.676 202.94 338.275 218.06 352.812 228.313C368.705 238.424 387.909 241.741 406.459 238.581C411.158 237.479 415.553 235.861 420 234C420.94 233.616 421.879 233.232 422.848 232.836C429.338 229.887 434.675 225.695 440 221C440.775 220.321 441.549 219.641 442.348 218.941C453.866 208.174 461.978 192.557 463.177 176.651C463.732 154.712 460.012 136.874 445 120C444.407 119.313 443.814 118.626 443.203 117.918C433.013 106.879 418.741 99.2098 403.777 97.4454C401.907 97.225 401.907 97.225 400 97.0001Z"
                      fill="#62748E"
                    />
                    <path
                      d="M115.312 71.3124C125.933 79.3327 133.259 88.7482 136 102C136.431 106.633 136.465 111.224 136.438 115.875C136.457 117.065 136.477 118.254 136.498 119.48C136.49 134.157 131.597 145.069 121.688 155.75C111.129 165.743 99.5817 168.514 85.4697 168.42C71.3473 168.009 60.2713 162.163 50.5938 151.937C41.6083 141.014 39.4804 129.986 39.5625 116.125C39.5425 114.935 39.5225 113.745 39.502 112.519C39.51 97.8428 44.4026 86.9311 54.3125 76.2499C70.6079 60.8274 96.7282 58.9784 115.312 71.3124ZM63 91.9999C55.7413 101.771 55.0212 113.69 56.625 125.375C58.2389 133.512 62.4194 140.67 69.043 145.75C77.2994 151.023 85.302 152.081 95 151C103.148 149.103 109.561 144.629 114.535 137.933C120.844 127.651 121.106 115.354 118.816 103.808C116.244 94.9591 110.727 88.29 102.824 83.7499C88.817 77.1475 73.1611 80.5715 63 91.9999Z"
                      fill="#62748E"
                    />
                    <path
                      d="M417.625 399.469C419.421 399.466 421.218 399.462 423.014 399.457C426.763 399.451 430.511 399.46 434.26 399.479C439.038 399.501 443.814 399.488 448.592 399.464C452.297 399.45 456.001 399.454 459.706 399.465C461.466 399.467 463.227 399.464 464.987 399.455C479.096 399.396 490.335 400.819 501 411C512.668 423.223 512.541 436.238 512.25 452.188C512.23 454.113 512.212 456.038 512.195 457.963C512.152 462.642 512.083 467.321 512 472C506.72 472 501.44 472 496 472C495.951 469.794 495.902 467.589 495.852 465.316C495.797 463.152 495.74 460.987 495.683 458.823C495.645 457.332 495.61 455.841 495.578 454.351C495.435 438.803 495.435 438.803 489 425C489 424.34 489 423.68 489 423C488.464 422.732 487.928 422.464 487.375 422.188C485.625 421.312 483.898 420.388 482.188 419.438C476.814 417.014 471.304 416.875 465.473 416.855C464.221 416.848 462.97 416.842 461.68 416.835C460.331 416.834 458.982 416.833 457.633 416.832C456.23 416.829 454.826 416.825 453.423 416.822C450.489 416.816 447.556 416.814 444.623 416.815C440.885 416.815 437.148 416.801 433.41 416.784C430.514 416.773 427.617 416.771 424.721 416.771C423.344 416.77 421.967 416.766 420.59 416.758C410.266 416.705 401.547 416.746 393 423C392.34 423 391.68 423 391 423C386.683 431.302 384.945 438.254 384.684 447.586C384.663 448.288 384.642 448.99 384.621 449.713C384.556 451.933 384.497 454.154 384.438 456.375C384.394 457.889 384.351 459.404 384.307 460.918C384.2 464.612 384.1 468.306 384 472C378.72 472 373.44 472 368 472C367.9 466.362 367.828 460.725 367.78 455.087C367.76 453.174 367.733 451.26 367.698 449.347C367.431 434.312 368.099 422.42 379 411C390.45 400.07 402.623 399.389 417.625 399.469Z"
                      fill="#62748E"
                    />
                    <path
                      d="M265.625 399.469C267.421 399.466 269.218 399.462 271.014 399.457C274.763 399.451 278.511 399.46 282.26 399.479C287.037 399.501 291.814 399.488 296.592 399.464C300.297 399.45 304.001 399.454 307.706 399.465C309.466 399.467 311.227 399.464 312.987 399.455C327.096 399.396 338.335 400.819 349 411C360.668 423.223 360.54 436.238 360.25 452.188C360.23 454.113 360.212 456.038 360.195 457.963C360.151 462.642 360.083 467.321 360 472C354.72 472 349.44 472 344 472C343.951 469.794 343.902 467.589 343.851 465.316C343.797 463.152 343.74 460.987 343.682 458.823C343.644 457.332 343.61 455.841 343.578 454.351C343.435 438.803 343.435 438.803 337 425C337 424.34 337 423.68 337 423C336.464 422.732 335.927 422.464 335.375 422.188C333.624 421.312 331.898 420.388 330.187 419.438C324.814 417.014 319.304 416.875 313.473 416.855C312.221 416.848 310.969 416.842 309.68 416.835C308.331 416.834 306.982 416.833 305.633 416.832C304.229 416.829 302.826 416.825 301.423 416.822C298.489 416.816 295.556 416.814 292.622 416.815C288.885 416.815 285.148 416.801 281.41 416.784C278.514 416.773 275.617 416.771 272.721 416.771C271.344 416.77 269.967 416.766 268.59 416.758C258.266 416.705 249.547 416.746 241 423C240.34 423 239.68 423 239 423C234.683 431.302 232.945 438.254 232.683 447.586C232.663 448.288 232.642 448.99 232.62 449.713C232.556 451.933 232.496 454.154 232.437 456.375C232.394 457.889 232.35 459.404 232.306 460.918C232.199 464.612 232.1 468.306 232 472C226.72 472 221.44 472 216 472C215.9 466.362 215.828 460.725 215.78 455.087C215.76 453.174 215.733 451.26 215.698 449.347C215.431 434.312 216.098 422.42 227 411C238.449 400.07 250.623 399.389 265.625 399.469Z"
                      fill="#62748E"
                    />
                    <path
                      d="M113.625 399.469C115.421 399.466 117.218 399.462 119.014 399.457C122.763 399.451 126.511 399.46 130.26 399.479C135.037 399.501 139.814 399.488 144.592 399.464C148.297 399.45 152.001 399.454 155.706 399.465C157.466 399.467 159.227 399.464 160.987 399.455C175.096 399.396 186.335 400.819 197 411C208.668 423.223 208.54 436.238 208.25 452.188C208.23 454.113 208.212 456.038 208.195 457.963C208.151 462.642 208.083 467.321 208 472C202.72 472 197.44 472 192 472C191.951 469.794 191.902 467.589 191.851 465.316C191.797 463.152 191.74 460.987 191.682 458.823C191.644 457.332 191.61 455.841 191.578 454.351C191.435 438.803 191.435 438.803 185 425C185 424.34 185 423.68 185 423C184.464 422.732 183.927 422.464 183.375 422.188C181.624 421.312 179.898 420.388 178.187 419.438C172.814 417.014 167.304 416.875 161.473 416.855C160.221 416.848 158.969 416.842 157.68 416.835C156.331 416.834 154.982 416.833 153.633 416.832C152.229 416.829 150.826 416.825 149.423 416.822C146.489 416.816 143.556 416.814 140.622 416.815C136.885 416.815 133.148 416.801 129.41 416.784C126.514 416.773 123.617 416.771 120.721 416.771C119.344 416.77 117.967 416.766 116.59 416.758C106.266 416.705 97.5471 416.746 88.9998 423C88.3398 423 87.6798 423 86.9998 423C82.6828 431.302 80.9447 438.254 80.6834 447.586C80.6627 448.288 80.6419 448.99 80.6205 449.713C80.5556 451.933 80.4964 454.154 80.4373 456.375C80.3941 457.889 80.3505 459.404 80.3065 460.918C80.1993 464.612 80.0997 468.306 79.9998 472C74.7198 472 69.4398 472 63.9998 472C63.9001 466.362 63.828 460.725 63.7801 455.087C63.7601 453.174 63.7329 451.26 63.6981 449.347C63.4312 434.312 64.0983 422.42 74.9998 411C86.4495 400.07 98.6227 399.389 113.625 399.469Z"
                      fill="#62748E"
                    />
                    <path
                      d="M462.418 309.508C471.507 316.054 477.156 324.184 480 335C480.528 339.352 480.562 343.621 480.5 348C480.523 349.647 480.523 349.647 480.547 351.328C480.491 363.064 477.148 372.465 469 381C459.773 389.808 450.15 392.626 437.635 392.471C425.808 392.002 417.159 387.452 409.027 378.934C401.213 369.659 399.333 359.877 399.5 348C399.485 346.902 399.469 345.803 399.453 344.672C399.509 332.936 402.852 323.535 411 315C424.78 301.845 446.105 299.335 462.418 309.508ZM421.348 328.863C415.689 337.048 414.969 346.941 416.688 356.5C418.36 363.191 421.262 368.176 427.125 371.937C433.641 375.677 441.032 376.313 448.32 374.387C454.596 371.593 459.22 366.398 462.375 360.375C465.001 350.395 464.98 340.05 460 330.812C456.653 325.972 452.509 323.019 447 321C436.881 319.284 428.305 321.018 421.348 328.863Z"
                      fill="#62748E"
                    />
                    <path
                      d="M310.418 309.508C319.507 316.054 325.156 324.184 328 335C328.528 339.352 328.562 343.621 328.5 348C328.523 349.647 328.523 349.647 328.547 351.328C328.491 363.064 325.148 372.465 317 381C307.773 389.808 298.15 392.626 285.635 392.471C273.808 392.002 265.159 387.452 257.027 378.934C249.213 369.659 247.333 359.877 247.5 348C247.485 346.902 247.469 345.803 247.453 344.672C247.509 332.936 250.852 323.535 259 315C272.78 301.845 294.105 299.335 310.418 309.508ZM269.348 328.863C263.689 337.048 262.969 346.941 264.688 356.5C266.36 363.191 269.262 368.176 275.125 371.937C281.641 375.677 289.032 376.313 296.32 374.387C302.596 371.593 307.22 366.398 310.375 360.375C313.001 350.395 312.98 340.05 308 330.812C304.653 325.972 300.509 323.019 295 321C284.881 319.284 276.305 321.018 269.348 328.863Z"
                      fill="#62748E"
                    />
                    <path
                      d="M158.418 309.508C167.507 316.054 173.156 324.184 176 335C176.528 339.352 176.562 343.621 176.5 348C176.523 349.647 176.523 349.647 176.547 351.328C176.491 363.064 173.148 372.465 165 381C155.773 389.808 146.15 392.626 133.635 392.471C121.808 392.002 113.159 387.452 105.027 378.934C97.2126 369.659 95.3327 359.877 95.5 348C95.4845 346.902 95.4691 345.803 95.4531 344.672C95.5087 332.936 98.8522 323.535 107 315C120.78 301.845 142.105 299.335 158.418 309.508ZM117.348 328.863C111.689 337.048 110.969 346.941 112.688 356.5C114.36 363.191 117.262 368.176 123.125 371.937C129.641 375.677 137.032 376.313 144.32 374.387C150.596 371.593 155.22 366.398 158.375 360.375C161.001 350.395 160.98 340.05 156 330.812C152.653 325.972 148.509 323.019 143 321C132.881 319.284 124.305 321.018 117.348 328.863Z"
                      fill="#62748E"
                    />
                    <path
                      d="M176 88C215.6 88 255.2 88 296 88C296 93.28 296 98.56 296 104C256.4 104 216.8 104 176 104C176 98.72 176 93.44 176 88Z"
                      fill="#62748E"
                    />
                    <path
                      d="M176 120C199.76 120 223.52 120 248 120C248 125.28 248 130.56 248 136C224.24 136 200.48 136 176 136C176 130.72 176 125.44 176 120Z"
                      fill="#62748E"
                    />
                    <path
                      d="M176 152C191.84 152 207.68 152 224 152C224 157.28 224 162.56 224 168C208.16 168 192.32 168 176 168C176 162.72 176 157.44 176 152Z"
                      fill="#62748E"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_403_26">
                      <rect width="512" height="512" fill="white" />
                    </clipPath>
                  </defs>
                </svg>

                <span className="text-xs font-bold text-slate-500 mt-2">
                  Seminar
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col mt-5">
            <div className="flex items-center gap-1">
              <h6 className="text-sm font-bold">Session Length</h6>
              <div className="relative group flex items-center cursor-pointer">
                <CircleQuestionMark
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  size={15}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 hidden group-hover:block bg-slate-900 text-white text-[11px] font-bold rounded-lg p-2.5 shadow-xl leading-normal text-center z-50">
                  Choose the total practice duration for your presentation. The
                  system timer will lock to this value.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {durations.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDuration(d)}
                  className={`py-1 px-4 border-2 rounded flex justify-center cursor-pointer transition-colors ${
                    selectedDuration === d
                      ? "border-main text-main"
                      : "border-slate-300 text-slate-500"
                  }`}
                >
                  <span className="font-semibold text-sm">{d} min</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full grid grid-cols-3">
        <div className="w-full col-span-3 p-5 pb-7 bg-white border-bold mt-6">
          <div className="">
            <h3 className="font-bold text-lg">What to Expect?</h3>
          </div>
          <div className="col-span-2 bg-white w-full grid grid-cols-1 sm:grid-cols-2 lg:flex lg:justify-evenly gap-5 mt-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-indigo-500/20">
                <Users className="text-indigo-500" strokeWidth={2} size={18} />
              </div>
              <div className="flex flex-col gap-1">
                <h6 className="font-bold text-sm">Virtual Audience</h6>
                <p className="text-sm">
                  You will present to a virtual audience that may react and get
                  distracted
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-yellow-500/20">
                <Ghost className="text-yellow-500" strokeWidth={2} size={18} />
              </div>
              <div className="flex flex-col gap-1">
                <h6 className="font-bold text-sm">Distractions</h6>
                <p className="text-sm">
                  Unexpected events will test your focus and composure
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-green-500/20">
                <ChartNoAxesCombined
                  className="text-green-500"
                  strokeWidth={2}
                  size={18}
                />
              </div>
              <div className="flex flex-col gap-1">
                <h6 className="font-bold text-sm">Performance Tracking</h6>
                <p className="text-sm">
                  We will analyze your delivery and provide detailed insight
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <MessageCircleCheck
                  className="text-blue-500"
                  strokeWidth={2}
                  size={18}
                />
              </div>
              <div className="flex flex-col gap-1">
                <h6 className="font-bold text-sm">Actionable Feedback</h6>
                <p className="text-sm">
                  Get personalized tips to help you improve and grow
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full border-bold p-5 flex flex-col lg:flex-row items-center gap-4 mt-6 bg-main/3 lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-main/20 rounded-full">
            <Trophy className="text-main" size={25} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold">Ready to start your session?</span>
            <span className="text-sm">
              Once you begin, the simulation will start and the timer will begin
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center">
          <button
            disabled={
              cameraStatus !== "ready" ||
              micStatus !== "ready" ||
              cueCardStatus === "loading"
            }
            onClick={handleStartPresentation}
            className={`flex gap-2 items-center rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors ${
              cameraStatus === "ready" &&
              micStatus === "ready" &&
              cueCardStatus !== "loading"
                ? "bg-main hover:bg-main/90 cursor-pointer"
                : "bg-slate-300 cursor-not-allowed opacity-75"
            }`}
          >
            <Play size={17} />
            Start Presentation
          </button>
          <span className="text-xs text-slate-500 mt-1">
            You can't pause or restart once begin
          </span>
        </div>
      </div>
    </div>
  );
}
