// ── Upload recorded audio for speech analysis ───────────────

import { Muxer, ArrayBufferTarget } from "mp4-muxer";

const SPEECH_ANALYSIS_URL = "https://pitcho-be.vercel.app/api/speech/analyze";
const TARGET_SAMPLE_RATE = 16000; // 16 kHz — optimal for speech analysis

/**
 * Convert WebM/Opus audio blob → M4A (AAC in MP4 container) via WebCodecs.
 * Falls back to original WebM if WebCodecs is unavailable.
 * @param {Blob} webmBlob
 * @returns {Promise<{ blob: Blob, filename: string }>}
 */
async function convertToM4a(webmBlob) {
  // Decode WebM/Opus → AudioBuffer
  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const numChannels = audioBuffer.numberOfChannels;
  const originalSampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;

  // Resample to 16 kHz mono via OfflineAudioContext
  const outputFrames = Math.ceil(length * (TARGET_SAMPLE_RATE / originalSampleRate));
  const offlineCtx = new OfflineAudioContext(1, outputFrames, TARGET_SAMPLE_RATE);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);
  audioContext.close();

  const resampledBuffer = await offlineCtx.startRendering();
  const pcmData = resampledBuffer.getChannelData(0); // Float32Array, mono

  // Encode PCM → AAC via WebCodecs AudioEncoder, mux into MP4
  return new Promise((resolve, reject) => {
    if (typeof AudioEncoder === "undefined") {
      // WebCodecs not available — fall back to original WebM
      resolve(null);
      return;
    }

    const muxer = new Muxer({
      target: new ArrayBufferTarget(),
      audio: {
        codec: "aac",
        numberOfChannels: 1,
        sampleRate: TARGET_SAMPLE_RATE,
      },
      fastStart: "in-memory",
    });

    const encoder = new AudioEncoder({
      output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      error: (e) => {
        encoder.close();
        resolve(null); // Fallback
      },
    });

    encoder.configure({
      codec: "mp4a.40.2", // AAC-LC
      numberOfChannels: 1,
      sampleRate: TARGET_SAMPLE_RATE,
      bitrate: 64000, // 64 kbps — great for speech
    });

    // Feed PCM as AudioData frames (1024 samples per frame is standard for AAC)
    const frameSize = 1024;
    let offset = 0;
    let timestamp = 0;

    while (offset < pcmData.length) {
      const frame = pcmData.slice(offset, offset + frameSize);
      // Pad last frame with silence if needed
      if (frame.length < frameSize) {
        const padded = new Float32Array(frameSize);
        padded.set(frame);
        const audioData = new AudioData({
          format: "f32-planar",
          sampleRate: TARGET_SAMPLE_RATE,
          numberOfFrames: frameSize,
          numberOfChannels: 1,
          timestamp: timestamp,
          data: padded,
        });
        encoder.encode(audioData);
        audioData.close();
      } else {
        const audioData = new AudioData({
          format: "f32-planar",
          sampleRate: TARGET_SAMPLE_RATE,
          numberOfFrames: frameSize,
          numberOfChannels: 1,
          timestamp: timestamp,
          data: frame,
        });
        encoder.encode(audioData);
        audioData.close();
      }
      offset += frameSize;
      timestamp += Math.round((frameSize / TARGET_SAMPLE_RATE) * 1_000_000); // microseconds
    }

    encoder.flush().then(() => {
      muxer.finalize();
      encoder.close();
      const blob = new Blob([muxer.target.buffer], { type: "audio/mp4" });
      resolve({ blob, filename: "recording.m4a" });
    }).catch(() => {
      encoder.close();
      resolve(null); // Fallback
    });
  });
}

/**
 * Sends the recorded audio blob to the speech analysis API.
 * Converts WebM → M4A (AAC) before uploading for minimal file size.
 * Falls back to original WebM blob if conversion fails or WebCodecs unavailable.
 * @param {Blob|null} audioBlob - WebM audio blob from MediaRecorder
 * @returns {Promise<Object|null>} Parsed JSON response or null if no blob provided
 */
export async function analyzeSpeech(audioBlob) {
  if (!audioBlob || audioBlob.size === 0) return null;

  // Try converting to M4A (AAC) — drastically smaller than WAV
  let uploadBlob;
  let filename;
  try {
    const result = await convertToM4a(audioBlob);
    if (result) {
      uploadBlob = result.blob;
      filename = result.filename;
    }
  } catch (convErr) {
    console.error("Failed to convert audio to M4A:", convErr);
  }

  // Fallback: send original WebM/Opus blob if M4A conversion failed
  if (!uploadBlob) {
    uploadBlob = audioBlob;
    filename = "recording.webm";
  }

  const formData = new FormData();
  formData.append("file", uploadBlob, filename);

  const res = await fetch(SPEECH_ANALYSIS_URL, {
    method: "POST",
    headers: {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NmFiNDI1NS1mZGUwLTRiNWEtOWM0Zi1iMjRkMTRmNDA2ZjkiLCJlbWFpbCI6ImZhemFtdW10YXpyYW1hZGhhbkBnbWFpbC5jb20iLCJpYXQiOjE3ODEyNTA0MDEsImV4cCI6MTc4MTg1NTIwMX0.SkI5ausTOZaooyrk2MfL2g4q3ODvSyQambsG5guAI0M"
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Speech analysis failed: " + res.status + " " + res.statusText);
  }

  return res.json();
}
