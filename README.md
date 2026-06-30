# Creatio CPQ — Guided Selling prototype

A throwaway demo: a **Creatio-styled CPQ / guided-selling** experience where a Store Consultant turns messy buyer input into a complete, priced, shareable quote. Mock data, simplified logic. Full scope in [SPEC.md](SPEC.md); design system in [design/DESIGN.md](design/DESIGN.md).

## Stack
- Vite + React + TypeScript
- Tailwind CSS, themed by Creatio tokens in [`design/tokens.css`](design/tokens.css)
- Zustand (central quote store)
- Supabase — optional, only for the cross-device QR temp link
- Deploy target: Netlify (static)

## Run
```bash
npm install
cp .env.example .env   # optional — add Supabase creds for cross-device
npm run dev            # http://localhost:5173
```
Scripts: `npm run typecheck` · `npm run build` · `npm run preview`.

## Routes
- `/` — consultant workspace (CPQ module)
- `/t/:sessionId` — buyer phone: paste list (temp link)
- `/q/:quoteId` — buyer-facing quote

## Supabase (optional)
Only the cross-device temp link needs it. Create a free project and set in `.env`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
Table: `sessions (id text primary key, data jsonb, updated_at timestamptz)` with Realtime enabled. (Text id holds both temp-link session ids and `cpq:quote:<id>` keys for shared quotes.) Without env, the app runs single-device and degrades gracefully.

## Deploy (Netlify)
Connect the GitHub repo. [`netlify.toml`](netlify.toml) sets build `npm run build`, publish `dist`, and an SPA redirect. Add the two `VITE_SUPABASE_*` env vars in Netlify if using cross-device.

## Structure
```
design/            design tokens + design system
src/lib/           FROZEN contracts: types, store, pricing, inventory, readiness, parse, supabase
src/data/          mock catalog, accounts, price lists, sample intake
src/components/shell/  Creatio app shell (nav rail, top bar, process bar, identify)
src/components/ui/     shared primitives (Button, Chip, Card)
src/features/      feature slices (catalog, quote, related, workspace)
src/pages/         buyer-phone pages
```

## Build split
Scaffolded **foundation-first**. The parallelizable Phase-1 slices and file ownership are in [BUILD_TASKS.md](BUILD_TASKS.md).
