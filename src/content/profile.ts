/**
 * The single typed source of truth for everything about Darpan that appears on the
 * site. Nothing here may be hardcoded in JSX.
 *
 * Populated from Darpan_Radadiya_Resume.pdf. Three deliberate divergences from that
 * PDF, all of which are corrections rather than edits:
 *
 *   1. Graduation is December 2026. The PDF's summary says December 2026 but its
 *      education block says May 2026; December is correct.
 *   2. The PDF claims "600+" data-structures and algorithms problems. The site
 *      makes no such claim: no problem count, difficulty split or platform
 *      ranking renders anywhere. The profiles are linked instead.
 *   3. The phone number in the PDF is deliberately not represented here. The site
 *      has no use for it, and modelling it would make it possible to render.
 *
 * One TODO remains below, for the GeeksforGeeks profile slug. It is typed so the
 * compiler points at every consumer if the shape changes, and it is the only thing
 * keeping that profile out of both the /about link list and the JSON-LD sameAs.
 */

export type ExternalProfile = {
  readonly label: string;
  /** `null` means the URL is not yet known — see the TODOs below. */
  readonly url: string | null;
  readonly handle: string | null;
  /** Whether to emit this in the JSON-LD `sameAs` array. */
  readonly inSameAs: boolean;
};

/*
 * `showStats` used to live here: a per-platform flag for whether a number from
 * that platform could be rendered, `false` for Codeforces. It is gone because the
 * rule it encoded is now site-wide and absolute. No figure from any coding profile
 * renders anywhere, so a field granting permission per platform could only ever be
 * wrong. The profiles are links.
 */

export type ProofPoint = {
  /** Rendered in the subset monospace. Only glyphs in MONO_SUBSET are permitted. */
  readonly value: string;
  readonly label: string;
  /** The evidence for the value. Rendered in the grotesk, directly beneath it. */
  readonly provenance: string;
};

export type EducationEntry = {
  readonly institution: string;
  readonly credential: string;
  /** Abbreviated form for tight spaces such as the hero meta line. */
  readonly credentialShort: string;
  readonly location: string;
  readonly completion: string;
  readonly result: string;
};

export type ExperienceEntry = {
  readonly role: string;
  readonly organisation: string;
  readonly location: string;
  readonly start: string;
  readonly end: string;
  readonly highlights: readonly string[];
};

/*
 * GeeksforGeeksStats used to be declared here: total, the basic/easy/medium/hard
 * split, coding score and institute rank, hand-entered from the profile.
 *
 * The type and the data are both gone. No problem count, difficulty split or
 * platform ranking renders anywhere on the site, and the standing rule for the
 * fetched snapshot applies just as well to a typed constant: if we never store
 * them they cannot leak. The profile is still linked.
 */

/** A "How I work" principle: a short claim, then the paragraph that backs it. */
export type WorkPrinciple = {
  /**
   * Anchor id for the full paragraph on /about. The home page lists the headings
   * and links each one here.
   *
   * Written down rather than slugified from the heading. A slug derived from prose
   * changes when the prose is edited, which silently breaks every link to it; this
   * is a permanent address that a rewrite cannot move. Uniqueness is checked in
   * the unit tests, because two identical ids would render two elements with the
   * same anchor and send the link to whichever came first.
   */
  readonly id: string;
  readonly heading: string;
  readonly body: string;
};

export type SkillGroup = {
  readonly category: string;
  readonly items: readonly string[];
};

export const profile = {
  name: 'Darpan Radadiya',
  role: 'Data / analytics engineer with applied ML depth',
  location: 'Boston, MA',
  availability: 'Graduating December 2026',

  headline: "Most ML pipelines break quietly. I build the ones that don't.",
  intro:
    "I'm a data and analytics engineer finishing an MPS in Analytics at Northeastern in December 2026. Carbon Record, my last project, is a 273-module Python system that works out who's in a feature film and cuts a reel per character.",

  howIWork: [
    {
      id: 'tests',
      heading: "1. Tests are how I find out I'm wrong",
      body: "I don't trust my own code, and nobody should trust code that hasn't said what it does when it fails. Carbon Record has 185 pytest functions behind a pre-commit gate. In 65,000 lines I find out I've broken something in seconds, not from a user.",
    },
    {
      id: 'bad-data',
      heading: '2. Bad data is cheaper to stop than to explain',
      body: 'Almost everything that goes wrong downstream started as a bad record upstream. At Clomotech I wrote validation rules that ran before anything reached a model, cutting manual data-wrangling by around 40%. Catching a malformed row costs seconds; debugging a model trained on one costs days.',
    },
    {
      id: 'interruption',
      heading: '3. Anything that runs for hours will be interrupted',
      body: 'Carbon Record runs six models in sequence over feature-length input, so I designed for interruption. Embeddings are cached on disk, each stage writes a completion marker, and Gemini calls get three bounded attempts. A job that dies at hour three resumes at hour three.',
    },
    {
      id: 'uncertainty',
      heading: "4. When a model isn't sure, it should say so",
      body: 'Cast identification carries everything downstream, and there is no answer key. I clustered face embeddings with HDBSCAN rather than k-means because it infers the number of clusters and labels outliers as noise instead of forcing extras into leads. Low-confidence clusters get a human name.',
    },
  ] satisfies readonly WorkPrinciple[],

  about: [
    "I'm Darpan. I'm finishing an MPS in Analytics at Northeastern in Boston, graduating December 2026, after a B.Tech in Information and Communication Technology from Dhirubhai Ambani University in Gujarat.",
    "The route here was unglamorous. Nine months at PepCoding on data structures and full-stack web development, mentoring at my university's CINS club, a summer research internship. Then ETL on AWS Glue, Lambda and S3 at Clomotech, replacing a legacy ingestion process that held up analytics.",
    "I build things larger than they need to be. That's where the interesting failures live. Carbon Record is 273 modules and six models deep. The clinic ERP is a ten-table 3NF schema with a SQL viewer, so I could check dashboard numbers against the database.",
    "Alongside that I've put a long stretch of time into data structures and algorithms. Not the interesting part of my work, but the reason the interesting part goes faster.",
    "What I'm looking for: analytics or data engineering work where the pipeline is the product, somewhere the correctness of the data matters as much as the model on top of it.",
  ] as readonly string[],

  contact: {
    email: 'radadiya.d@northeastern.edu',
  },

  /**
   * What Darpan is open to, in one sentence. Rendered on the home page and again
   * on /contact. It stopped being a literal in JSX the moment it appeared twice:
   * two copies of a sentence are two things to keep in step, and one of them
   * always loses.
   */
  openTo:
    'Open to analytics engineering, data engineering, and applied ML roles from December 2026.',

  /*
   * statsVerifiedOn used to live here, dating the coding-profile figures in the
   * proof strip. There are none left: every cell is now measured from a repository
   * or documented in the résumé, and none of them changes without a commit. A date
   * that can only ever agree with itself is not evidence.
   */

  links: {
    github: {
      label: 'GitHub',
      url: 'https://github.com/darpanradadiya',
      handle: 'darpanradadiya',
      inSameAs: true,
    },
    linkedin: {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/darpan-radadiya-146a49215',
      handle: 'darpan-radadiya-146a49215',
      inSameAs: true,
    },
    leetcode: {
      label: 'LeetCode',
      url: 'https://leetcode.com/u/darpanradadiya576/',
      handle: 'darpanradadiya576',
      inSameAs: true,
    },
    codeforces: {
      label: 'Codeforces',
      // In sameAs only. The rating was never rendered, and now the link is not
      // either: the contest profile said nothing the case studies do not say
      // better. The URL stays so the entity graph is complete.
      url: 'https://codeforces.com/profile/darpanradadiya576',
      handle: 'darpanradadiya576',
      inSameAs: true,
    },
    geeksforgeeks: {
      label: 'GeeksforGeeks',
      // TODO(darpan): the profile display name is "Darpan", which is not enough to
      // build a URL, and the slug is not yet known. Left null rather than guessed —
      // a wrong sameAs asserts an identity that is not his. This is now the only
      // thing blocking the link, because there is no longer a figure to render.
      url: null,
      handle: null,
      inSameAs: true,
    },
  } satisfies Record<string, ExternalProfile>,

  /**
   * The proof strip. Four hard numbers, each with the evidence beneath it.
   *
   * `value` renders in the subset monospace; `provenance` renders in the grotesk.
   * That asymmetry is the point — the monospace marks the claim, the grotesk cites
   * it. Every figure here is documented in the resume or verified against a live
   * profile, and none of them can render as 0.
   */
  proof: [
    {
      value: '273',
      label: 'modules',
      /*
       * Re-verified against the repository on 2026-09-04, from a fresh clone:
       * 273 .py files outside tests/, 65,193 lines across all .py, 21 test files
       * in tests/ and 185 pytest functions in them. The definition of "module"
       * matters and is therefore written down: every .py file except the ones
       * under tests/. Ten more test files live under scratch/ and are not
       * counted, which makes the 21 conservative rather than generous.
       *
       * "24 subsystems" was never evidenced and is not claimed anywhere.
       */
      provenance: 'Carbon Record, 65K lines',
    },
    {
      value: '185',
      label: 'pytest functions',
      provenance: 'Pre-commit gated, 21 test files',
    },
    {
      /*
       * Replaces "950+ problems solved". A problem count measures how much
       * practice, not what was built, and it came from a platform rather than
       * from the work; this comes out of a schema anyone can read. It also puts a
       * second project in the strip, which was otherwise Carbon Record twice and
       * one internship, and it is the only cell that speaks to data modelling.
       *
       * Checked against CLINIC_TABLES and CLINIC_RELATIONSHIPS in the unit tests,
       * so the strip cannot disagree with the schema it cites.
       */
      value: '10',
      label: 'tables in 3NF',
      provenance: 'Clinic ERP, 9 enforced relationships',
    },
    {
      value: '100K+',
      label: 'records a day',
      provenance: 'Clomotech ETL on Glue, Lambda and S3',
    },
  ] satisfies readonly ProofPoint[],

  education: [
    {
      institution: 'Northeastern University',
      credential: 'Master of Professional Studies in Analytics',
      credentialShort: 'MPS Analytics',
      location: 'Boston, MA',
      completion: 'December 2026',
      result: 'GPA 3.96/4.0',
    },
    {
      institution: 'Dhirubhai Ambani University',
      credential: 'B.Tech, Information and Communication Technology',
      credentialShort: 'B.Tech ICT',
      location: 'Gujarat, India',
      completion: 'June 2024',
      result: 'CGPA 7.45/10.0',
    },
  ] satisfies readonly EducationEntry[],

  experience: [
    {
      role: 'Data Analyst Intern',
      organisation: 'Wisaxis LLC',
      location: 'Boston, MA',
      start: 'September 2025',
      end: 'March 2026',
      highlights: [
        'Built reproducible Python and SQL analysis workflows over a 100K+ daily-record operational dataset with no prior scalable process, cutting time-to-insight by 30%.',
        'Applied LLM-based summarisation and machine learning workflows to detect anomalies and inconsistent patterns in structured operational data, shortening issue-resolution cycles.',
        'Translated ambiguous business requirements into testable data specifications, and authored integration guides and best-practice documentation to standardise quality expectations across teams.',
      ],
    },
    {
      role: 'Data Analyst Intern',
      organisation: 'Clomotech Pvt. Ltd.',
      location: 'Gujarat, India',
      start: 'January 2024',
      end: 'June 2024',
      highlights: [
        'Built and maintained automated ETL pipelines on AWS Glue, Lambda, and S3 processing 100K+ operational records daily, replacing a legacy ingestion process that delayed downstream analytics.',
        'Developed Python preprocessing and data-cleaning scripts enforcing data quality validation rules before records reached machine learning models, reducing manual data-wrangling effort by 40%.',
        'Owned API-based ingestion troubleshooting and defect resolution, and built AWS QuickSight and Excel dashboards surfacing operational KPIs and early-warning quality signals for business stakeholders.',
      ],
    },
  ] satisfies readonly ExperienceEntry[],

  skills: [
    {
      category: 'AI/ML testing and validation',
      items: [
        'Model output validation',
        'Robustness and edge-case testing',
        'Data quality assurance',
        'Regression testing',
        'pytest-based test automation',
        'Pre-commit quality gates',
        'Retry/timeout and checkpoint-recovery validation',
        'LLM output evaluation',
      ],
    },
    {
      category: 'AI and machine learning',
      items: [
        'PyTorch',
        'scikit-learn',
        'Hugging Face Transformers',
        'ONNX Runtime model serving',
        'Whisper speech-to-text',
        'ArcFace/InsightFace embeddings',
        'HDBSCAN clustering',
        'OpenCV',
        'LLM orchestration and evaluation',
        'Prompt engineering',
        'Feature engineering',
        'Time-series analysis',
      ],
    },
    {
      category: 'Programming and automation',
      items: [
        'Python',
        'SQL',
        'R',
        'JavaScript',
        'C',
        'C++',
        'Test automation and scripting',
        'Workflow automation',
        'Distributed task queues (Redis, RQ)',
        'Job scheduling',
        'Git',
        'pytest',
        'Jupyter',
      ],
    },
    {
      category: 'Data engineering',
      items: [
        'ETL/ELT pipeline development',
        'Data transformation',
        'AWS Glue',
        'AWS Lambda',
        'Amazon S3',
        'Amazon QuickSight',
        'PySpark',
        'Batch processing',
        'REST API design with FastAPI',
        'Data quality validation rules',
      ],
    },
    {
      category: 'Databases and reporting',
      items: [
        'PostgreSQL',
        'MySQL',
        'SQLite',
        'Redis',
        'Firestore',
        'Relational schema design',
        '3NF normalisation',
        'ERD documentation',
        'Query optimisation',
        'Tableau',
        'Power BI',
        'Streamlit',
      ],
    },
    {
      category: 'Foundations',
      items: [
        'Data structures and algorithms',
        'Operating systems',
        'Database management systems',
        'Object-oriented programming',
        'Node.js',
        'React',
      ],
    },
  ] satisfies readonly SkillGroup[],
} as const;

/**
 * The current qualification.
 *
 * `noUncheckedIndexedAccess` is on, so indexing is checked rather than asserted.
 * The throw documents an invariant that holds at build time: this array is never
 * empty, and if someone empties it the build fails loudly instead of rendering a
 * gap in the hero.
 */
export function currentEducation(): EducationEntry {
  const first = profile.education[0];
  if (first === undefined) {
    throw new Error('profile.education must contain at least one entry');
  }
  return first;
}

/**
 * Guards the "How I work" anchor ids against a copy-paste duplicate.
 *
 * Two principles sharing an id renders two elements with the same anchor, and
 * every link to the second one silently lands on the first. Called from the unit
 * tests. See WorkPrinciple.
 */
export function workPrincipleIdsAreUnique(): boolean {
  const ids = profile.howIWork.map((principle) => principle.id);
  return new Set(ids).size === ids.length;
}

/** Absolute URLs for JSON-LD `sameAs`, excluding profiles whose URL is unknown. */
export function sameAsUrls(): string[] {
  return Object.values(profile.links)
    .filter((link) => link.inSameAs && link.url !== null)
    .map((link) => link.url as string);
}
