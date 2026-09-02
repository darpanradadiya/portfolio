#!/usr/bin/env python3
"""Verify the committed fonts still satisfy the design system's guarantees.

This deliberately does not byte-compare against a fresh build. woff2 output is not
reproducible across fontTools and brotli versions, so a byte comparison would fail
for reasons that have nothing to do with correctness. What matters is coverage:

  1. The monospace font contains EXACTLY the glyphs in MONO_SUBSET -- no more, so it
     cannot render prose, and no fewer, so no declared value renders as a fallback.
  2. The text font covers every character the site actually renders, including the
     acute accents in "Resume" and the dash, quote, and ellipsis families.

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
