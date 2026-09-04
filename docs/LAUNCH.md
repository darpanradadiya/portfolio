# Launch checklist

Everything standing between the site as it is and announcing the URL. Audited
2026-09-03 against the deployed build.

Nothing here is a bug. The site is green on every gate and clears the quality floor
on all ten routes. These are the items that need a decision, a credential, or a file
only you have.

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

The served PDF is out of date in four ways. It is the one place the résumé and the
site now contradict each other.

| Fix                        | Currently says         | Should say                    |
| -------------------------- | ---------------------- | ----------------------------- |
| Degree                     | "MS in Analytics"      | **MPS in Analytics**          |
| DSA figure                 | "600+ problems solved" | **950+**                      |
| Line count                 | (not stated)           | 65K lines, if you cite it     |
| Test files                 | (not stated)           | 21 test files, if you cite it |
| Site Intelligence Platform | listed                 | **remove it**                 |

The last one matters most. It was deleted from the site because no repository exists
for it and no PySpark appears anywhere in the GitHub account, so nothing about it
could be checked. Leaving it on the résumé reintroduces exactly the unverifiable
claim the site was cleaned of.

Two things were already fixed in the served copy by `scripts/redact-resume.py`: the
phone number is removed, and the graduation date reads December 2026. Re-run that
script against the new export so both survive:

```bash
python3 scripts/redact-resume.py path/to/new-export.pdf
```

It refuses to write if the phone survives or the graduation line is lost.

## 4. Answer the five review markers

All live in MDX comments and none renders. `npm run lint:todo` fails the build if one
ever reaches a page.

| File                               | Question                                                                                                                      |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `carbon-record-automation.mdx`     | Is "forty speaking parts" representative? It comes from the reference film's 42 characters.                                   |
| `carbon-record-automation.mdx`     | Was the deleted caching stage measured before deletion, or after?                                                             |
| `healthcare-clinic-erp.mdx`        | Does the live SQL viewer follow from the 3NF decision, or was it separate?                                                    |
| `healthcare-clinic-erp.mdx`        | Was the 8-patient sample deliberate, or just what got committed?                                                              |
| `bank-term-deposit-prediction.mdx` | Solo or group coursework? The README credits you alone; the notebook imports `capstone_group7`. `role` is null until you say. |

One `[INFERRED]` also remains, on the clinic's problem statement: it is read from the
code rather than from you, and the assignment brief would settle it.

## 5. Screenshots

Three featured projects have none. `screenshot` is null, so nothing renders and
nothing is promised.

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

The only `sameAs` entry still null. It is left null rather than guessed, because a
wrong `sameAs` asserts an identity that is not yours. Set `links.geeksforgeeks.url`
in `src/content/profile.ts`; the `/code` page and the JSON-LD both pick it up.

## 7. Fix your GitHub display name

`github.com/darpanradadiya` shows **"VADIL"**. A recruiter following the link from a
page about Darpan Radadiya lands on a profile with a different name on it.

---

## Where things stand

|              |                                                                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| CI           | Green. Typecheck, ESLint, stylelint, monospace guard, font coverage, Prettier, 71 unit tests, build, output guard, 64 e2e at desktop and 320px. |
| Deploys      | Automatic. Vercel is connected to GitHub; pushing to `main` deploys. Do not run `vercel deploy`.                                                |
| Lighthouse   | All ten routes ≥96 on all four categories, mobile. CLS 0 everywhere.                                                                            |
| Coding stats | Snapshot current, re-verified against the live LeetCode API on 2026-09-03. Refreshes daily by cron.                                             |
| Claims       | Every figure on the site matches the source it came from.                                                                                       |

## Known and accepted

**LCP sits at 2.0-2.2s** across routes against a 2.0s target. The cause is not
loading: every request completes by ~134ms and main-thread work is ~370ms.
Lighthouse attributes ~1.9s of "render delay" to the hero paragraph under simulated
throttling. The lever is a shorter hero paragraph, not less motion, and it is worth
0.1-0.2s. Measured, not guessed: disabling the gradient, the proof-strip animation
and the scroll reveal moves it by 0.0s, 0.0s and 0.1s respectively.

**Three sections are deliberately absent.** Tesla and Customer Segmentation have no
Decisions or Results; Bank Term Deposit has no Decisions. They were deleted rather
than placeheld because the source cannot support them. Five real sections beat eight
where three are apologies.

**Carbon Record has no repository link.** It is private, and the page says so where
the link would be rather than shipping a 404.
