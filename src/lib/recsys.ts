import type { DwellEvent, Weights } from "@/store/feedStore";

export type Item = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  author: string;
  readMinutes: number;
  imageUrl: string | null;
  imageCredit: { photographer: string; url: string } | null;
};

const RECENCY_HALF_LIFE_MS = 60_000;

function categoryAffinityScores(events: DwellEvent[]): Record<string, number> {
  const now = Date.now();
  const totals: Record<string, number> = {};
  for (const e of events) {
    const ageMs = now - e.at;
    const decay = Math.pow(0.5, ageMs / RECENCY_HALF_LIFE_MS);
    const intentBoost = e.highIntent ? 2 : 1;
    const dwellWeight = Math.min(e.dwellMs, 8000) / 1000;
    totals[e.category] = (totals[e.category] ?? 0) + decay * intentBoost * dwellWeight;
  }
  let max = 0;
  for (const v of Object.values(totals)) if (v > max) max = v;
  if (max === 0) return {};
  const norm: Record<string, number> = {};
  for (const [k, v] of Object.entries(totals)) norm[k] = v / max;
  return norm;
}

function dwellSignal(events: DwellEvent[]): number {
  if (events.length === 0) return 0;
  const last = events.slice(-10);
  const avg = last.reduce((s, e) => s + Math.min(e.dwellMs, 8000), 0) / last.length;
  return avg / 8000;
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

export function rerank(
  items: Item[],
  weights: Weights,
  events: DwellEvent[],
  seed: string,
): Item[] {
  if (events.length === 0) return items;

  const affinity = categoryAffinityScores(events);
  const dwell = dwellSignal(events);

  const wAffinity = weights.categoryAffinity / 100;
  const wDwell = weights.dwellTime / 100;
  const wExplore = weights.exploration / 100;

  return [...items]
    .map((item) => {
      const aff = affinity[item.category] ?? 0;
      const random = hashStr(seed + item.id);
      const score =
        wAffinity * aff +
        wDwell * dwell * aff +
        wExplore * random;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
