# 2026 Strategic Tracker

A personal life management dashboard built as a portfolio project. Calm, nature-inspired design with a white base, soft grey tones, and a single muted sage green accent. All data persists locally — no server required.

---

## Overview

The tracker is organized around a four-pillar priority framework:

1. **Academic Excellence** — thesis and university coursework
2. **Spiritual & Physical** — religious practices and sports routine
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

The design uses one accent color throughout. Sage green appears on active navigation states, progress bars, the "Done" pill, the habit streak note, and the highlight metric card. Nothing else is colored.

---

## File Structure

```
index.html   — markup and all modals
style.css    — design system, tokens, components
script.js    — app state, routing, all controllers
```

All three files are standalone. Drop them in any folder and open `index.html` in a browser — no build step, no dependencies to install.

The only external resources loaded are:
- Google Fonts (Playfair Display + Plus Jakarta Sans)
- Chart.js 4.4.0 via CDN (for the Analytics charts)

---

## Data & Storage

Data is saved automatically on every change. The app tries two storage layers in order:

1. `window.storage` — persistent cloud storage if available (Claude artifacts environment)
2. `localStorage` — browser-local fallback

The data schema is versioned (`v5.0`). If the schema version does not match, the app starts fresh rather than loading corrupted state.

You can export a full JSON backup at any time using the **Export** button in the sidebar.

### Data schema

```json
{
  "version": "5.0",
  "goals": [
    {
      "id": 1700000000000,
      "name": "Complete thesis chapter 3",
      "category": "academic",
      "progress": 60,
      "milestone": "Submit draft to supervisor",
      "createdAt": "2026-01-15T09:00:00.000Z"
    }
  ],
  "languages": [
    {
      "id": 1700000000001,
      "name": "Arabic",
      "status": "active",
      "level": "B1",
      "hours": 240,
      "createdAt": "2026-01-10T08:00:00.000Z"
    }
  ],
  "certifications": [
    {
      "id": 1700000000002,
      "name": "CompTIA Security+",
      "description": "Studying with Professor Messer and practice exams.",
      "hours": 40,
      "estHours": 120,
      "createdAt": "2026-02-01T10:00:00.000Z"
    }
  ],
  "habits": [
    {
      "id": 1700000000003,
      "name": "Morning prayer",
      "category": "spiritual",
      "target": 20,
      "completed": false,
      "streak": 5,
      "lastCompleted": "Wed Mar 23 2026",
      "createdAt": "2026-01-01T06:00:00.000Z"
    }
  ],
  "weeklyRoutine": [
    {
      "id": 1700000000004,
      "day": "Monday",
      "time": "8:00–10:00 AM",
      "activity": "Thesis writing",
      "duration": 120,
      "done": false
    }
  ]
}
```

---

## Keyboard & Navigation

| Action | How |
|---|---|
| Navigate sections | Click sidebar links or bottom mobile nav |
| Close any modal | Press `Escape` or click the backdrop |
| Export data | Export button in sidebar footer |

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). No Internet Explorer support. Requires JavaScript enabled.

---

## Notes

- The **2 + 4 language rule** is enforced — adding a third active language shows a warning and prevents saving. Set one existing language to Maintenance first.
- Habit streaks reset automatically. If you do not mark a habit done on a given day, its streak returns to zero the next time you open the app.
- The estimated certification finish date assumes a pace of **2 study hours per day**. Adjust your hours completed regularly to keep the estimate accurate.
- All IDs are Unix timestamps in milliseconds, which guarantees uniqueness without a database.
