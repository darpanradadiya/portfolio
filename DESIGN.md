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

| Token           | Light     | Dark      | Role                                   | Contrast          |
| --------------- | --------- | --------- | -------------------------------------- | ----------------- |
| `--paper`       | `#FBFBF9` | `#121416` | Page ground                            | —                 |
| `--ink`         | `#161A1D` | `#E7E9E5` | Body text                              | 16.90:1 / 15.11:1 |
| `--ink-muted`   | `#5B6570` | `#9BA4AD` | Provenance lines, captions             | 5.73:1 / 7.30:1   |
| `--rule`        | `#DFE1DC` | `#262A2E` | Decorative hairlines only              | 1.27:1 / 1.28:1   |
| `--rule-strong` | `#848981` | `#5E656B` | Hairlines bounding interactive rows    | 3.45:1 / 3.12:1   |
| `--signal`      | `#1F6F5C` | `#4FB99B` | **Reserved** — verified data only      | 5.81:1 / 7.69:1   |
| `--warn`        | `#A6522C` | `#D98A5E` | **Reserved** — limitations, stale data | 5.24:1 / 6.81:1   |

Ratios are measured, not estimated. Every text pair clears WCAG 2.2 AA.

`--rule-strong` exists because `--rule` measures 1.27:1 — correct for decoration, but
below the 3:1 that SC 1.4.11 requires of a hairline that is the _sole_ boundary of an
interactive row. Decorative hairlines keep `--rule`.

Dark mode is CSS-only, via `color-scheme: light dark` and `light-dark()`. There is no
JavaScript theme toggle: `prefers-color-scheme` is respected, which means no
hydration flash and no theme script in the critical path. `--ink` in dark mode is a
paper-tinted off-white rather than pure white, to avoid halation on the near-black.

**There are no shadows in this system.** Separation is hairlines and whitespace.

### The data scale

Four categorical colours, and a single-hue ramp for ordered magnitudes. Both are
reserved to **the drawing area of a diagram or a chart** — never a button, border,
heading, link, or any other chrome. Colour here means "this is a category of data",
in the same way monospace means "this is a measured value".

| Token      | Light     | Dark      | Role                       | Contrast        |
| ---------- | --------- | --------- | -------------------------- | --------------- |
| `--data-1` | `#2D5F8A` | `#6FA8D4` | Ingestion / input stages   | 6.51:1 / 7.23:1 |
| `--data-2` | `#1F6F5C` | `#4FB99B` | Model / inference stages   | 5.81:1 / 7.69:1 |
| `--data-3` | `#8A6A2D` | `#D4B26F` | Orchestration / storage    | 4.85:1 / 9.14:1 |
| `--data-4` | `#7A3B52` | `#C98BA0` | Human-in-the-loop / review | 7.87:1 / 6.76:1 |

`--data-2` is deliberately the same value as `--signal`: "the model produced a
verified value" is the same semantic in both places.

**Colour is never the carrier.** Simulated against deuteranopia, `--data-1` and
`--data-2` collapse to 1.01:1 — indistinguishable. So every diagram stage and every
chart series also carries a text label, and every diagram ships an HTML list of its
stages alongside the drawing. The scale is reinforcement (WCAG 1.4.1).

The ramp is derived from `--data-1`'s hue at 3.2, 4.6, 6.6 and 9.4 against paper, so
even the lightest step clears the 3:1 SC 1.4.11 asks of a graphical object. Adjacent
steps are only about 1.4:1 apart, so charts draw a hairline in the page ground
between segments rather than relying on the ramp alone.

## Type

Two families, both self-hosted, subset, `font-display: swap`.

**Instrument Sans** for everything that is language. Chosen over Geist because Geist
is the house font of the platform this deploys to, and over Inter because it is the
default everything already reaches for; Instrument Sans is a compact grotesk with a
high x-height that stays legible at the 13px provenance size.

**IBM Plex Mono** for measured values, and nothing else, with two corrections made
at the subsetting step. Its comma, period and colon are narrowed from the full
600-unit monospace cell to their own ink plus even sidebearings — correct for a
monospace face, wrong for one that only ever sets numerals, where "5,000" rendered
as "5 , 000". Digits keep the full cell so numerals still align. And the zero ships
plain: Plex draws a marked zero with no OpenType feature to disable it, and at 96px
the mark reads as a code editor. Both are asserted by `npm run lint:fonts`. Chosen over JetBrains Mono,
which is common enough in developer tooling that it reads as "screenshot of an
editor"; Plex Mono comes from a technical-documentation lineage, which is closer to
"instrument readout".

| Step             | Size                         | Use                                     |
| ---------------- | ---------------------------- | --------------------------------------- |
| `--text-2xs`     | 13px                         | Provenance lines, captions              |
| `--text-xs`      | 15px                         | Navigation, stack lists, secondary text |
| `--text-base`    | 17px                         | Body — line-height 1.6, measure 66ch    |
| `--text-lg`      | 21px                         | Lead paragraphs, row subtitles          |
| `--text-xl`      | 26px                         | `h3`, row titles on small screens       |
| `--text-2xl`     | 34px                         | `h2`, row titles on wide screens        |
| `--text-3xl`     | 44px                         | `h1` page titles                        |
| `--text-display` | `clamp(2.5rem, 9vw, 4.5rem)` | Proof-strip numerals only               |

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

## Diagrams

Diagrams are inline SVG, never image files: they stay themeable, they respond to
`prefers-color-scheme`, and they can be described to a screen reader. Each one is
`role="img"` with a `<title>` and `<desc>`, and is accompanied by a real HTML list
of its stages — that list is the primary text, not a fallback.

Layout is vertical at every width. Five stages laid out horizontally would give each
about 64px at 320px. The SVG's `max-width` equals its `viewBox` width so the drawing
never scales above 1:1; at 320px the floor is 0.82, which renders a 14px label at
11.5px.

A review gate is drawn as a gate — two bars on posts leaving a narrow opening, with
the flow passing through and a branch leading aside. A review step is a constriction
in a pipeline, not a stage of it, and it should not look like another box.

## Motion

**One** orchestrated moment: on load, the three hairlines between the four proof
numbers scale in from zero width — 400ms, 60ms stagger, transform-only, so CLS is
unaffected. The numbers are at their final value from the first frame.

Three further pieces of motion exist and are deliberate: the hero's two-stop
gradient, a 2px lift on hover over a work row, and a 10px rise as the three
below-fold sections scroll into view. There is no box-shadow anywhere in the system
and no count-up. Everything sits inside `prefers-reduced-motion: reduce`, and all
content is present and readable without any of it.

Counting-up numerals were considered and rejected: they render `0` on the first frame,
and no statistic on this site may ever display as zero.

### A starting keyframe is a colour pair

An animation that changes opacity must hold its contrast requirement at the keyframe
it _starts_ from, not only where it ends. `opacity` on a section composites the whole
subtree over the page ground, so every colour inside it is a blend on the way in, and
a scroll-driven animation sits at its starting keyframe for as long as the section is
unread.

The scroll reveal therefore starts at `opacity: 0.94`, not `0`. That number is solved
for, not chosen: the tightest pair on the page is a link on a cool band, 5.13:1 at
full opacity, which holds 4.5:1 down to 0.935. Body ink needs only 0.615. The link
sets the floor for everything.

Verify this with motion **enabled**. A reduced-motion audit skips the animation and
proves nothing about it.

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
