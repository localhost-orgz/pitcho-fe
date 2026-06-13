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
 * Fetch a single session by ID from the backend via the Next.js BFF proxy.
 * GETs /api/history/:id on the same origin so the proxy handles auth.
 *
 * @param {string} id - Session ID
 * @returns {Promise<Object>} The parsed session object
 * @throws {Error} On auth failure, 404, or server errors
 */
export async function fetchSession(id) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No auth token found. Please log in again.");
  }

  const res = await fetch(`/api/history/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) {
      throw new Error("Please log in to view session details.");
    }
    if (res.status === 404) {
      throw new Error("Session not found. It may have been deleted.");
    }
    throw new Error(
      json.error || `Failed to fetch session (${res.status})`,
    );
  }

  const json = await res.json();
  // Backend may return { data: { ... } } or the object directly
  return json.data ?? json;
}
