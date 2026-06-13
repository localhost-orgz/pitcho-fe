// ── IndexedDB helper for storing/retrieving video blobs ──────
const DB_NAME = "pitcho-session-videos";
const DB_VERSION = 2;
const STORE_NAME = "videos";
const CLIPS_STORE = "clips";
const VIDEO_KEY = "session-recording";
const CLIPS_KEY = "session-clips";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(CLIPS_STORE)) {
        db.createObjectStore(CLIPS_STORE);
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

/**
 * Store extracted distraction clips in IndexedDB.
 * Each clip: { id, blob, type, timestamp, duration }
 * @param {Array<{id: string, blob: Blob, type: string, timestamp: number, duration: number}>} clips
 * @returns {Promise<void>}
 */
export async function saveSessionClips(clips) {
  if (!clips || clips.length === 0) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CLIPS_STORE, "readwrite");
    const store = tx.objectStore(CLIPS_STORE);
    // Store each clip individually so we can retrieve them back with their blobs
    clips.forEach((clip, i) => {
      store.put(clip, `${CLIPS_KEY}-${i}`);
    });
    // Also store the count so we know how many to retrieve
    store.put(clips.length, `${CLIPS_KEY}-count`);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = (event) => { db.close(); reject(event.target.error); };
  });
}

/**
 * Retrieve stored distraction clips from IndexedDB.
 * @returns {Promise<Array<{id: string, blob: Blob, type: string, timestamp: number, duration: number}>>}
 */
export async function getSessionClips() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CLIPS_STORE, "readonly");
    const store = tx.objectStore(CLIPS_STORE);

    // First get the count
    const countReq = store.get(`${CLIPS_KEY}-count`);
    countReq.onsuccess = () => {
      const count = countReq.result;
      if (!count) {
        db.close();
        resolve([]);
        return;
      }

      const clips = [];
      let loaded = 0;
      let failed = false;

      for (let i = 0; i < count; i++) {
        const req = store.get(`${CLIPS_KEY}-${i}`);
        req.onsuccess = () => {
          if (!failed) {
            if (req.result) clips[i] = req.result;
            loaded++;
            if (loaded === count) {
              db.close();
              resolve(clips.filter(Boolean));
            }
          }
        };
        req.onerror = () => {
          if (!failed) {
            failed = true;
            db.close();
            reject(req.error);
          }
        };
      }
    };
    countReq.onerror = () => {
      db.close();
      reject(countReq.error);
    };
  });
}

/**
 * Remove stored distraction clips from IndexedDB.
 * @returns {Promise<void>}
 */
export async function clearSessionClips() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CLIPS_STORE, "readwrite");
    const store = tx.objectStore(CLIPS_STORE);

    // Get count first to know what to delete
    const countReq = store.get(`${CLIPS_KEY}-count`);
    countReq.onsuccess = () => {
      const count = countReq.result || 0;
      store.delete(`${CLIPS_KEY}-count`);
      for (let i = 0; i < count; i++) {
        store.delete(`${CLIPS_KEY}-${i}`);
      }
    };
    countReq.onerror = () => {
      // Even if count read fails, try to clear the store
      store.clear();
    };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = (event) => { db.close(); reject(event.target.error); };
  });
}
