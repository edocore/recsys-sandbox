"use client";

import { useMemo } from "react";

type CategoryStyle = {
  gradient: [string, string];
  accent: string;
  icon: string; // SVG path data
};

const STYLES: Record<string, CategoryStyle> = {
  AI: {
    gradient: ["#7C3AED", "#1E1B4B"],
    accent: "#C4B5FD",
    icon: "M12 2a5 5 0 0 0-5 5v1H6a3 3 0 0 0 0 6h1v1a5 5 0 0 0 5 5 5 5 0 0 0 5-5v-1h1a3 3 0 0 0 0-6h-1V7a5 5 0 0 0-5-5z",
  },
  SaaS: {
    gradient: ["#0EA5E9", "#0C4A6E"],
    accent: "#7DD3FC",
    icon: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6l-2 4-2-4H5a2 2 0 0 1-2-2V5z",
  },
  Hardware: {
    gradient: ["#F59E0B", "#7C2D12"],
    accent: "#FCD34D",
    icon: "M9 3v2H7a2 2 0 0 0-2 2v2H3v2h2v4H3v2h2v2a2 2 0 0 0 2 2h2v2h2v-2h4v2h2v-2h2a2 2 0 0 0 2-2v-2h2v-2h-2v-4h2V9h-2V7a2 2 0 0 0-2-2h-2V3h-2v2h-4V3H9zm-1 6h8v8H8V9z",
  },
  Crypto: {
    gradient: ["#F97316", "#7C2D12"],
    accent: "#FED7AA",
    icon: "M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.156-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727",
  },
  ClimateTech: {
    gradient: ["#10B981", "#064E3B"],
    accent: "#6EE7B7",
    icon: "M12 2L8 8h3v6H5v-2H2l4 6 4-6H7v-2h6v6h-3l4 6 4-6h-3v-6h3v2h3l-4-6-4 6h3v2h-6V8h3l-4-6z",
  },
  Robotics: {
    gradient: ["#EF4444", "#7F1D1D"],
    accent: "#FCA5A5",
    icon: "M12 2v2h-2a4 4 0 0 0-4 4v1H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v1a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-1h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2V8a4 4 0 0 0-4-4h-2V2h-2zm-2 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm4 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-4 5h4v1h-4v-1z",
  },
  Biotech: {
    gradient: ["#EC4899", "#831843"],
    accent: "#F9A8D4",
    icon: "M7 2v6.586L3.293 12.293A1 1 0 0 0 4 14h16a1 1 0 0 0 .707-1.707L17 8.586V2H7zm2 2h6v5.414l3 3V14H6v-1.586l3-3V4zm-2 12h10a3 3 0 0 1 0 6H7a3 3 0 0 1 0-6z",
  },
  FinTech: {
    gradient: ["#22C55E", "#14532D"],
    accent: "#86EFAC",
    icon: "M3 13l4-4 4 4 6-6 4 4M3 19h18",
  },
  DevTools: {
    gradient: ["#3B82F6", "#1E3A8A"],
    accent: "#93C5FD",
    icon: "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",
  },
  Design: {
    gradient: ["#A855F7", "#581C87"],
    accent: "#D8B4FE",
    icon: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.52-4.5-10-10-10zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
  },
};

const FALLBACK: CategoryStyle = {
  gradient: ["#475569", "#0F172A"],
  accent: "#94A3B8",
  icon: "M4 4h16v16H4z",
};

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Props = { id: string; category: string; title: string };

export default function CoverArt({ id, category, title }: Props) {
  const svg = useMemo(() => {
    const style = STYLES[category] ?? FALLBACK;
    const h = hashStr(id);
    // Per-item variation: angle + 3 deterministic shape positions
    const angle = (h % 360) - 180;
    const c1x = 20 + ((h >> 3) % 60);
    const c1y = 20 + ((h >> 7) % 50);
    const c1r = 80 + ((h >> 11) % 60);
    const c2x = 30 + ((h >> 13) % 60);
    const c2y = 50 + ((h >> 17) % 40);
    const c2r = 50 + ((h >> 19) % 50);
    const c3x = ((h >> 23) % 80) + 10;
    const c3y = ((h >> 5) % 60) + 30;
    const c3r = 30 + ((h >> 9) % 30);

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="g${h}" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0%" stop-color="${style.gradient[0]}"/>
      <stop offset="100%" stop-color="${style.gradient[1]}"/>
    </linearGradient>
    <radialGradient id="r${h}" cx="0.5" cy="0.5" r="0.6">
      <stop offset="0%" stop-color="${style.accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${style.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="400" height="500" fill="url(#g${h})"/>
  <circle cx="${c1x * 4}" cy="${c1y * 5}" r="${c1r}" fill="${style.accent}" fill-opacity="0.18"/>
  <circle cx="${c2x * 4}" cy="${c2y * 5}" r="${c2r}" fill="${style.accent}" fill-opacity="0.12"/>
  <circle cx="${c3x * 4}" cy="${c3y * 5}" r="${c3r}" fill="${style.accent}" fill-opacity="0.22"/>
  <rect width="400" height="500" fill="url(#r${h})"/>
  <g transform="translate(40, 380)" fill="${style.accent}" fill-opacity="0.95">
    <g transform="scale(2.5)">
      <path d="${style.icon}" stroke="${style.accent}" stroke-width="0.5" fill="${style.accent}" fill-opacity="0.85"/>
    </g>
  </g>
  <text x="40" y="80" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="13" font-weight="700" fill="white" fill-opacity="0.6" letter-spacing="2">${category.toUpperCase()}</text>
</svg>`.trim();
  }, [id, category]);

  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return (
    <div
      role="img"
      aria-label={`${category} cover for ${title}`}
      style={{
        width: "100%",
        aspectRatio: "4 / 5",
        backgroundImage: `url("${dataUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}
