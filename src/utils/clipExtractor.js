/**
 * Extract a video clip segment from a full session video blob.
 *
 * Uses an offscreen <video> element + canvas + MediaRecorder to trim
 * without server-side processing. Because MediaRecorder records in
 * real-time, extracting a clip of duration N will take ~N seconds.
 *
 * Falls back gracefully: returns null if any step fails.
 *
 * @param {Blob} videoBlob - Full session video (WebM)
 * @param {number} startSeconds - Clip start time in seconds
 * @param {number} clipDurationSeconds - Duration of clip in seconds
 * @returns {Promise<Blob|null>} Clip video blob, or null on failure
 */
export async function extractClip(videoBlob, startSeconds, clipDurationSeconds) {
  if (!videoBlob || videoBlob.size === 0) return null;
  if (clipDurationSeconds <= 0) return null;

  const video = document.createElement("video");
  const blobUrl = URL.createObjectURL(videoBlob);

  // Determine a supported WebM mime type for the recorder
  const mimeType = (() => {
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
      return "video/webm;codecs=vp9,opus";
    }
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
      return "video/webm;codecs=vp8,opus";
    }
    if (MediaRecorder.isTypeSupported("video/webm")) {
      return "video/webm";
    }
    return null;
  })();

  if (!mimeType) {
    URL.revokeObjectURL(blobUrl);
    return null;
  }

  return new Promise((resolve) => {
    let resolved = false;

    const cleanup = () => {
      if (video.src) {
        video.pause();
        video.removeAttribute("src");
      }
      URL.revokeObjectURL(blobUrl);
    };

    const done = (blob) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(blob);
    };

    // Timeout safety: give up after clip duration + 10s
    const timeoutMs = (clipDurationSeconds + 10) * 1000;
    const timeout = setTimeout(() => done(null), timeoutMs);

    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    video.onloadedmetadata = () => {
      const actualDuration = video.duration || 0;
      const start = Math.max(0, Math.min(startSeconds, actualDuration - 0.5));
      video.currentTime = start;
    };

    video.onseeked = () => {
      // Create canvas matching the video dimensions
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      if (width === 0 || height === 0) {
        clearTimeout(timeout);
        done(null);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      const stream = canvas.captureStream(30); // 30 fps
      const chunks = [];

      let recorder;
      try {
        recorder = new MediaRecorder(stream, { mimeType });
      } catch {
        clearTimeout(timeout);
        done(null);
        return;
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        clearTimeout(timeout);
        if (chunks.length > 0) {
          done(new Blob(chunks, { type: mimeType }));
        } else {
          done(null);
        }
      };

      // Draw frames while recording
      recorder.start(100);

      video.play().catch(() => {
        // If autoplay fails, try drawing a frame and moving on
        ctx.drawImage(video, 0, 0, width, height);
      });

      let frameRequest;
      const drawLoop = () => {
        if (video.paused || video.ended) {
          if (recorder.state === "recording") {
            recorder.stop();
          }
          return;
        }
        ctx.drawImage(video, 0, 0, width, height);
        frameRequest = requestAnimationFrame(drawLoop);
      };
      frameRequest = requestAnimationFrame(drawLoop);

      // Stop after the desired clip duration
      const clipMs = clipDurationSeconds * 1000;
      setTimeout(() => {
        if (frameRequest) cancelAnimationFrame(frameRequest);
        if (recorder.state === "recording") {
          // Request final data, then stop
          recorder.requestData();
          // Small delay so the last chunk is flushed
          setTimeout(() => {
            if (recorder.state === "recording") {
              recorder.stop();
            }
          }, 150);
        } else {
          done(null);
        }
      }, clipMs);
    };

    video.onerror = () => {
      clearTimeout(timeout);
      done(null);
    };

    video.src = blobUrl;
    video.load();
  });
}
