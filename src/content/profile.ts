/**
 * The single typed source of truth for everything about Darpan that appears on the
 * site. Nothing here may be hardcoded in JSX.
 *
 * Populated from Darpan_Radadiya_Resume.pdf. Three deliberate divergences from that
 * PDF, all of which are corrections rather than edits:
 *
 *   1. Graduation is December 2026. The PDF's summary says December 2026 but its
 *      education block says May 2026; December is correct.
 *   2. The DSA figure is 950+ (719 GeeksforGeeks + 242 LeetCode, verified
 *      2026-09-02). The PDF still says 600+.
 *   3. The phone number in the PDF is deliberately not represented here. The site
 *      has no use for it, and modelling it would make it possible to render.
 *
 * TODO markers below are content Darpan still owes; they are typed so the compiler
 * points at every consumer if the shape changes.
 */

export type ExternalProfile = {
  readonly label: string;
  /** `null` means the URL is not yet known — see the TODOs below. */
  readonly url: string | null;
  readonly handle: string | null;
  /** Whether to emit this in the JSON-LD `sameAs` array. */
  readonly inSameAs: boolean;
  /**
   * Whether any *number* from this platform may be rendered. Codeforces is
   * deliberately `false`: it is linked, but never quantified. See DESIGN.md.
   */
  readonly showStats: boolean;
};

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

/**
 * GeeksforGeeks figures.
 *
 * Hand-entered, not fetched: GeeksforGeeks has no public API, and the community
 * scrapers that exist are unreliable enough that depending on one would be worse
 * than a dated constant. `verifiedOn` is when these were read off the profile.
 */
export type GeeksforGeeksStats = {
  readonly verifiedOn: string;
  readonly total: number;
  readonly school: number;
  readonly basic: number;
  readonly easy: number;
  readonly medium: number;
  readonly hard: number;
  readonly codingScore: number;
  readonly instituteRank: number;
};

/** A "How I work" principle: a short claim, then the paragraph that backs it. */
export type WorkPrinciple = {
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
    "I'm a data and analytics engineer finishing an MPS in Analytics at Northeastern in December 2026. My last project was a 270-module Python system that takes a feature film, works out who's in it, and cuts a reel for each character — six models in sequence, no labelled cast, and multi-hour runtimes. Most of the engineering went into making it survive failure rather than making it clever. That's the part of this work I'm actually interested in.",

  howIWork: [
    {
      heading: "1. Tests are how I find out I'm wrong",
      body: "I don't trust my own code, and I don't think anyone should trust code that hasn't told them what it does when things go badly. Carbon Record has 185 pytest functions across 24 test files, which expand to 494 passing cases, sitting behind a pre-commit gate. The number isn't the point. The point is that in a 95,000-line system across 270 modules, I find out I've broken something in seconds instead of finding out from whoever is using it.",
    },
    {
      heading: '2. Bad data is cheaper to stop than to explain',
      body: "Almost everything that goes wrong downstream started as a bad record upstream. At Clomotech I wrote preprocessing and validation rules that ran before anything reached a model, which cut manual data-wrangling by around 40% — not because the rules were clever, but because catching a malformed row costs seconds and debugging a model trained on it costs days. I'd rather fail loudly at ingestion than quietly at inference.",
    },
    {
      heading: '3. Anything that runs for hours will be interrupted',
      body: 'Carbon Record runs six models in sequence over feature-length input, so I designed for interruption from the start rather than bolting recovery on later. Embeddings are cached on disk and flushed in batches, each stage writes a marker when it completes, and Gemini calls get three bounded attempts with an explicit timeout. A job that dies at hour three resumes at hour three. That single decision is what made the system usable rather than merely working.',
    },
    {
      heading: "4. When a model isn't sure, it should say so",
      body: "Cast identification is the stage everything downstream depends on, and there's no labelled answer key — identities have to be discovered from the footage. I clustered face embeddings with HDBSCAN rather than k-means specifically because it infers the number of clusters and labels outliers as noise instead of forcing every extra into a lead's identity. Then I put a human naming step in front of low-confidence clusters. It's the only manual step in the pipeline and it's manual on purpose: a threshold is a guess about where a model stops being trustworthy, and it's wrong in both directions.",
    },
  ] satisfies readonly WorkPrinciple[],

  about: [
    "I'm Darpan. I'm finishing an MPS in Analytics at Northeastern in Boston, graduating December 2026, after a B.Tech in Information and Communication Technology from Dhirubhai Ambani University in Gujarat.",
    "I got here through the unglamorous route. Nine months at PepCoding on data structures and full-stack web development, mentoring at my university's CINS club, a summer research internship. Then a data analyst internship at Clomotech building ETL on AWS Glue, Lambda, and S3 that processed over 100,000 operational records a day and replaced a legacy ingestion process that was holding up everything downstream. Most recently at Wisaxis, building reproducible Python and SQL workflows over a 100,000-record daily dataset that had no scalable process at all.",
    "Outside coursework I build things that are larger than they need to be, because that's where the interesting failures live. Carbon Record is 270 modules and six models deep. The clinic ERP is a ten-table 3NF schema with a live SQL viewer that traces every dashboard metric back to its source table, because I wanted to know whether the numbers on the dashboard were the numbers in the database.",
    "Alongside that I've solved around 950 algorithm problems across GeeksforGeeks and LeetCode, weighted toward medium and hard. Not the interesting part of my work, but the reason the interesting part goes faster.",
    "What I'm looking for: analytics or data engineering work where the pipeline is the product — somewhere the correctness of the data matters as much as the model on top of it.",
  ] as readonly string[],

  contact: {
    email: 'radadiya.d@northeastern.edu',
  },

  /**
   * When the coding-profile figures in `proof` were last checked against the live
   * profiles. Rendered beside the numbers, so a stale figure is honest rather than
   * silently wrong.
   */
  statsVerifiedOn: '2026-09-02',

  links: {
    github: {
      label: 'GitHub',
      url: 'https://github.com/darpanradadiya',
      handle: 'darpanradadiya',
      inSameAs: true,
      showStats: true,
    },
    linkedin: {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/darpan-radadiya-146a49215',
      handle: 'darpan-radadiya-146a49215',
      inSameAs: true,
      showStats: false,
    },
    leetcode: {
      label: 'LeetCode',
      url: 'https://leetcode.com/u/darpanradadiya576/',
      handle: 'darpanradadiya576',
      inSameAs: true,
      showStats: true,
    },
    codeforces: {
      label: 'Codeforces',
      // Linked, never quantified. The rating is fetched but not rendered.
      url: 'https://codeforces.com/profile/darpanradadiya576',
      handle: 'darpanradadiya576',
      inSameAs: true,
      showStats: false,
    },
    geeksforgeeks: {
      label: 'GeeksforGeeks',
      // TODO(darpan): the profile display name is "Darpan", which is not enough to
      // build a URL, and the slug is not yet known. Left null rather than guessed —
      // a wrong sameAs asserts an identity that is not his. The 719 figure below is
      // hand-entered because GeeksforGeeks has no public API.
      url: null,
      handle: null,
      inSameAs: true,
      showStats: true,
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
      value: '270',
      label: 'modules',
      // TODO(darpan): confirm whether these group into 24 subsystems. The resume
      // documents 270 modules, 95K lines, and 24 *test files* — "24 subsystems" is
      // not evidenced anywhere, so it is left off rather than guessed.
      provenance: 'Carbon Record — 95K lines',
    },
    {
      value: '185',
      label: 'pytest functions',
      provenance: 'Pre-commit gated, 24 test files',
    },
    {
      value: '950+',
      label: 'problems solved',
      provenance: 'GeeksforGeeks and LeetCode',
    },
    {
      value: '100K+',
      label: 'records a day',
      provenance: 'Clomotech ETL — Glue, Lambda, S3',
    },
  ] satisfies readonly ProofPoint[],

  /** See GeeksforGeeksStats — these are read off the profile, not fetched. */
  geeksforgeeks: {
    verifiedOn: '2026-09-02',
    total: 719,
    school: 1,
    basic: 74,
    easy: 225,
    medium: 348,
    hard: 71,
    codingScore: 2270,
    instituteRank: 70,
  } satisfies GeeksforGeeksStats,

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
        'Data structures and algorithms (950+ problems solved)',
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
 * Guards the hand-entered GeeksforGeeks breakdown against a typo.
 *
 * These numbers are not validated by any fetch, so the one check available is that
 * the tiers add up to the stated total. Called from the unit tests.
 */
export function geeksforgeeksBreakdownSums(): boolean {
  const g = profile.geeksforgeeks;
  return g.school + g.basic + g.easy + g.medium + g.hard === g.total;
}

/** Absolute URLs for JSON-LD `sameAs`, excluding profiles whose URL is unknown. */
export function sameAsUrls(): string[] {
  return Object.values(profile.links)
    .filter((link) => link.inSameAs && link.url !== null)
    .map((link) => link.url as string);
}
