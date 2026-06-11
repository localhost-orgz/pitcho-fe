// ── Upload recorded audio for speech analysis ───────────────

const SPEECH_ANALYSIS_URL = "https://pitcho-be.vercel.app/api/speech/analyze";

/**
 * Convert WebM/Opus audio blob to WAV format using Web Audio API.
 * WAV is universally supported by speech-to-text backends.
 * @param {Blob} webmBlob
 * @returns {Promise<Blob>} WAV audio blob
 */
async function convertToWav(webmBlob) {
  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;

  // Build WAV file: 44-byte header + PCM data
  const buffer = new ArrayBuffer(44 + length * numChannels * 2);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + length * numChannels * 2, true);
  writeString(view, 8, "WAVE");

  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true); // byte rate
  view.setUint16(32, numChannels * 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, length * numChannels * 2, true);

  // Write interleaved PCM samples
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  audioContext.close();
  return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Sends the recorded audio blob to the speech analysis API.
 * Converts WebM to WAV before uploading.
 * @param {Blob|null} audioBlob - WebM audio blob from MediaRecorder
 * @returns {Promise<Object|null>} Parsed JSON response or null if no blob provided
 */
export async function analyzeSpeech(audioBlob) {
  if (!audioBlob || audioBlob.size === 0) return null;

  // Convert WebM → WAV (no external deps, reliable format)
  let wavBlob;
  try {
    wavBlob = await convertToWav(audioBlob);
  } catch (convErr) {
    console.error("Failed to convert audio to WAV:", convErr);
    // Fallback: try sending the original webm blob
    wavBlob = audioBlob;
  }

  const formData = new FormData();
  formData.append("file", wavBlob, "recording.wav");

  const res = await fetch(SPEECH_ANALYSIS_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Speech analysis failed: " + res.status + " " + res.statusText);
  }

  return res.json();
}
