"""Is category listing order stable / recency-sorted?

This decides whether incremental sync is cheap (crawl page 1..k until you hit
known IDs) or expensive (full re-crawl every time). We compare the backend's
internal auto-increment `id` for products on an early page vs a deep page.
"""

from __future__ import annotations

import json
import re
import sys
import urllib.parse
import urllib.request

BASE = "https://chibox.app"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126 Safari/537.36"}
CODE = re.compile(r"/products/p-(\d+)")


def get(url: str, t: int = 90) -> str:
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=t) as r:
        return r.read().decode("utf-8", "replace")


def codes_on(cat: str, page: int) -> list[str]:
    html = get(f"{BASE}/categories/{cat}?page={page}")
    return list(dict.fromkeys(CODE.findall(html)))


def internal_id(code: str) -> tuple[int | None, float | None]:
    raw = get(f"{BASE}/api/public/product?code=p-{code}&include=")
    p = json.loads(raw).get("data", {}).get("product") or {}
    return p.get("id"), p.get("price")


def main() -> int:
    cat = sys.argv[1] if len(sys.argv) > 1 else "781-women-s-clothing"
    pages = [int(x) for x in (sys.argv[2].split(",") if len(sys.argv) > 2 else ["1", "400"])]

    for pg in pages:
        cs = codes_on(cat, pg)
        print(f"\npage {pg}: {len(cs)} products")
        for c in cs[:3]:
            iid, price = internal_id(c)
            print(f"   code={c:<16} internal_id={iid}  price={price}")

    print("\nRepeat of page 1 (stability check):")
    a = codes_on(cat, 1)
    b = codes_on(cat, 1)
    same = a == b
    print(f"   identical order across two calls: {same}")
    if not same:
        print(f"   overlap: {len(set(a) & set(b))}/{len(a)} codes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
