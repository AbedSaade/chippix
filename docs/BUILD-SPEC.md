# Chippix — Build Spec

**Handoff document.** Self-contained. Everything below was empirically verified against the
live source on 2026-07-30; do not assume anything not stated here.

---

## 1. What you are building

A storefront called **Chippix** that reads its catalog **live** from `chibox.app` on every
request. No product database, no ingest job, no sync. A product added upstream appears on
Chippix immediately.

**Stack:** Next.js 15 (App Router, RSC), TypeScript, Tailwind. Server-side data fetching only.

**Product principle:** Chippix mirrors ChiBox. If ChiBox shows a product, Chippix shows it. If it
does not, Chippix shows nothing — no stale copies, no placeholders, no compensating for upstream
failure. See §5.

### Hard scope boundaries

| In scope | Out of scope |
|---|---|
| Home, category browse (3 levels), product detail, search, deals, CMS content pages | **Local Stores** — upstream returns zero items; do not build the route |
| Client-side cart + wishlist (localStorage) | Real checkout / payment — upstream exposes no order API. Cart terminates in a stub "not yet available" state |
| | User accounts / auth — upstream `/api/auth/*` is theirs, not ours |

### The one rule that matters

**Never call `chibox.app` from the browser.** All upstream calls happen in Server Components
or Route Handlers. Client code calls only your own routes. Reasons: CORS, credential hygiene,
and it keeps caching under your control.

---

## 2. Verified API surface

Base: `https://chibox.app`. No auth. Not origin-locked (plain server-side requests work).
Latency measured warm; first hit after idle is ~3x slower.

| Endpoint | Returns | Latency | Notes |
|---|---|---|---|
| `GET /api/public/home` | `banners[]`, `categories[10]`, `products[10]`, `hotProducts[8]`, `dealProducts[8]`, `pages[5]` | ~0.9s | Powers home + deals + CMS pages |
| `GET /api/public/categories` | 30 top-level only | ~0.6s | **Ignores all parent params.** Cannot give you sub-categories |
| `GET /api/public/product?code=p-<code>&include=reviews,related` | Full product | ~1.5s warm, ~4.9s cold | See §2.2 |
| `GET /api/chibox/v10_0_0-product/search?keyword=<q>&page=1&per_page=<n>` | Paginated search | ~1.5s | `per_page` honored to ~100. Totals drift between identical calls — it queries a live index. Never show a precise result count |
| `GET /categories/<id>-<slug>?page=<n>` | **HTML** — 24 products/page | ~1.0–1.6s | The *only* category-browse path. Must be parsed. See §3.2 |

### 2.1 Envelope

`/api/chibox/*` wraps everything: `{ success, message, data, pagination }`.
`/api/public/*` returns bare objects: `{ products: [...] }`, `{ data: { product } }`.
Normalize both into your own types at the adapter boundary. Never leak upstream shapes into components.

### 2.2 Product detail fields

```
id, code, name, slug, image, images[], videoUrl, price, originalPrice,
currencySymbol, discountPercent, category, categoryId, source, rating,
ratingCount, soldCount, description, storeId, storeName, available,
hasOption, options[], variations[], props[]
```

- `options[]` — `{ id, name, isColor, values[{ id, name, image? }] }`. Color options carry swatch images.
- `variations[]` — `{ id, skuId, name: "Color:apricot;size:bagged", price, ... }`. **Per-SKU pricing**; the
  headline `price` is the minimum. Selecting options must resolve to a variation and update the price.
- `description` is **usually `null`**. `rating` is usually `null`, `ratingCount` usually `0`.
- `reviews` is almost always `[]`. Build the UI to omit review sections entirely rather than show empty states.
- `related[]` is populated and useful.

### 2.3 Traps — these will silently ruin your build

1. **`GET /api/public/products` is unusable.** Caps at 12 items regardless of `per_page`, ignores
   `page`, and on upstream failure **silently returns hardcoded demo data** (a placeholder
   "Adjustable sofa side table" with a local image path). Never call it. If you see that product,
   you have a bug.
2. **`v10_0_0` is a release-pinned version string.** When upstream ships v10.0.1, every search call
   404s. It must live in exactly one constant (§4.1).
3. **Category totals fluctuate.** Women's Clothing measured 131,595 / 131,350 / 126,072 / 131,596
   across calls. Use totals for rough page-count only. Never display an exact product count.
4. **Prices arrive with 4 decimals** (`6.8159`, `1.4773`). Always round to 2dp for display.
   `currencySymbol` is a separate field — never hardcode `$`.
5. **Upstream sometimes times out.** Every call needs a timeout and a fallback (§5).

---

## 3. Where each page's data comes from

### 3.1 The category tree is a shipped file, not an API call

The API gives only the 30 top-level categories. The full tree was crawled and lives at
**`data/categories.json`** — commit it and import it.

**7,301 nodes, exactly 3 levels deep:** 30 top-level → 808 sub → 6,463 sub-sub.
Level 3 is always a leaf; some branches end at level 2.

Each node: `{ id, name, slug, image, parentId, depth, productTotal?, childCount? }`.
Names are real display names (`"Backpack Bed, Bed-in-Bed/Co-sleeper"`), not slugified guesses.
IDs are unique, every `parentId` resolves, no orphans.

Build an in-memory index at boot: `byId`, `bySlug` (`"<id>-<slug>"`), `childrenOf(id)`,
`ancestorsOf(id)` for breadcrumbs. This is static data — zero request cost, instant navigation.

> 6,463 leaf nodes have no `productTotal` (collecting them would have cost 6,463 extra requests).
> 15 leaves lack images. Design must tolerate both.

### 3.2 Category listings require HTML parsing

There is no JSON endpoint. Fetch `GET /categories/<id>-<slug>?page=<n>` and extract from the
markup. **This extractor is validated — 24/24 products per page.**

Each product tile is an anchor whose querystring carries the display data:

```
/products/p-<code>?n=<url-encoded-name>&p=<price>&c=<url-encoded-currency>
```

```ts
// Unescape first: RSC payloads use \u0026, server HTML uses &amp;
const norm = html.replaceAll("\\u0026", "&").replaceAll("&amp;", "&");

const TILE = /\/products\/p-(\d+)\?n=([^"\\&]*)&p=([0-9.]+)&c=([^"\\&]*)/g;
// -> code, name (decodeURIComponent + '+' → ' '), price (float), currency

const TOTAL = /\{\\"total\\":(\d+)\}/;        // page's product total
const IMG   = /https:\/\/cbu01\.alicdn\.com\/[^"\\ ]+/g;   // product images
```

Notes:
- The `<img alt="...">` on each tile holds the **full untruncated name**; the `n=` param is truncated
  to ~100 chars. Prefer `alt` when you can associate it with the tile.
- De-duplicate by `code` — the same product can appear more than once in the markup.
- Images are `cbu01.alicdn.com`. Add that host to `next.config.ts` `images.remotePatterns`.
- **This is the most brittle part of the system.** Isolate it in one module. If the regex yields 0
  products on a page that returned 200 with >100KB of HTML, log loudly — that is the signal upstream
  markup changed.

### 3.3 Route → source map

| Route | Source |
|---|---|
| `/` | `/api/public/home` |
| `/categories` | `data/categories.json` (depth 1) |
| `/categories/[slug]` | children from `categories.json`; products via §3.2 HTML parse |
| `/products/[code]` | `/api/public/product?code=p-<code>&include=reviews,related` |
| `/search?q=` | `/api/chibox/v10_0_0-product/search` |
| `/deals` | `/api/public/home` → `dealProducts` + `hotProducts` |
| `/about-us`, `/help-center`, `/contact-us`, `/shipping`, `/support` | Structure only from `/api/public/home` → `pages[5]`. **Copy must be your own — see §3.4** |
| `/local-stores` | **does not exist — do not build** |

Exact CMS slugs (verified): `about-us`, `help-center`, `contact-us`, `shipping`, `support`.
All five carry `slug`, `title`, `subtitle`, `seoDescription`, `sections`; `about-us` additionally has
`heroTitle`, `heroSubtitle`, `story`, `stats`, `values`.

Banners carry `actionType: null` and `actionValue: null` — they are currently non-clickable images.
Render them as such; do not build link handling that assumes a destination exists.

### 3.4 Do not reuse upstream marketing copy

The CMS pages are **ChiBox's own brand copy** — `title: "About Chibox"`, their company story,
their stats, their support policies. Publishing that on Chippix would be both factually false and
a brand-impersonation problem.

Use these endpoints for **page structure only** (which pages exist, what sections they have).
Write original copy for all five. Product data is the thing being read live; company identity is not.
Shipping and support pages in particular must state *your* actual policies, not theirs.

---

## 4. Architecture

```
lib/chibox/
  config.ts      API_VERSION = "v10_0_0"  ← the ONLY place this string appears
  client.ts      fetchUpstream(): timeout, retry+backoff, cache policy, error taxonomy
  parse-list.ts  §3.2 HTML extractor — isolated, unit-tested against a saved fixture
  home.ts        getHome()
  product.ts     getProduct(code)
  search.ts      search(q, page)
  listing.ts     getCategoryProducts(categoryKey, page)
  types.ts       YOUR domain types (Product, Listing, CategoryNode, ...)
lib/categories/
  tree.ts        loads data/categories.json, builds indexes, breadcrumbs
data/
  categories.json
```

### 4.1 Adapter discipline

Every upstream call goes through `lib/chibox/`. Components import from `lib/chibox`, never
`fetch("https://chibox.app/...")` directly. Upstream field names get mapped to your own types at
this boundary. **Consequence:** migrating off this source later is a change to one directory.

### 4.2 Caching — mandatory, not optional

"Live" does not mean "uncached". At ~1.5s upstream, an uncached storefront is unusable. Use
Next.js `fetch` cache with short revalidation:

| Data | `revalidate` | Why |
|---|---|---|
| Category tree | ∞ (static import) | Shipped file |
| Home / deals | 300s | Merchandised, changes slowly |
| Category listing page | 120s | New products land on page 1 |
| Product detail | 60s | Price accuracy matters most here |
| Search | 60s | Per-query |

This still satisfies "new products appear immediately" at human timescales, while turning a
1.5s page into a sub-100ms one for all but the first visitor.

---

## 5. Failure behaviour — mirror the source, do not compensate for it

**The product decision: Chippix is a mirror.** If ChiBox returns products, show them. If it does
not, show nothing and say so plainly. Do **not** paper over upstream failure.

This makes one common pattern explicitly **forbidden**:

> **No stale-while-error.** Never serve an older cached copy when a fresh call fails. That would
> display products ChiBox is no longer showing — the opposite of a mirror. On failure, show an
> honest empty state.

Required in `client.ts`:

1. **Timeout** every request (8s hard ceiling via `AbortSignal.timeout`). Non-negotiable: without a
   timeout you cannot tell "no products" from "still waiting", and the page spins forever. A spinner
   that never resolves is worse than an empty state.
2. **Retry once** on network error / 5xx / timeout. Never retry a 4xx. One retry absorbs a dropped
   packet; more than that just makes a real outage take longer to admit.
3. **Honest empty states.** When a call fails or returns nothing, render a clear message
   ("No products available right now") — not a broken grid, not a skeleton frozen forever, not
   fabricated placeholder content.
4. **Per-section, not per-page.** If `hotProducts` fails but `banners` succeeds, show the banners.
   Each independent section gets its own `<Suspense>` + error boundary. This is still mirroring:
   you are showing exactly what came back.
5. **Stream.** Use `loading.tsx` and `<Suspense>` so shell + navigation paint instantly while product
   data streams in. Biggest perceived-performance lever available.
6. **Treat demo data as failure.** If a response contains code `CN-1004893524806` /
   "Adjustable sofa side table", upstream has fallen back to its seed data (§2.3.1). That is not
   real catalog content — discard it and render the empty state.
7. **Brand blocklist at render.** The upstream catalog contains counterfeit listings (verified:
   titles containing "Lv", "Dior", etc.). Filter matching products out of listings, search, and
   detail. One module, easy to extend. This is the one deliberate exception to mirroring.

Caching (§4.2) stays — but its job is **speed, not resilience**. Short revalidation windows keep
pages fast; they are not a fallback layer.

---

## 6. Design brief — go as far as you can with this

**Do not imitate ChiBox.** It is a generic Shein-derivative grid. Chippix should look like a
product someone chose, not a template someone filled. You have full latitude on visual direction —
typography, color, motion, layout system, art direction. Use it.

But the interesting work here is not decoration. It is these four constraints, which are real and
which most e-commerce design ignores:

**1. Design for hostile data.** This is the central problem. The catalog is machine-translated
wholesale data and it is *ugly*. These are **measured numbers**, not guesses — see
`data/stress-fixtures.json` for the real records:

- **Median title is 121 characters. Longest measured: 182.** 83% (119/144) exceed 100 chars.
  A real one, at 182: *"Armpit sweat-absorbent patch invisible armpit sweat-absorbent pad washable
  sweat-absorbent clothing patch summer thin breathable quick-drying antiperspirant pad sweat-absorbent towel"*
- **38% of products on the home page have no name at all** — 10 of 26 are a bare code like
  `CN-933022695798`. This is not an edge case; it is the front page.
- Prices span **`$0.0136` to `$79.55`** in the same grid, arriving with 4 decimal places
- `description` is almost always `null`; `rating` null; `ratingCount` 0; `reviews` `[]`
- Images vary wildly in aspect ratio, background, and quality
- Some `props` contain mojibake from broken encoding (e.g. `7天\udc90由退货`)

A design that only looks good with clean data is a failed design here. Decide deliberately: how
does a card handle a 182-character title? What renders when the name *is* the SKU — do you derive
something from `props` and `category`, lean on the image, or own it typographically? What does a
product page look like with no description, no rating, and no reviews, and how does it avoid feeling
broken rather than merely empty? Solve this and the whole site works. Ignore it and every page looks
like a bug.

`data/stress-fixtures.json` contains the real worst-case records — longest titles, code-only names,
sub-cent and high-end prices. **Build the card against that file before building any page.**

**2. Navigation is the product.** 1.64M products across 7,301 categories. The grid is not the hard
part — getting someone to the right leaf is. You have a fully-loaded 3-level tree with real names
and images available at zero request cost. Do something genuinely good with that: fast hierarchical
browse, breadcrumbs that orient, sibling/child pivots at every level. This is your biggest
advantage over the source, which buries its own taxonomy.

**3. Make waiting feel intentional.** Upstream is ~1.5s cold. Skeletons must match the final
layout so nothing shifts on load. Exploit a trick the source itself uses: product links carry
`n=` (name) and `p=` (price) in the querystring, so **you can render a product page's title and
price instantly from listing data** while the rest streams in. Optimistic navigation, no spinners
on primary paths, zero layout shift.

**4. Mobile-first, and accessible.** Assume phone traffic dominates. Real focus states, keyboard
navigation through the category tree, honest contrast, `prefers-reduced-motion` respected. Motion
should have a reason — arrival, state change, spatial continuity — not ambient decoration.

Be ambitious on: the category-tree navigation experience, product card typography under stress,
the variant/SKU selector (per-SKU pricing with color swatches is a genuinely rich interaction),
and how the home page frames 1.64M products without feeling like a warehouse. Ship a coherent
design system — tokens, scale, one type pairing, one motion vocabulary — not a pile of one-offs.

---

## 7. Acceptance criteria

- [ ] Home renders banners, categories, hot, and deal products from one `/api/public/home` call
- [ ] `/categories` lists all 30 top-level; drilling reaches depth 2 and depth 3 with correct breadcrumbs
- [ ] A depth-3 leaf renders 24 products/page with working pagination
- [ ] Product page: image gallery, per-SKU price resolution from `options` → `variations`, `props`
      table, related products. No empty review/rating/description sections when data is null
- [ ] Search works, paginates, and never displays an exact total
- [ ] Cart + wishlist persist across reload; checkout is an honest stub
- [ ] `data/categories.json` is the only category source; no runtime call tries to fetch sub-categories
- [ ] `API_VERSION` appears in exactly one file
- [ ] Killing network to `chibox.app` shows honest empty states — no crash, no infinite spinner, and
      **no stale products served from an earlier cache**
- [ ] A section that fails does not blank the sections that succeeded
- [ ] `/api/public/products` is never called anywhere in the codebase
- [ ] Prices always 2dp with upstream `currencySymbol`
- [ ] No `chibox.app` request originates from the browser (verify in devtools Network)
- [ ] Lighthouse: no layout shift on listing or detail pages
- [ ] Blocklisted brand terms do not appear in any listing
- [ ] No upstream marketing copy is reproduced — all five CMS pages have original text (§3.4)
- [ ] Product card survives the §9 stress fixtures without overflow, clipping, or layout shift

---

## 8. Known limitations to accept, not fix

- **Category listings depend on parsing upstream HTML.** It will break when they change markup.
  Contained to `parse-list.ts` by design.
- **`v10_0_0` will break on their next release.** One-constant fix.
- **Offset pagination over a live catalog** produces occasional gaps/duplicates across pages.
  De-dupe by `code` within a page; do not attempt to guarantee global coverage.
- **No real checkout is possible.** Upstream has no order API.
- **Leaf categories have no product counts.** Do not design UI that depends on them.

---

## 9. Build order

1. `lib/chibox/client.ts` + `config.ts` + `types.ts` — resilience layer first, everything depends on it
2. `lib/categories/tree.ts` — static, zero-risk, unblocks all navigation UI
3. `parse-list.ts` + unit test against a saved HTML fixture
4. Design system: tokens, type scale, motion vocabulary, product card under stress-test data
5. Routes: `/` → `/categories` → `/categories/[slug]` → `/products/[code]` → `/search` → `/deals` → CMS pages
6. Cart/wishlist, then resilience + accessibility pass against §7

Start with step 4's stress test against `data/stress-fixtures.json` — it already contains the
ugliest genuine records: 182-char titles, bare `CN-` codes as names, `$0.0136` and `$79.55` prices.
If the card survives those, the site will survive the catalog. Regenerate anytime with
`python scripts/make_fixtures.py`.

### Reference scripts already in the repo

| Script | Purpose |
|---|---|
| `scripts/crawl_categories.py` | Produced `data/categories.json` (7,301 nodes). Re-run to refresh the tree |
| `scripts/probe_depth.py` | Descends a branch to a leaf — proves the tree is 3 deep |
| `scripts/probe_ordering.py` | Confirms listings are recency-sorted and order is stable |
| `scripts/make_fixtures.py` | Regenerates `data/stress-fixtures.json` |

These are recon/build tooling in Python. They are **not** part of the Next.js app and should not be
ported into it — the app reads `data/*.json` and calls upstream live.
