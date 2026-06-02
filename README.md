# recsys sandbox

A scrollable feed where you can tune a recommendation algorithm in real time and watch the feed respond. Built as a portfolio piece to make the invisible mechanics of modern recsys legible to non-engineers.

---

## Problem statement

Most people interact with recommender systems every day — YouTube, TikTok, Instagram, Spotify, Amazon — but the way those systems work is invisible. Users see "the feed." They don't see:

- **The signals being collected** (dwell time, scroll velocity, replays, skips, taps).
- **The weights that turn signals into ranking** (how heavily does dwell time count vs. category affinity? How much exploration is injected to break echo chambers?).
- **The trade-offs PMs and ML engineers actually argue about** (engagement vs. diversity, recency vs. depth, exploration vs. exploitation).

For a Product Manager working on or alongside a recsys-driven product, this opacity is a real problem:

1. **Stakeholder communication is hard.** It's tough to explain to leadership, sales, or legal *why* the feed shifted — or what changes if you re-weight a signal.
2. **Hypothesis generation is slow.** Without a way to feel how weights interact, ideas like "let's increase exploration for new users" stay abstract until an A/B test runs.
3. **PM/engineer alignment costs cycles.** "What if we cared more about dwell?" is a conversation; making it a sandbox demo collapses it into a 30-second loop.

## Purpose of this proof of concept

This is **not** a production recsys, and not a ML system. It's a **didactic sandbox** — a stripped-down implementation of the recsys mental model, instrumented and exposed.

It demonstrates four ideas a PM should be able to point at and explain:

1. **Implicit signals dominate.** Dwell time on a card produces more signal than an explicit like. Watch the telemetry counter increment as you linger.
2. **Affinity profiles decay.** What you watched 30 seconds ago weighs more than what you watched 5 minutes ago. The category-affinity bar chart in the PM Dashboard reflects this in real time.
3. **Weights are levers, not switches.** Slide *Category Affinity* up and the feed narrows toward your dwell history; slide *Exploration* up and unrelated content reappears. The interaction between the two is the actual product decision.
4. **Already-rendered content is locked.** Production feeds re-rank the *upcoming* queue, never the cards a user is currently looking at. The first 8 rendered cards stay put on weight changes — only the tail re-ranks.

### What it does

- **Infinite feed** of 500 mock items spanning 10 tech/startup categories (AI, SaaS, Crypto, FinTech, ClimateTech, Robotics, Biotech, Hardware, DevTools, Design).
- **PM Dashboard** (slide-out drawer, top-right tune icon): three weight sliders + live telemetry showing the user's evolving interest profile.
- **First-visit explainer** (re-openable via the "?" icon) framing the four core recsys concepts.
- **Back-to-top FAB** that scrolls up *and* refreshes the feed, applying the latest weights to the first batch — useful for demoing how a hard refresh would behave with the user's current signal profile.
- **Per-card telemetry** via `IntersectionObserver`: dwell time is captured the moment a card crosses 60% visibility, and pushed to the store when it leaves view. Cards over 2.5s dwell are flagged as high-intent.

### What it deliberately does *not* do

- No real ML model. The "recsys" is a deterministic scoring function (`src/lib/recsys.ts`) — affinity × dwell × exploration, with time-decay on signals. Enough fidelity to feel right; honest enough not to mislead.
- No backend. Everything runs in the browser. No user accounts, no persistence beyond `localStorage`.
- No collaborative filtering. The explainer overlay describes "similar users" as a concept; the actual implementation only uses the current session's signal.

---

## Tech stack

- **Next.js 16** (App Router) + **React 19.2**
- **Material UI v7** for the YouTube/Google Material aesthetic
- **Zustand** for client-side state (weights, telemetry events, refresh trigger)
- **TypeScript** throughout
- **Pexels-sourced cover photos** fetched at build time per category, with a programmatic SVG fallback (`CoverArt.tsx`) for any item without a photo.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Regenerating the mock data

`src/data/items.json` is committed and used as-is at build time. To regenerate it (titles, authors, and Pexels cover photos):

```bash
echo "PEXELS_API_KEY=your_key_here" > .env.local
npm run generate
```

Without `PEXELS_API_KEY`, items are generated with `imageUrl: null` and the `CoverArt` SVG fallback renders instead.

## Project layout

```
src/
  app/
    layout.tsx        # MUI theme provider, Roboto font, metadata
    page.tsx          # Composes TopBar + Feed + PMDrawer + ExplainerOverlay + BackToTopFab
  components/
    TopBar.tsx        # Sticky AppBar with help + tune icons
    Feed.tsx          # Infinite scroll, refresh logic, queue re-rank
    FeedCard.tsx      # Card + IntersectionObserver dwell tracking
    CoverArt.tsx      # Programmatic per-category SVG covers
    PMDrawer.tsx      # Right-side weight sliders + live telemetry
    ExplainerOverlay.tsx  # First-visit modal explaining recsys concepts
    BackToTopFab.tsx  # Bottom-right FAB; scroll-up + refresh
  lib/
    recsys.ts         # Scoring function: affinity × dwell × exploration, with decay
  store/
    feedStore.ts      # Zustand store: weights, events, drawerOpen, refreshKey
  data/
    items.json        # 500 mock items (generated; not hand-curated)
  theme/
    theme.ts          # MUI theme: light, Roboto, YouTube-ish accents
scripts/
  generate-data.mjs   # Run with `node scripts/generate-data.mjs` to regenerate items.json
```

## Build & deploy

```bash
npm run build
npm run start
```
