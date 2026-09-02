import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import { SITE } from '@/lib/site';

const CONTENT_DIR = join(process.cwd(), 'src', 'content', 'projects');

/**
 * Title budget.
 *
 * The metadata template renders `%s | <site name>`, so the suffix is derived from
 * SITE.name rather than written out — renaming the site cannot silently invalidate
 * the budget. The quality floor puts a document title at 50-60 characters, which
 * leaves MAX_SEO_TITLE for the title itself.
 */
export const TITLE_SUFFIX = ` | ${SITE.name}`;
export const MAX_DOCUMENT_TITLE = 60;
export const MAX_SEO_TITLE = MAX_DOCUMENT_TITLE - TITLE_SUFFIX.length;

/**
 * `summary` doubles as the page's meta description, which reads best between these
 * bounds. Outside them is a warning, never an error — a short summary is worth
 * shipping, and failing a build over prose length would be absurd.
 */
export const SUMMARY_MIN = 130;
export const SUMMARY_MAX = 160;

/** A non-blocking note about description length, or null when it is in range. */
export function summaryLengthWarning(
  slug: string,
  summary: string | null,
): string | null {
  if (summary === null) return null;
  const length = summary.length;
  if (length >= SUMMARY_MIN && length <= SUMMARY_MAX) return null;

  const direction = length < SUMMARY_MIN ? 'short' : 'long';
  return (
    `${slug}: summary is ${length} characters, ${direction} of the ${SUMMARY_MIN}-${SUMMARY_MAX} ` +
    'range that reads best as a meta description. Not an error.'
  );
}

/**
 * Frontmatter is validated rather than trusted. A case study with a malformed
 * header fails the build with the file name and the offending field, which is
 * cheaper than discovering it as an empty element in production.
 */
const screenshotSchema = z.object({
  src: z.string().startsWith('/'),
  /** Required, not optional — every image on this site has alt text. */
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const metricSchema = z.object({
  /** Rendered in the subset monospace. Must only use glyphs in MONO_SUBSET. */
  value: z.string().min(1),
  label: z.string().min(1),
});

const baseProjectFrontmatterSchema = z.object({
  /** The project's factual name. Used for navigation and the document title. */
  title: z.string().min(1),
  /**
   * The outcome-shaped headline — what the project achieved, not what it was
   * built with. `null` until Darpan writes it; consumers fall back to `title`.
   *
   * Used for the on-page `<h1>`, where length is not a constraint.
   */
  outcomeTitle: z.string().min(1).nullable(),
  /**
   * A shorter title for the browser `<title>` and search results.
   *
   * The key is required in every file, even as null, rather than being optional.
   * An optional field gets forgotten and drifts out of sync with a rewritten
   * outcomeTitle; a key you have to write is one you have to think about. The
   * refinement below makes it mandatory exactly when it is needed.
   */
  seoTitle: z.string().min(1).nullable(),
  /** One line stating the problem the project solves. */
  summary: z.string().min(1).nullable(),
  featured: z.boolean(),
  /** Display order. Featured projects occupy 1-3. */
  order: z.number().int().positive(),
  /** Nullable: the resume does not record dates or team size per project. */
  role: z.string().min(1).nullable(),
  timeframe: z.string().min(1).nullable(),
  stack: z.array(z.string().min(1)).min(1),
  /** Controlled vocabulary, so /projects can filter without free-text drift. */
  domains: z
    .array(
      z.enum([
        'ML pipelines',
        'Data engineering',
        'Data modelling',
        'Analytics and reporting',
      ]),
    )
    .min(1),
  metrics: z.array(metricSchema),
  repo: z.string().url().nullable(),
  demo: z.string().url().nullable(),
  screenshot: screenshotSchema.nullable(),
  /**
   * A disclosure that belongs next to the work — a synthetic dataset, say. Rendered
   * with the Limitation component, never hidden.
   */
  dataNote: z.string().min(1).nullable(),
});

/**
 * Conditional requirement, in the same spirit as the monospace guard and the
 * reserved-token rule: the constraint is enforced by tooling rather than trusted to
 * memory.
 *
 *   - An outcomeTitle longer than the budget REQUIRES a seoTitle. Rewriting the
 *     outcome title into something longer cannot quietly blow the title budget,
 *     because the build stops until a short one exists.
 *   - A seoTitle that would itself overflow the budget is rejected. A field that
 *     exists to keep titles short is not allowed to make them long.
 */
export const projectFrontmatterSchema = baseProjectFrontmatterSchema.superRefine(
  (value, ctx) => {
    if (value.seoTitle !== null && value.seoTitle.length > MAX_SEO_TITLE) {
      ctx.addIssue({
        code: 'custom',
        path: ['seoTitle'],
        message:
          `is ${value.seoTitle.length} characters, which renders a document title of ` +
          `${value.seoTitle.length + TITLE_SUFFIX.length} once "${TITLE_SUFFIX.trim()}" is ` +
          `appended. Keep it to ${MAX_SEO_TITLE} characters or fewer.`,
      });
    }

    if (
      value.outcomeTitle !== null &&
      value.outcomeTitle.length > MAX_SEO_TITLE &&
      value.seoTitle === null
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['seoTitle'],
        message:
          `is required: outcomeTitle is ${value.outcomeTitle.length} characters, which ` +
          `would render a document title of ${value.outcomeTitle.length + TITLE_SUFFIX.length}. ` +
          `Add a seoTitle of ${MAX_SEO_TITLE} characters or fewer. The outcomeTitle stays ` +
          'as it is — it is the on-page heading, where length is not a constraint.',
      });
    }
  },
);

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
export type Project = ProjectFrontmatter & { slug: string; body: string };

/** Slugs already warned about in this process, so a note is not repeated per read. */
const warnedSlugs = new Set<string>();

function readProject(fileName: string): Project {
  const slug = fileName.replace(/\.mdx$/, '');
  const raw = readFileSync(join(CONTENT_DIR, fileName), 'utf8');
  const { data, content } = matter(raw);
  const parsed = projectFrontmatterSchema.safeParse(data);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `    ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Invalid frontmatter in src/content/projects/${fileName}:\n${issues}`,
    );
  }

  const warning = summaryLengthWarning(slug, parsed.data.summary);
  if (warning !== null && !warnedSlugs.has(slug)) {
    // getAllProjects runs several times per build — page, metadata, OG image,
    // sitemap — so without this the same note repeats for every consumer. Next
    // renders static pages across worker processes, each with its own module
    // instance, so a note can still appear once per worker. That is as far as a
    // module-level set can get, and it is enough to keep the log readable.
    warnedSlugs.add(slug);
    console.warn(`  note  ${warning}`);
  }

  return { ...parsed.data, slug, body: content };
}

export function getAllProjects(): Project[] {
  return readdirSync(CONTENT_DIR)
    .filter((name) => name.endsWith('.mdx'))
    .map(readProject)
    .sort((a, b) => a.order - b.order);
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((project) => project.featured);
}

export function getProject(slug: string): Project | undefined {
  return getAllProjects().find((project) => project.slug === slug);
}

/** The previous and next project in display order, for case-study navigation. */
export function getProjectNeighbours(slug: string): {
  previous: Project | undefined;
  next: Project | undefined;
} {
  const all = getAllProjects();
  const index = all.findIndex((project) => project.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };
  return { previous: all[index - 1], next: all[index + 1] };
}

/** Every domain in use, for the /projects filter. */
export function getAllDomains(): string[] {
  return [...new Set(getAllProjects().flatMap((project) => project.domains))].sort();
}

/**
 * The on-page `<h1>`: the outcome-shaped title once written, else the project name.
 * Length is not a constraint here — a heading may be a full sentence.
 */
export function displayTitle(project: Project): string {
  return project.outcomeTitle ?? project.title;
}

/**
 * The browser `<title>`, before the site name is appended. Falls back to the
 * heading when no short form was needed.
 */
export function documentTitle(project: Project): string {
  return project.seoTitle ?? displayTitle(project);
}
