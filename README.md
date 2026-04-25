# BrewMap

An interactive world map of specialty coffee — origins, flavor profiles, and brewing recommendations tailored to each bean.

**Status:** *Still Under Development* — Phase 1 + Phase 2 complete. 30 bean profiles with full SCA flavor-note tagging, custom Mapbox styles, SSR bean pages, responsive panel, dark/light mode, faceted filters, ⌘K search, brewing recommendation cards with dose calculator, /beans browser with grid/table toggle, Euclidean similar-beans, and shareable URLs.

## Tech stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Map:** [react-map-gl](https://visgl.github.io/react-map-gl/) + [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) (globe projection, clustering, custom [Mapbox Studio](https://studio.mapbox.com/) styles)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + custom coffee color palette
- **State:** [Zustand](https://github.com/pmndrs/zustand)
- **URL state:** [`nuqs`](https://nuqs.47ng.com/) — type-safe URL search params, shallow routing
- **Search:** [Fuse.js](https://www.fusejs.io/) (weighted, fuzzy)
- **Data:** JSON seed files validated with [Zod](https://zod.dev/) at build time
- **Theme:** [next-themes](https://github.com/pacocoursey/next-themes) (Mapbox style swaps on toggle)
- **Deploy:** [Vercel](https://vercel.com/)

## Feature highlights

- **Interactive map** — Mapbox globe with clustered bean markers, on-hover region highlights. Click a marker to fly to the origin and open its profile.
- **Bean profiles** — Each bean carries a 6-axis flavor profile (acidity, body, sweetness, bitterness, complexity, fruitiness), tagged tasting notes, varieties, processing, harvest months, and an SSR detail page. A similar-beans section uses Euclidean distance over the flavor profile to surface related origins from other countries.
- **Brewing recommendations** — Per-bean cards sorted by affinity score with a "Best Match" highlight. Open any card for a full recipe — grind-scale visualization, water temperature with °C/°F toggle, ratio, pour schedule, equipment list, and an embedded dose calculator that scales by cup count and persists the user's preferred cup size.
- **SCA flavor-notes hierarchy** — 9 categories / 29 subcategories / 84 specific notes in [src/data/flavor-notes.json](src/data/flavor-notes.json), cross-validated against every bean at build time.

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
| `npm run validate:data` | Validate [src/data/](src/data/) against Zod schemas + cross-check flavor-note IDs, method IDs, and related-bean IDs |
| `npm run expand:brewing` | Regenerate missing brewing recommendations via affinity weights |
| `npm run new:bean` | Interactive scaffolder that prompts for every field and appends a new bean profile to `beans.json` |

## Project structure

```
brew-map/
├── src/
│   ├── app/        # Next.js App Router
│   │   ├── bean/[slug]/          # SSR bean detail page (generateStaticParams)
│   │   ├── beans/                # /beans grid + table browser
│   │   ├── layout.tsx            # Root layout — fonts, ThemeProvider, NuqsAdapter, TopNav
│   │   ├── page.tsx              # Home (map view)
│   │   └── globals.css           # Tailwind v4 theme + coffee palette
│   │
│   ├── components/
│   │   ├── map/                  # CoffeeMap, MapView, RegionHighlight
│   │   ├── bean/                 # BeanPanel, BeansBrowser
│   │   ├── filter/               # FilterPanel, FlavorSliders
│   │   ├── brewing/              # BrewCard, BrewDetailModal, BrewCalculator
│   │   ├── layout/               # TopNav
│   │   ├── shared/               # ThemeProvider, ThemeToggle, SearchCommand, UrlStateSync
│   │   └── ui/                   # shadcn/ui primitives
│   │
│   ├── lib/
│   │   ├── data.ts               # Cached bean / method / flavor-notes loaders
│   │   ├── schemas.ts            # Zod schemas mirroring src/types
│   │   ├── search.ts             # Fuse.js index + recent-searches helpers
│   │   ├── similar.ts            # Euclidean distance over flavor profile
│   │   ├── url-state.ts          # nuqs parsers for filters / viewport / selection
│   │   └── utils.ts              # cn(), country flags, formatters, flavor-note label lookup
│   │
│   ├── store/      # Zustand store + filter selectors
│   ├── types/      # TypeScript interfaces
│   └── data/       # beans.json, brewing-methods.json, flavor-notes.json, regions.geojson
│
├── public/
│   └── data/       # regions.geojson (fetched at runtime by the map)
│
├── scripts/
│   ├── validate-data.ts          # Zod validation + cross-checks — runs before `next build`
│   ├── expand-brewing-recs.mjs   # Generate missing brewing recs by affinity
│   ├── generate-regions.mjs      # Generate placeholder region polygons
│   └── new-bean.mjs              # Interactive scaffolder (`npm run new:bean`)
│
├── .env.example    # Env var template
├── AGENTS.md       # Agent-facing notes (Next.js 16 caveats)
├── CLAUDE.md       # Claude Code project instructions
├── TASKS.md        # Phased roadmap (source of truth)
└── package.json
```

## Contributing data

Bean profiles live in [src/data/beans.json](src/data/beans.json). The fastest way to add one:

```bash
npm run new:bean
```

The interactive scaffolder prompts for every field, validates flavor-note IDs against [src/data/flavor-notes.json](src/data/flavor-notes.json), refuses duplicate slugs, and appends the new bean. After it finishes, you can either edit `beans.json` to add brewing recommendations by hand or run `npm run expand:brewing` to algorithmically fill the remaining methods.

To add a bean manually:

1. Pick a unique `id` (kebab-case, e.g. `ethiopian-guji`) and `slug`.
2. Fill in origin fields: `country`, `countryCode` (ISO-2), `region`, `coordinates: [lng, lat]`, `altitudeMasl: [min, max]`.
3. Fill in the 6-axis `flavorProfile` (1–10 each), `flavorNotes` (must be IDs from [src/data/flavor-notes.json](src/data/flavor-notes.json)), `varieties`, `processing`, `roastRecommendation`, `harvestMonths`.
4. Add at least one entry to `brewingRecommendations`. Run `npm run expand:brewing` to algorithmically fill the remaining methods.
5. Run `npm run validate:data` — Zod will catch any missing or malformed fields and the cross-check will flag unknown flavor-note IDs, method IDs, or related-bean IDs.

Region polygons live in [public/data/regions.geojson](public/data/regions.geojson) and are fetched client-side for hover highlights.

## Deployment

The project deploys to Vercel with no configuration beyond environment variables:

1. Import the GitHub repo into Vercel.
2. Add the three `NEXT_PUBLIC_MAPBOX_*` env vars across Production/Preview/Development.
3. Deploy. The build runs `npm run validate:data && next build`.
4. In your Mapbox account, restrict the token to your Vercel domains + `localhost:3000` to prevent scraping.

## License

Released under the [MIT License](LICENSE).
