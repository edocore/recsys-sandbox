"use client";

import { useEffect, useState } from "react";
import Fab from "@mui/material/Fab";
import Zoom from "@mui/material/Zoom";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import RefreshIcon from "@mui/icons-material/Refresh";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useFeedStore } from "@/store/feedStore";

const SCROLL_THRESHOLD = 600;

export default function BackToTopFab() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const refreshFeed = useFeedStore((s) => s.refreshFeed);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    if (busy) return;
    setBusy(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    refreshFeed();
    window.setTimeout(() => setBusy(false), 800);
  };

  return (
    <Zoom in={visible} unmountOnExit>
      <Fab
        color="secondary"
        onClick={handleClick}
        aria-label="back to top and refresh feed"
        sx={{
          position: "fixed",
          right: { xs: 16, sm: 24 },
          bottom: { xs: 16, sm: 24 },
          zIndex: (theme) => theme.zIndex.drawer + 2,
          boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
        }}
      >
        {busy ? (
          <Box sx={{ position: "relative", display: "grid", placeItems: "center" }}>
            <CircularProgress size={24} sx={{ color: "white" }} />
            <RefreshIcon
              sx={{
                position: "absolute",
                fontSize: 16,
                color: "white",
                opacity: 0.9,
              }}
            />
          </Box>
        ) : (
          <KeyboardArrowUpIcon />
        )}
      </Fab>
    </Zoom>
  );
}
