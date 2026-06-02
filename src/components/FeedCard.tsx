"use client";

import { useEffect, useRef } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import type { Item } from "@/lib/recsys";
import { useFeedStore } from "@/store/feedStore";
import CoverArt from "@/components/CoverArt";

const HIGH_INTENT_MS = 2500;

const CATEGORY_COLORS: Record<string, string> = {
  AI: "#7C3AED",
  SaaS: "#0EA5E9",
  Hardware: "#F59E0B",
  Crypto: "#F97316",
  ClimateTech: "#10B981",
  Robotics: "#EF4444",
  Biotech: "#EC4899",
  FinTech: "#22C55E",
  DevTools: "#3B82F6",
  Design: "#A855F7",
};

type Props = { item: Item };

export default function FeedCard({ item }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const enteredAt = useRef<number | null>(null);
  const pushEvent = useFeedStore((s) => s.pushEvent);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.6) {
            if (enteredAt.current === null) {
              enteredAt.current = performance.now();
            }
          } else if (enteredAt.current !== null) {
            const dwellMs = performance.now() - enteredAt.current;
            enteredAt.current = null;
            if (dwellMs > 250) {
              pushEvent({
                itemId: item.id,
                category: item.category,
                dwellMs,
                highIntent: dwellMs >= HIGH_INTENT_MS,
                at: Date.now(),
              });
            }
          }
        }
      },
      { threshold: [0, 0.6, 1] },
    );

    observer.observe(node);

    const flushOnHide = () => {
      if (document.hidden && enteredAt.current !== null) {
        const dwellMs = performance.now() - enteredAt.current;
        enteredAt.current = null;
        if (dwellMs > 250) {
          pushEvent({
            itemId: item.id,
            category: item.category,
            dwellMs,
            highIntent: dwellMs >= HIGH_INTENT_MS,
            at: Date.now(),
          });
        }
      }
    };
    document.addEventListener("visibilitychange", flushOnHide);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", flushOnHide);
    };
  }, [item.id, item.category, pushEvent]);

  const catColor = CATEGORY_COLORS[item.category] ?? "#0F0F0F";

  return (
    <Card
      ref={ref}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ position: "relative", width: "100%", aspectRatio: "4 / 5", overflow: "hidden", bgcolor: "rgba(0,0,0,0.04)" }}>
        {item.imageUrl ? (
          <Box
            component="img"
            src={item.imageUrl}
            alt={`${item.category} cover for ${item.title}`}
            loading="lazy"
            decoding="async"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <CoverArt id={item.id} category={item.category} title={item.title} />
        )}
        <Chip
          label={item.category}
          size="small"
          sx={{
            position: "absolute",
            top: { xs: 6, sm: 12 },
            left: { xs: 6, sm: 12 },
            height: { xs: 18, sm: 24 },
            bgcolor: "rgba(0,0,0,0.55)",
            color: "white",
            fontWeight: 600,
            fontSize: { xs: 9, sm: 12 },
            letterSpacing: "0.02em",
            backdropFilter: "blur(4px)",
            "& .MuiChip-label": {
              px: { xs: 0.75, sm: 1.25 },
            },
          }}
        />
      </Box>
      <CardContent
        sx={{
          p: { xs: 1, sm: 2 },
          "&:last-child": { pb: { xs: 1, sm: 2 } },
        }}
      >
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: { xs: 12, sm: 16 },
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title}
        </Typography>
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: { xs: 10, sm: 14 },
            lineHeight: 1.35,
            mt: 0.5,
            display: { xs: "none", sm: "-webkit-box" },
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.subtitle}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: { xs: 0.75, sm: 1.5 },
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          <Avatar
            sx={{
              width: { xs: 16, sm: 24 },
              height: { xs: 16, sm: 24 },
              fontSize: { xs: 8, sm: 12 },
              bgcolor: catColor,
            }}
          >
            {item.author
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </Avatar>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: { xs: 9, sm: 12 },
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              {item.author} ·{" "}
            </Box>
            {item.readMinutes} min
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
