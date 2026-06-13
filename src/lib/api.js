import axios from "axios";

/**
 * Read auth token from localStorage first, then fall back to the
 * auth-token-fallback cookie (set during OAuth callback).
 */
function getAuthToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("auth-token");
  if (token) return token;
  const match = document.cookie.match(
    /(?:^|; )auth-token-fallback=([^;]*)/,
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Fetch the user's previously uploaded documents from the backend.
 * Returns an array of document objects with fileName, pageCount, fileSize,
 * and uploadedAt fields. Handles both a bare array and a `{ data: [...] }`
 * envelope.
 */
export async function fetchDocumentLibrary() {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No auth token found. Please log in again.");
  }

  const res = await fetch("https://pitcho-be.vercel.app/api/document/library", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch library: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  // Defensive: handle both { data: [...] } and direct array
  const documents = Array.isArray(json) ? json : (json.data ?? []);

  console.log("Document library fetched:", {
    count: documents.length,
    sample: documents[0]
      ? {
          id: documents[0].id ?? documents[0]._id,
          fileName: documents[0].fileName ?? documents[0].name,
          pageCount: documents[0].pageCount ?? documents[0].pages,
          fileSize: documents[0].fileSize ?? documents[0].size,
          uploadedAt: documents[0].uploadedAt ?? documents[0].createdAt,
        }
      : null,
  });

  return documents;
}

/**
 * Upload a single distraction clip to the backend.
 * POSTs the clip as FormData to /api/clip/upload.
 * Returns the parsed JSON response (expected { video_url: "..." }) or null on failure.
 *
 * @param {Blob} clipBlob - Video clip blob (WebM)
 * @param {Object} metadata - { type, timestamp_start, timestamp_end, duration }
 * @returns {Promise<Object|null>}
 */
export async function uploadClip(
  clipBlob,
  { type, timestamp, duration } = {},
) {
  if (!clipBlob || clipBlob.size === 0) return null;

  const token = getAuthToken();

  if (!token) return null;

  const formData = new FormData();
  formData.append("video", clipBlob, `clip-${timestamp ?? 0}.webm`);
  if (type != null) formData.append("type", String(type));
  if (timestamp != null)
    formData.append("timestamp", String(timestamp));
  if (duration != null) formData.append("duration", String(duration));

  try {
    const res = await fetch("https://pitcho-be.vercel.app/api/clip/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Save a completed session record to the backend.
 * POSTs JSON to /api/history.
 *
 * @param {Object} payload - Full session payload matching the /api/history schema
 * @returns {Promise<Object>} Parsed response JSON
 */
export async function saveSession(payload) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No auth token found. Please log in again.");
  }

  const res = await fetch("https://pitcho-be.vercel.app/api/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to save session: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch session history from the backend.
 * GETs JSON from /api/history (optionally limited to last N).
 * Returns an array of session objects, or [] on failure.
 *
 * @param {Object} opts - { limit?: number }
 * @returns {Promise<Array>}
 */
export async function fetchHistory({ limit } = {}) {
  const token = getAuthToken();

  if (!token) return [];

  try {
    const url = new URL("https://pitcho-be.vercel.app/api/history");
    if (limit != null) url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return [];

    const json = await res.json();
    const sessions = Array.isArray(json) ? json : (json.data ?? []);
    return sessions;
  } catch {
    return [];
  }
}

const api = axios.create({
  baseURL: "https://pitcho-be.vercel.app/api",
  // baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Let the browser set the correct multipart boundary for FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
