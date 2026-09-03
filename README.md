# darpanradadiya.com

The portfolio of Darpan Radadiya — data / analytics engineer.

The site is the proof artifact, not decoration. Its argument is that the systems
described on it were actually built and actually tested, so the code that renders it
has to hold up to the same reading. That constraint drives most of what follows.

- **Live:** https://portfolio-black-five-67.vercel.app
- **Design system:** [DESIGN.md](DESIGN.md) — tokens, the two rules enforced by
  tooling, and why the diagrams are SVG
- **Outstanding copy:** [CONTENT.md](CONTENT.md) — every string still missing

## Stack

| Concern   | Choice                                                      | Why this one                                                                                                                                                                                     |
| --------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework | Next.js 15, App Router, React 19                            | Static prerendering for every page, with one serverless route for the contact form. Nothing else needs a server.                                                                                 |
| Language  | TypeScript, `strict` + `noUncheckedIndexedAccess`, no `any` | Indexing is checked rather than asserted; the one place an invariant is assumed, it throws with the reason.                                                                                      |
| Styling   | Tailwind CSS v4, tokens as CSS custom properties            | The default `--color-*` and `--text-*` namespaces are reset to `initial`, so there is no `text-blue-500` or `text-sm` to reach for. The only colours and sizes that exist are the designed ones. |
| Content   | MDX with Zod-validated frontmatter                          | A malformed case-study header fails the build naming the file and field, rather than rendering as an empty element.                                                                              |
| Fonts     | Self-hosted, subset, `font-display: swap`                   | 26 KB total. The monospace is subset to 20 glyphs and cannot render a letter — see below.                                                                                                        |
| Theming   | CSS `light-dark()`                                          | No JavaScript, no hydration flash, no theme script in the critical path.                                                                                                                         |
| Tests     | Vitest + Playwright                                         | 71 unit tests, 68 smoke tests at desktop and 320px.                                                                                                                                              |
| Hosting   | Vercel                                                      | Static output plus one function.                                                                                                                                                                 |

## Running it

Node is pinned in `.node-version`. With [fnm](https://github.com/Schniz/fnm) or nvm
the version is picked up automatically.

```bash
npm install
npm run dev
```

| Script                | What it does                                                     |
| --------------------- | ---------------------------------------------------------------- |
| `npm run dev`         | Development server                                               |
| `npm run build`       | Production build                                                 |
| `npm run typecheck`   | `tsc --noEmit`                                                   |
| `npm run lint`        | ESLint, including the reserved-token rule                        |
| `npm run lint:css`    | stylelint, including the reserved-token rule                     |
| `npm run lint:mono`   | Fails if a monospace string uses a glyph outside the font subset |
| `npm run lint:fonts`  | Checks the committed fonts still cover exactly what they should  |
| `npm run test`        | Unit tests                                                       |
| `npm run test:e2e`    | Smoke tests against the production build                         |
| `npm run verify`      | Everything except e2e — what CI's first job runs                 |
| `npm run fetch-stats` | Refreshes `data/stats.json` from the coding profiles             |

## Environment

| Variable             | Required             | Purpose                                                                 |
| -------------------- | -------------------- | ----------------------------------------------------------------------- |
| `SITE_URL`           | No                   | Canonical origin. Falls back to the production URL.                     |
| `RESEND_API_KEY`     | For the contact form | Without it the endpoint returns 503 and says the message was not sent.  |
| `CONTACT_FROM_EMAIL` | For the contact form | Verified sender address.                                                |
| `CONTACT_TO_EMAIL`   | No                   | Defaults to the address in `profile.ts`.                                |
| `GITHUB_TOKEN`       | No                   | Raises the api.github.com rate limit for `fetch-stats`. CI supplies it. |

Pointing the site at a custom domain is a dashboard change plus a redeploy, not a
commit: set `SITE_URL` and redeploy. That one value drives canonical tags, the
sitemap, `robots.txt`, `llms.txt`, and Open Graph URLs. Pages are statically
prerendered, so it is read at build time — the redeploy is what applies it.

## Architecture decisions

### Content is typed, and nothing about a person is hardcoded in JSX

`src/content/profile.ts` is the single source of truth for bio, education,
experience, skills, links and the proof strip. Case studies are MDX with Zod-validated
frontmatter. `alt` text on an image is required by the schema, not optional, and
`domains` is a closed enum so the project filter cannot drift.

### Two design tokens are reserved, and the reservation is mechanical

`--signal` marks verified data. `--warn` marks limitations and stale-data notices. A
four-colour `--data-*` scale and a `--ramp-*` ramp belong to diagrams and charts. None
of them may appear on a button, a border, a heading, or any other chrome — because
colour in this system means "this is a category of data", the same way monospace means
"this is a measured value", and a token that decorates things stops meaning anything.

Three layers keep that true without relying on discipline:

1. None of them is registered in Tailwind's `@theme`, so no `text-signal` or `bg-warn`
   utility exists to reach for.
2. stylelint blocks `var(--signal)` and friends outside `src/styles/reserved.css`.
3. ESLint blocks the consuming classes outside the four components allowed to render
   them, which expose semantic props instead of the class names.

### The monospace face physically cannot render prose

Monospace on this site means "this is a real, measured number". To keep that a fact
rather than a habit, the font is subset to 20 glyphs — digits and numeric punctuation.
Instrument Sans is deliberately next in the stack, so an out-of-subset glyph degrades
to the grotesk rather than to an arbitrary system monospace.

`npm run lint:mono` fails the build if any string rendered in the mono class contains
a glyph outside that set. It checks the data at its source — the proof strip, case
study frontmatter, hand-entered figures and the committed stats snapshot — because
most values reach the component as expressions that cannot be read from the source.

Two corrections are applied when the font is generated. The comma, period and colon
are narrowed from the full 600-unit monospace cell to their own ink plus even
sidebearings; correct for a monospace face, wrong for one that only sets numerals,
where "5,000" rendered as "5 , 000". Digits keep the full cell so numerals still align
in a column. And the zero ships plain: IBM Plex Mono draws a marked zero and exposes no
OpenType feature to disable it, so the mark is removed by dropping a contour. Both are
asserted by `npm run lint:fonts`, and font generation is byte-reproducible via a pinned
`SOURCE_DATE_EPOCH`.

### No statistic can render as nothing

No figure on this site may display as `0`, `—`, `NaN`, or a spinner. If data is
unavailable the element is not rendered at all. A Playwright test asserts this against
the built site by inspecting every monospace value on the pages that carry them.

### Diagrams are SVG in the markup

Architecture diagrams are inline SVG, not images: they follow the theme, respond to
`prefers-color-scheme`, and can be described to a screen reader. Each is `role="img"`
with a `<title>` and `<desc>`, and ships an HTML list of its stages beside the drawing.

That list is the primary text rather than a fallback, for a measurable reason:
simulated against deuteranopia, `--data-1` and `--data-2` collapse to 1.01:1 —
indistinguishable. Colour cannot carry stage identity, so every stage carries a label
and the scale is reinforcement (WCAG 1.4.1).

### The contact endpoint cannot fail silently

Every outcome is reported with a distinct status the form renders differently: sent,
invalid with per-field messages, rate-limited with a retry time, unavailable, and
failed. With no mail provider configured it returns 503 saying the message was not
sent — never a 200 that implies it went out. A form that quietly drops a message costs
the sender an opportunity they think they took.

Rate limiting is honest about being best-effort: serverless instances do not share
memory, so it is a courtesy throttle against double-submits, not a security control.
The decision logic is storage-agnostic, so moving to a shared store is a small change.

## The statistics pipeline

Coding-profile numbers are fetched **at build time in CI** and committed as a static
snapshot to `data/stats.json`. Nothing is fetched from the browser: CORS blocks most of
these endpoints, the limits are per-IP, LeetCode's endpoint is undocumented and can
throttle without notice, and a visitor must never wait on a third party or see a zero.

```
.github/workflows/refresh-stats.yml   daily cron + on push
  └─ npm run fetch-stats              scripts/fetch-stats.ts
       ├─ api.github.com              repos, stars, languages by repo count
       ├─ leetcode.com/graphql        solved totals by difficulty
       └─ codeforces.com/api          liveness check only — see below
     └─ mergeSnapshot()               src/lib/stats.ts — pure, unit-tested
       └─ data/stats.json             committed only if a rendered value changed
```

**The merge rule is the guarantee the whole thing rests on: the file on disk never
gets worse.** Incoming data is rejected when it is absent, zero, internally
inconsistent, or lower than what is already stored. Sections are replaced atomically —
taking the better of each field independently could leave a breakdown that does not sum
to its own total, which is worse than stale data because it looks authoritative and is
wrong. That logic is pure and lives in `src/lib/stats.ts` so it can be tested without a
network; the script only does I/O.

**Activity data is excluded by the shape of the types, not by discipline.** There is no
field for a streak, a submission calendar, or a last-active date, so none of it can
leak into the UI. Four tests assert that such a payload fails validation.

**Codeforces is queried but never quantified.** It is linked from the site with no
figure attached; the fetch exists only to confirm the handle still resolves, so a dead
outbound link surfaces in CI. Its rating is neither stored nor logged — this repository
is public, so a CI log is published output.

**GeeksforGeeks has no public API.** Its figures are hand-entered constants in
`profile.ts` carrying the date they were read, guarded by a test that the difficulty
tiers sum to the stated total — the only automated defence a typed-in number has.

Each section carries its own `verifiedAt`, which is what the UI renders as "as of".
A run that confirms the same figures still advances that date and commits, because
"still 242, checked today" is different information from "242, last checked whenever";
the commit message distinguishes the two cases. A diff confined to `fetchedAt`, which
is not rendered, commits nothing.

## CI

`.github/workflows/ci.yml` runs on every branch and every pull request into `main`,
with in-flight runs cancelled when a newer commit lands. Node comes from
`.node-version` so CI and local development cannot drift.

Two jobs. The first runs typecheck, ESLint, stylelint, the monospace guard, the font
coverage check, Prettier, the unit tests and the production build. The second, which
depends on it, runs the Playwright suite against the built site at desktop and 320px
and uploads the report on failure. Any gate failing fails the run.

## Repository layout

```
src/
  app/                    routes, metadata, sitemap, robots, llms.txt, OG images
  components/             presentation; four own the reserved tokens
  content/
    profile.ts            typed single source of truth
    projects/*.mdx        case studies, Zod-validated frontmatter
    clinic-schema.ts      the clinic ERP schema, as data for its ERD
  lib/                    content loaders, stats merge rule, site config
  styles/
    tokens.css            design tokens
    reserved.css          the only file permitted to consume the reserved tokens
data/stats.json           committed snapshot, written by CI
scripts/
  fetch-stats.ts          coding-profile fetch
  check-mono-subset.ts    monospace guard
  check-fonts.py          font coverage and metrics
  subset-fonts.py         font generation, run by hand and committed
  redact-resume.py        strips the phone number from the published résumé PDF
e2e/                      Playwright smoke tests
```
