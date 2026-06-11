# Badge Design Specification

> Reference: badge_reference.png (the 3×3 grid screenshot)
> Purpose: Guide Claude Code to redesign Sakuin's achievement badges to match this visual system.

---

## Overview

Each badge is a **card + hexagon icon** combo. The card is a white rounded rectangle that acts as a display frame. Inside it sits a large hexagonal badge graphic with a white icon, and below that are two text labels. The color of the hexagon is **not fixed** — it adapts per badge type (green, orange/gold, purple, gray for locked).

---

## 1. Card (Outer Container)

- **Shape:** Rounded rectangle — `border-radius` roughly 20–24px (visually generous, like a squircle-lite).
- **Background:** Pure white (`#FFFFFF`).
- **Shadow:** Soft, diffused drop shadow — light green-gray tint, low opacity (~10–15%), spread ~12–16px, no hard edge. Gives a floating card feel.
- **Size:** Square-ish proportions, roughly 160–180px wide on screen.
- **Padding:** About 20–24px on all sides — generous breathing room around the hexagon icon and text.
- **Border:** None. The card is borderless; the shadow defines the edge.

---

## 2. Hexagon Badge (Icon Container)

This is the **centerpiece** of each badge card. It is a **double-layered hexagon** with a 3D depth effect.

### Shape

- Flat-top hexagon (point-up orientation — the flat side faces up and down, points face left and right). This is the classic "shield" hexagon.
- Approximately 90–100px tall in the visual.

### Layering (3D effect)

The hexagon is made of **two stacked hexagons** of the same shape, slightly offset:

1. **Bottom layer (shadow hex):** Same hexagon, shifted down by ~4–6px. Color is a **darker shade** of the main color (e.g., dark green `#2d7a00` for the green badges, dark gold `#b87400` for orange badges, dark purple `#6a30b0` for purple badges). This creates the illusion of depth/thickness, like a physical badge.
2. **Top layer (main hex):** The primary colored hexagon sitting on top. Slightly lighter and fully saturated.

### Colors (adaptive per badge type)

| Badge Type      | Top Hex Color         | Bottom Shadow Hex     |
| --------------- | --------------------- | --------------------- |
| Green (default) | `#4caf1e` / `#56c220` | `#2e7d00` / `#3a9900` |
| Orange/Gold     | `#f5a623` / `#f7b731` | `#c47d00` / `#b87000` |
| Purple          | `#9b59f5` / `#a855f7` | `#6a25d0` / `#7b2fd4` |
| Gray (Locked)   | `#7a7a7a` / `#888888` | `#4a4a4a` / `#555555` |

> **Note:** The exact hex values should be derived from your app's color tokens. Green = Sakuin brand green. Orange/Gold = achievement/warning. Purple = premium/high-level. Gray = locked/unavailable.

### Icon inside hexagon

- White icon, centered inside the top hexagon layer.
- Icon style: **solid / filled**, not outline. Clean and bold.
- Icon size: ~40–48% of the hexagon's width.
- Examples from reference: piggy bank, pie chart with leaf, banknote, recycle arrows, node graph, credit card, lightning bolt, bar chart presentation.

---

## 3. Text Labels (Below Hexagon)

Two lines of text, center-aligned, below the hexagon with ~12–16px gap.

### Badge Name (Line 1)

- **Font weight:** Bold / `font-weight: 700`
- **Font size:** ~15–16px
- **Color:** Near-black, `#1a1a1a` or `#222222`
- **Letter spacing:** Slightly normal to tight

### Level / Status (Line 2)

- **Font weight:** Regular / `font-weight: 400`
- **Font size:** ~13–14px
- **Color:** Medium gray, `#666666` or `#777777`
- **Content:** "Level 1", "Level 2", "Level 3", or "Locked" for unavailable badges

---

## 4. Locked State

When a badge is **locked/unavailable**:

- The hexagon changes to **gray** (both layers gray, see color table above).
- The icon inside remains white but may appear slightly dimmed.
- The level text shows **"Locked"** instead of "Level X".
- The card itself remains white — only the hexagon goes gray.
- No additional overlay or blur is applied to the card.

---

## 5. Implementation Notes for React Native / Expo

### Hexagon rendering

Since React Native doesn't have a native hexagon shape, use one of these approaches:

1. **SVG (recommended):** Use `react-native-svg` with a `<Polygon>` or `<Path>` for the hexagon. Render two polygons (bottom dark + top light) stacked.
2. **Image asset:** Pre-render hexagons as PNG with transparency for each color variant.
3. **CSS clip-path (Web only):** `clip-path: polygon(...)` if building for web.

### Card style (React Native)

```js
{
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  padding: 20,
  alignItems: 'center',
  shadowColor: '#a0c060',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 4, // Android
}
```

### Double-hex SVG approach

Render two `<Polygon>` inside one `<Svg>`:

- First polygon: `fill={shadowColor}`, translated down by ~5px
- Second polygon: `fill={mainColor}`, at normal position
- Icon on top of the second polygon using `<Image>` or a vector icon component

### Flat-top hexagon points formula

For a hexagon centered at (cx, cy) with radius r:

```
Points (flat-top):
  (cx, cy - r)           ← top center
  (cx + r*0.866, cy - r*0.5)  ← top-right
  (cx + r*0.866, cy + r*0.5)  ← bottom-right
  (cx, cy + r)           ← bottom center
  (cx - r*0.866, cy + r*0.5)  ← bottom-left
  (cx - r*0.866, cy - r*0.5)  ← top-left
```

---

## 6. Summary Checklist

When redesigning a badge to match this system, ensure:

- [ ] Card is white, rounded (~20px radius), with soft shadow
- [ ] Hexagon is flat-top orientation (points left/right)
- [ ] Hexagon has a dark-shifted bottom layer to simulate 3D depth (~5px offset down)
- [ ] Icon is white, solid/filled, centered in the hexagon
- [ ] Badge name is bold, near-black
- [ ] Level is regular weight, gray
- [ ] Locked badges use full gray hexagon
- [ ] Color is adaptive (green/orange/purple/gray) — not hardcoded green
