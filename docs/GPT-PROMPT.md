# Kickoff prompt for GPT-5.6 Sol

Paste everything below the line.

---

You're building **Chippix**, an e-commerce storefront, in this repo. It's currently empty except
for `docs/`, `data/`, and `scripts/`.

**Read `docs/BUILD-SPEC.md` completely before writing any code.** It's a verified technical spec —
every endpoint, latency figure, and data quirk in it was measured against the live source, not
assumed. Don't guess at anything it already answers, and don't contradict it.

Also load these two data files, they're inputs you'll depend on:
- `data/categories.json` — the full 7,301-node category tree (30 top-level → 808 sub → 6,463 sub-sub)
- `data/stress-fixtures.json` — real worst-case product records

## What this app does

Chippix reads its catalog **live** from `chibox.app` on every request. No database, no sync job.
It's a mirror: if ChiBox returns products, show them; if it doesn't, show an honest empty state.
Never serve stale cached data to cover an upstream failure — spec §5 explains why that's forbidden
rather than merely unnecessary.

Stack: Next.js 15 (App Router, RSC), TypeScript, Tailwind. All upstream calls happen server-side.

## Design: this is the part I want you to push hardest on

**You have full design authority. Use all of it.** Don't ask me to approve colors, type, or layout
directions — make the call, commit to it, and build it. I'd rather see a strong opinionated result I
disagree with somewhere than a safe one nobody remembers.

Do not build a generic Tailwind template. Do not imitate ChiBox — it's a stock Shein-derivative
grid. And do not default to "modern, clean, minimal"; that's a way of avoiding a decision. Pick an
actual point of view and carry it through consistently — type, color, spacing, motion, density,
art direction.

**The real design problem here isn't decoration — it's that the data is genuinely hostile.** This is
measured, from `data/stress-fixtures.json`:

- Median product title is **121 characters**; the longest is **182**
- **38% of home-page products have no name at all** — just a bare code like `CN-933022695798`
- Prices run `$0.0136` to `$79.55` in the same grid, arriving with 4 decimals
- `description`, `rating`, and `reviews` are almost always null or empty
- Images vary wildly in aspect ratio, background, and quality

A design that only looks good with clean data fails here. **Build the product card against those
fixtures before you build a single page.** Decide deliberately: what happens to a 182-character
title? What do you render when the product's name *is* its SKU — derive something from `props` and
category, lean on the image, own it typographically? What does a product page look like with no
description, no rating, and no reviews, and how do you make that feel intentional rather than broken?

Get that right and the whole site works. Skip it and every page looks like a bug.

Four more things worth being ambitious about:

1. **Navigation is the product.** 1.64M items across 7,301 categories. The grid isn't the hard part —
   getting someone to the right leaf is. You have the entire tree in memory at zero request cost,
   with real names and images. Do something genuinely good with it. This is your biggest advantage
   over the source, which buries its own taxonomy.
2. **The variant selector.** Products have per-SKU pricing with color swatch images (spec §2.2).
   That's a rich interaction — selecting options resolves to a variation and updates the price.
3. **Make waiting feel intentional.** Upstream is ~1.5s. Skeletons must match final layout so nothing
   shifts. Exploit the trick in spec §6: product links carry the name and price in the querystring,
   so you can paint a product page's title and price *instantly* while the rest streams in.
4. **Craft bar.** A real design system — tokens, one type pairing, one motion vocabulary — not a pile
   of one-offs. Mobile-first. Real focus states, keyboard navigation through the tree, honest
   contrast, `prefers-reduced-motion` respected. Motion needs a reason: arrival, state change,
   spatial continuity. Never ambient decoration.

## Five things that will silently break the build

These are in the spec but they're easy to skim past, so: 

1. **Never call `/api/public/products`.** It caps at 12 items and silently returns hardcoded demo
   data on upstream failure. If you ever see "Adjustable sofa side table", that's the tell.
2. **Category listings have no JSON endpoint.** Browsing a category means parsing ChiBox's rendered
   HTML server-side. The validated extractor is in spec §3.2 — isolate it in one module, it's the
   most brittle part of the system.
3. **The string `v10_0_0` goes in exactly one file.** It's their release version, baked into the
   search URL. It will 404 on their next release and you'll want a one-line fix.
4. **Never call `chibox.app` from the browser.** Server Components and Route Handlers only.
5. **The CMS pages are ChiBox's own brand copy** ("About Chibox", their story, their policies).
   Use those endpoints for page *structure* only and write original copy. Don't republish theirs.

Also: don't build `/local-stores` (upstream returns zero items), and don't port the Python scripts
in `scripts/` into the app — they're recon tooling that produced the data files.

## How to work

Follow the build order in spec §9: resilience layer → category tree → HTML extractor + a unit test
against a saved fixture → design system and stress-tested card → routes → cart/wishlist →
accessibility pass.

Actually run things. Install dependencies, start the dev server, load the pages, confirm real data
renders. Verify against the acceptance criteria in spec §7 rather than assuming. When upstream is
slow or flaky, that's expected — handle it per §5, don't work around it by faking data.

If you hit something the spec genuinely doesn't cover, make a reasonable decision, note it, and keep
going. Only stop and ask if you're blocked on something that would make the work useless if you
guessed wrong.

Start by reading the spec and the two data files, then tell me your design direction in a few
sentences and begin.
