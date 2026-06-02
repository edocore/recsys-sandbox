"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TuneIcon from "@mui/icons-material/Tune";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import { useFeedStore } from "@/store/feedStore";

export default function TopBar() {
  const setDrawerOpen = useFeedStore((s) => s.setDrawerOpen);
  const setExplainerOpen = useFeedStore((s) => s.setExplainerOpen);

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.01em",
              fontSize: { xs: "1rem", sm: "1.15rem" },
            }}
          >
            recsys sandbox
          </Typography>
        </Box>
        <IconButton
          aria-label="about this sandbox"
          onClick={() => setExplainerOpen(true)}
          size="large"
          sx={{ color: "text.secondary" }}
        >
          <HelpOutlineIcon />
        </IconButton>
        <IconButton
          aria-label="open recommender controls"
          onClick={() => setDrawerOpen(true)}
          size="large"
          sx={{ color: "text.primary" }}
        >
          <TuneIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
