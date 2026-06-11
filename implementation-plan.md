# Implementation Plan: Virtual Classroom Distraction System

## Objective

Integrate `/public/classroom.mp4` into the Presentation Session page as the visual audience simulation.

The video should become the main virtual classroom display and support the distraction engine that triggers specific audience animations throughout the presentation session.

---

# Phase 1: Virtual Classroom Video Integration

## Goal

Replace the current placeholder virtual classroom with the classroom video.

### Requirements

- Load video from:

```text
/public/classroom.mp4
```

- Render inside the existing Virtual Classroom section on Presentation Session page.
- Video should fill the entire classroom area.
- Aspect ratio should be:

```text
19:6
```

- Classroom container should be:

```text
width: 100%
height: 100%
```

- Use object-fit cover behavior so the classroom always fills available space.
- No visible browser video controls.
- Video should autoplay.
- Video should remain muted.
- Video should be controlled entirely through JavaScript.

### Acceptance Criteria

- Video visually occupies the full virtual classroom area.
- No black bars visible.
- No controls visible.
- Video automatically starts when session starts.

---

# Phase 2: Video State Controller

## Goal

Turn a single MP4 into a state-driven animation system.

### States

```ts
IDLE_BLINK;
COUGH;
SNEEZE;
YAWN;
DROP_BOTTLE;
```

### Timeline Mapping

```ts
IDLE_BLINK:
0s → 7s

COUGH:
8s → 10s

SNEEZE:
10s → 12s

YAWN:
12s → 15s

DROP_BOTTLE:
15s → 17s
```

### Behavior

Default behavior:

```text
Loop 0s → 7s forever
```

When distraction triggered:

```text
Jump to distraction start
Play distraction segment
Wait until segment finishes
Return to idle loop
```

### Required API

```ts
playIdleLoop();

playDistraction(type);

stopCurrentAnimation();
```

---

# Phase 3: Distraction Schedule Generator

## Goal

Generate distraction timings based on session duration and difficulty.

### Session Durations

```ts
1 minute
3 minutes
5 minutes
10 minutes
15 minutes
```

### Difficulty Multipliers

```ts
easy = 0.3;
medium = 0.6;
hard = 1.0;
```

### Formula

```ts
eventCount = Math.round(sessionMinutes * multiplier);
```

### Example

```ts
5 min easy
= 2 events

10 min medium
= 6 events

15 min hard
= 15 events
```

---

# Phase 4: Weighted Timeline Distribution

## Goal

Avoid robotic spacing.

### Timeline Zones

```text
0-20%
15% of events

20-80%
70% of events

80-100%
15% of events
```

### Rules

- Add randomness.
- Never place events at fixed intervals.
- Avoid two events occurring too close together.
- Define a minimum gap between distractions.

Example:

```text
6%
17%
32%
48%
63%
81%
```

---

# Phase 5: Distraction Type Selection

## Goal

Randomize animation types while maintaining realism.

### Weights

```ts
COUGH = 45%
SNEEZE = 25%
YAWN = 20%
DROP_BOTTLE = 10%
```

### Constraints

Easy:

```text
No DROP_BOTTLE
```

Medium:

```text
Maximum 1 DROP_BOTTLE
```

Hard:

```text
Maximum 2 DROP_BOTTLE
```

Additional:

```text
Maximum 2 identical distractions consecutively
```

---

# Phase 6: Session Runtime Engine

## Goal

Trigger distractions automatically during presentation.

### Responsibilities

- Start when presentation session begins.
- Generate distraction schedule.
- Track elapsed session time.
- Trigger distraction when scheduled timestamp is reached.
- Return to idle state afterward.
- Continue monitoring remaining schedule.

### Cleanup

When session ends:

```text
Clear timers
Stop listeners
Return video to idle state
Release resources
```

---

# Phase 7: Future-Proof Architecture

Structure code so new audience behaviors can be added later.

Examples:

```ts
LOOK_AT_PHONE;
LOOK_AT_WATCH;
TALK_TO_NEIGHBOR;
LEAVE_ROOM;
ENTER_ROOM;
```

The engine should require only:

1. New state definition
2. New timestamp mapping
3. Optional weight configuration

No major refactor should be required.
