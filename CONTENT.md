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

## Titles: how the two fields work

Settled and enforced by the schema, so you can write freely.

- **`outcomeTitle`** is the on-page heading. Write it for a human — a full sentence
  is fine, length is not a constraint.
- **`seoTitle`** is the browser title and the search result. Budgeted to **42
  characters**, because the template appends ` | Darpan Radadiya` (18) and the floor
  wants 50–60 total.

The build enforces the pairing rather than trusting either of us to remember:

| Situation                                | What happens                                                    |
| ---------------------------------------- | --------------------------------------------------------------- |
| `outcomeTitle` is 42 characters or fewer | `seoTitle` may stay `null`                                      |
| `outcomeTitle` is longer than 42         | `seoTitle` is **required** — the build fails, naming the counts |
| `seoTitle` is longer than 42             | **Rejected**, whether or not it was required                    |
| `seoTitle` key is missing entirely       | **Rejected** — every file carries the key, even as `null`       |

So: write the outcome title you want, and add a short `seoTitle` alongside it when
it runs long. If you forget, the build tells you, with both numbers.

`summary` doubles as the meta description and reads best at **130–160 characters**.
Outside that the build logs a note and carries on — prose length never fails a
build.

## `src/content/profile.ts` — done

Inserted verbatim on 2026-09-03: `headline`, `intro`, four `howIWork` principles,
and the five-paragraph `about` narrative.

One field remains: **`links.geeksforgeeks.url`**. The display name is "Darpan" but
the slug is unknown, so it is `null` rather than guessed.

An unused alternative was supplied for the hero intro — the shorter "Data and
analytics engineer in Boston…" version. The longer one is live; say the word to
swap.

## `src/content/projects/` — six case studies

**Done for the three featured projects:** `outcomeTitle`, `seoTitle`, `summary`.
Titles land at 48–54 characters; two summaries are 170–171 against the 130–160
preference, which warns and ships.

**Still outstanding for all six:** `timeframe`, `repo`, `screenshot`, and the eight
body sections. The three secondary projects still need `outcomeTitle`, `seoTitle`
and `summary` as well. Noted below only where a file differs.

### 1. `carbon-record-automation.mdx` — featured, flagship

**Written: Context, The problem, Constraints, What I built, Decisions (five),
Results.** Two `[CHECK]` review comments are in the file — the "forty speaking parts"
figure, and whether the deleted stage was measured before or after deletion.

Still outstanding: **Limitations** (partly drafted in your notes — the review gate
doesn't scale, checkpoints assume local disk), `timeframe`, and a screenshot.

- `role` is set: _Architecture, ML pipeline, and test suite_
- Verified facts, safe to use: 273 non-test modules, 65,193 lines of tracked
  Python; ingests
  feature-length video and produces per-character vertical reels; FastAPI service
  with Redis + RQ workers under APScheduler; Whisper speech-to-text, PySceneDetect
  shot segmentation, InsightFace ArcFace embeddings via ONNX Runtime, HDBSCAN
  clustering; human review gate for low-confidence output; multi-model LLM calls
  with configurable timeouts and three-attempt retries; on-disk embedding cache
  with per-stage checkpoints so multi-hour jobs resume; 185 pytest functions across
  21 test files behind a pre-commit gate
- The architecture diagram is **built and on the page** — five stages, checkpoint
  markers, and the review gate drawn as a gate. The "What I built" section needs
  the prose around it, not a diagram.
- Needed beyond the eight sections: the repo URL and one screenshot
- Decisions section candidates: ONNX Runtime over serving PyTorch directly;
  HDBSCAN over k-means; the human review gate over a confidence threshold alone;
  per-stage checkpoints over re-running; retry logic on LLM calls

### 2. `healthcare-clinic-erp.mdx` — featured

**Written: Context, The problem, Constraints, What I built, Decisions (two).** The ERD
is rendered from the schema. Two `[CHECK]` review comments are in the file — whether
the SQL viewer flows from the 3NF decision, and whether the 8-patient sample was
deliberate or just convenient.

Still outstanding: **Results** (row counts are measured, query timings are not — say
so if you don't have them), **Limitations** (one line on what a real clinic would need
that this doesn't), `timeframe`, and a screenshot. The problem statement still carries
an `[INFERRED]` marker.

- `role` is set: _Schema design, reporting layer, and REST API_
- `dataNote` is written and confirmed: the 5,000 patients and 12,000 appointments
  are generated, loaded to validate query performance at scale
- Verified facts: 10-table clinical schema in 3NF covering patients, providers,
  encounters, ICD-10 diagnoses, invoices and payments; documented ERD;
  provider-productivity, billing and clinical-diagnosis reporting; KPI dashboards
  with a live SQL viewer tracing metrics to source tables; full CRUD REST API to a
  React front end with CSV export
- The ERD **slot is in place** and awaits your schema; it will be drawn with the
  same component as the pipeline rather than pasted in as an image
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

## The shortest path to finished

1. **Five `[CHECK]` markers** confirmed or corrected — two in Carbon Record, two in
   the clinic, one in Bank Term Deposit about whether it was group coursework.
2. **`timeframe` on all six.** Not one is filled.
3. **Results for Customer Segmentation** — the only section left TODO in the two
   secondary write-ups, because whether any recommendation was acted on is not
   something the code can say.
4. **Site Intelligence** — verify or remove.
5. **Screenshots.** Customer Segmentation's repository already has seven committed
   under `screenshots/`, so that one is a copy job rather than a capture job.

## Not copy, but still outstanding

| Item                                                     | Blocks                                                                                                          |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Real screenshots for the three featured projects         | The featured rows render without them, but they are the weakest part of the home page as-is                     |
| Domain purchase, then `SITE_URL` in the Vercel dashboard | Canonical URLs currently point at the `.vercel.app` origin                                                      |
| `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` in Vercel      | The contact form returns an honest 503 until these exist                                                        |
| Vercel ↔ GitHub connection                               | No auto-deploy, no PR previews. Needs a browser authorization.                                                  |
| Your GitHub display name is "VADIL"                      | A recruiter following the link lands on a profile with a different name                                         |
| Re-export the résumé PDF from source                     | The served copy still says "MS in Analytics" and "600+ problems solved"; both were left rather than risk reflow |
