"""Probe a sample of deep categories to find the true maximum tree depth.

Walks down from a given category, following the first child that has children,
until it hits a leaf. Prints the chain so the real depth is visible.
"""

from __future__ import annotations

import sys

from crawl_categories import scrape, top_level


def walk(start: dict, chrome: set[int], limit: int = 6) -> None:
    cur = start
    for level in range(limit):
        total, kids = scrape(cur, chrome)
        print(
            f"  depth {cur['depth']}: {cur['name'][:44]:46} "
            f"products={total if total is not None else '?':>8}  children={len(kids)}"
        )
        if not kids:
            print(f"  -> LEAF at depth {cur['depth']}\n")
            return
        # descend into the child with the most products (most likely to branch)
        cur = kids[0]
    print("  -> hit walk limit\n")


def main() -> int:
    l1 = top_level()
    chrome = {c["id"] for c in l1}
    wanted = sys.argv[1:] or ["Women's Clothing", "Office & Culture", "Hardware & Tools"]

    for name in wanted:
        match = next((c for c in l1 if c["name"].lower().startswith(name.lower()[:12])), None)
        if not match:
            print(f"! no top-level category matching {name!r}")
            continue
        print(f"\n=== descending from {match['name']} ===")
        walk(match, chrome)
    return 0


if __name__ == "__main__":
    sys.exit(main())
