# Restyle prompt for GPT-5.6 Sol

Paste everything below the line.

---

You built the **Shippix** storefront in this repo (Next.js 15, App Router). The structure and
functionality are good — this task is a **visual rebrand only**. Do not change data fetching,
routes, or component logic. The whole design system is centralized in `app/globals.css` using CSS
variables, so most of this is token work plus a font swap and a logo swap.

Make four changes: **colors**, **type sizes**, **font**, and **logo**. Concrete values are given so
you don't have to guess — apply them, then run the dev server and confirm every page still renders.

## 1. Colors — match the Shippix brand identity

The brand is exactly three colors: **deep teal-navy, coral, cream**. Replace the current palette
(near-black ink, lime green, light blue — all off-brand) with this. Edit the `:root` block in
`app/globals.css`:

```css
--paper: #f4ecdb;       /* cream — page background */
--paper-deep: #eae0ca;  /* deeper cream — alternating sections */
--ink: #143f4e;         /* deep teal-navy — text + dark sections (replaces near-black) */
--muted: #5c6b70;       /* muted teal-grey — secondary text */
--line: #ccc2ac;        /* warm hairline */
--signal: #dd5f37;      /* coral — CTAs, emphasis, accents */
--acid: #f2c3ad;        /* soft coral tint — replaces the lime highlight */
--blue: #e9dcc4;        /* warm sand — replaces the light-blue image backdrops */
--white: #fffdf6;
--teal: #1e6d8b;        /* the logo's own teal — for mid-tone accents if needed */
```

Then hunt down the **hardcoded off-brand colors** still living in rule bodies (not just the tokens)
and bring them onto the palette:

- Any `rgba(216, 255, 62, …)` (lime) → `rgba(221, 95, 55, …)` (coral)
- Any `rgba(191, 217, 255, …)` / `#aac7f2` (blue) → a warm teal or sand tint, e.g.
  `rgba(30, 109, 139, 0.14)` for the product-image gradients, `#d9c9a8` for the empty-state stripes
- Dark inner borders/greys used inside dark sections (`#4a4943`, `#53524d`, `#2c2c29`) → teal-tinted
  equivalents (`#2c5766`, `#1c5364`) so borders read as "darker teal", not "grey on teal"
- Footer muted text `#aaa89f` → `#a9c2cb` (cool teal-grey, readable on the new teal footer)

Grep the file for `rgb`, `#`, `lime`, `blue` and make sure nothing off-brand remains.

## 2. Font — replace Georgia with an elegant display serif

The identity uses a high-contrast elegant serif (the logo wordmark) — Georgia is a weak stand-in.
Load proper fonts with **`next/font/google`** (not `@import` in CSS — that breaks the CSP and hurts
performance). In `app/layout.tsx`:

- **Display / headings** → **Fraunces** (soft, high-contrast, has a real italic — matches the logo's
  character). Load weights 400 + 600 and italic.
- **Body / UI** → **Inter** (clean neutral grotesk).

Wire them to the existing CSS variables so you don't have to touch every rule — the system already
reads `var(--serif)` and `var(--sans)`:

```ts
import { Fraunces, Inter } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
```

Add `className={`${fraunces.variable} ${inter.variable}`}` to the `<html>` element, then in
`globals.css` point the tokens at the loaded fonts:

```css
--serif: var(--font-serif), Georgia, serif;
--sans: var(--font-sans), system-ui, sans-serif;
```

The many `font-family: var(--serif)` display headings will pick up Fraunces automatically. Where a
heading uses `font-style: italic` (e.g. the code-only product card title), Fraunces italic will now
render properly — verify it looks intentional.

## 3. Type sizes — the whole design is too big; scale it down

Headings are oversized (the hero H1 hits ~160px; section titles ~90px). Reduce the **max end of the
`clamp()`** on every display heading by roughly 40–45%, and relax the tight line-heights so the
smaller type breathes. Apply these targets (search for the current value, replace the whole rule's
size/line-height):

| Selector | Current `clamp(min, vw, max)` | New |
|---|---|---|
| `.hero__copy h1` | `clamp(4rem, 9vw, 10rem)` / lh `0.76` | `clamp(2.6rem, 6vw, 5.2rem)` / lh `0.9` |
| `.section-heading h2` | `clamp(2.5rem, 5vw, 5.6rem)` / lh `0.9` | `clamp(1.9rem, 3.2vw, 3.2rem)` / lh `0.96` |
| `.page-intro h1` | `clamp(4rem, 9vw, 10rem)` / lh `0.8` | `clamp(2.6rem, 6vw, 5rem)` / lh `0.92` |
| `.category-header h1` | `clamp(3.8rem, 8vw, 9rem)` / lh `0.82` | `clamp(2.4rem, 5vw, 4.4rem)` / lh `0.92` |
| `.product-purchase h1` | `clamp(2.2rem, 4.6vw, 5.8rem)` / lh `0.9` | `clamp(1.7rem, 3.2vw, 3rem)` / lh `1` |
| `.product-price` | `clamp(2.3rem, 5vw, 5rem)` | `clamp(1.9rem, 3.5vw, 3rem)` |
| `.product-copy h2`, `.property-ledger h2` | `clamp(2.5rem, 5vw, 5.5rem)` | `clamp(1.8rem, 3.2vw, 3rem)` |
| `.content-page > header h1` | `clamp(4rem, 10vw, 11rem)` / lh `0.78` | `clamp(2.6rem, 6vw, 5rem)` / lh `0.9` |
| `.content-page__sections h2` | `clamp(2rem, 4vw, 4rem)` | `clamp(1.6rem, 2.8vw, 2.4rem)` |
| `.message-page h1` | `clamp(4rem, 9vw, 9rem)` / lh `0.8` | `clamp(2.6rem, 6vw, 4.4rem)` / lh `0.92` |
| `.search-intro label` | `clamp(2.5rem, 6vw, 7rem)` | `clamp(2rem, 4vw, 3.6rem)` |
| `.search-intro input` | `clamp(1.5rem, 3vw, 3rem)` | `clamp(1.2rem, 2vw, 1.8rem)` |
| `.department-index strong` | `clamp(1.4rem, 3vw, 3rem)` | `clamp(1.2rem, 2.2vw, 2rem)` |
| `.catalog-menu__intro strong` | `clamp(2rem, 4vw, 4.5rem)` | `clamp(1.6rem, 3vw, 2.8rem)` |
| `.site-footer__mark` | `clamp(2rem, 4vw, 4rem)` | `clamp(1.5rem, 2.5vw, 2.3rem)` |
| `.site-footer__statement` | `clamp(2rem, 4vw, 4rem)` | `clamp(1.5rem, 2.5vw, 2.2rem)` |
| mobile `.hero__copy h1` (in `@media max-width:800px`) | `clamp(4.3rem, 20vw, 8rem)` | `clamp(2.3rem, 11vw, 3.6rem)` |

Also **tighten vertical rhythm** so pages feel less cavernous:
- `.category-rail, .product-section` padding: `clamp(3rem, 7vw, 7rem) …` → `clamp(2.25rem, 4.5vw, 4rem) …`
- `.hero__copy` padding: `clamp(3rem, 7vw, 8rem) clamp(1.25rem, 6vw, 7rem)` → `clamp(2.5rem, 5vw, 5rem) clamp(1.25rem, 5vw, 5rem)`
- `.content-page > header`: drop `min-height: 70svh` to `min-height: auto` and cut its padding to `clamp(2.5rem, 5vw, 4.5rem) …`
- `.section-heading` `margin-bottom`: `clamp(2rem, 4vw, 4rem)` → `clamp(1.5rem, 3vw, 2.5rem)`

When you lower a heading's size, also relax any line-height below `0.9` up toward `0.92–1.0`, and
reduce letter-spacing tighter than `-0.06em` toward `-0.045em` — very tight tracking only looks right
at huge sizes.

## 4. Logo — use the real Shippix mark

The brand's logo is at **`resources/logo.png`** — a 500×500 PNG with a transparent background; the
actual teal wordmark occupies a ~293×88 box in the middle. (A pre-trimmed copy may already exist at
`public/shippix-logo.png` — if so, use it; otherwise trim the transparent padding to the mark's
bounding box and save it there.)

- In `components/site-header.tsx`, replace the `CHIPPIX®` text wordmark with the image:
  ```tsx
  <Link className="wordmark" href="/" aria-label="Shippix home">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/shippix-logo.png" alt="Shippix" width={293} height={88} />
  </Link>
  ```
- In `globals.css`, replace the `.wordmark` font styling with a flex box, and swap the old
  `.wordmark span` rule for `.wordmark img { height: 1.7rem; width: auto; display: block; }`.
- The logo is teal, so it sits correctly on the cream header but would be **invisible on the teal
  footer** — in `components/site-footer.tsx` keep the footer mark as the text `shippix` (cream on
  teal), do not put the teal PNG there.
- Update the brand name from Chippix → **Shippix** everywhere it's user-visible: footer mark, and the
  `title` / `openGraph` / `twitter` strings in `app/layout.tsx`.

## Verify before you finish

Run the dev server and load these pages — confirm each renders with real data, no console errors,
and no leftover lime/blue anywhere:

- [ ] Home — logo shows in header, hero H1 is ~half its old size, deep-teal text on cream, coral CTA
- [ ] A category listing (e.g. `/categories/733-automobiles-accessories`) — 24-per-page grid intact
- [ ] A product detail page — Fraunces title, coral "Add to bag", teal structure
- [ ] Footer reads `shippix` in cream on the teal panel
- [ ] Grep `globals.css`: no `216, 255, 62`, no `191, 217, 255`, no `#aac7f2` remain
- [ ] Fonts load via `next/font` (check Network: no external font `@import`); FOUT handled by `swap`
- [ ] Nothing about data/routes/logic changed — this was visual only
