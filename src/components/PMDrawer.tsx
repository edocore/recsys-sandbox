"use client";

import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useFeedStore, type Weights } from "@/store/feedStore";
import { useMemo } from "react";

const SLIDERS: Array<{
  key: keyof Weights;
  label: string;
  hint: string;
}> = [
  {
    key: "dwellTime",
    label: "Dwell time weight",
    hint: "How heavily seconds-on-card boost similar future content.",
  },
  {
    key: "categoryAffinity",
    label: "Category affinity weight",
    hint: "Push categories the user has lingered on toward the top.",
  },
  {
    key: "exploration",
    label: "Exploration / randomness",
    hint: "Inject unrelated content to break the echo chamber.",
  },
];

export default function PMDrawer() {
  const open = useFeedStore((s) => s.drawerOpen);
  const setOpen = useFeedStore((s) => s.setDrawerOpen);
  const weights = useFeedStore((s) => s.weights);
  const setWeight = useFeedStore((s) => s.setWeight);
  const reset = useFeedStore((s) => s.resetWeights);
  const events = useFeedStore((s) => s.events);
  const clearEvents = useFeedStore((s) => s.clearEvents);

  const topCategories = useMemo(() => {
    const tally: Record<string, number> = {};
    for (const e of events) {
      tally[e.category] = (tally[e.category] ?? 0) + Math.min(e.dwellMs, 8000);
    }
    return Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [events]);

  const highIntent = events.filter((e) => e.highIntent).length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "92vw", sm: 380 },
            maxWidth: 420,
            bgcolor: "rgba(255,255,255,0.96)",
            backdropFilter: "saturate(180%) blur(20px)",
          },
        },
      }}
    >
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center" }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            PM Dashboard
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Tune the algorithm
          </Typography>
        </Box>
        <IconButton onClick={() => setOpen(false)} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 3 }}>
        {SLIDERS.map(({ key, label, hint }) => (
          <Box key={key}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {label}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {weights[key]}
              </Typography>
            </Box>
            <Slider
              value={weights[key]}
              onChange={(_, v) => setWeight(key, v as number)}
              min={0}
              max={100}
              size="small"
              sx={{ color: "secondary.main" }}
            />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {hint}
            </Typography>
          </Box>
        ))}

        <Button
          variant="text"
          startIcon={<RestartAltIcon />}
          onClick={reset}
          sx={{ alignSelf: "flex-start" }}
        >
          Reset to defaults
        </Button>
      </Box>

      <Divider />

      <Box sx={{ p: 2.5 }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          Live telemetry
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Chip
            size="small"
            label={`${events.length} events`}
            color="default"
            variant="outlined"
          />
          <Chip
            size="small"
            label={`${highIntent} high-intent`}
            color="secondary"
            variant="outlined"
          />
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Top categories by dwell
        </Typography>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
          {topCategories.length === 0 && (
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              Scroll the feed to start collecting signal.
            </Typography>
          )}
          {topCategories.map(([cat, ms]) => (
            <Box key={cat} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 80, fontSize: 12, color: "text.secondary" }}>{cat}</Box>
              <Box sx={{ flexGrow: 1, height: 6, bgcolor: "rgba(0,0,0,0.06)", borderRadius: 3 }}>
                <Box
                  sx={{
                    width: `${Math.min(100, (ms / Math.max(...topCategories.map(([, v]) => v))) * 100)}%`,
                    height: "100%",
                    bgcolor: "secondary.main",
                    borderRadius: 3,
                  }}
                />
              </Box>
              <Box sx={{ width: 56, fontSize: 12, color: "text.secondary", textAlign: "right" }}>
                {(ms / 1000).toFixed(1)}s
              </Box>
            </Box>
          ))}
        </Box>
        {events.length > 0 && (
          <Button
            size="small"
            variant="text"
            onClick={clearEvents}
            sx={{ mt: 1.5, color: "text.secondary" }}
          >
            Clear telemetry
          </Button>
        )}
      </Box>
    </Drawer>
  );
}
