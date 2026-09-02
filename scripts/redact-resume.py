#!/usr/bin/env python3
"""Produce the public résumé PDF from the source export.

The résumé is served from public/ and is crawlable, so the phone number in the
source export is removed here. Run against a fresh export:

    python3 scripts/redact-resume.py path/to/source.pdf

What this does:
  1. Removes the contact header line (which carries the phone number) and rebuilds
     it with location, email, LinkedIn and GitHub only. apply_redactions() deletes
     the text outright, so the number is not recoverable by text extraction.
  2. Replaces "May 2026" with "December 2026" in the education block. The source
     export contradicts itself — its summary says December — and December is correct.
  3. Repoints the LinkedIn and GitHub hyperlinks, which in the source export target
     the bare linkedin.com and github.com roots rather than profiles, and adds a
     mailto: link on the address.

What this deliberately does NOT do:
  - Touch "600+ problems solved". It sits mid-sentence in a justified paragraph, and
    any reinsertion orphans that fragment in the text-extraction order, which a
    résumé parser reads. 600+ is understated rather than wrong, so it is left alone.
  - Touch "MS in Analytics" in the summary. Correcting it to "MPS" widens the line
    and would reflow the paragraph.

Both of those, and anything else, are better fixed in the source document and
re-exported. This script is a safety net, not a substitute.

Header runs are inserted in reverse with overlay=False. Each insert prepends to the
page content stream, so reversing the order leaves them in reading order and puts
the contact block at the top of the extracted text, where a parser expects it.
"""

from __future__ import annotations

import pathlib
import shutil
import sys

import fitz

FONT = 'tiro'  # base-14 Times-Roman; metrically matches the export's Nimbus Roman
SIZE = 10.0
BASELINE = 50.41
CENTER = 306.0
GAP_BEFORE_PIPE = 12.5
GAP_AFTER_PIPE = 10.0

LINKEDIN = 'https://www.linkedin.com/in/darpan-radadiya-146a49215'
GITHUB = 'https://github.com/darpanradadiya'
EMAIL = 'radadiya.d@northeastern.edu'

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEST = ROOT / 'public' / 'Darpan_Radadiya_Resume.pdf'


def width(text: str) -> float:
    return fitz.get_text_length(text, fontname=FONT, fontsize=SIZE)


def main() -> None:
    source = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else DEST
    doc = fitz.open(source)
    page = doc[0]

    for link in page.get_links():
        page.delete_link(link)

    page.add_redact_annot(fitz.Rect(100, 40, 512, 55))   # contact header
    page.add_redact_annot(fitz.Rect(469, 161, 578, 176))  # graduation date
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

    parts = ['Boston, MA', EMAIL, 'LinkedIn', 'GitHub']
    pipe = width('|')
    total = sum(width(p) for p in parts) + 3 * (GAP_BEFORE_PIPE + pipe + GAP_AFTER_PIPE)
    x = CENTER - total / 2
    runs: list[tuple[float, str]] = []
    rects: dict[str, fitz.Rect] = {}

    for index, part in enumerate(parts):
        runs.append((x, part))
        rects[part] = fitz.Rect(x, 42.9, x + width(part), 52.8)
        x += width(part)
        if index < len(parts) - 1:
            x += GAP_BEFORE_PIPE
            runs.append((x, '|'))
            x += pipe + GAP_AFTER_PIPE

    for position, text in reversed(runs):
        page.insert_text((position, BASELINE), text, fontname=FONT, fontsize=SIZE, overlay=False)

    date_line = 'December 2026 | GPA: 3.96/4.0'
    page.insert_text((576.0 - width(date_line), 171.14), date_line, fontname=FONT, fontsize=SIZE)

    page.insert_link({'kind': fitz.LINK_URI, 'from': rects['LinkedIn'], 'uri': LINKEDIN})
    page.insert_link({'kind': fitz.LINK_URI, 'from': rects['GitHub'], 'uri': GITHUB})
    page.insert_link({'kind': fitz.LINK_URI, 'from': rects[EMAIL], 'uri': f'mailto:{EMAIL}'})

    tmp = ROOT / '.resume-tmp.pdf'
    doc.save(tmp, garbage=4, deflate=True, clean=True)
    doc.close()

    text = fitz.open(tmp)[0].get_text()
    problems = []
    if '959-9842' in text or '(617)' in text:
        problems.append('phone number still present after redaction')
    if 'May 2026' in text:
        problems.append('"May 2026" still present')
    if 'December 2026 | GPA: 3.96/4.0' not in text:
        problems.append('graduation line was not reinserted')
    if EMAIL not in text:
        problems.append('email address missing')
    if problems:
        tmp.unlink()
        sys.exit('refusing to write:\n  - ' + '\n  - '.join(problems))

    shutil.move(str(tmp), str(DEST))
    print(f'  wrote {DEST.relative_to(ROOT)} ({DEST.stat().st_size / 1024:.1f} KB)')
    print('  phone removed, graduation corrected, profile links repointed')


if __name__ == '__main__':
    main()
