# AISolutionsOS Performance Autoresearch

> SignalSpeed Lab — Turn website speed tests into repeatable optimization systems.

A local-first web app combining a dark technical Lighthouse optimizer dashboard with a clean report-style performance research view. Built for founders and developers who want to track, experiment, and improve site performance systematically.

## Quick Start

```bash
cd performance-autoresearch
npm install
npm run dev
```

Then open: **http://localhost:5173**

The API server runs on **http://localhost:3001**

## Demo Data (optional)

Seed a demo project with realistic runs and experiments to explore the UI immediately:

```bash
node scripts/seed.mjs
```

Then open: http://localhost:5173/project/demo-project-001

## Requirements

- **Node.js** 18+ (LTS recommended)
- **Chrome or Chromium** — required for real Lighthouse audits

### Chrome install (if needed)

**Ubuntu/Debian:**
```bash
sudo apt-get install -y google-chrome-stable
```

**macOS:**
```bash
brew install --cask google-chrome
```

If Chrome is not available, the audit fails gracefully with a clear error. All other features (experiments, status tracking, report generation) still work without Chrome.

## Architecture

```
performance-autoresearch/
├── src/                    # React frontend (Vite + TypeScript)
│   ├── components/         # Shared UI components
│   ├── pages/              # Route pages
│   ├── lib/                # API client, helpers, templates
│   └── types/              # TypeScript types
├── server/                 # Express API server
│   ├── routes/             # REST endpoints
│   ├── services/           # Lighthouse runner, comparison logic
│   └── storage/            # JSON file DB
├── data/                   # JSON storage (persisted locally)
│   ├── projects.json
│   ├── runs.json
│   └── experiments.json
└── scripts/
    └── seed.mjs            # Demo data seeder
```

## App Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/` | Project cards, global stats, New Audit CTA |
| New Audit | `/new-audit` | Create project + run baseline Lighthouse audit |
| Project Audit | `/project/:id` | Lab View + Report View with charts |
| Report Export | `/project/:id/report` | Markdown + JSON export |

## API Endpoints

```
GET    /api/health
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
GET    /api/projects/:id/runs
GET    /api/projects/:id/experiments
GET    /api/projects/:id/stats
GET    /api/projects/:id/report

POST   /api/audits/baseline/sync    # Runs Lighthouse, blocks until done
POST   /api/audits/experiment       # Runs experiment audit with comparison
PATCH  /api/audits/runs/:id/status  # Override keep/discard/review

POST   /api/experiments
GET    /api/experiments/:id
PATCH  /api/experiments/:id/status
```

## Keep/Discard Logic

Auto-suggested status after each experiment run:

| Condition | Suggestion |
|-----------|------------|
| Score drops > 2 pts | Discard |
| LCP improves ≥ 5% | Keep |
| Score +2 and LCP stable | Keep |
| Mixed results | Review |

Users can always manually override via the status dropdown.

## Branding & Colors

Edit **`tailwind.config.js`** to change the color scheme:

- `signal.*` — Primary accent (indigo/blue)
- `navy.*` — Background shades
- `panel`, `card`, `border` — Surface colors

For logo/name: Edit **`src/components/Layout.tsx`** (the `<nav>` section).

## Tech Stack

- **Frontend:** React 19, Vite 8, TypeScript, Tailwind CSS 3, Recharts, React Router 7
- **Backend:** Express 5, tsx
- **Audit:** Lighthouse 13, chrome-launcher
- **Storage:** Local JSON files (no database needed)

## Phase 2 Roadmap

- Automated code edits in a sandboxed workspace
- Multiple URL comparison (staging vs production)
- CI integration via webhooks
- Historical trend tracking across weeks/months
- Slack/email digest reports
