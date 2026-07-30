"""Crawl the full ChiBox category tree (top-level -> children -> grandchildren).

The site exposes only its 30 top-level categories via /api/public/categories.
Deeper levels are discoverable only from the rendered category pages, which
render a strip of child-category links plus a {"total":N} product count.

Usage:
    python scripts/crawl_categories.py               # full crawl
    python scripts/crawl_categories.py --max-depth 2 # stop at children
    python scripts/crawl_categories.py --sample 20   # only probe N children (fast recon)

Output: data/categories.json
"""

from __future__ import annotations

import argparse
import concurrent.futures as cf
import html as html_mod
import json
import random
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

BASE = "https://chibox.app"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)

# A child-category tile: <a href="/categories/<id>-<slug>"> ...<img>... <span class="clamp-2">Name</span></a>
CAT_ANCHOR = re.compile(
    r'<a[^>]*href="/categories/(\d+)-([a-z0-9\-]+)"[^>]*>(.*?)</a>', re.S
)
LABEL = re.compile(r'<span class="clamp-2[^"]*">([^<]+)</span>')
CAT_IMG = re.compile(r"/_next/image\?url=([^&\"]+)")
TOTAL = re.compile(r'\{\\"total\\":(\d+)\}')

OUT = Path("data/categories.json")

_print_lock = threading.Lock()


def log(msg: str) -> None:
    with _print_lock:
        print(msg, flush=True)


def fetch(url: str, timeout: int = 90, attempts: int = 3) -> str:
    last = None
    for i in range(attempts):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read().decode("utf-8", "replace")
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            last = e
            if i < attempts - 1:
                time.sleep(1.5 * (i + 1) + random.random())
    raise RuntimeError(f"failed after {attempts}: {url} ({last})")


def top_level() -> list[dict]:
    data = json.loads(fetch(f"{BASE}/api/public/categories"))["categories"]
    return [
        {
            "id": c["id"],
            "name": c["name"],
            "slug": c["slug"],
            "image": c.get("image"),
            "depth": 1,
        }
        for c in data
    ]


def scrape(cat: dict, chrome: set[int]) -> tuple[int | None, list[dict]]:
    """Return (product_total, child_categories) for one category page."""
    html = fetch(f"{BASE}/categories/{cat['id']}-{cat['slug']}?page=1").replace("&amp;", "&")

    m = TOTAL.search(html)
    total = int(m.group(1)) if m else None

    children, seen = [], set()
    for cid, cslug, inner in CAT_ANCHOR.findall(html):
        cid = int(cid)
        if cid in chrome or cid == cat["id"] or cid in seen:
            continue
        label = LABEL.search(inner)
        if not label:
            # nav/breadcrumb/footer links have no tile label - not children
            continue
        seen.add(cid)
        img = CAT_IMG.search(inner)
        children.append(
            {
                "id": cid,
                "slug": cslug,
                "name": html_mod.unescape(label.group(1)).strip(),
                "image": urllib.parse.unquote(img.group(1)) if img else None,
                "parentId": cat["id"],
                "depth": cat["depth"] + 1,
            }
        )
    return total, children


def crawl_level(cats: list[dict], chrome: set[int], workers: int, label: str) -> list[dict]:
    """Attach productTotal to each cat in `cats`; return the next level down."""
    next_level: list[dict] = []
    done = 0

    def work(c: dict):
        try:
            return c, scrape(c, chrome)
        except Exception as e:  # noqa: BLE001 - record and continue
            return c, (None, [])

    with cf.ThreadPoolExecutor(max_workers=workers) as ex:
        for cat, (total, kids) in ex.map(work, cats):
            cat["productTotal"] = total
            cat["childCount"] = len(kids)
            next_level.extend(kids)
            done += 1
            log(
                f"  [{label}] {done}/{len(cats)}  {cat['name'][:38]:40} "
                f"products={total if total is not None else '?':>8}  children={len(kids)}"
            )

    return next_level


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-depth", type=int, default=3)
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--sample", type=int, default=0, help="probe only N cats per level (recon)")
    args = ap.parse_args()

    OUT.parent.mkdir(parents=True, exist_ok=True)

    log("Fetching top-level categories...")
    level1 = top_level()
    chrome = {c["id"] for c in level1}  # nav/footer links appear on every page
    log(f"  {len(level1)} top-level categories\n")

    all_cats: list[dict] = list(level1)
    current = level1
    depth = 1

    while current and depth < args.max_depth:
        probe = current
        if args.sample and len(probe) > args.sample:
            probe = random.sample(probe, args.sample)
            log(f"\nDepth {depth}: sampling {len(probe)} of {len(current)}")
        else:
            log(f"\nDepth {depth}: crawling {len(probe)} categories")

        nxt = crawl_level(probe, chrome, args.workers, f"L{depth}")

        # de-dupe children that appear under multiple parents
        seen = {c["id"] for c in all_cats}
        nxt = [c for c in nxt if c["id"] not in seen and not seen.add(c["id"])]

        all_cats.extend(nxt)
        log(f"  -> discovered {len(nxt)} categories at depth {depth + 1}")
        current = nxt
        depth += 1

    by_depth: dict[int, int] = {}
    for c in all_cats:
        by_depth[c["depth"]] = by_depth.get(c["depth"], 0) + 1

    payload = {
        "source": BASE,
        "crawledAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "counts": {"total": len(all_cats), "byDepth": by_depth},
        "categories": all_cats,
    }
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    log("\n" + "=" * 60)
    log(f"categories by depth: {by_depth}")
    log(f"total categories:    {len(all_cats)}")
    leaves = [c for c in all_cats if c.get("childCount") == 0 and c.get("productTotal")]
    if leaves:
        log(f"leaf product sum:    {sum(c['productTotal'] for c in leaves):,}")
    log(f"written -> {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
