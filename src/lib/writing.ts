import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';

const CONTENT_DIR = join(process.cwd(), 'src', 'content', 'writing');

export const postFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  publishedAt: z.string().date(),
  /** Drafts are readable by URL but excluded from the index and the sitemap. */
  draft: z.boolean().default(false),
});

export type Post = z.infer<typeof postFrontmatterSchema> & { slug: string; body: string };

/**
 * Published posts, newest first.
 *
 * Returns an empty array when there is nothing to show, and the page renders an
 * honest empty state. The shell ships before the writing does — a portfolio with
 * three invented blog posts is worse than one with none.
 */
export function getPublishedPosts(): Post[] {
  if (!existsSync(CONTENT_DIR)) return [];

  return readdirSync(CONTENT_DIR)
    .filter((name) => name.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const { data, content } = matter(readFileSync(join(CONTENT_DIR, fileName), 'utf8'));
      const parsed = postFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((issue) => `    ${issue.path.join('.') || '(root)'}: ${issue.message}`)
          .join('\n');
        throw new Error(
          `Invalid frontmatter in src/content/writing/${fileName}:\n${issues}`,
        );
      }
      return { ...parsed.data, slug, body: content };
    })
    .filter((post) => !post.draft)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
