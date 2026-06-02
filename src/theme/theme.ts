"use client";

import { createTheme } from "@mui/material/styles";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: "#0F0F0F" },
    secondary: { main: "#FF0033" },
    background: {
      default: "#F9F9F9",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F0F0F",
      secondary: "#606060",
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h6: { fontWeight: 600 },
    body2: { color: "#606060" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
          transition: "box-shadow 200ms ease, transform 200ms ease",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255,255,255,0.85)",
          backdropFilter: "saturate(180%) blur(12px)",
          color: "#0F0F0F",
          boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
        },
      },
    },
  },
});

export default theme;
