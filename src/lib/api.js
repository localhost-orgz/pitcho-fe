/**
 * Fetch the user's previously uploaded documents from the backend.
 * Returns an array of document objects. Handles both a bare array
 * and a `{ data: [...] }` envelope.
 */
export async function fetchDocumentLibrary() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("auth-token")
      : null;

  if (!token) {
    throw new Error("No auth token found. Please log in again.");
  }

  const res = await fetch(
    "https://pitcho-be.vercel.app/api/document/library",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch library: ${res.statusText}`);
  }

  const json = await res.json();

  // Defensive: handle both { data: [...] } and direct array
  const documents = Array.isArray(json) ? json : json.data ?? [];

  return documents;
}
