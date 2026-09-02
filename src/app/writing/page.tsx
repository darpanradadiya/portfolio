import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { Limitation } from '@/components/Limitation';
import { getPublishedPosts } from '@/lib/writing';
import { formatDate } from '@/lib/format';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Technical notes on data engineering, testing ML pipelines, and data quality by Darpan Radadiya. Notes are published here as they are written.',
  alternates: { canonical: absoluteUrl('/writing') },
  // Nothing published yet, so keep it out of the index until it says something.
  robots: { index: false, follow: true },
};

export default function WritingPage() {
  const posts = getPublishedPosts();

  return (
    <Section marker="Writing">
      <h1 className="text-3xl">Writing</h1>

      {posts.length === 0 ? (
        <>
          <p className="measure mt-4 text-lg">Nothing here yet.</p>
          <Limitation className="measure mt-4">
            This page is a shell. It is empty rather than padded with posts that were not
            written — there is no version of three invented articles that reads better
            than an honest blank page. Until then, the{' '}
            <Link href="/projects">case studies</Link> are where the technical detail is.
          </Limitation>
        </>
      ) : (
        <ol className="mt-10 flex list-none flex-col gap-8 p-0">
          {posts.map((post, index) => (
            <li
              key={post.slug}
              className={index > 0 ? 'border-rule-strong border-t pt-8' : ''}
            >
              <h2 className="text-xl">
                <Link href={`/writing/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-ink-muted text-2xs mt-1">
                {formatDate(post.publishedAt)}
              </p>
              <p className="measure mt-2">{post.description}</p>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
