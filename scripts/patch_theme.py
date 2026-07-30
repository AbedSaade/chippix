"""One-shot theme patch: brand palette + smaller type scale.

Applies literal, asserted replacements to app/globals.css so every change is
reviewable and fails loudly if the source drifts. Safe to read; run once.
"""

from pathlib import Path

CSS = Path("app/globals.css")
text = CSS.read_text(encoding="utf-8")

# (old, new, label) — each old must appear exactly once
EDITS: list[tuple[str, str, str]] = [
    # ---- 1. BRAND PALETTE (Shippix: deep teal + coral + cream) ----
    (
        """  --paper: #f2efe5;
  --paper-deep: #e7e1d2;
  --ink: #171714;
  --muted: #67655e;
  --line: #c9c3b5;
  --signal: #ff4f1f;
  --acid: #d8ff3e;
  --blue: #bfd9ff;
  --white: #fffef8;""",
        """  --paper: #f4ecdb;
  --paper-deep: #eae0ca;
  --ink: #143f4e;
  --muted: #5c6b70;
  --line: #ccc2ac;
  --signal: #dd5f37;
  --acid: #f2c3ad;
  --blue: #e9dcc4;
  --white: #fffdf6;
  --teal: #1e6d8b;""",
        "palette",
    ),
    # hero image overlay: lime -> coral tint
    (
        """    linear-gradient(135deg, transparent 72%, rgba(216, 255, 62, 0.55)),
    linear-gradient(to bottom, transparent 75%, rgba(23, 23, 20, 0.24));""",
        """    linear-gradient(135deg, transparent 72%, rgba(221, 95, 55, 0.4)),
    linear-gradient(to bottom, transparent 75%, rgba(20, 63, 78, 0.28));""",
        "hero overlay",
    ),
    # hero empty state stripes: blue -> warm cream
    (
        """      var(--blue),
      var(--blue) 24px,
      #aac7f2 24px,
      #aac7f2 25px""",
        """      var(--blue),
      var(--blue) 24px,
      #d9c9a8 24px,
      #d9c9a8 25px""",
        "hero empty",
    ),
    # product card visual bg gradient: blue -> warm tint
    (
        "    linear-gradient(135deg, rgba(191, 217, 255, 0.55), transparent 50%),\n    #e5e3dc;",
        "    linear-gradient(135deg, rgba(30, 109, 139, 0.14), transparent 52%),\n    #ece7da;",
        "card visual",
    ),
    # product gallery main bg gradient: blue -> warm tint
    (
        "    linear-gradient(135deg, rgba(191, 217, 255, 0.6), transparent 46%),\n    #e4e1d8;",
        "    linear-gradient(135deg, rgba(30, 109, 139, 0.15), transparent 48%),\n    #e9e3d6;",
        "gallery bg",
    ),
    # dark inner borders/greys: neutral -> teal-tinted
    ("border-right: 1px solid #4a4943;", "border-right: 1px solid #2c5766;", "menu border r"),
    ("border-bottom: 1px solid #4a4943;", "border-bottom: 1px solid #2c5766;", "menu border b"),
    ("  border: 1px solid #53524d;\n  background: #53524d;", "  border: 1px solid #2c5766;\n  background: #2c5766;", "rail track"),
    ("  background: #2c2c29;", "  background: #1c5364;", "tile img bg"),
    ("  border-top: 1px solid #53524d;\n  color: #aaa89f;", "  border-top: 1px solid #2c5766;\n  color: #a9c2cb;", "footer rule"),

    # ---- 2. TYPE SCALE: dial the big display sizes down ----
    ("  font-size: clamp(4rem, 9vw, 10rem);\n  font-weight: 400;\n  letter-spacing: -0.075em;\n  line-height: 0.76;",
     "  font-size: clamp(2.6rem, 6vw, 5.2rem);\n  font-weight: 400;\n  letter-spacing: -0.06em;\n  line-height: 0.9;",
     "hero h1"),
    ("  margin: 1.25rem 0 1.8rem;\n  font-family: var(--serif);",
     "  margin: 0.9rem 0 1.4rem;\n  font-family: var(--serif);",
     "hero h1 margin"),
    ("  max-width: 34rem;\n  margin: 0;\n  font-size: clamp(1rem, 1.4vw, 1.3rem);\n  line-height: 1.45;",
     "  max-width: 34rem;\n  margin: 0;\n  font-size: clamp(0.95rem, 1.1vw, 1.08rem);\n  line-height: 1.5;",
     "hero dek"),
    ("  padding: clamp(3rem, 7vw, 8rem) clamp(1.25rem, 6vw, 7rem);",
     "  padding: clamp(2.5rem, 5vw, 5rem) clamp(1.25rem, 5vw, 5rem);",
     "hero copy pad"),
    # catalog menu intro headline
    ("  font-family: var(--serif);\n  font-size: clamp(2rem, 4vw, 4.5rem);\n  font-weight: 400;\n  letter-spacing: -0.055em;\n  line-height: 0.92;",
     "  font-family: var(--serif);\n  font-size: clamp(1.6rem, 3vw, 2.8rem);\n  font-weight: 400;\n  letter-spacing: -0.045em;\n  line-height: 0.98;",
     "menu intro"),
    # section headings
    ("  font-family: var(--serif);\n  font-size: clamp(2.5rem, 5vw, 5.6rem);\n  font-weight: 400;\n  letter-spacing: -0.065em;\n  line-height: 0.9;",
     "  font-family: var(--serif);\n  font-size: clamp(1.9rem, 3.2vw, 3.2rem);\n  font-weight: 400;\n  letter-spacing: -0.05em;\n  line-height: 0.96;",
     "section h2"),
    ("  padding: clamp(3rem, 7vw, 7rem) clamp(1rem, 3vw, 3rem);\n  border-bottom: 1px solid var(--ink);",
     "  padding: clamp(2.25rem, 4.5vw, 4rem) clamp(1rem, 3vw, 3rem);\n  border-bottom: 1px solid var(--ink);",
     "section pad"),
    ("  gap: 0.8rem 2rem;\n  margin-bottom: clamp(2rem, 4vw, 4rem);",
     "  gap: 0.8rem 2rem;\n  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);",
     "section head mb"),
    # page intro
    ("  max-width: 12ch;\n  margin: 0;\n  font-family: var(--serif);\n  font-size: clamp(4rem, 9vw, 10rem);\n  font-weight: 400;\n  letter-spacing: -0.075em;\n  line-height: 0.8;",
     "  max-width: 12ch;\n  margin: 0;\n  font-family: var(--serif);\n  font-size: clamp(2.6rem, 6vw, 5rem);\n  font-weight: 400;\n  letter-spacing: -0.06em;\n  line-height: 0.92;",
     "page intro h1"),
    # department index
    ("  font-family: var(--serif);\n  font-size: clamp(1.4rem, 3vw, 3rem);\n  font-weight: 400;\n  letter-spacing: -0.045em;\n  line-height: 1;",
     "  font-family: var(--serif);\n  font-size: clamp(1.2rem, 2.2vw, 2rem);\n  font-weight: 400;\n  letter-spacing: -0.035em;\n  line-height: 1.02;",
     "dept index"),
    # category header
    ("  max-width: 14ch;\n  margin: 0.7rem 0 0;\n  font-family: var(--serif);\n  font-size: clamp(3.8rem, 8vw, 9rem);\n  font-weight: 400;\n  letter-spacing: -0.075em;\n  line-height: 0.82;",
     "  max-width: 16ch;\n  margin: 0.6rem 0 0;\n  font-family: var(--serif);\n  font-size: clamp(2.4rem, 5vw, 4.4rem);\n  font-weight: 400;\n  letter-spacing: -0.055em;\n  line-height: 0.92;",
     "category header"),
    # product purchase title
    ("  overflow-wrap: anywhere;\n  font-family: var(--serif);\n  font-size: clamp(2.2rem, 4.6vw, 5.8rem);\n  font-weight: 400;\n  letter-spacing: -0.065em;\n  line-height: 0.9;",
     "  overflow-wrap: anywhere;\n  font-family: var(--serif);\n  font-size: clamp(1.7rem, 3.2vw, 3rem);\n  font-weight: 400;\n  letter-spacing: -0.045em;\n  line-height: 1;",
     "purchase h1"),
    # product price
    ("  font-family: var(--serif);\n  font-size: clamp(2.3rem, 5vw, 5rem);\n  letter-spacing: -0.06em;\n  line-height: 0.9;",
     "  font-family: var(--serif);\n  font-size: clamp(1.9rem, 3.5vw, 3rem);\n  letter-spacing: -0.05em;\n  line-height: 0.95;",
     "product price"),
    # product copy / ledger h2
    ("  font-family: var(--serif);\n  font-size: clamp(2.5rem, 5vw, 5.5rem);\n  font-weight: 400;\n  letter-spacing: -0.06em;\n  line-height: 0.9;",
     "  font-family: var(--serif);\n  font-size: clamp(1.8rem, 3.2vw, 3rem);\n  font-weight: 400;\n  letter-spacing: -0.05em;\n  line-height: 0.95;",
     "copy/ledger h2"),
    # search label + input
    ("  font-family: var(--serif);\n  font-size: clamp(2.5rem, 6vw, 7rem);\n  letter-spacing: -0.07em;\n  line-height: 0.85;",
     "  font-family: var(--serif);\n  font-size: clamp(2rem, 4vw, 3.6rem);\n  letter-spacing: -0.055em;\n  line-height: 0.92;",
     "search label"),
    ("  background: transparent;\n  font-family: var(--serif);\n  font-size: clamp(1.5rem, 3vw, 3rem);",
     "  background: transparent;\n  font-family: var(--serif);\n  font-size: clamp(1.2rem, 2vw, 1.8rem);",
     "search input"),
    # content page hero
    ("  position: relative;\n  min-height: 70svh;\n  padding: clamp(3rem, 8vw, 9rem) clamp(1rem, 6vw, 7rem);\n  border-bottom: 1px solid var(--ink);\n  background: var(--acid);",
     "  position: relative;\n  min-height: auto;\n  padding: clamp(2.5rem, 5vw, 4.5rem) clamp(1rem, 5vw, 5rem);\n  border-bottom: 1px solid var(--ink);\n  background: var(--acid);",
     "content hero box"),
    ("  max-width: 12ch;\n  margin: 1rem 0 2rem;\n  font-family: var(--serif);\n  font-size: clamp(4rem, 10vw, 11rem);\n  font-weight: 400;\n  letter-spacing: -0.08em;\n  line-height: 0.78;",
     "  max-width: 14ch;\n  margin: 0.8rem 0 1.5rem;\n  font-family: var(--serif);\n  font-size: clamp(2.6rem, 6vw, 5rem);\n  font-weight: 400;\n  letter-spacing: -0.06em;\n  line-height: 0.9;",
     "content h1"),
    ("  max-width: 48rem;\n  font-size: clamp(1rem, 1.5vw, 1.35rem);\n  line-height: 1.5;",
     "  max-width: 48rem;\n  font-size: clamp(0.98rem, 1.1vw, 1.12rem);\n  line-height: 1.55;",
     "content lede"),
    # content sections h2
    ("  font-family: var(--serif);\n  font-size: clamp(2rem, 4vw, 4rem);\n  font-weight: 400;\n  letter-spacing: -0.055em;\n  line-height: 0.95;",
     "  font-family: var(--serif);\n  font-size: clamp(1.6rem, 2.8vw, 2.4rem);\n  font-weight: 400;\n  letter-spacing: -0.045em;\n  line-height: 1;",
     "content section h2"),
    # message page
    ("  max-width: 12ch;\n  margin: 1rem 0;\n  font-family: var(--serif);\n  font-size: clamp(4rem, 9vw, 9rem);\n  font-weight: 400;\n  letter-spacing: -0.075em;\n  line-height: 0.8;",
     "  max-width: 14ch;\n  margin: 0.8rem 0;\n  font-family: var(--serif);\n  font-size: clamp(2.6rem, 6vw, 4.4rem);\n  font-weight: 400;\n  letter-spacing: -0.06em;\n  line-height: 0.92;",
     "message h1"),
    # footer mark + statement
    ("  margin: 0;\n  font-size: clamp(2rem, 4vw, 4rem);\n  font-weight: 900;\n  letter-spacing: -0.07em;",
     "  margin: 0;\n  font-size: clamp(1.5rem, 2.5vw, 2.3rem);\n  font-weight: 900;\n  letter-spacing: -0.05em;",
     "footer mark"),
    ("  max-width: 17ch;\n  margin: 0;\n  font-family: var(--serif);\n  font-size: clamp(2rem, 4vw, 4rem);\n  letter-spacing: -0.055em;\n  line-height: 0.9;",
     "  max-width: 20ch;\n  margin: 0;\n  font-family: var(--serif);\n  font-size: clamp(1.5rem, 2.5vw, 2.2rem);\n  letter-spacing: -0.04em;\n  line-height: 0.98;",
     "footer statement"),
    # derived (code-only) card title
    ("  max-width: 12ch;\n  font-family: var(--serif);\n  font-size: clamp(1.35rem, 2vw, 2rem);\n  font-style: italic;",
     "  max-width: 12ch;\n  font-family: var(--serif);\n  font-size: clamp(1.15rem, 1.6vw, 1.6rem);\n  font-style: italic;",
     "derived card h3"),
    # mobile hero h1
    ("    font-size: clamp(4.3rem, 20vw, 8rem);",
     "    font-size: clamp(2.3rem, 11vw, 3.6rem);",
     "mobile hero h1"),
    # ---- 3. WORDMARK sizing for logo image ----
    ("""  padding-right: clamp(1.2rem, 3vw, 3rem);
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: -0.06em;""",
     """  display: flex;
  align-items: center;
  padding-right: clamp(1.2rem, 3vw, 3rem);""",
     "wordmark box"),
    (""".wordmark span {
  position: relative;
  top: -0.7em;
  margin-left: 0.12rem;
  font-size: 0.38em;
}""",
     """.wordmark img {
  height: 1.7rem;
  width: auto;
  display: block;
}""",
     "wordmark img"),
]

for old, new, label in EDITS:
    n = text.count(old)
    assert n == 1, f"[{label}] expected 1 match, found {n}"
    text = text.replace(old, new)

CSS.write_text(text, encoding="utf-8")
print(f"applied {len(EDITS)} edits to {CSS}")
