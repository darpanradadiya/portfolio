# darpanradadiya.com

Portfolio of Darpan Radadiya — data / analytics engineer with applied ML depth.

The site is the proof artifact, not decoration: it exists to show that the systems
described on it were actually built and actually tested. `PORTFOLIO_BRIEF.md` is the
source of truth for positioning, design tokens, banned patterns, and the quality floor.
Read it before changing anything.

## Stack

| Concern   | Choice                                                         |
| --------- | -------------------------------------------------------------- |
| Framework | Next.js 15 (App Router), React 19                              |
| Language  | TypeScript, `strict` + `noUncheckedIndexedAccess`, no `any`    |
| Styling   | Tailwind CSS v4, design tokens as CSS custom properties        |
| Content   | MDX case studies, frontmatter validated with Zod at build time |
| Fonts     | Self-hosted, subset, `font-display: swap`                      |
| Hosting   | Vercel                                                         |

## Local development

Node is pinned in `.node-version` (22.x). With [fnm](https://github.com/Schniz/fnm)
or nvm installed, the version is picked up automatically.

```bash
npm install
npm run dev
```

## Scripts

| Script              | Purpose                                                            |
| ------------------- | ------------------------------------------------------------------ |
| `npm run dev`       | Development server                                                 |
| `npm run build`     | Production build                                                   |
| `npm run typecheck` | `tsc --noEmit`                                                     |
| `npm run lint`      | ESLint, including the reserved-token rule                          |
| `npm run lint:css`  | stylelint, including the reserved-token rule                       |
| `npm run lint:mono` | Fails if any monospace string uses a glyph outside the font subset |
| `npm run verify`    | All of the above — what CI runs                                    |

## Two rules worth knowing before you edit

**`--signal` and `--warn` are reserved.** They mark verified data and limitations
respectively, and nothing else. This is enforced mechanically, not by convention:
neither token is registered as a Tailwind color, stylelint blocks `var(--signal)`
outside `src/styles/reserved.css`, and ESLint blocks the consuming classes outside
the two components allowed to render them. See `PORTFOLIO_BRIEF.md` §11.5.

**The monospace face is subset to numeric glyphs only.** Monospace on this site is a
semantic signal meaning "this is a real, measured number" — so the font file
physically cannot render prose. `npm run lint:mono` fails the build if a string
rendered in the mono class contains a glyph outside that subset. See §11.3.

## External statistics

Coding-profile numbers are fetched **at build time in CI** and committed as a static
snapshot to `data/stats.json`. Nothing is fetched from the browser: CORS blocks most
of these endpoints, unofficial endpoints break without notice, and a visitor must
never see a spinner or a zero. The fetch script refuses to overwrite good data with
worse data.

The merge rule is the guarantee the architecture rests on, so it is pure and
unit-tested: incoming data is rejected when it is absent, zero, internally
inconsistent, or lower than what is already stored, and sections are replaced
atomically so a breakdown can never disagree with its own total.

The snapshot type has no field for a streak, a submission calendar, or a
last-active date, and no Codeforces entry at all — activity data cannot leak into
the UI because there is nowhere to put it. Codeforces is queried only to confirm
the handle still resolves; its rating is neither stored nor logged.
