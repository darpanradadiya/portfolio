# Launch checklist

Everything standing between the site as it is and announcing the URL. Audited
2026-09-04 against the deployed build, end to end.

Nothing here is a bug. The site is green on every gate, and every route scores 100
on accessibility, best practices and SEO on both mobile and desktop. These are the
items that need a decision, a credential, or a file only you have.

Two of the seven are done and are marked as such rather than deleted, so the list
stays comparable with the one you have been working through.

---

## 1. Connect the contact form

Until these exist the endpoint returns `503` and tells the sender the message was
not delivered. That is honest, and it is still a form that cannot send.

Verified live on 2026-09-03:

```
POST /api/contact
503  {"status":"unavailable","reason":"The form is not connected to a mail
      provider yet, so this message was not sent."}
```

In the Vercel dashboard, Settings → Environment Variables, scope **Production**:

| Variable             | Value                                     | Required                                    |
| -------------------- | ----------------------------------------- | ------------------------------------------- |
| `RESEND_API_KEY`     | From resend.com → API Keys                | Yes                                         |
| `CONTACT_FROM_EMAIL` | A sender on a domain verified with Resend | Yes                                         |
| `CONTACT_TO_EMAIL`   | Where enquiries land                      | No, defaults to the address in `profile.ts` |

Redeploy after adding them; environment variables are read at build time.

Then check it end to end by sending yourself a message from the live form. Success
looks like the form replacing itself with "Message sent." A failure will say so
rather than pretending.

## 2. Buy the domain and point the site at it

One value drives canonical tags, the sitemap, `robots.txt`, `llms.txt`, and every
Open Graph URL.

1. Register the domain.
2. Vercel → Settings → Domains → add it, and follow the DNS instructions.
3. Vercel → Settings → Environment Variables, Production:
   `SITE_URL = https://yourdomain.com` (no trailing slash; one is stripped anyway)
4. **Redeploy.** Pages are statically prerendered, so the value is read at build
   time. Adding the variable alone changes nothing until a build runs.
5. Verify:

```bash
curl -s https://yourdomain.com | grep -o 'rel="canonical" href="[^"]*"'
curl -s https://yourdomain.com/sitemap.xml | head -5
```

Both should show the new origin. If they still show `.vercel.app`, the redeploy did
not pick up the variable.

The fallback is the current production URL rather than localhost, deliberately: a
build that loses the variable still emits correct canonicals instead of pointing
search engines at a dev server.

## 3. Re-export the résumé PDF

**Status: outstanding.** The text of the published PDF was extracted and compared to
the site on 2026-09-04. Five discrepancies, all in the résumé's favour to fix
because the site's numbers are the measured ones.

| Fix              | PDF currently says                                                                           | Should say                                                                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modules          | "a 270-module, 95K-line Python system"                                                       | **273-module, 65K-line** (measured: 273 .py outside `tests/`, 65,193 lines)                                                                                             |
| Test files       | "185 pytest functions across 24 test files"                                                  | **21 test files** (measured: 21 in `tests/`; 185 functions is correct)                                                                                                  |
| DSA figure       | "600+ problems solved"                                                                       | **delete the parenthetical.** The claim is retired from the site entirely, so replacing it with a bigger number reintroduces something the site no longer stands behind |
| Degree           | Summary says "MS in Analytics"; Education says "Master of Professional Studies in Analytics" | **MPS in Analytics** in both. The PDF currently disagrees with itself                                                                                                   |
| Northeastern GPA | not shown in the education block                                                             | **GPA 3.96/4.0**, which the site states                                                                                                                                 |

**Site Intelligence Platform is already gone from the PDF.** Verified: no occurrence
of the name. That item is closed.

Confirmed still correct in the PDF, so do not disturb them: no phone number,
December 2026, the 10-table 3NF schema with 5,000 patients and 12,000 appointments,
and 185 pytest functions.

After re-exporting, run the redaction step again, because it is what keeps the phone
number out and it operates on the file you replace:

```bash
python3 scripts/redact-resume.py
```

## 4. Answer the review markers

**Status: five left, one closed.** All live in MDX comments and none renders.
`npm run lint:todo` fails the build if one ever reaches a page, and it is green.

Four `[CHECK]` questions and one `[INFERRED]` note, plus seven `TODO(darpan)` notes
that record why a section is the length it is. Answering the five unblocks prose; the
seven are context, not debts.

| File                               | Question                                                                                                                      |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `carbon-record-automation.mdx`     | Is "forty speaking parts" representative? It comes from the reference film's 42 characters.                                   |
| `carbon-record-automation.mdx`     | Was the deleted caching stage measured before deletion, or after?                                                             |
| `healthcare-clinic-erp.mdx`        | Does the live SQL viewer follow from the 3NF decision, or was it separate?                                                    |
| `bank-term-deposit-prediction.mdx` | Solo or group coursework? The README credits you alone; the notebook imports `capstone_group7`. `role` is null until you say. |
| `healthcare-clinic-erp.mdx`        | `[INFERRED]`: the problem statement is read from the code rather than from anything you wrote. Confirm or replace it.         |

**The sql.js question is closed, and by measurement rather than recollection.** It
asked whether the eight-patient committed database was deliberate.
`public/clinic_erp.db` is 86KB and holds 75 rows across all ten tables, of which 8
patients, 14 appointments, 8 encounters and 8 invoices. `server/seed.js` loops 5,000
times at line 171 and its own comment documents about 12,000 appointments. The case
study states both, and the marker is gone.

Worth trying on the rest: at least one more of these is a question the repository can
answer without anyone having to remember anything.

## 5. Screenshots

**Status: outstanding, and the largest visual gap on the site.** All five projects
have `screenshot: null`, so nothing renders and nothing is promised, but a case
study about a dashboard with no picture of the dashboard is the thing a hiring
engineer will notice first.

**Customer Segmentation is a copy job, not a capture job.** Its repository already
has seven committed under `screenshots/`.

Tesla's repository has five under `screenshots/` as well.

For each, add to the project's frontmatter:

```yaml
screenshot:
  src: /screenshots/<name>.png
  alt: <what it shows, not "screenshot of the dashboard">
  width: 1600
  height: 1000
```

`alt` is required by the schema, not optional. The build fails without it.

## 6. Fill the GeeksforGeeks profile URL

**Status: outstanding, and now blocking two things.** It is the only `sameAs` entry
still null, so the JSON-LD ships three profiles instead of four, and it is why the
Profiles list at the foot of `/about` shows LeetCode alone. Both render from the
links that have a URL, so both fill in the moment you set one.

Left null rather than guessed, because a wrong `sameAs` asserts an identity that is
not yours. Set `links.geeksforgeeks.url` in `src/content/profile.ts`. Note that
`/code` no longer exists: it was folded into `/about` and redirects there.

## 7. Fix your GitHub display name

**Status: outstanding.** `github.com/darpanradadiya` shows **"VADIL"**. A recruiter following the link from a
page about Darpan Radadiya lands on a profile with a different name on it.

---

## Where things stand

Measured on 2026-09-04 against the deployed build, not asserted.

|                 |                                                                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CI              | Green. Typecheck, ESLint, stylelint, monospace guard, font coverage, Prettier, 60 unit tests, build, output guard, 66 e2e at desktop and 320px.                                                                                            |
| Deploys         | Automatic. Vercel is connected to GitHub; pushing to `main` deploys. Do not run `vercel deploy`.                                                                                                                                           |
| Lighthouse      | All ten routes, both presets, two runs each: **100 on accessibility, best practices and SEO everywhere**. Performance 100 on desktop, 97-100 on mobile. Nothing under 95.                                                                  |
| CLS             | 0.000 on every route and preset, with one 0.010 sample on the Tesla page.                                                                                                                                                                  |
| LCP             | 0.35-0.46s desktop, 1.37-2.22s mobile.                                                                                                                                                                                                     |
| Contrast        | Every rendered text element walked in the browser and measured against the background actually painted behind it: **883 elements, seven routes, both themes, none below AA.** Tightest margin 4.81 against 4.5.                            |
| Responsive      | **500 checks**: 25 widths from 320 to 2560, ten routes, both themes. Nothing past the viewport, no monospace cell clipped inside its own column.                                                                                           |
| Outbound links  | 15 URLs monitored daily: every `sameAs` entry, every repository row, and every case-study repo and demo link. 12 confirmed alive, 3 refused by hosts that do not serve robots, **0 dead**.                                                 |
| Claims          | Re-verified from source. Carbon Record's 273 modules, 65,193 lines, 185 pytest functions and 21 test files all reproduce from a fresh clone. The clinic's 10 tables and 9 foreign keys match `server/schema.sql` exactly, table for table. |
| Rendered output | No `TODO`, review marker, em-dash, placeholder or build-status narration on any route. Enforced by a build gate, not by reading.                                                                                                           |

## The honest list

Everything a hiring engineer could find if they went looking. None of it is a
blocker. All of it is true, and it is better to know before they do.

**No screenshots anywhere.** Five case studies about dashboards and pipelines, and
not one image. This is the first thing anyone will notice, and it is item 5.

**Two case studies are visibly thinner than the other three.** Tesla is 534 words
across six sections and Customer Segmentation is 494 across six, against Carbon
Record's 3,022 across eight. The missing sections were deleted for lack of evidence
rather than placeheld, which is the right call and still reads as thin.

**Two case studies render no figures at all.** Tesla and Customer Segmentation have
empty `metrics` arrays, so the one page element that says "this is measured" is
absent on the two pages that most need it.

**Three of five projects disclose generated or synthetic data.** Tesla, Customer
Segmentation and Bank Term Deposit all carry a `dataNote`. Honest, and it means the
majority of the portfolio is not built on data anyone paid for.

**The flagship project cannot be inspected.** Carbon Record is private. The page
says so where the link would be, but every number about it is unverifiable by a
reader, which is an awkward position for a site whose argument is checkability.

**The repository is still moving under the claims.** Carbon Record's last commit was
2026-09-03. The 273 / 65,193 / 185 / 21 figures reproduce today; they are a snapshot
of a repository still being worked on, and the definition of "module" (every `.py`
outside `tests/`) is a choice, written down in `profile.ts` so it can be checked.

**The JSON-LD `jobTitle` says something the site does not.** It is "Data / analytics
engineer with applied ML depth", a tagline cut from the hero. Structured data rather
than page copy, and kept because `sameAs` and `jobTitle` are what an entity graph
reads, but a reader viewing source will find a claim the page never makes.

**`sameAs` ships three profiles, not four.** GeeksforGeeks is missing because its URL
is unknown. Item 6.

**The one live demo is on a free tier that sleeps.** The clinic ERP answers in about
0.2s once awake and timed out at 15s from cold during this audit. A visitor arriving
first can wait 30 to 60 seconds. The monitor now allows 75s for exactly this reason,
which means it will not catch the demo actually dying quickly.

**Two proof-strip figures cannot be checked by a reader at all.** "100K+ records a
day" is from the Clomotech internship and exists only on the résumé. "273 modules"
is in a private repository. Two of the four are verifiable by clicking; two are
taken on trust.

**Two summaries overrun the meta-description range.** Carbon Record at 171
characters and Tesla at 170, against 130-160. The build reports them as notes rather
than failing, deliberately, and search engines will truncate them.

**The `--ramp-*` colour scale has no consumer.** It was reserved for the difficulty
bars, which were deleted with the coding-profile figures. Four tokens and eight
classes that nothing paints, kept on the argument that re-deriving a scale is more
expensive than leaving one parked.

**`VerifiedValue.tsx` has no importers.** It predates the current pages and stays
only because the ESLint reserved-token rule names it as the owner of two classes.

**Nothing on the site is dated.** No published dates, no "last updated". Deliberate,
since the alternative is a page that ages visibly, but a reader cannot tell whether
they are looking at something from last week or last year.

**The contact form is not connected.** It returns 503 and says so honestly rather
than pretending to send. Item 1.

## Known and accepted

**LCP on mobile sits at 1.4-2.2s** against a 2.0s target, and it is not loading.
Every request completes by ~134ms and main-thread work is ~370ms; Lighthouse
attributes the rest to "render delay" on the hero paragraph under simulated
throttling. Measured, not guessed: disabling the gradient, the proof-strip animation
and the scroll reveal moves it by 0.0s, 0.0s and 0.1s. The lever is a shorter hero
paragraph, and the hero is already at a 40-word budget.

**Three case-study sections are deliberately absent.** Tesla and Customer
Segmentation have no Decisions or Results; Bank Term Deposit has no Decisions. They
were deleted rather than placeheld because the source cannot support them. Five real
sections beat eight where three are apologies.

**Carbon Record has no repository link.** It is private, and the page says so where
the link would be rather than shipping a 404.

**The `/code` route is gone.** Every figure on it came off the site, which left two
links and no reason for a route. It redirects permanently to `/about`, where the
Profiles list carries what remains.
