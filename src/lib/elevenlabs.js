"use client";

/**
 * @file elevenlabs.js — Core TTS service for ElevenLabs Text-to-Speech API
 *
 * Architecture:
 *   This module runs on the CLIENT side and makes fetch() calls to our
 *   own BFF API route (/api/tts), which proxies requests to ElevenLabs.
 *   The ELEVENLABS_API_KEY is NEVER exposed to the browser — it is only
 *   read server-side in the API route handler.
 *
 * Pre-generation strategy:
 *   Interview questions are known upfront (loaded from sessionStorage).
 *   We generate audio for ALL questions in parallel as soon as they load,
 *   store them as blob URLs in an in-memory cache, and play each one
 *   instantly when its turn comes. This avoids per-question network
 *   latency during the interview.
 *
 * Caching:
 *   - In-memory Map keyed by DJB2 hash of the text content
 *   - Deduplicates concurrent requests for the same text via a
 *     pending-requests Map that holds promises
 *   - Blob URLs are revoked on clearAudioCache() (called on unmount)
 *
 * Fallback:
 *   This module does NOT handle fallback — that is the responsibility
 *   of the useTTS hook or the consumer. If generateSpeech() throws,
 *   the caller should fall back to browser SpeechSynthesis.
 */

// ── Configuration ──────────────────────────────────────────────

/**
 * Default ElevenLabs configuration for Bahasa Indonesia.
 *
 * Voice selection rationale:
 *   - "Adam" (pNInz6obpgDQGcFmaJgB): Clear, warm male voice.
 *     Multilingual v2 model supports Indonesian with good prosody.
 *   - "Antoni" (ErXwobaYiN019PkySvjV): Backup male voice, also
 *     multilingual. Used if Adam is rate-limited or unavailable.
 *
 * Voice settings:
 *   - stability (0.5): Mid-range — expressive but not chaotic
 *   - similarity_boost (0.75): Strong match to original voice timbre
 *   - style (0.3): Subtle style exaggeration for natural conversational tone
 */
const ELEVENLABS_CONFIG = {
  voiceId: "pNInz6obpgDQGcFmaJgB", // Adam — warm, natural male voice (built-in, no Voice Library issues)
  fallbackVoiceId: "ErXwobaYiN019PkySvjV", // Antoni — multilingual male (backup)
  modelId: "eleven_multilingual_v2",
  voiceSettings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.3,
  },
};

// ── In-memory cache ────────────────────────────────────────────
// Key: hex hash of question text (avoids storing raw text twice)
// Value: { blobUrl: string, createdAt: number }
const audioCache = new Map();

// Track in-flight requests so concurrent calls for the same text
// share a single API call instead of firing duplicates.
const pendingRequests = new Map();

// ── Helpers ────────────────────────────────────────────────────

/**
 * Simple DJB2 hash — fast, deterministic, collision-resistant enough
 * for cache keys. We use this instead of the raw text so the cache map
 * doesn't hold long question strings as keys.
 *
 * @param {string} str
 * @returns {string} hex-encoded 32-bit hash
 */
function hashText(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return hash.toString(16);
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Generate TTS audio for a given text by calling our BFF API proxy.
 *
 * The request goes to /api/tts (Next.js server route), which forwards
 * to the ElevenLabs API. The response is raw audio/mpeg binary.
 *
 * @param {string} text - The text to synthesize (Bahasa Indonesia)
 * @param {Object} [options]
 * @param {string} [options.voiceId] - Override the default voice ID
 * @param {AbortSignal} [options.signal] - AbortController signal
 * @returns {Promise<Blob>} Audio blob (audio/mpeg MIME type)
 * @throws {Error} If the API call fails with a non-OK response
 */
export async function generateSpeech(text, options = {}) {
  const { voiceId = ELEVENLABS_CONFIG.voiceId, signal } = options;

  if (!text || text.trim().length === 0) {
    throw new Error("generateSpeech: text must be a non-empty string");
  }

  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: text.trim(),
      voice_id: voiceId,
      model_id: ELEVENLABS_CONFIG.modelId,
      voice_settings: ELEVENLABS_CONFIG.voiceSettings,
    }),
    signal,
  });

  if (!response.ok) {
    // Try to extract a human-readable error detail from the response
    let errorDetail = "";
    try {
      const errBody = await response.json();
      errorDetail = errBody.error || errBody.detail || "";
    } catch {
      errorDetail = await response.text().catch(() => "");
    }
    throw new Error(
      `ElevenLabs TTS failed (${response.status}): ${errorDetail || "Unknown error"}`
    );
  }

  // Response body is raw audio/mpeg binary
  const arrayBuffer = await response.arrayBuffer();
  return new Blob([arrayBuffer], { type: "audio/mpeg" });
}

/**
 * Generate speech and return a cached blob URL.
 *
 * If the same text was already synthesized, the cached blob URL is
 * returned immediately WITHOUT any network request.
 *
 * If a request for the same text is currently in-flight, this call
 * awaits that same promise instead of firing a duplicate request.
 *
 * @param {string} text - The text to synthesize
 * @param {Object} [options]
 * @param {string} [options.voiceId] - Override the default voice ID
 * @param {AbortSignal} [options.signal] - AbortController signal
 * @returns {Promise<{ blobUrl: string, fromCache: boolean }>}
 */
export async function getCachedSpeechUrl(text, options = {}) {
  if (!text) return null;

  const key = hashText(text);

  // 1. Check if already cached
  if (audioCache.has(key)) {
    const entry = audioCache.get(key);
    return { blobUrl: entry.blobUrl, fromCache: true };
  }

  // 2. Check if a request for this text is already in-flight
  if (pendingRequests.has(key)) {
    const blobUrl = await pendingRequests.get(key);
    return { blobUrl, fromCache: false };
  }

  // 3. Start a new request and register it so concurrent calls deduplicate
  const fetchPromise = (async () => {
    try {
      const blob = await generateSpeech(text, options);
      const blobUrl = URL.createObjectURL(blob);
      audioCache.set(key, { blobUrl, createdAt: Date.now() });
      return blobUrl;
    } finally {
      // Always remove from pending, even on error
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, fetchPromise);
  const blobUrl = await fetchPromise;
  return { blobUrl, fromCache: false };
}

/**
 * Play a blob URL through an HTMLAudioElement.
 *
 * Wraps the Audio element lifecycle in a Promise so the caller can
 * await playback completion (e.g., before transitioning to the next
 * interview phase).
 *
 * Returns true if playback started successfully, false if it was
 * blocked or errored. The caller can use this to decide whether to
 * fall back to browser SpeechSynthesis.
 *
 * @param {string} blobUrl - Object URL from URL.createObjectURL
 * @param {AbortSignal} [signal] - AbortController signal to cancel playback
 * @returns {Promise<boolean>} true if audio played through, false if blocked/errored
 */
export function playBlobUrl(blobUrl, signal) {
  return new Promise((resolve) => {
    if (!blobUrl) {
      resolve(false);
      return;
    }

    const audio = new Audio(blobUrl);
    audio.volume = 1.0;

    const cleanup = () => {
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onError);
      if (signal) signal.removeEventListener("abort", onAbort);
    };

    const onEnd = () => {
      cleanup();
      resolve(true); // Playback completed successfully
    };

    const onError = (e) => {
      cleanup();
      console.warn("[elevenlabs] Audio playback error:", e);
      resolve(false); // Signal that playback failed → caller can fallback
    };

    const onAbort = () => {
      cleanup();
      audio.pause();
      audio.removeAttribute("src");
      resolve(false);
    };

    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onError);
    if (signal) {
      signal.addEventListener("abort", onAbort);
    }

    audio.play().catch((err) => {
      // Autoplay may be blocked if the play() call happens
      // outside a user gesture chain (e.g., after an async
      // network request). We return false so the caller can
      // fall back to SpeechSynthesis which doesn't require
      // user gesture.
      cleanup();
      console.warn("[elevenlabs] Audio.play() rejected (likely autoplay):", err.message);
      resolve(false);
    });
  });
}

/**
 * Pre-generate audio for an array of question objects.
 *
 * This is the primary entry point for the interview session.
 * All questions are generated in PARALLEL via Promise.allSettled
 * so a single failure doesn't block the others.
 *
 * Call this as soon as questions are loaded from sessionStorage.
 * The pre-generation runs during the calibration phase, so by the
 * time the user starts answering, all audio is ready.
 *
 * @param {Array<{ id: string|number, text: string }>} questions
 *   Array of objects with at least `id` and `text` properties.
 *   `id` is used as the key in the returned Map.
 *   `text` is the question text to synthesize.
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - AbortController signal
 * @returns {Promise<Map<string|number, string|null>>}
 *   Map where keys are question IDs and values are blob URLs.
 *   Null values indicate that generation failed for that question.
 */
export async function preGenerateQuestions(questions, options = {}) {
  if (!questions || questions.length === 0) return new Map();

  const results = new Map();
  const { signal } = options;

  // Generate questions SEQUENTIALLY (not in parallel) with a small
  // stagger between requests. This avoids an ElevenLabs Voice Library
  // race condition: when using a community voice for the first time,
  // the API auto-adds it to the account, but multiple simultaneous
  // "add" calls for the same voice conflict and return a 400 error
  // ("Multiple voice additions/deletions for the same voice...").
  // Sequential requests with a stagger let the first call complete
  // the voice registration before the next one starts.
  for (const q of questions) {
    // Check if the operation was aborted before each request
    if (signal?.aborted) break;

    const text = q.text || q.question || q.title || "";
    const id = q.id != null ? q.id : q.question || text;

    if (!text) continue; // Skip empty questions silently

    try {
      const result = await getCachedSpeechUrl(text, { signal });
      if (result) {
        results.set(id, result.blobUrl);
      }
    } catch (err) {
      // Log and store null so the consumer knows this one needs fallback
      console.warn(
        `[elevenlabs] Pre-generation failed for "${text.slice(0, 40)}...":`,
        err.message
      );
      results.set(id, null);
    }

    // Small stagger between requests to avoid Voice Library race conditions.
    // 300ms is enough for ElevenLabs to finish registering the voice.
    if (signal?.aborted) break;
    await new Promise((r) => setTimeout(r, 300));
  }

  return results;
}

/**
 * Revoke all cached blob URLs and clear the cache.
 *
 * Call this on component unmount to prevent memory leaks from
 * accumulated blob URLs. Each blob URL holds audio data in memory
 * until revoked.
 */
export function clearAudioCache() {
  for (const [, entry] of audioCache) {
    try {
      URL.revokeObjectURL(entry.blobUrl);
    } catch {
      // URL may already be revoked — ignore
    }
  }
  audioCache.clear();
  pendingRequests.clear();
}

/**
 * Lightweight health check — pings our BFF proxy to verify that
 * the ElevenLabs API key is configured and the service is reachable.
 *
 * Useful for pre-flight checks before attempting generation.
 *
 * @returns {Promise<boolean>} true if the service appears healthy
 */
export async function healthCheck() {
  try {
    const res = await fetch("/api/tts", { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}
