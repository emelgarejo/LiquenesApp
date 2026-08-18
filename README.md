# Chama Lichen Bioindicator Heatmap

Static Vite + TypeScript map for a **local science-fair** demo of provisional lichen sampling in Urbanización Chama (Santiago de Surco, Lima).

This project is **local-only for v1**. There is no production deploy. Serve with Vite (`dev` / `preview`) on localhost. Opening `dist/index.html` via `file://` is **unsupported**.

## Prerequisites

- Node.js 20+
- A Google Maps JavaScript API key with billing enabled

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and set VITE_GOOGLE_MAPS_API_KEY
```

### Maps key HTTP referrers (science fair)

Restrict the browser key by **HTTP referrer** to local Vite origins (not IP restrictions):

- `http://localhost:5173/*`
- `http://127.0.0.1:5173/*`
- `http://localhost:4173/*`
- `http://127.0.0.1:4173/*`

Also restrict the key to the **Maps JavaScript API** only and set a quota/billing alert. Never commit a live key.

## Run locally

```bash
npm run dev
# or production-like:
npm run build
npm run preview
```

## Tests

```bash
npm test
```

## Manual checklist (science fair)

With `npm run preview` (or `dev`) and a valid local Maps key:

1. **Map** loads with Google basemap centered on Chama.
2. **Boundary** polygon (Higuereta–Benavides–Valle del Sur–Aviación) is visible.
3. **Semáforo** markers show by default (good / moderate / poor colors).
4. **Legend** explains good, moderate, and poor.
5. **Provisional notice** is visible in the header.
6. **Heat toggle** enables a deck.gl heat overlay from study weights; legend gains a heat row.
7. **Missing-key error**: remove/blank `VITE_GOOGLE_MAPS_API_KEY`, restart, and confirm an explicit config error (not a blank page).

## Data

- Study dataset: `public/data/chama-study.json` (provisional)
- Boundary: `public/data/chama-boundary.geojson` (digitized Chama box)

`avgCoverByMorphology` values are averages over **lichen-bearing trees only**. Prevalence = `treesWithLichen / treesExamined`. Heat weight = prevalence × total cover.
