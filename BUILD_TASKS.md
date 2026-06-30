# BUILD_TASKS — Phase 1 slice cards (for Codex)

Phase 0 (foundation) is done on `main`: scaffold, design tokens, **frozen contracts**, mock data, Creatio shell, a reference catalog slice, the live quote panel, and stubs for the remaining slices. `npm run typecheck && npm run build` both pass.

This file hands the parallelizable slices to Codex. Read the rules, pick a slice, branch, build, PR.

## Status (updated each merge)
- [x] **Phase 0 — foundation** — scaffold, tokens, frozen contracts, mock data, Creatio shell, reference catalog, live quote panel, stubs. Pushed.
- [x] **Quote slice** (foundation owner) — full quote view, share (QR / link / email) + print, order-readiness flags, buyer quote page.
- [x] **List-first refactor** (foundation) — draft-quote canvas, search-to-add bar, Paste-list seed, Browse-catalogue picker, per-line Related + Swap. (Catalogue+cart replaced.)
- [x] **Catalogue expansion** (foundation) — ~290 items across 14 categories + category-mapped images (`ProductTile`/`ProductHero` render `imageUrl`); curated hero/intake SKUs preserved. Makes slice-A facets / sort production-like.
- [ ] **Slice A — Catalog** (Codex) — faceted filters + sort + dense table.
- [ ] **Slice B — Related overlay** (Codex) — tabs / sub-tabs, Compare, Swap-from-line.
- [x] **Slice C — Intake** (foundation owner) — capture via QR / paste → reconciliation (matched / choose / unmatched-search) + Supabase realtime.

## Rules of engagement
1. **Do NOT edit** `src/lib/types.ts` or `src/lib/store.ts` — the frozen contract. Need a new action/type? Note it in your PR; the foundation owner adds it.
2. **One slice = one folder.** Create/own files only under your slice's folder.
3. Consume state via `useStore` + the helpers below. Never mutate state directly.
4. Match the visual system: Tailwind tokens are wired (`bg-surface`, `text-ink`, `text-ink-muted`, `border-line`, `bg-primary`, `text-accent`, …) plus `Button`/`Chip`/`Card` from `@/components/ui/primitives`. See `design/DESIGN.md`.
5. `npm run typecheck` and `npm run build` must pass before a PR.
6. Branch per slice (`slice/catalog`, `slice/related`, `slice/intake`) → PR. Foundation owner reviews against acceptance criteria + contracts, then merges.

## Frozen contract (what you build against)

Store: `import { useStore, selectSubtotal } from '@/lib/store'`
- state: `quote`, `buyer`, `contact`, `view`, `catalogView`, `navCollapsed`
- `priceListId()` → `'default' | 'buyer'`
- buyer: `setBuyer(accountId|null)`, `registerBuyer({name,phone?,email?})`
- lines: `addLine(sku, qty?)`, `removeLine(id)`, `setQty(id, qty)`, `swapLine(id, newSku)`, `setNote(text)`, `applyParsed(parsed)`
- view: `setView('catalog'|'quote'|'order')`, `setCatalogView('tiles'|'table')`, `toggleNav()`
- lifecycle: `generateQuote()`, `shareQuote()`, `createOrder()`
- `selectSubtotal(lines)` → number

Helpers:
- catalog — `@/data/catalog`: `CATALOG`, `productBySku(sku)`, `searchCatalog(q)`
- accounts — `@/data/accounts`: `ACCOUNTS`, `searchAccounts(q)`, `contactsForAccount(id)`
- pricing — `@/lib/pricing`: `priceFor(product, priceListId)`, `lineExt(unit, qty)`
- inventory — `@/lib/inventory`: `availabilityOf(product)` → `'available'|'low'|'out'`
- readiness — `@/lib/readiness`: `readinessFor(lines)`, `readinessForLine(line)`
- parse — `@/lib/parse`: `parseList(text)` (emulated); sample at `@/data/sampleIntake` (`SAMPLE_PASTE`, `SAMPLE_PARSED`)
- supabase — `@/lib/supabase`: `supabase`, `SUPABASE_READY`, `upsertSession`, `getSession`, `subscribeSession`
- misc — `@/lib/format` (`money`, `round2`), `@/lib/util` (`cn`, `genId`)

Types — `@/lib/types`: `Product`, `Account`, `Contact`, `Quote`, `QuoteLine`, `ParsedLine`, `ReadinessFlag`, reasons (`AlternativeReason`, `TogetherReason`).

## Ownership map
| Path | Owner |
|---|---|
| `src/lib/*`, `src/data/*`, `src/components/shell/*`, `src/components/ui/*` | foundation — **do not edit** |
| `src/features/catalog/*` | Codex — slice A |
| `src/features/related/*` | Codex — slice B |
| `src/features/intake/*` + `src/pages/IntakePaste.tsx` | foundation owner — slice C (done) |
| `src/features/quote/*`, `src/pages/BuyerQuote.tsx` | foundation owner — Phase 1 |
| `src/features/workspace/*` (Workspace, BrowseOverlay), `src/features/quote/DraftQuote.tsx` | foundation owner |

---

## Slice A — Catalog (the Browse-catalogue picker)
**Folder:** `src/features/catalog/` · **SPEC:** §6 Scenario 3, §7
> The workspace is now **list-first**: `CatalogView` renders inside the **Browse-catalogue overlay** (`features/workspace/BrowseOverlay.tsx`), and a **search-to-add bar** already lives in `DraftQuote`. This slice completes the Browse picker:
- Faceted filters: category, color/finish, material/style, brand, price range, rating, availability — with live counts, removable chips, plain labels.
- Sort: price / best match / availability / rating.
- Keep both tiles and the dense table; add sortable headers to the table, keep it compact (~12–13px).
- **Keep the `onViewRelated(sku)` prop** — it opens slice B.
Use: `searchCatalog`, `CATALOG`, `priceFor`, `availabilityOf`, `addLine`, `catalogView`/`setCatalogView`.
**Acceptance:** filters + sort visibly narrow/reorder the grid; both views work; Add adds a line; chips removable; zero-results suggests relaxing one filter.

## Slice B — View-related split overlay (replace the stub)
**Folder:** `src/features/related/` · **SPEC:** §7
Full View-related overlay:
- Full-screen split: left = selected item detail; right = related items (tiles/list).
- Top filter bar: tab **Alternatives** (sub-tabs: better price / better quality / same style) and tab **They buy together** (sub-tabs: same style / work together). Sub-tabs filter by `reason`.
- Actions: Alternatives → **Swap** (accept optional `lineId` prop; if present `swapLine(lineId, sku)`, else `addLine(sku)`). They buy together → **Add** (`addLine`).
- Select 2–4 → **Compare** (full-screen, side-by-side specs/photos) → Swap/Add from there.
- Keep the running quote total visible in the overlay (use `selectSubtotal`).
Use: `productBySku`, `product.alternatives` / `product.buyTogether` (`{sku, reason}`), `swapLine`, `addLine`, `priceFor`.
**Acceptance:** opens from a catalog row AND a quote line; tabs+sub-tabs filter; Swap replaces the line (keeps `originalSku`, re-prices); Compare works; total updates live.

## Slice C — Intake (buyer paste → reconciliation) — DONE (foundation owner)
**Folder:** `src/features/intake/` + `src/pages/IntakePaste.tsx` · **SPEC:** Scenario 2, §10
> **Done:** `CaptureListDialog.tsx` captures via QR temp-link (buyer phone → Supabase realtime) or direct paste, then reconciles into three buckets — matched / choose-from-candidates / unmatched-search → add to the list. Original card below kept for reference / optional polish.
- Buyer page (`/t/:sessionId`): textarea prefilled with `SAMPLE_PASTE` → on send, `upsertSession(sessionId, {paste})`. If `!SUPABASE_READY`, keep working single-device (memory/localStorage).
- Consultant side: a "Capture list" action opening a reconciliation panel. Run `parseList(text)` → render `ParsedLine[]` in three buckets: `high` → auto-add (`applyParsed` or `addLine`), `low` → pick from `candidateSkus`, `sku === null` → unmatched, manual search. **Nothing dropped silently.**
- Cross-device: consultant `subscribeSession(sessionId, cb)`; when the buyer paste arrives, reconcile.
- Show a QR (`qrcode.react`) pointing at `` `${location.origin}/t/${sessionId}` ``.
Use: `parseList`, `SAMPLE_PARSED`/`SAMPLE_PASTE`, `productBySku`, `addLine`, `applyParsed`, supabase helpers, `qrcode.react`.
**Acceptance:** a messy paste becomes catalog-matched draft lines with high/low/unmatched all handled; cross-device works when Supabase is set, single-device otherwise.

---

## Foundation-owner Phase 1
- [x] `src/features/quote/`: full quote view (number, validity, lines, totals, notes), share (QR/link/email) + print, **order-readiness flags** (`readinessFor` at Create order → tiny inline per-row markers), buyer quote page `/q/:quoteId`. **Done.**
- [ ] Integrate slices A–C into `Workspace.tsx` + Supabase realtime review (as they land).
