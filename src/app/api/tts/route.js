import { NextResponse } from "next/server";

/**
 * @file src/app/api/tts/route.js
 *
 * BFF (Backend-For-Frontend) proxy for the ElevenLabs Text-to-Speech API.
 *
 * Why a server-side proxy?
 *   - ELEVENLABS_API_KEY must NEVER be exposed to the browser.
 *     This route runs exclusively on the server (Next.js API route),
 *     so the key stays secure.
 *   - We can add rate limiting, usage logging, and caching headers
 *     at this layer without touching client code.
 *   - Follows the same BFF pattern used by other API routes in this
 *     project (see src/app/api/history/route.js).
 *
 * Endpoints:
 *   POST /api/tts — Generate TTS audio for a given text
 *   HEAD /api/tts — Health check (returns 200 if API key is configured)
 *
 * POST request body:
 *   {
 *     text: string (required, max 5000 chars),
 *     voice_id?: string (default: "pNInz6obpgDQGcFmaJgB" = Adam),
 *     model_id?: string (default: "eleven_multilingual_v2"),
 *     voice_settings?: {
 *       stability: number (0-1),
 *       similarity_boost: number (0-1),
 *       style: number (0-1),
 *     }
 *   }
 *
 * POST response:
 *   Success (200): audio/mpeg binary stream
 *   Error (4xx/5xx): JSON { error: string, detail?: string }
 *
 * Voice fallback strategy:
 *   If the primary voice (Adam) returns 429 (rate limited) or 500
 *   (server error), we retry ONCE with the fallback voice (Antoni).
 *   This improves resilience without adding significant latency.
 *   The response includes an X-TTS-Voice header so the client knows
 *   which voice was ultimately used.
 */

// ── Configuration ──────────────────────────────────────────────

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech";

// Primary voice: "Adam" — warm, natural male voice, built-in (no Voice Library issues)
const DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB";

// Fallback voice: "Antoni" — used if the primary voice is rate-limited
const FALLBACK_VOICE_ID = "ErXwobaYiN019PkySvjV";

// ElevenLabs v2 model character limit
const MAX_TEXT_LENGTH = 5000;

// ── Helpers ────────────────────────────────────────────────────

/**
 * Call the ElevenLabs TTS API and return the fetch Response.
 *
 * @param {string} text - Text to synthesize
 * @param {string} voiceId - ElevenLabs voice ID
 * @param {string} modelId - Model ID (e.g., "eleven_multilingual_v2")
 * @param {Object} voiceSettings - { stability, similarity_boost, style }
 * @param {string} apiKey - ElevenLabs API key
 * @returns {Promise<Response>} Fetch Response from ElevenLabs
 */
async function callElevenLabs(text, voiceId, modelId, voiceSettings, apiKey) {
  const url = `${ELEVENLABS_BASE_URL}/${voiceId}`;

  return fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: voiceSettings,
    }),
  });
}

/**
 * Attempt to parse an error response body from ElevenLabs.
 * ElevenLabs returns errors in the format:
 *   { detail: { status: "...", message: "..." } }
 * or simply:
 *   { detail: "error message" }
 *
 * @param {Response} response
 * @returns {Promise<string>} Human-readable error message
 */
async function parseElevenLabsError(response) {
  try {
    const body = await response.json();
    if (body.detail) {
      if (typeof body.detail === "object" && body.detail.message) {
        return body.detail.message;
      }
      return String(body.detail);
    }
    return JSON.stringify(body);
  } catch {
    try {
      return await response.text();
    } catch {
      return `HTTP ${response.status}`;
    }
  }
}

// ── Route Handlers ─────────────────────────────────────────────

/**
 * POST /api/tts
 *
 * Synthesizes speech from text using ElevenLabs.
 * The API key is read from process.env.ELEVENLABS_API_KEY and is
 * NEVER returned to or accessible from the client.
 */
export async function POST(request) {
  try {
    // ── 1. Validate API key ─────────────────────────────────
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      console.error("[TTS] ELEVENLABS_API_KEY environment variable is not set.");
      return NextResponse.json(
        { error: "TTS service is not configured. Missing API key." },
        { status: 500 }
      );
    }

    // ── 2. Parse and validate request body ──────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON." },
        { status: 400 }
      );
    }

    const {
      text,
      voice_id = DEFAULT_VOICE_ID,
      model_id = "eleven_multilingual_v2",
      voice_settings = {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
      },
    } = body;

    // Validate required fields
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "The 'text' field is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    // Truncate text to ElevenLabs v2 model limit.
    // Questions in this app are typically 50-300 characters, so
    // truncation is a safety net, not expected to fire in practice.
    const truncatedText = text.trim().slice(0, MAX_TEXT_LENGTH);

    // ── 3. Call ElevenLabs API ──────────────────────────────
    let response = await callElevenLabs(
      truncatedText,
      voice_id,
      model_id,
      voice_settings,
      apiKey
    );

    let usedVoiceId = voice_id;

    // ── 4. Fallback voice on rate-limit or server error ─────
    // If the primary voice fails with 429 (rate limited) or 5xx
    // (server error), retry once with the fallback voice.
    // We do NOT retry on 4xx client errors (bad request, etc.)
    // because those indicate a problem with the request itself.
    if (
      !response.ok &&
      (response.status === 429 || response.status >= 500) &&
      voice_id !== FALLBACK_VOICE_ID
    ) {
      console.warn(
        `[TTS] Primary voice ${voice_id} returned ${response.status}. ` +
          `Retrying with fallback voice ${FALLBACK_VOICE_ID}.`
      );

      response = await callElevenLabs(
        truncatedText,
        FALLBACK_VOICE_ID,
        model_id,
        voice_settings,
        apiKey
      );
      usedVoiceId = FALLBACK_VOICE_ID;
    }

    // ── 5. Handle ElevenLabs error ──────────────────────────
    if (!response.ok) {
      const errorMessage = await parseElevenLabsError(response);
      console.error(
        `[TTS] ElevenLabs API error (${response.status}): ${errorMessage}`
      );

      return NextResponse.json(
        {
          error: `ElevenLabs API returned ${response.status}`,
          detail: errorMessage,
        },
        { status: response.status }
      );
    }

    // ── 6. Return audio binary ──────────────────────────────
    const audioBuffer = await response.arrayBuffer();

    console.log(
      `[TTS] Generated ${audioBuffer.byteLength} bytes of audio ` +
        `for text "${truncatedText.slice(0, 50)}..." using voice ${usedVoiceId}`
    );

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
        // Inform the client which voice was actually used
        "X-TTS-Voice": usedVoiceId,
        // Cache for 24 hours — same text + same settings produces
        // identical audio output, so browser/CDN caching is safe.
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    // Catch-all for unexpected errors (network failures, etc.)
    console.error("[TTS] Unexpected server error:", error);
    return NextResponse.json(
      { error: "TTS service encountered an internal error. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * HEAD /api/tts
 *
 * Lightweight health check. Returns 200 if the API key is
 * configured, 500 otherwise. No request body needed.
 * Used by the client-side healthCheck() function to verify
 * service availability before attempting generation.
 */
export async function HEAD() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TTS service is not configured" },
      { status: 500 }
    );
  }

  return new NextResponse(null, { status: 200 });
}
