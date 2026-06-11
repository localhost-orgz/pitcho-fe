// ── IndexedDB helper for storing/retrieving video blobs ──────
const DB_NAME = "pitcho-session-videos";
const DB_VERSION = 1;
const STORE_NAME = "videos";
const VIDEO_KEY = "session-recording";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * Store a video blob in IndexedDB.
 * @param {Blob} blob - The video blob to store
 * @returns {Promise<void>}
 */
export async function saveSessionVideo(blob) {
  if (!blob) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(blob, VIDEO_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = (event) => { db.close(); reject(event.target.error); };
  });
}

/**
 * Retrieve the stored video blob from IndexedDB.
 * @returns {Promise<Blob|null>}
 */
export async function getSessionVideo() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(VIDEO_KEY);
    request.onsuccess = (event) => {
      db.close();
      resolve(event.target.result || null);
    };
    request.onerror = (event) => { db.close(); reject(event.target.error); };
  });
}

/**
 * Remove the stored video blob from IndexedDB.
 * @returns {Promise<void>}
 */
export async function clearSessionVideo() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(VIDEO_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = (event) => { db.close(); reject(event.target.error); };
  });
}
