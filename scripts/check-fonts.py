#!/usr/bin/env python3
"""Verify the committed fonts still satisfy the design system's guarantees.

This deliberately does not byte-compare against a fresh build. woff2 output is not
reproducible across fontTools and brotli versions, so a byte comparison would fail
for reasons that have nothing to do with correctness. What matters is coverage:

  1. The monospace font contains EXACTLY the glyphs in MONO_SUBSET -- no more, so it
     cannot render prose, and no fewer, so no declared value renders as a fallback.
  2. The text font covers every character the site actually renders, including the
     acute accents in "Resume" and the dash, quote, and ellipsis families.
  3. Narrow punctuation in the monospace font has a proportional advance, not the
     full monospace cell, and digits still share one advance so numerals align.
  4. The zero is plain. IBM Plex Mono draws a marked zero and offers no OpenType
     feature to turn it off, so the mark is removed by editing the outline -- which
     means a regeneration could silently restore it. This is the guard.

Run locally with `npm run lint:fonts`; CI runs the same script.
"""

from __future__ import annotations

import pathlib
import re
import sys

from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
MONO = ROOT / "public" / "fonts" / "plex-mono-measured.woff2"
TEXT = ROOT / "public" / "fonts" / "instrument-sans-latin.woff2"
OG = ROOT / "src" / "assets" / "og" / "instrument-sans-og.ttf"

# Characters the site is known to render in the grotesk beyond plain ASCII.
REQUIRED_TEXT_CHARS = "éÉ—–’‘“”…·"

failures: list[str] = []


def mono_subset() -> str:
    src = (ROOT / "src" / "lib" / "mono-subset.ts").read_text()
    match = re.search(r"MONO_SUBSET\s*=\s*'([^']*)'", src)
    if not match:
        sys.exit("could not read MONO_SUBSET from src/lib/mono-subset.ts")
    return match.group(1)


def coverage(path: pathlib.Path) -> set[int]:
    if not path.exists():
        failures.append(f"missing font: {path.relative_to(ROOT)}")
        return set()
    return set(TTFont(path).getBestCmap())


declared = mono_subset()
declared_points = {ord(c) for c in declared}

mono_points = coverage(MONO)
if mono_points:
    missing = declared_points - mono_points
    extra = mono_points - declared_points
    if missing:
        failures.append(
            "monospace font is missing declared glyphs: "
            + ", ".join(f"U+{cp:04X} ({chr(cp)!r})" for cp in sorted(missing))
        )
    if extra:
        failures.append(
            "monospace font contains glyphs outside MONO_SUBSET, so it could render "
            "text that is not a measured value: "
            + ", ".join(f"U+{cp:04X} ({chr(cp)!r})" for cp in sorted(extra))
        )
    if not missing and not extra:
        print(f"  mono font: exactly {len(mono_points)} glyphs, matching MONO_SUBSET")

# The punctuation advances are corrected in scripts/subset-fonts.py. Left at the
# monospace default of 600, a comma whose ink is 182 units sits in a cell with 418
# units of air, and "5,000" renders as "5 , 000" at display sizes.
NARROW_PUNCTUATION = {",": "comma", ".": "period", ":": "colon"}
MAX_PUNCTUATION_RATIO = 0.65
SIDEBEARING_TOLERANCE = 2

if MONO.exists():
    mono = TTFont(MONO)
    mono_cmap = mono.getBestCmap()
    hmtx = mono["hmtx"]
    glyf = mono["glyf"]

    digit_advances = {hmtx[mono_cmap[ord(d)]][0] for d in "0123456789" if ord(d) in mono_cmap}
    if len(digit_advances) != 1:
        failures.append(
            f"digits no longer share one advance ({sorted(digit_advances)}), so numerals "
            "will not align in a column"
        )
    digit_advance = next(iter(digit_advances)) if digit_advances else 0

    # The zero is drawn with three contours -- bowl, counter, mark -- and ships with
    # the mark dropped, leaving two. Three means the mark is back.
    PLAIN_ZERO_CONTOURS = 2
    if ord("0") in mono_cmap:
        zero = glyf[mono_cmap[ord("0")]]
        zero.expand(glyf)
        if zero.isComposite():
            failures.append("'zero' is composite; expected a simple outline")
        elif zero.numberOfContours != PLAIN_ZERO_CONTOURS:
            failures.append(
                f"'zero' has {zero.numberOfContours} contours, expected "
                f"{PLAIN_ZERO_CONTOURS}. The mark is back: at 96px it reads as a code "
                "editor, which this design avoids, and a strip of pure numerals has no "
                "letter O to disambiguate from. Re-run scripts/subset-fonts.py "
                "(the plain zero is the default; --dotted-zero is comparison only)."
            )
        else:
            print(f"  zero: {zero.numberOfContours} contours (plain, mark removed)")

    for char, glyph_name in NARROW_PUNCTUATION.items():
        code = ord(char)
        if code not in mono_cmap:
            continue
        advance, lsb = hmtx[mono_cmap[code]]
        ratio = advance / digit_advance if digit_advance else 1.0

        if ratio > MAX_PUNCTUATION_RATIO:
            failures.append(
                f"{glyph_name!r} advance is {advance}, {ratio:.0%} of a digit's {digit_advance}. "
                f"It should be proportional to its own ink (under {MAX_PUNCTUATION_RATIO:.0%}); "
                "at the full monospace cell it renders with visible gaps either side. "
                "Re-run scripts/subset-fonts.py."
            )
            continue

        glyph = glyf[mono_cmap[code]]
        glyph.recalcBounds(glyf)
        left = lsb
        right = advance - glyph.xMax
        if abs(left - right) > SIDEBEARING_TOLERANCE:
            failures.append(
                f"{glyph_name!r} is not centred in its cell: left sidebearing {left}, "
                f"right {right}. Re-run scripts/subset-fonts.py."
            )

    if not any("advance" in f or "centred" in f or "align" in f for f in failures):
        shown = ", ".join(
            f"{c} {hmtx[mono_cmap[ord(c)]][0]}" for c in NARROW_PUNCTUATION if ord(c) in mono_cmap
        )
        print(f"  mono metrics: digits {digit_advance} (tabular), narrowed {shown}")

for label, path in (("text font", TEXT), ("Open Graph font", OG)):
    points = coverage(path)
    if not points:
        continue
    missing = [c for c in REQUIRED_TEXT_CHARS if ord(c) not in points]
    ascii_missing = [chr(c) for c in range(0x20, 0x7F) if c not in points]
    if missing or ascii_missing:
        failures.append(
            f"{label} is missing characters the site renders: "
            + ", ".join(repr(c) for c in [*ascii_missing, *missing])
        )
    else:
        print(f"  {label}: {len(points)} glyphs, covers ASCII and {REQUIRED_TEXT_CHARS}")

if failures:
    print("\n  Font check failed.\n", file=sys.stderr)
    for failure in failures:
        print(f"  - {failure}", file=sys.stderr)
    print(
        "\n  Regenerate with `python3 scripts/subset-fonts.py` and commit the result.\n",
        file=sys.stderr,
    )
    sys.exit(1)
