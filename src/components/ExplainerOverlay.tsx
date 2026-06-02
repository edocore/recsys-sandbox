"use client";

import { useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TimerIcon from "@mui/icons-material/Timer";
import LayersIcon from "@mui/icons-material/Layers";
import GroupsIcon from "@mui/icons-material/Groups";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import { useFeedStore } from "@/store/feedStore";

const STORAGE_KEY = "recsys-sandbox:explainer-seen";

export default function ExplainerOverlay() {
  const open = useFeedStore((s) => s.explainerOpen);
  const setOpen = useFeedStore((s) => s.setExplainerOpen);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, [setOpen]);

  const close = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            mx: { xs: 2, sm: 4 },
            my: { xs: 2, sm: 4 },
            maxHeight: { xs: "calc(100dvh - 32px)", sm: "calc(100dvh - 64px)" },
            overflow: "hidden",
          },
        },
        backdrop: {
          sx: { backdropFilter: "blur(8px)", bgcolor: "rgba(15,15,15,0.55)" },
        },
      }}
    >
      <IconButton
        aria-label="close"
        onClick={close}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 2,
          bgcolor: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(4px)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ pt: 4, pb: 2, px: { xs: 3, sm: 4 } }}>
        <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 700 }}>
          Welcome
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, lineHeight: 1.2 }}>
          This is an experiment in how feeds get built.
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
          Modern recsys (YouTube, TikTok, Instagram) don&rsquo;t recommend
          content from rules — they learn from billions of micro-signals
          every minute. This sandbox lets you scroll a feed and see those
          signals being collected, then tune the weights live.
        </Typography>

        <Stack spacing={2} sx={{ mt: 3 }}>
          <Signal
            icon={<TimerIcon fontSize="small" />}
            title="Implicit signals"
            body="Dwell time, scroll velocity, taps, replays. The card you stop on for 4 seconds tells the algorithm more than the one you like."
          />
          <Signal
            icon={<LayersIcon fontSize="small" />}
            title="Category affinity"
            body="The feed builds a fading interest profile from what you've watched recently. Old signals decay; fresh ones dominate."
          />
          <Signal
            icon={<GroupsIcon fontSize="small" />}
            title="Similar users (collaborative filtering)"
            body="In production, your behavior is matched to thousands of users with similar patterns. Their next-best item becomes your next-best item."
          />
          <Signal
            icon={<ShuffleIcon fontSize="small" />}
            title="Exploration"
            body="A controlled dose of randomness keeps the feed from collapsing into an echo chamber and surfaces new interests."
          />
        </Stack>

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(255,0,51,0.06)",
            border: "1px solid rgba(255,0,51,0.18)",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Tap the tune icon (top right) at any time to adjust weights.
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Already-rendered cards stay put — only upcoming items get
            re-ranked, mirroring how production feeds avoid jarring shifts.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 3, sm: 4 }, pb: 3, pt: 1 }}>
        <Button onClick={close} variant="contained" color="secondary" size="large" fullWidth>
          Start scrolling
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Signal({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 2,
          bgcolor: "rgba(0,0,0,0.05)",
          display: "grid",
          placeItems: "center",
          color: "text.primary",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {body}
        </Typography>
      </Box>
    </Box>
  );
}
