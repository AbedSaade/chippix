"""Pull real worst-case products so the product card can be stress-tested.

Writes data/stress-fixtures.json: the ugliest genuine records in the catalog —
code-only names, 140-char titles, sub-cent prices, missing images.
"""

from __future__ import annotations

import html as html_mod
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

BASE = "https://chibox.app"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126 Safari/537.36"}
TILE = re.compile(r"/products/p-(\d+)\?n=([^\"\\&]*)&p=([0-9.]+)&c=([^\"\\&]*)")
# the tile's <img alt> carries the FULL name; the n= param is truncated to 100 chars
TILE_ALT = re.compile(
    r'href="/products/p-(\d+)\?n=[^"]*&p=([0-9.]+)&c=([^"&]*)"[^>]*>.*?alt="([^"]*)"', re.S
)

# categories chosen to surface extremes: sub-cent wholesale + long-title fashion
SAMPLE = ["781-women-s-clothing", "753-household-daily-necessities", "765-packaging"]


def get(url: str, t: int = 90) -> str:
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=t) as r:
        return r.read().decode("utf-8", "replace")


def tiles(cat: str, page: int) -> list[dict]:
    html = get(f"{BASE}/categories/{cat}?page={page}").replace("\\u0026", "&").replace("&amp;", "&")
    out, seen = [], set()
    for code, p, c, alt in TILE_ALT.findall(html):
        if code in seen or not alt.strip():
            continue
        seen.add(code)
        out.append(
            {
                "code": code,
                "name": html_mod.unescape(alt).strip(),
                "price": float(p),
                "currency": urllib.parse.unquote(c),
            }
        )
    return out


def main() -> int:
    pool: list[dict] = []
    for cat in SAMPLE:
        for pg in (1, 2):
            try:
                pool += tiles(cat, pg)
            except Exception as e:  # noqa: BLE001
                print(f"  ! {cat} p{pg}: {e}")
    # de-dupe across categories
    seen: set[str] = set()
    pool = [p for p in pool if p["code"] not in seen and not seen.add(p["code"])]
    print(f"pool: {len(pool)} products")

    code_only = [p for p in pool if re.fullmatch(r"CN-\d+", p["name"])]
    longest = sorted(pool, key=lambda p: -len(p["name"]))[:5]
    cheapest = sorted(pool, key=lambda p: p["price"])[:5]
    priciest = sorted(pool, key=lambda p: -p["price"])[:3]

    fixtures = {
        "note": "Real worst-case records. Product card must survive all of these.",
        "codeOnlyNames": code_only[:5],
        "longestTitles": longest,
        "cheapest": cheapest,
        "priciest": priciest,
        "titleLengthStats": {
            "max": max(len(p["name"]) for p in pool),
            "median": sorted(len(p["name"]) for p in pool)[len(pool) // 2],
            "over100chars": sum(1 for p in pool if len(p["name"]) > 100),
            "codeOnly": len(code_only),
            "sampleSize": len(pool),
        },
    }

    out = Path("data/stress-fixtures.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(fixtures, indent=2, ensure_ascii=False), encoding="utf-8")

    s = fixtures["titleLengthStats"]
    print(f"\ntitle length  max={s['max']}  median={s['median']}")
    print(f"over 100 chars: {s['over100chars']}/{s['sampleSize']}   code-only names: {s['codeOnly']}")
    print(f"price range: {cheapest[0]['currency']}{cheapest[0]['price']} .. {priciest[0]['price']}")
    print(f"\nwritten -> {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
