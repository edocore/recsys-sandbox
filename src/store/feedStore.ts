"use client";

import { create } from "zustand";

export type Weights = {
  dwellTime: number;
  categoryAffinity: number;
  exploration: number;
};

export type DwellEvent = {
  itemId: string;
  category: string;
  dwellMs: number;
  highIntent: boolean;
  at: number;
};

type FeedState = {
  weights: Weights;
  setWeight: (key: keyof Weights, value: number) => void;
  resetWeights: () => void;

  events: DwellEvent[];
  pushEvent: (e: DwellEvent) => void;
  clearEvents: () => void;

  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;

  explainerOpen: boolean;
  setExplainerOpen: (open: boolean) => void;

  refreshKey: number;
  refreshFeed: () => void;
};

const DEFAULT_WEIGHTS: Weights = {
  dwellTime: 60,
  categoryAffinity: 70,
  exploration: 25,
};

export const useFeedStore = create<FeedState>((set) => ({
  weights: DEFAULT_WEIGHTS,
  setWeight: (key, value) =>
    set((s) => ({ weights: { ...s.weights, [key]: value } })),
  resetWeights: () => set({ weights: DEFAULT_WEIGHTS }),

  events: [],
  pushEvent: (e) =>
    set((s) => ({ events: [...s.events.slice(-199), e] })),
  clearEvents: () => set({ events: [] }),

  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),

  explainerOpen: false,
  setExplainerOpen: (open) => set({ explainerOpen: open }),

  refreshKey: 0,
  refreshFeed: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
}));
