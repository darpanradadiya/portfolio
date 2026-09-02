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
"""

from __future__ import annotations

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


def subset(src: pathlib.Path, dest: pathlib.Path, *, text: str = "", unicodes: str = "") -> None:
    args = [
        sys.executable, "-m", "fontTools.subset", str(src),
        f"--output-file={dest}",
        "--flavor=woff2",
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


def main() -> None:
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
    subset(raw, OUT / "plex-mono-measured.woff2", text=declared)
    report(OUT / "plex-mono-measured.woff2")

    for leftover in tmp.iterdir():
        leftover.unlink()
    tmp.rmdir()


if __name__ == "__main__":
    main()
