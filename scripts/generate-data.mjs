import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Per-category Pexels search queries — tuned in HANDOFF.md to favour relevance.
const PEXELS_QUERIES = {
  AI: ["neural network abstract", "data visualization"],
  SaaS: ["office workspace", "laptop desk"],
  Hardware: ["circuit board", "semiconductor"],
  Crypto: ["bitcoin coin", "gold coin stack"],
  ClimateTech: ["solar panels", "wind turbines"],
  Robotics: ["industrial robot", "humanoid robot"],
  Biotech: ["laboratory microscope", "biotech lab"],
  FinTech: ["finance chart", "trading screen"],
  DevTools: ["code editor", "developer keyboard"],
  Design: ["design studio", "color palette"],
};

const PHOTOS_PER_CATEGORY = 18;

async function fetchPexelsForQuery(query, perPage, apiKey) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    query,
  )}&per_page=${perPage}&orientation=portrait&size=medium`;
  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) {
    throw new Error(`Pexels ${res.status} for "${query}": ${await res.text()}`);
  }
  const json = await res.json();
  return (json.photos ?? []).map((p) => ({
    src: p.src.large,
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
    pexelsUrl: p.url,
  }));
}

async function buildCategoryPhotoMap(apiKey) {
  const map = {};
  for (const [cat, queries] of Object.entries(PEXELS_QUERIES)) {
    const perQuery = Math.ceil(PHOTOS_PER_CATEGORY / queries.length);
    const photos = [];
    for (const q of queries) {
      const batch = await fetchPexelsForQuery(q, perQuery, apiKey);
      photos.push(...batch);
    }
    // Dedup by src in case two queries returned the same photo.
    const seen = new Set();
    map[cat] = photos.filter((p) => {
      if (seen.has(p.src)) return false;
      seen.add(p.src);
      return true;
    });
    console.log(`  ${cat}: ${map[cat].length} photos`);
  }
  return map;
}

const CATEGORIES = {
  AI: {
    titles: [
      "Why agentic LLMs are eating internal tooling",
      "The cost curve behind GPT-class inference",
      "Evals are the new unit tests",
      "Multimodal models hit the enterprise floor",
      "Vector DBs vs. plain Postgres in 2026",
      "Fine-tuning is dead. Long live distillation.",
      "RAG patterns that actually scale past 10M docs",
      "How OpenAI quietly rebuilt its training stack",
      "Why your AI app needs a router, not a model",
      "Inference economics: GPU-hours per active user",
      "Anthropic's interpretability bets are paying off",
      "Open weights closed the gap — what now?",
      "Synthetic data crossed 50% of training budgets",
    ],
  },
  SaaS: {
    titles: [
      "PLG is over. Sales-led B2B is back.",
      "The vertical SaaS playbook for 2026",
      "Why 'seat-based pricing' is collapsing",
      "Usage-based billing: lessons from Snowflake",
      "How Linear hit $200M ARR with 90 people",
      "Notion's enterprise pivot, by the numbers",
      "The unbundling of Salesforce continues",
      "Why every SaaS founder is shipping an agent",
      "Multi-tenant churn benchmarks for mid-market",
      "Net revenue retention is the only metric",
      "Product-led growth is dead in vertical SaaS",
      "ARR per employee crossed $1M for top decile",
    ],
  },
  Hardware: {
    titles: [
      "Apple's M5 brings on-device LLMs to the masses",
      "The custom silicon arms race no one expected",
      "Inside Nvidia's $5T moat — and its cracks",
      "Why every hyperscaler is building chips now",
      "ARM laptops finally crossed 30% market share",
      "RISC-V's quiet path into datacenters",
      "The thermal limits of edge AI inference",
      "Tesla's Dojo, three years later",
      "Why Humane and Rabbit failed (and what's next)",
      "Photonic compute is closer than you think",
      "Custom NPUs in every flagship phone by 2027",
    ],
  },
  Crypto: {
    titles: [
      "Stablecoins quietly became the killer app",
      "Tokenized treasuries cross $200B AUM",
      "Why Solana ate Ethereum's L2 lunch",
      "On-chain identity is finally usable",
      "Restaking economics, simplified",
      "The end of the L2 thesis",
      "How Stripe rebuilt payments on USDC rails",
      "Crypto's compliance layer is a $10B market",
      "Bitcoin ETFs reshaped institutional flows",
      "Why every fintech is launching a stablecoin",
    ],
  },
  ClimateTech: {
    titles: [
      "Why DAC pricing finally hit $200/ton",
      "The grid is the bottleneck for everything",
      "Long-duration storage breakthroughs in Q1",
      "How CATL is locking up battery supply",
      "Geothermal's unexpected comeback",
      "EV adoption hit the chasm in Europe",
      "Carbon removal: the real numbers",
      "Why hydrogen pivoted to industrial only",
      "Solar+storage just beat coal on cost — globally",
      "Climate compute: a new category emerges",
    ],
  },
  Robotics: {
    titles: [
      "Humanoids are closer than your investors think",
      "Why warehouse automation hit a wall in 2025",
      "Figure, 1X, and the great humanoid bake-off",
      "Boston Dynamics rebrands as a software company",
      "The robotics foundation model nobody is talking about",
      "Tesla Optimus: real progress or showroom demo?",
      "Sim-to-real is the bottleneck, not the model",
      "How Agility built a profitable warehouse business",
      "Surgical robots cross the $5B revenue mark",
    ],
  },
  Biotech: {
    titles: [
      "AlphaFold 4 closes the loop on drug design",
      "GLP-1s reshape adjacent markets, fast",
      "Why every biotech is hiring ML engineers",
      "CRISPR therapies hit price/access reality",
      "Cell therapy pricing: the $4M problem",
      "Lab automation startups raise mega-rounds",
      "The longevity stack: what actually works",
      "Synthetic biology's industrial moment",
    ],
  },
  FinTech: {
    titles: [
      "Embedded finance crossed the chasm",
      "Why every neobank is becoming a lender",
      "Real-time payments rewire treasury",
      "Stripe's quiet enterprise dominance",
      "BaaS providers face regulatory reckoning",
      "How Ramp grew to $1B ARR",
      "B2B payments: the $10T unbundling",
      "Treasury management is hot again",
    ],
  },
  DevTools: {
    titles: [
      "Why Cursor is winning the IDE war",
      "GitHub Copilot's $1B run-rate, demystified",
      "The death of the local dev environment",
      "Vercel's pivot to AI infra",
      "Linear, Height, and the rise of opinionated tools",
      "Why nobody is paying for observability anymore",
      "Postgres is the database. Stop arguing.",
      "Edge functions hit production-readiness",
      "AI codegen just doubled merge velocity at FAANG",
    ],
  },
  Design: {
    titles: [
      "Figma's post-Adobe era, by the numbers",
      "Why every design system is being rebuilt",
      "Generative design crossed the professional threshold",
      "The tyranny of design tokens",
      "Spatial UI is finally ready for mainstream",
      "Skeuomorphism is back. Here's why.",
      "Material 4 leaks: the YouTube refresh",
      "How Linear designs at the speed of bug reports",
      "Brutalism in B2B: a 2026 trend report",
    ],
  },
};

const SUBTITLES = [
  "A teardown of the strategy, the moat, and the risk.",
  "What the numbers actually say.",
  "Five charts that reframe the debate.",
  "An operator's perspective.",
  "Founders, here's what changes for you.",
  "The contrarian read.",
  "Why this matters for the next 18 months.",
  "Behind the announcement.",
  "What we learned from 40 customer calls.",
  "The early signal nobody is pricing in.",
  "A framework for thinking about it.",
  "Three predictions, with confidence intervals.",
];

const AUTHORS = [
  "Maya Chen",
  "Devon Park",
  "Priya Raman",
  "Lukas Becker",
  "Aisha Bello",
  "Tomás Vega",
  "Hana Suzuki",
  "Noor Hassan",
  "Felix Andersson",
  "Sofia Rossi",
  "Ravi Iyer",
  "Elena Petrova",
];

function pick(arr, i) {
  return arr[i % arr.length];
}

function readTime(seed) {
  return 3 + (seed % 11);
}

function items(photoMap) {
  const out = [];
  const cats = Object.keys(CATEGORIES);
  const perCatCount = {};
  let id = 0;
  const target = 500;
  // Round-robin through categories so the distribution is balanced
  while (out.length < target) {
    for (const cat of cats) {
      if (out.length >= target) break;
      const titles = CATEGORIES[cat].titles;
      const titleIdx = Math.floor(id / cats.length);
      const baseTitle = titles[titleIdx % titles.length];
      const variant = Math.floor(titleIdx / titles.length);
      const title = variant === 0 ? baseTitle : `${baseTitle} (Pt. ${variant + 1})`;
      const subtitle = pick(SUBTITLES, id);
      const author = pick(AUTHORS, id);

      const catPhotos = photoMap?.[cat] ?? [];
      const catIdx = perCatCount[cat] ?? 0;
      perCatCount[cat] = catIdx + 1;
      const photo = catPhotos.length > 0 ? catPhotos[catIdx % catPhotos.length] : null;

      out.push({
        id: `it_${String(id).padStart(4, "0")}`,
        title,
        subtitle,
        category: cat,
        author,
        readMinutes: readTime(id),
        imageUrl: photo?.src ?? null,
        imageCredit: photo
          ? { photographer: photo.photographer, url: photo.photographerUrl }
          : null,
      });
      id += 1;
    }
  }
  return out;
}

function loadEnvLocal() {
  const envPath = join(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

async function main() {
  loadEnvLocal();
  const apiKey = process.env.PEXELS_API_KEY;
  let photoMap = null;
  if (apiKey) {
    console.log("Fetching photos from Pexels...");
    photoMap = await buildCategoryPhotoMap(apiKey);
  } else {
    console.log("PEXELS_API_KEY not set — items will fall back to SVG covers.");
  }
  const data = items(photoMap);
  const outDir = join(__dirname, "..", "src", "data");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "items.json"), JSON.stringify(data, null, 2));
  console.log(`Wrote ${data.length} items to src/data/items.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
