# BrewMap

An interactive world map of specialty coffee — origins, flavor profiles, and brewing recommendations tailored to each bean.

**Status:** Phase 1 complete. 30 bean profiles, custom Mapbox styles, SSR bean pages, responsive panel, dark/light mode.

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- **Map:** react-map-gl + Mapbox GL JS (globe projection, clustering, custom Studio styles)
- **Styling:** Tailwind CSS v4 + shadcn/ui + custom coffee color palette
- **State:** Zustand
- **Data:** JSON seed files validated with Zod at build time
- **Theme:** next-themes (Mapbox style swaps on toggle)
- **Deploy:** Vercel

## Local development

### Prerequisites

- Node.js 20+
- A [Mapbox account](https://account.mapbox.com/) and access token

### Setup

```bash
git clone https://github.com/DouglasC2627/brew-map.git
cd brew-map
npm install
cp .env.example .env.local
# edit .env.local with your Mapbox token (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Name | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes | Mapbox public access token (`pk.*`) |
| `NEXT_PUBLIC_MAPBOX_STYLE_LIGHT` | No | Custom Mapbox Studio style URL for light mode. Falls back to `mapbox://styles/mapbox/light-v11` |
| `NEXT_PUBLIC_MAPBOX_STYLE_DARK` | No | Custom Mapbox Studio style URL for dark mode. Falls back to `mapbox://styles/mapbox/dark-v11` |

All three are inlined into the client bundle at build time — changing them requires a full rebuild.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Run Zod validation, then production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run validate:data` | Validate [src/data/](src/data/) against Zod schemas |
| `npm run expand:brewing` | Regenerate missing brewing recommendations via affinity weights |

## Project structure

```
brew-map/
├── src/
│   ├── app/        # Next.js App Router
│   │   ├── bean/[slug]/          # SSR bean detail page (generateStaticParams)
│   │   ├── layout.tsx            # Root layout — fonts, ThemeProvider, TopNav
│   │   ├── page.tsx              # Home (map view)
│   │   └── globals.css           # Tailwind v4 theme + coffee palette
│   │
│   ├── components/
│   │   ├── map/                  # CoffeeMap, MapView, RegionHighlight
│   │   ├── bean/                 # BeanPanel (responsive sheet)
│   │   ├── layout/               # TopNav
│   │   ├── shared/               # ThemeProvider, ThemeToggle
│   │   └── ui/                   # shadcn/ui primitives
│   │
│   ├── lib/
│   │   ├── data.ts               # Cached bean / method / region loaders
│   │   ├── schemas.ts            # Zod schemas mirroring src/types
│   │   └── utils.ts              # cn(), country flags, formatters
│   │
│   ├── store/      # Zustand store + filter selectors
│   ├── types/      # TypeScript interfaces
│   └── data/       # beans.json, brewing-methods.json, regions.geojson
│
├── public/
│   └── data/       # regions.geojson (fetched at runtime by the map)
│
├── scripts/
│   ├── validate-data.ts          # Zod validation — runs before `next build`
│   ├── expand-brewing-recs.mjs   # Generate missing brewing recs by affinity
│   └── generate-regions.mjs      # Generate placeholder region polygons
│
├── .env.example    # Env var template
├── AGENTS.md       # Agent-facing notes (Next.js 16 caveats)
├── CLAUDE.md       # Claude Code project instructions
├── TASKS.md        # Phased roadmap (source of truth)
└── package.json
```

## Contributing data

Bean profiles live in [src/data/beans.json](src/data/beans.json). To add a bean:

1. Pick a unique `id` (kebab-case, e.g. `ethiopian-guji`) and `slug`.
2. Fill in origin fields: `country`, `countryCode` (ISO-2), `region`, `coordinates: [lng, lat]`, `altitudeMasl: { min, max }`.
3. Fill in the 6-axis `flavorProfile` (1–10 each), `flavorNotes`, `varieties`, `processing`, `roastRecommendation`, `harvestMonths`.
4. Add at least one entry to `brewingRecommendations`. Run `npm run expand:brewing` to algorithmically fill the remaining methods.
5. Run `npm run validate:data` — Zod will catch any missing or malformed fields.

Region polygons live in [public/data/regions.geojson](public/data/regions.geojson) and are fetched client-side for hover highlights.

## Deployment

The project deploys to Vercel with no configuration beyond environment variables:

1. Import the GitHub repo into Vercel.
2. Add the three `NEXT_PUBLIC_MAPBOX_*` env vars across Production/Preview/Development.
3. Deploy. The build runs `npm run validate:data && next build`.
4. In your Mapbox account, restrict the token to your Vercel domains + `localhost:3000` to prevent scraping.

## License

Released under the [MIT License](LICENSE).
