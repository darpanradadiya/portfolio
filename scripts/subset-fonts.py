#!/usr/bin/env python3
"""Download and subset the two typefaces this site uses.

Run once; the resulting .woff2 files are committed. Fonts do not change between
builds, so this is deliberately not part of `npm run build`.

    python3 scripts/subset-fonts.py

Instrument Sans carries all language on the site and is subset to the Latin
characters actually needed, plus typographic punctuation.

IBM Plex Mono carries measured numeric values and NOTHING else. It is subset to the
glyph set in src/lib/mono-subset.ts, so the file physically cannot render prose --
see DESIGN.md, "The monospace face is subset to numeric glyphs". `npm run lint:mono`
enforces the same set at build time.

The zero ships PLAIN. IBM Plex Mono draws a marked zero and exposes no `zero`
OpenType feature, so the mark is removed here by dropping the glyph's smallest
contour. At the proof strip's 96px the mark reads as "code editor", which is an
association this design avoids, and a strip of pure numerals has no letter O to
disambiguate from. This is the default rather than an opt-in so that regenerating
the fonts cannot quietly restore it; check-fonts.py fails the build if it comes
back. `--dotted-zero` emits the marked variant for comparison only.
"""

from __future__ import annotations

import argparse
import pathlib
import re
import subprocess
import sys
import urllib.request

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "fonts"
# Satori (which renders the Open Graph images) cannot read woff2, and does not
# handle variable fonts reliably, so a static TTF instance is emitted separately.
# It is not under public/: it is read from disk at build time, never served.
OG_OUT = ROOT / "src" / "assets" / "og"

# Keep in sync with src/lib/mono-subset.ts -- that file is the source of truth and
# this script asserts against it below.
MONO_GLYPHS = "0123456789.,+-%/:Kx "

# Basic Latin, plus non-breaking space, the dash and quote family, and the ellipsis.
# Latin-1 in full (the site uses "Resume" with acute accents), plus the dash and
# quote families, the ellipsis, and prime marks.
TEXT_UNICODES = (
    "U+0020-00FF,U+0131,U+0152-0153,U+2010-2015,U+2018-201A,U+201C-201E,"
    "U+2026,U+2032,U+2033"
)


def mono_glyphs_from_ts() -> str:
    """Read the glyph set out of the TypeScript source of truth."""
    src = (ROOT / "src" / "lib" / "mono-subset.ts").read_text()
    match = re.search(r"MONO_SUBSET\s*=\s*'([^']*)'", src)
    if not match:
        sys.exit("could not find MONO_SUBSET in src/lib/mono-subset.ts")
    return match.group(1).replace("\\\\", "\\")


def css_for(family: str, axis: str) -> str:
    url = f"https://fonts.googleapis.com/css2?family={family}:{axis}&display=swap"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode()


def latin_url(css: str) -> str:
    """Pull the woff2 URL from the /* latin */ block only."""
    blocks = re.split(r"/\*\s*([a-z-]+)\s*\*/", css)
    for i in range(1, len(blocks) - 1, 2):
        if blocks[i].strip() == "latin":
            found = re.search(r"src:\s*url\((https://[^)]+\.woff2)\)", blocks[i + 1])
            if found:
                return found.group(1)
    sys.exit("no latin woff2 block found")


def download(url: str, dest: pathlib.Path) -> pathlib.Path:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as resp:
        dest.write_bytes(resp.read())
    return dest


# Punctuation that is too wide in a true monospace.
#
# IBM Plex Mono gives every glyph a 600-unit advance, so a comma whose ink is only
# 182 units sits in a cell with 418 units of air around it. At the proof strip's
# 96px that renders "5,000" as "5 , 000". The advance is not wrong for a monospace
# font -- it is exactly right, and it is what a monospace font is for -- but this
# face exists solely to set measured numerals, where the gap is a defect.
#
# So the advance is narrowed here, at the subsetting step, and the outline is
# re-centred in the smaller cell. Digits keep their 600 units, so numerals still
# align in a column; only punctuation becomes proportional. Doing it in the font
# rather than with CSS letter-spacing matters: letter-spacing would pull the digits
# apart too.
NARROW_PUNCTUATION = ("comma", "period", "colon")
SIDEBEARING = 60


def narrow_advance(font, glyph_name: str, sidebearing: int = SIDEBEARING) -> tuple[int, int]:
    """Shrink a glyph's advance to its ink plus even sidebearings. Returns before/after."""
    glyf = font["glyf"]
    glyph = glyf[glyph_name]
    before = font["hmtx"][glyph_name][0]

    if glyph.numberOfContours == 0:
        return before, before

    glyph.expand(glyf)
    # Composite glyphs (the colon is two periods) carry no bounds until they are
    # computed, so measure before deciding the shift rather than after.
    glyph.recalcBounds(glyf)
    ink = glyph.xMax - glyph.xMin
    shift = sidebearing - glyph.xMin

    if glyph.isComposite():
        for component in glyph.components:
            x, y = component.x, component.y
            component.x = x + shift
            component.y = y
    else:
        glyph.coordinates.translate((shift, 0))

    glyph.recalcBounds(glyf)
    advance = ink + 2 * sidebearing
    font["hmtx"][glyph_name] = (advance, glyph.xMin)
    return before, advance


def strip_inner_mark(font, glyph_name: str = "zero") -> bool:
    """
    Remove the mark from the zero by dropping its smallest contour.

    IBM Plex Mono has no `zero` OpenType feature and ships no plain-zero alternate
    (only `zero.numr` and `zero.dnom`, which are fraction forms), so a plain zero
    can only be produced by editing the outline. The zero has three contours -- the
    bowl, its counter, and the mark -- against two for a capital O, and the mark is
    the smallest of the three.
    """
    glyf = font["glyf"]
    glyph = glyf[glyph_name]
    glyph.expand(glyf)
    if glyph.isComposite() or glyph.numberOfContours < 3:
        return False

    starts = [0] + [end + 1 for end in glyph.endPtsOfContours[:-1]]
    spans = list(zip(starts, glyph.endPtsOfContours))

    def area(span: tuple[int, int]) -> int:
        lo, hi = span
        xs = [glyph.coordinates[i][0] for i in range(lo, hi + 1)]
        ys = [glyph.coordinates[i][1] for i in range(lo, hi + 1)]
        return (max(xs) - min(xs)) * (max(ys) - min(ys))

    lo, hi = min(spans, key=area)
    keep = [i for i in range(len(glyph.coordinates)) if not (lo <= i <= hi)]

    from fontTools.ttLib.tables._g_l_y_f import GlyphCoordinates

    glyph.coordinates = GlyphCoordinates([glyph.coordinates[i] for i in keep])
    glyph.flags = bytearray(glyph.flags[i] for i in keep)
    removed = hi - lo + 1
    glyph.endPtsOfContours = [
        end - removed if end > hi else end for end in glyph.endPtsOfContours if not (lo <= end <= hi)
    ]
    glyph.numberOfContours = len(glyph.endPtsOfContours)
    glyph.recalcBounds(glyf)
    return True


def subset(
    src: pathlib.Path,
    dest: pathlib.Path,
    *,
    text: str = "",
    unicodes: str = "",
    flavor: str = "woff2",
) -> None:
    args = [
        sys.executable, "-m", "fontTools.subset", str(src),
        f"--output-file={dest}",
        *([f"--flavor={flavor}"] if flavor else []),
        "--layout-features=kern,liga,calt,tnum",
        "--no-hinting",
        "--desubroutinize",
        "--drop-tables+=GSUB",
    ]
    if text:
        args.append(f"--text={text}")
    if unicodes:
        args.append(f"--unicodes={unicodes}")
    subprocess.run(args, check=True, capture_output=True)


def instance_ttf(src: pathlib.Path, dest: pathlib.Path, weight: int, unicodes: str) -> None:
    """Pin the weight axis and emit a subset static TTF for Open Graph rendering."""
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer

    font = TTFont(src)
    instancer.instantiateVariableFont(font, {"wght": weight}, inplace=True)
    tmp = dest.with_suffix(".full.ttf")
    font.save(tmp)
    subprocess.run(
        [
            sys.executable, "-m", "fontTools.subset", str(tmp),
            f"--output-file={dest}",
            f"--unicodes={unicodes}",
            "--no-hinting",
        ],
        check=True,
        capture_output=True,
    )
    tmp.unlink()


def report(path: pathlib.Path) -> None:
    from fontTools.ttLib import TTFont

    font = TTFont(path)
    cmap = font.getBestCmap()
    print(f"  {path.name:38} {path.stat().st_size / 1024:7.1f} KB  {len(cmap):4d} glyphs")


def main(dotted_zero: bool = False) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    tmp = ROOT / ".fonts-tmp"
    tmp.mkdir(exist_ok=True)

    declared = mono_glyphs_from_ts()
    if set(declared) != set(MONO_GLYPHS):
        sys.exit(
            "mono glyph set drift:\n"
            f"  mono-subset.ts     {sorted(set(declared))}\n"
            f"  subset-fonts.py    {sorted(set(MONO_GLYPHS))}"
        )

    print("Instrument Sans (variable 400-700, Latin):")
    raw = download(
        latin_url(css_for("Instrument+Sans", "wght@400..700")),
        tmp / "instrument-sans-raw.woff2",
    )
    subset(raw, OUT / "instrument-sans-latin.woff2", unicodes=TEXT_UNICODES)
    report(OUT / "instrument-sans-latin.woff2")

    print("Instrument Sans (static TTF at wght 500, for Open Graph rendering):")
    OG_OUT.mkdir(parents=True, exist_ok=True)
    instance_ttf(raw, OG_OUT / "instrument-sans-og.ttf", 500, TEXT_UNICODES)
    report(OG_OUT / "instrument-sans-og.ttf")

    print(f"IBM Plex Mono (400, subset to {len(set(declared))} glyphs):")
    raw = download(
        latin_url(css_for("IBM+Plex+Mono", "wght@400")),
        tmp / "plex-mono-raw.woff2",
    )

    # Subset to an uncompressed TTF first: the punctuation metrics have to be
    # corrected before the file is compressed.
    staged = tmp / "plex-mono-staged.ttf"
    subset(raw, staged, text=declared, flavor="")

    from fontTools.ttLib import TTFont

    font = TTFont(staged)
    for glyph_name in NARROW_PUNCTUATION:
        if glyph_name in font.getGlyphOrder():
            before, after = narrow_advance(font, glyph_name)
            print(f"    narrowed {glyph_name:8} advance {before} -> {after}")

    if dotted_zero:
        print("    keeping the mark on 'zero' (comparison variant)")
    elif strip_inner_mark(font):
        print("    removed the mark from 'zero' -- the plain zero is what ships")
    else:
        sys.exit(
            "could not remove the mark from 'zero'. The shipped font must have a "
            "plain zero; refusing to write a marked one silently."
        )

    dest = OUT / ("plex-mono-measured-dotted-zero.woff2" if dotted_zero else "plex-mono-measured.woff2")
    font.flavor = "woff2"
    font.save(dest)
    report(dest)

    for leftover in tmp.iterdir():
        leftover.unlink()
    tmp.rmdir()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dotted-zero",
        action="store_true",
        help=(
            "Emit the marked-zero variant to a separate file, for comparison. The "
            "shipped font has a plain zero; this does not replace it."
        ),
    )
    main(dotted_zero=parser.parse_args().dotted_zero)
