# Content checklist

Every string still outstanding, grouped by the file it goes in. This is the map —
you should not need to grep for TODO.

Copy you send is inserted **verbatim**. Not rewritten, not tightened, not
"improved". If something breaks the monospace guard or a Zod schema I will flag it
and leave it alone; I will not silently edit prose.

---

## The case-study skeleton

Each of the six `.mdx` files has these eight sections, already stubbed in this
order. Write them as an argument, not a timeline.

```
1. Context      Two sentences. What it is, when, solo or with others, your role.
2. The problem  The actual question or failure mode. Open here — never with the stack.
3. Constraints  What made it hard. Scale, latency, cost, no labelled data, multi-hour jobs.
4. What I built The architecture, with one real diagram.
5. Decisions    Three to five forks in the road, each with the option you rejected
                and why. THE MOST IMPORTANT SECTION.
6. Results      Measured, with units. If it was not measured, say so plainly.
7. Limitations  What it does not do, and what breaks at ten times the load.
8. Stack + links Repo URL, demo if one exists.
```

---

## Two constraints that will bounce copy

**Monospace is digits only.** The font is subset to `0123456789.,+-%/:Kx` and a
space — it physically cannot render a letter. That is fine for prose, which is never
monospace, but a _measured value_ you introduce must stay inside that set. `95K`,
`3.96/4.0`, `90.15%`, `5,000`, `10x` all pass. `~30GB` does not (`~`, `G`, `B`).
If you need a new glyph, say so — it means regenerating the font, which is
deliberate, not a workaround.

**Frontmatter is validated.** A malformed header fails the build with the file and
field named. `alt` text on a screenshot is required, not optional. `domains` is a
closed list: `ML pipelines`, `Data engineering`, `Data modelling`,
`Analytics and reporting`.

---

## Decision needed before you write six titles

`outcomeTitle` is used for both the on-page `<h1>` and the browser `<title>`, and
the title template appends ` | Darpan Radadiya` — 18 characters. So the §9 window of
50–60 characters leaves **32–42 characters** for the title itself.

The brief's own example of a good title, _"Turning feature-length video into
per-character reels, unattended"_, is 65 characters, which yields an 83-character
`<title>`. Outcome-shaped titles and the 50–60 window are in direct conflict.

Pick one:

- **Write for humans, accept long titles.** Google truncates around 60 characters;
  the beginning still carries the meaning. Costs a few SEO points.
- **Add an optional `seoTitle` field.** Long outcome title for the `<h1>`, short one
  for the `<title>`. One nullable frontmatter field; tell me and I will add it.

`summary` is also used as the meta description, so aim for **130–160 characters**
there if you want that page to clear the floor.

---

## `src/content/profile.ts`

| Field                     | What it is                                | Notes                                                                                                                                    |
| ------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `headline`                | The hero headline                         | One job: land _he builds data and ML systems that are actually tested, and he can prove it_.                                             |
| `intro`                   | Two-line sub-paragraph under the headline | Currently the hero shows a placeholder note instead.                                                                                     |
| `howIWork`                | **Four paragraphs**, array of strings     | Testing, data quality, tradeoffs. Prose, not bullets, not icons. The section that separates you from the other 199 applicants.           |
| `about`                   | `/about` narrative, array of paragraphs   | First person. How you got from an ICT degree to building tested ML pipelines, and what you want next.                                    |
| `links.geeksforgeeks.url` | Profile URL                               | Display name is "Darpan"; the slug is unknown. Left `null` rather than guessed — a wrong `sameAs` asserts an identity that is not yours. |

Everything else in this file is populated and verified: education, both internships
with all bullets, six skill groups, the proof strip, and the GeeksforGeeks figures.

---

## `src/content/projects/` — six case studies

Common to all six: `outcomeTitle`, `summary`, `timeframe`, `repo`, `screenshot`,
and the eight body sections. Noted below only where a file differs.

### 1. `carbon-record-automation.mdx` — featured, flagship

Start here. It carries more weight than anything else on the site.

- `role` is set: _Architecture, ML pipeline, and test suite_
- Verified facts, safe to use: 270 modules, 95K lines of Python; ingests
  feature-length video and produces per-character vertical reels; FastAPI service
  with Redis + RQ workers under APScheduler; Whisper speech-to-text, PySceneDetect
  shot segmentation, InsightFace ArcFace embeddings via ONNX Runtime, HDBSCAN
  clustering; human review gate for low-confidence output; multi-model LLM calls
  with configurable timeouts and three-attempt retries; on-disk embedding cache
  with per-stage checkpoints so multi-hour jobs resume; 185 pytest functions across
  24 test files behind a pre-commit gate
- Needed beyond the eight sections: the repo URL, one architecture diagram, one
  screenshot
- Decisions section candidates: ONNX Runtime over serving PyTorch directly;
  HDBSCAN over k-means; the human review gate over a confidence threshold alone;
  per-stage checkpoints over re-running; retry logic on LLM calls

### 2. `healthcare-clinic-erp.mdx` — featured

- `role` is set: _Schema design, reporting layer, and REST API_
- `dataNote` is written and confirmed: the 5,000 patients and 12,000 appointments
  are generated, loaded to validate query performance at scale
- Verified facts: 10-table clinical schema in 3NF covering patients, providers,
  encounters, ICD-10 diagnoses, invoices and payments; documented ERD;
  provider-productivity, billing and clinical-diagnosis reporting; KPI dashboards
  with a live SQL viewer tracing metrics to source tables; full CRUD REST API to a
  React front end with CSV export
- The ERD is the centrepiece diagram here, not an aid
- Decisions candidates: 3NF over a star schema given that reporting is a goal; the
  encounter-to-diagnosis cardinality; why the live SQL viewer exists

### 3. `tesla-supercharger-dashboard.mdx` — featured

- `dataNote` is written: synthetic, a generated three-year dataset, explicitly not
  evidence about real stations. It renders above the body. Restate it in Context.
- `role` also needed
- Thinnest of the three featured. Strengthen it by naming the stakeholder question:
  who acts on this dashboard, and what do they do differently after reading it?
- Results must not claim real-world outcomes from generated data

### 4. `customer-segmentation-analysis.mdx` — listed, not featured

- `role` needed
- **`dataNote` unconfirmed — blocking.** Which credit card transaction dataset? If
  it is a well-known public one, say so: a recognisable dataset is far better
  disclosed than discovered. Do not publish this one until that line exists.
- Its job on the site is showing R and a second visualisation stack, so lead with
  the segmentation method

### 5. `site-intelligence-platform.mdx` — listed, not featured

- `role` needed
- Confirm the size: frontmatter states 30 GB as a measured figure, the brief said
  "~30GB". Correct it or make it a range.
- Constraints is the section that matters here: what did 30 GB make impossible, and
  what did you do about it?

### 6. `bank-term-deposit-prediction.mdx` — listed, not featured

- `role` needed
- **`dataNote` unconfirmed — blocking.** If it is UCI bank marketing, say so, and
  say that accuracy is a misleading headline metric there because the negative
  class dominates. Naming that weakness yourself is the strongest move available.
- Weakest differentiator on the site. Consider whether it earns its place once the
  three featured studies are written — a short body is a fine answer.

---

## Not copy, but still outstanding

| Item                                                     | Blocks                                                                                                          |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Real screenshots for the three featured projects         | The featured rows render without them, but they are the weakest part of the home page as-is                     |
| Domain purchase, then `SITE_URL` in the Vercel dashboard | Canonical URLs currently point at the `.vercel.app` origin                                                      |
| `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` in Vercel      | The contact form returns an honest 503 until these exist                                                        |
| Vercel ↔ GitHub connection                               | No auto-deploy, no PR previews. Needs a browser authorization.                                                  |
| Your GitHub display name is "VADIL"                      | A recruiter following the link lands on a profile with a different name                                         |
| Re-export the résumé PDF from source                     | The served copy still says "MS in Analytics" and "600+ problems solved"; both were left rather than risk reflow |
