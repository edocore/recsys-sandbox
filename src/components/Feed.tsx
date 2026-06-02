"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import FeedCard from "@/components/FeedCard";
import items from "@/data/items.json";
import { rerank, type Item } from "@/lib/recsys";
import { useFeedStore } from "@/store/feedStore";

const PAGE_SIZE = 12;
const RENDERED_LOCK = 8;

const ALL_ITEMS = items as Item[];

export default function Feed() {
  const weights = useFeedStore((s) => s.weights);
  const events = useFeedStore((s) => s.events);
  const refreshKey = useFeedStore((s) => s.refreshKey);

  const [rendered, setRendered] = useState<Item[]>(() =>
    ALL_ITEMS.slice(0, PAGE_SIZE),
  );
  const [refreshing, setRefreshing] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const seedRef = useRef<string>(Math.random().toString(36).slice(2));

  // Refresh-trigger effect: scroll to top, briefly show loading, regenerate seed,
  // and rebuild the first page using current weights + accumulated signal.
  useEffect(() => {
    if (refreshKey === 0) return;
    setRefreshing(true);
    seedRef.current = Math.random().toString(36).slice(2);
    const timer = window.setTimeout(() => {
      const candidates = [...ALL_ITEMS];
      const sorted =
        events.length === 0
          ? candidates
          : rerank(candidates, weights, events, seedRef.current);
      setRendered(sorted.slice(0, PAGE_SIZE));
      setRefreshing(false);
    }, 600);
    return () => window.clearTimeout(timer);
    // We intentionally only want this to re-run when refreshKey changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const loadMore = useCallback(() => {
    setRendered((current) => {
      if (current.length >= ALL_ITEMS.length) return current;
      const remaining = ALL_ITEMS.filter(
        (it) => !current.some((c) => c.id === it.id),
      );
      const sorted =
        events.length === 0
          ? remaining
          : rerank(remaining, weights, events, seedRef.current);
      const next = sorted.slice(0, PAGE_SIZE);
      return [...current, ...next];
    });
  }, [weights, events]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) loadMore();
        }
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    setRendered((current) => {
      if (current.length <= RENDERED_LOCK || events.length === 0) return current;
      const locked = current.slice(0, RENDERED_LOCK);
      const tail = current.slice(RENDERED_LOCK);
      const tailIds = new Set(tail.map((i) => i.id));
      const candidates = ALL_ITEMS.filter(
        (it) => !locked.some((l) => l.id === it.id),
      );
      const reranked = rerank(candidates, weights, events, seedRef.current);
      const newTail: Item[] = [];
      for (const it of reranked) {
        if (newTail.length >= tail.length) break;
        if (tailIds.has(it.id) || newTail.length < tail.length) {
          newTail.push(it);
        }
      }
      return [...locked, ...newTail];
    });
  }, [weights, events.length]);

  return (
    <Box
      component="main"
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 1.25, sm: 2, md: 3 },
        py: { xs: 1.5, sm: 3 },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: { xs: 1.5, sm: 2 },
            opacity: refreshing ? 0.4 : 1,
            transition: "opacity 200ms ease",
          }}
        >
          {rendered.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </Box>
        {refreshing && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              pt: 6,
              pointerEvents: "none",
            }}
          >
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.96)",
                px: 3,
                py: 1.5,
                borderRadius: 999,
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <CircularProgress size={20} sx={{ color: "secondary.main" }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Refreshing feed…
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Box
        ref={sentinelRef}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 6,
          gap: 1,
        }}
      >
        {rendered.length < ALL_ITEMS.length ? (
          <>
            <CircularProgress size={28} sx={{ color: "secondary.main" }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Re-ranking next batch…
            </Typography>
          </>
        ) : (
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            You&rsquo;ve reached the end of the catalog · {ALL_ITEMS.length} items
          </Typography>
        )}
      </Box>
    </Box>
  );
}
