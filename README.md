# 2026 Strategic Tracker

A personal life management dashboard built as a portfolio project. Calm, nature-inspired design with a white base, soft grey tones, and a single muted sage green accent. All data persists locally — no server required.

---

## Overview

The tracker is organized around a four-pillar priority framework:

1. **Academic Excellence** — thesis and university coursework
2. **Spiritual Balance** — prayer, sports, and well-being
3. **Career Capital** — technical skills and business projects
4. **Personal Enrichment** — languages and reading

Each pillar is reflected across the Goals, Habits, and Analytics sections so you always see how your daily actions connect to the bigger picture.

---

## Features

### Overview (Dashboard)
- Live summary of goals completed, milestones hit, and active habits
- Overall progress percentage across all goals
- Four priority cards with animated progress bars, one per pillar
- Greeting updates automatically based on time of day
- "Load sample data" button when starting fresh or with empty state

### Backup & Restore
- **Export**: Save full app state as a formatted `tracker-backup.json` file.
- **Import**: Restore state from any valid JSON backup file with instant re-rendering.

### Goals
Goals are organized into three categories:

| Category | Description |
|---|---|
| Academic | University work, thesis, research |
| Technical Skills | Programming, tools, certifications-related learning |
| Business & Projects | Side projects, entrepreneurial goals |

Each goal supports:
- A name and a progress percentage (0–100%)
- An optional milestone — a key checkpoint within the goal
- Status chip that updates automatically (Pending → Started → In Progress → Done)
- Inline edit and delete actions
- Confetti animation when a goal reaches 100%

### Languages
Follows the **2 + 4 rule** — a maximum of 2 active (primary focus) languages, and up to 4 in maintenance mode.

Each language card shows:
- Current level (A0 through C2)
- Hours invested
- A thin progress bar toward the 600-hour fluency benchmark
- Color-coded by level

### Certifications
Cards support drag-and-drop reordering. Click any card to expand it and reveal full details.

Each certification includes:
- A **custom name** — write whatever certification you are pursuing
- **Notes** (optional) — why you are pursuing it, study resources, key topics
- **Hours tracking** (optional toggle) — hours completed, total estimated hours, and an automatic estimated finish date based on a 2 hours/day pace
- Status chip (Pending → Started → In Progress → Done)

### Habits
- Tracks daily habits with a done/not-done toggle
- **Streak counter** — counts consecutive days completed, resets automatically at midnight if a day is missed
- Streak banner appears when your best streak reaches 3+ days
- Gentle confetti when a streak hits 7 days
- Category icons: Spiritual ✦, Sports ◈, Reading ◎, Focus ◉, No-Scroll ◫

### Weekly Routine
A simple schedule table organized by day (Sunday through Saturday). Each entry has a day, time block, activity name, and duration. Rows can be marked done for the current week.

### Analytics
- Average completion rate across all goals
- Total language and certification counts
- Today's habit completion ratio
- Bar chart: completion percentage by goal category
- Doughnut chart: hours invested per language
- Built with Chart.js with fallback safety if CDN is unavailable

---

## Design

| Element | Choice |
|---|---|
| Display font | Playfair Display (serif, editorial warmth) |
| Body font | Plus Jakarta Sans (clean, readable) |
| Primary background | Pure white `#ffffff` |
| Surface / sidebar | Warm off-white `#fafaf9` |
| Accent color | Muted sage green `#5c7a62` |
| Certifications accent | Muted slate blue `#5a7087` |
| Texture | SVG fractal noise overlay at 2.8% opacity |
| Motion | Single page-in fade, staggered card reveals, smooth progress bar fills |

The design uses one accent color throughout. Sage green appears on active navigation states, progress bars, the "Done" pill, the habit streak note, and the highlight metric card. Text contrast satisfies WCAG AA guidelines.

---

## File Structure

```
index.html   — markup and all modals
style.css    — design system, tokens, components
script.js    — app state, routing, all controllers
package.json — project metadata and local serve script
LICENSE      — MIT license
```

All files are standalone static assets. Drop them in any web server or GitHub Pages repository — no build step or bundler needed.

---

## Data & Storage

Data is saved automatically on every change. The app tries two storage layers in order:

1. `window.storage` — persistent cloud storage if available (Claude / sandbox environment)
2. `localStorage` — browser-local fallback

The data schema is versioned (`v5.0`). Unique IDs are generated using `crypto.randomUUID()` with timestamp fallback.

---

## License & Contributing

Distributed under the MIT License. See `LICENSE` for more information.

### Known Limitations
- Local device storage only (no backend sync or multi-device real-time sync).
- Internet connection required for Google Fonts and Chart.js CDN (charts degrade gracefully if offline).
