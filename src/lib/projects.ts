import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';

const CONTENT_DIR = join(process.cwd(), 'src', 'content', 'projects');

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

export const projectFrontmatterSchema = z.object({
  /** The project's factual name. Used for navigation and the document title. */
  title: z.string().min(1),
  /**
   * The outcome-shaped headline — what the project achieved, not what it was
   * built with. `null` until Darpan writes it; consumers fall back to `title`.
   */
  outcomeTitle: z.string().min(1).nullable(),
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

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
export type Project = ProjectFrontmatter & { slug: string; body: string };

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

/** The headline to display: the outcome-shaped title once written, else the name. */
export function displayTitle(project: Project): string {
  return project.outcomeTitle ?? project.title;
}
