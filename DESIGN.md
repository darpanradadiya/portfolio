# Design system

The visual language of this site is **instrumented systems** — pipelines, stages,
checkpoints, assertions, measured values. It should read like a well-kept instrument
panel, not a marketing page.

The organising idea: **every claim sits next to the evidence for it.** A number and
its provenance are a single typographic unit — the value set in monospace, the source
directly beneath it in muted grotesk. That pairing is the atom the page is built from,
and it is why the type system carries the argument rather than decorating it.

## Colour

Six roles. Nothing outside this table is a colour decision that can be made ad hoc.

| Token | Light | Dark | Role | Contrast |
|---|---|---|---|---|
| `--paper` | `#FBFBF9` | `#121416` | Page ground | — |
| `--ink` | `#161A1D` | `#E7E9E5` | Body text | 16.90:1 / 15.11:1 |
| `--ink-muted` | `#5B6570` | `#9BA4AD` | Provenance lines, captions | 5.73:1 / 7.30:1 |
| `--rule` | `#DFE1DC` | `#262A2E` | Decorative hairlines only | 1.27:1 / 1.28:1 |
| `--rule-strong` | `#848981` | `#5E656B` | Hairlines bounding interactive rows | 3.45:1 / 3.12:1 |
| `--signal` | `#1F6F5C` | `#4FB99B` | **Reserved** — verified data only | 5.81:1 / 7.69:1 |
| `--warn` | `#A6522C` | `#D98A5E` | **Reserved** — limitations, stale data | 5.24:1 / 6.81:1 |

Ratios are measured, not estimated. Every text pair clears WCAG 2.2 AA.

`--rule-strong` exists because `--rule` measures 1.27:1 — correct for decoration, but
below the 3:1 that SC 1.4.11 requires of a hairline that is the *sole* boundary of an
interactive row. Decorative hairlines keep `--rule`.

Dark mode is CSS-only, via `color-scheme: light dark` and `light-dark()`. There is no
JavaScript theme toggle: `prefers-color-scheme` is respected, which means no
hydration flash and no theme script in the critical path. `--ink` in dark mode is a
paper-tinted off-white rather than pure white, to avoid halation on the near-black.

**There are no shadows in this system.** Separation is hairlines and whitespace.

## Type

Two families, both self-hosted, subset, `font-display: swap`.

**Instrument Sans** for everything that is language. Chosen over Geist because Geist
is the house font of the platform this deploys to, and over Inter because it is the
default everything already reaches for; Instrument Sans is a compact grotesk with a
high x-height that stays legible at the 13px provenance size.

**IBM Plex Mono** for measured values, and nothing else. Chosen over JetBrains Mono,
which is common enough in developer tooling that it reads as "screenshot of an
editor"; Plex Mono comes from a technical-documentation lineage, which is closer to
"instrument readout".

| Step | Size | Use |
|---|---|---|
| `--text-2xs` | 13px | Provenance lines, captions |
| `--text-xs` | 15px | Navigation, stack lists, secondary text |
| `--text-base` | 17px | Body — line-height 1.6, measure 66ch |
| `--text-lg` | 21px | Lead paragraphs, row subtitles |
| `--text-xl` | 26px | `h3`, row titles on small screens |
| `--text-2xl` | 34px | `h2`, row titles on wide screens |
| `--text-3xl` | 44px | `h1` page titles |
| `--text-display` | `clamp(2.5rem, 9vw, 4.5rem)` | Proof-strip numerals only |

The ratio is ~1.25 through the text range, then `--text-display` jumps deliberately
off-scale. That gap is where the page spends its boldness; nothing else competes.

Body copy is 17px rather than 16px. It is the load-bearing element for anyone reading
rather than skimming, and at 66ch it costs nothing.

## Layout

A two-track grid: a fixed **7rem left rail** carrying section markers, and a **66ch
measure** for content. The rail supplies datasheet structure, which is what lets the
page avoid tracked-out all-caps eyebrow labels above every heading. Below 768px the
rail collapses and its marker sits above the content.

Featured work renders as **full-width rows separated by hairlines, not cards.** A card
constrains a title to a few words, which forces tool-shaped names; a row lets a title
be a sentence about an outcome. Rows also stack at 320px with no reflow.

The header is **static, not sticky** — sticky costs roughly a tenth of a 320px
viewport and `backdrop-filter` is a real paint cost. The footer repeats every route,
and case studies carry their own back and prev/next links.

Border radius is **0**, except 2px on images.

## Motion

**One** orchestrated moment: on load, the three hairlines between the four proof
numbers scale in from zero width — 400ms, 60ms stagger, transform-only, so CLS is
unaffected. The numbers are at their final value from the first frame.

Nothing animates on scroll. There are no entrance transitions, no hover lifts.
`prefers-reduced-motion: reduce` removes the one moment, leaving the rules present.

Counting-up numerals were considered and rejected: they render `0` on the first frame,
and no statistic on this site may ever display as zero.

## Two rules enforced by tooling

### `--signal` and `--warn` are reserved

`--signal` marks verified data. `--warn` marks limitations and stale-data notices.
Neither is a general accent, and neither may appear on a button, border, or heading.
Three layers keep this true:

1. Neither token is registered in Tailwind's `@theme`, so no `text-signal` or
   `bg-warn` utility exists to reach for.
2. stylelint blocks `var(--signal)` and `var(--warn)` outside `src/styles/reserved.css`.
3. ESLint blocks the consuming classes outside the two components permitted to
   render them.

### The monospace face is subset to numeric glyphs

Monospace on this site means "this is a real, measured number". To keep that a fact
rather than a habit, the font file is subset to digits and numeric punctuation only —
it physically cannot render prose. `Instrument Sans` is the next entry in the mono
stack, so any out-of-subset glyph degrades to the grotesk rather than to an arbitrary
system font.

`npm run lint:mono` fails the build if a string rendered in the mono class contains a
glyph outside the subset. The guard matters most for pages that display external data,
where a label could otherwise arrive from an API.

## Data display rules

- Statistics are fetched at build time in CI and committed as a static snapshot.
  Nothing is fetched from the browser.
- No statistic may render as `0`, `—`, `NaN`, or a spinner. If data is unavailable,
  the element is not rendered.
- Numbers carry an "as of" date, so a stale snapshot is honest rather than broken.
- **Cumulative totals only.** No heatmaps, contribution grids, streaks, "submissions
  in the past year", or any chart whose x-axis is time.

## Not built here

Preloaders and splash screens. Scroll-to-explore indicators. Particle backgrounds,
cursor followers, typing-effect headings. Fade-and-slide-up on every section.
Hover-lift on every card. Walls of technology logos. Skill proficiency bars. Gradient
washes as decoration. Arrows appended to every link. Meta strings joined with middle
dots.

## Quality floor

Lighthouse ≥95 on mobile across all four categories. LCP < 2.0s, CLS < 0.05,
INP < 200ms. Works from 320px to 2560px. WCAG 2.2 AA contrast, visible focus rings
(`:focus-visible`, 2px solid `--ink` at 2px offset), semantic landmarks, keyboard
navigable, alt text on every image. TypeScript strict, no `any`. Typecheck, lint,
stylelint, and the mono guard all run in CI, and a red build blocks deploy.
