Here's the updated prompt with the 360° rotating circular text + GSAP enabled:Here's the live preview, and the updated prompt for your code agent below:

---

**Animation Prompt v2: "Whisper-to-Clarity" — with 360° Ring + GSAP**

Recreate the ambient hero animation from the Flow landing page. Use **GSAP 3** for all animations. Three visual zones work simultaneously:

---

**Zone 1 — Rotating Whisper Ring (left, partially off-screen)**

- SVG `<textPath>` along a `<circle>` path (radius ~200px), centered off-screen-left so only the right arc is visible
- The text is a long run-on thought: _"like nobody really knows what's going on so can you check in with them and see if the notes from yesterday's meeting were sent out, or if they're still waiting..."_
- Use `gsap.to('#ring-group', { rotation: 360, transformOrigin: 'center center', duration: 28, repeat: -1, ease: 'none' })` for a continuous 360° clockwise spin
- Text: 11px, light gray, `opacity: 0.45`, `letter-spacing: 1.5px`, serif or light sans
- The ring should feel like ambient background atmosphere — slow, ghostly, always moving

---

**Zone 2 — Processing Core (center)**

Two stacked elements:

1. **Badge chip** — pill-shaped, dark teal/green (`#2D6A4F`), white text reading `"Grammar corrected"` with a small pulsing green dot on the left. Entrance: fade in + `y: 8 → 0` with `power2.out`.

2. **Waveform pill** — dark rounded pill (`#1a1a1a`), containing 10–12 thin vertical bars. Animate each bar's height using:
   ```js
   gsap.to(bar, {
     height: () => gsap.utils.random(6, 32),
     duration: gsap.utils.random(0.2, 0.5),
     repeat: -1,
     yoyo: true,
     ease: "sine.inOut",
     delay: index * 0.06,
   });
   ```
   Staggered delays create an organic, breathing waveform effect.

---

**Zone 3 — Word Reveal (right side)**

- Take the sentence: _"Can you check if the notes from yesterday's meeting were sent out, or if they're still waiting?"_
- Split into individual `<span class="word">` elements
- Initial state: `filter: blur(4px); opacity: 0.2; color: #888`
- Reveal left-to-right with staggered GSAP tweens:
  ```js
  words.forEach((word, i) => {
    gsap.to(word, {
      delay: 0.3 + i * 0.18,
      filter: "blur(0px)",
      opacity: 1,
      color: "#1a1a1a",
      duration: 0.5,
      ease: "power2.out",
    });
  });
  ```
- After full reveal + 1.8s hold: reset all words to blurred and loop
- This creates the speech-becoming-writing effect — fuzzy noise resolving into clarity, word by word

---

**Layout & feel**

- Background: `#F5F3E8` (warm off-white)
- Scene height: `420px`, `overflow: hidden`
- Ring zone: `position: absolute; left: -120px` (partially clipped)
- Core zone: centered absolutely
- Clarity zone: `position: absolute; right: 20px`
- Load GSAP from `cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- No canvas, no other libraries needed
