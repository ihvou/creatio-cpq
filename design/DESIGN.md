# Creatio-style Design System — CPQ Guided Selling prototype

Canonical tokens: [`tokens.css`](tokens.css). This doc explains the palette, type, components, and the **Creatio app-shell** the prototype lives inside.

> **Method & caveat:** tokens were extracted by eye from four Creatio Freedom UI screenshots (Case/Service, Email campaign results, Account analytics, Case detail). Hex values are *close approximations* — if you have Creatio's exact brand hexes, override `tokens.css`. The point is to read unmistakably as Creatio at a glance.

---

## 1. What "looks like Creatio" means (the signature cues)

From the screenshots, five cues do most of the work — get these right and it reads as Creatio:

1. **Dark chrome, light content.** A near-black violet-navy **left nav rail** + **top bar**, wrapping a **light grey content area** full of **white cards**.
2. **Blue primary, orange-red accent.** Primary buttons + links are **blue** (`--c-primary`); the **active-tab underline** and the little **section-header square markers** are **orange-red** (`--c-accent`). Don't mix them up.
3. **Green process/status.** Stage chevrons and status pills ("Completed", "Time left") are **green** (`--c-stage` / `--c-success`).
4. **Pill everything.** Tags, badges, statuses are **fully-rounded chips** in soft tinted backgrounds.
5. **Quiet surfaces.** White cards, **hairline borders** (`--c-border`), **soft shadows**, generous padding, and **small grey field labels** above values. Inter (or close) typography.

---

## 2. Palette

| Role | Token | Hex |
|---|---|---|
| Chrome (nav/topbar) | `--c-chrome` | `#1A1830` |
| Chrome gradient | `--c-chrome-gradient` | violet→navy |
| Primary (buttons/links) | `--c-primary` | `#1A73E8` |
| Accent (tabs/markers) | `--c-accent` | `#F4511E` |
| Success / stage | `--c-success` / `--c-stage` | `#2EA85C` / `#46B24A` |
| Info | `--c-info` | `#2C7BE5` |
| Warning | `--c-warning` | `#F5A623` |
| Danger | `--c-danger` | `#E5484D` |
| App background | `--c-bg` | `#F3F4F6` |
| Card surface | `--c-surface` | `#FFFFFF` |
| Border | `--c-border` | `#E5E7EE` |
| Text | `--c-text` | `#1B1B2E` |
| Text secondary | `--c-text-secondary` | `#565768` |
| Text muted (labels) | `--c-text-muted` | `#8A8C9C` |

Status KPI cards (from the Email view) use **saturated gradient fills**: green / blue / orange / red over white numbers — reserve those for big metric tiles only, not general UI.

---

## 3. Typography

- **Family:** Inter (load from Google Fonts) → `--c-font-sans`.
- **Scale:** page title 24/600 · sub-title 18/600 · section 16/600 · body 14/400 · secondary 13/400 · **field label 12/500, grey, often slightly tracked**.
- Headings use `--c-text` (near-black navy), not pure black. Values are dark; their labels are `--c-text-muted`.

---

## 4. Spacing · radius · shadow · layout

- **Spacing:** 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40.
- **Radius:** inputs & buttons `6px` · cards `8px` · modals/KPI `12px` · chips/stages `pill`.
- **Shadow:** cards `--c-shadow-sm`; popovers `--c-shadow-md`; modals/overlays `--c-shadow-lg`.
- **Layout:** nav rail `240px` (collapsible `64px`) · top bar `56px` · content padding `24px` · card gap `16px` · contextual right panel `~400px`.

---

## 5. Components

| Component | Spec |
|---|---|
| **Primary button** | bg `--c-primary`, fg white, radius-sm, padding `8px 16px`, weight 500; hover `--c-primary-hover` |
| **Secondary button** | bg white, `1px --c-border`, text `--c-text`; hover `--c-surface-2` |
| **Ghost / icon button** | transparent, text-secondary; hover `--c-surface-2` |
| **Tabs** | inactive `--c-text-muted`; **active = `--c-text` + 2px `--c-accent` underline** |
| **Stage bar** | chevron pills; completed/current = `--c-stage` fill, white text; current slightly brighter; upcoming = `#E9EAEE`, `--c-text-muted` |
| **Card** | `--c-surface`, `1px --c-border`, radius-md, `--c-shadow-sm`, padding 16–20; header = section title + optional small `--c-accent` square + collapse caret |
| **Input / select** | white, `1px --c-border`, radius-sm, height 36, padding `8–12`; focus = 2px `--c-primary` ring; label above in `--c-text-muted` 12px |
| **Chip / tag** | pill; tinted bg + matching fg (neutral/blue/green/yellow/red sets in tokens) |
| **Eligibility / Pro badge** | green or blue chip (`--c-chip-green-*` / `--c-chip-blue-*`) |
| **Availability badge** | in-stock = green chip · low = yellow · out = red chip |
| **Nav item** | height 40, gap 12, **colored rounded-square icon (22px)** + label `--c-text-sm`; active = `--c-chrome-active` bg + 3px `--c-accent` left bar |
| **Top bar** | `--c-chrome`, height 56; left: collapse + global search pill; right: AI button, app-grid, bell, help, settings, avatar |
| **Modal / overlay** | white, radius-lg, `--c-shadow-lg`, scrim `rgba(16,16,40,0.45)` |

---

## 6. App shell + the new CPQ module

Present the prototype **inside a Creatio-style shell** so it reads as a native Creatio capability (recommended for the stakeholder demo).

```
┌───────────────────────────────────────────────────────────────┐
│ TOP BAR (dark): ⊞  search "What can I find for you?"   AI ▦ 🔔 ? ⚙ 👤 │
├──────────┬────────────────────────────────────────────────────┤
│ NAV RAIL │  CONTENT (light) — the CPQ workspace                │
│ (dark)   │                                                     │
│ Creatio  │  ┌── Catalog / search ──┐ ┌── Live quote ───────┐  │
│ ▦ All    │  │ filters · tiles/list │ │ lines · qty · total │  │
│ • Home   │  └──────────────────────┘ └─────────────────────┘  │
│ • Accounts                                                     │
│ • Contacts                                                     │
│ • Opportunities                                                │
│ ▸ CPQ  ◀ active (──accent left bar)                            │
│ • Orders                                                       │
│ • Products                                                     │
│ • Invoices                                                     │
└──────────┴────────────────────────────────────────────────────┘
```

- **Add one new nav item: “CPQ”** (icon colour `--c-app-cpq`, a price-tag / cart glyph). Selecting it opens the consultant **split-screen workspace**.
- **Other nav items are static mock** — non-functional, but they make the shell believable and tie to the CPQ data model (Accounts · Contacts · Opportunities · Orders · Products · Invoices are all real Creatio modules).
- The **identify-buyer bar**, **recommendation overlays** (full-height with running-total bar), and **Compare** (full-screen) all render within the content area, styled per §5.

---

## 7. Using the tokens

1. Import once (e.g. in `main.tsx`): `import './design/tokens.css'` and load Inter.
2. **Tailwind** — extend the theme to reference the CSS vars:

```js
// tailwind.config.js (excerpt)
export default {
  theme: {
    extend: {
      colors: {
        chrome: 'var(--c-chrome)',
        primary: 'var(--c-primary)',
        accent: 'var(--c-accent)',
        success: 'var(--c-success)',
        surface: 'var(--c-surface)',
        bg: 'var(--c-bg)',
        border: 'var(--c-border)',
        ink: 'var(--c-text)',
        'ink-muted': 'var(--c-text-muted)',
      },
      borderRadius: { sm: 'var(--c-radius-sm)', md: 'var(--c-radius-md)', lg: 'var(--c-radius-lg)' },
      boxShadow: { card: 'var(--c-shadow-sm)', pop: 'var(--c-shadow-md)', modal: 'var(--c-shadow-lg)' },
      fontFamily: { sans: 'var(--c-font-sans)' },
    },
  },
}
```

3. **shadcn/ui** components inherit the look via the HSL block at the bottom of `tokens.css` — no per-component overrides needed for the basics.
