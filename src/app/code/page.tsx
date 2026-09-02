import type { Metadata } from 'next';
import { Section } from '@/components/Section';
import { Measured } from '@/components/Measured';
import { MetaList } from '@/components/MetaList';
import { StackList } from '@/components/StackList';
import { DifficultyTiers } from '@/components/DifficultyTiers';
import { profile } from '@/content/profile';
import { stats } from '@/lib/stats-snapshot';
import { formatDate } from '@/lib/format';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Foundations',
  description:
    'Data structures and algorithms: 348 medium and 71 hard problems on GeeksforGeeks, 151 medium and 36 hard on LeetCode. Depth rather than volume.',
  alternates: { canonical: absoluteUrl('/code') },
};

export default function CodePage() {
  const gfg = profile.geeksforgeeks;
  const leetcode = stats?.leetcode ?? null;
  const github = stats?.github ?? null;

  return (
    <div className="flex flex-col gap-14 md:gap-20">
      <Section marker="Foundations">
        <h1 className="text-3xl">Foundations</h1>
        <p className="measure mt-4 text-lg">
          The interesting number here is not how many problems, but which ones. Medium and
          hard problems are where data-structure choices stop being interchangeable.
        </p>
        <p className="measure text-ink-muted mt-4 text-xs">
          These are cumulative totals. The two platforms grade difficulty on their own
          scales, so the tiers are reported separately rather than added together — a
          &ldquo;hard&rdquo; on one is not a &ldquo;hard&rdquo; on the other.
        </p>
      </Section>

      <Section marker="GeeksforGeeks" divided>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 className="text-xl">GeeksforGeeks</h2>
          <p className="text-ink-muted text-2xs">as of {formatDate(gfg.verifiedOn)}</p>
        </div>

        <div className="mt-6">
          <DifficultyTiers
            tiers={[
              { label: 'hard', count: gfg.hard, emphasis: true },
              { label: 'medium', count: gfg.medium, emphasis: true },
              { label: 'easy', count: gfg.easy },
              { label: 'basic', count: gfg.basic },
              { label: 'school', count: gfg.school },
            ]}
          />
        </div>

        <MetaList
          className="text-ink-muted mt-6 text-xs"
          items={[`${gfg.total} problems solved in total`]}
        />

        <dl className="mt-6 flex flex-col gap-2 text-xs">
          <div className="flex gap-3">
            <dt className="text-ink-muted w-28 shrink-0">Coding score</dt>
            <dd>
              <Measured>{String(gfg.codingScore)}</Measured>
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-ink-muted w-28 shrink-0">Institute rank</dt>
            <dd>
              <Measured>{String(gfg.instituteRank)}</Measured>
            </dd>
          </div>
        </dl>

        {/*
          GeeksforGeeks has no public API, so these figures are hand-entered
          constants rather than a fetch. The profile URL slug is not yet known, so
          there is no outbound link here rather than a guessed one.
        */}
        <p className="text-ink-muted text-2xs mt-6">
          Read from the profile by hand — GeeksforGeeks publishes no API, and the
          community scrapers are less reliable than a dated constant.
        </p>
      </Section>

      {leetcode !== null && (
        <Section marker="LeetCode" divided>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="text-xl">
              <a href={profile.links.leetcode.url ?? undefined}>LeetCode</a>
            </h2>
            <p className="text-ink-muted text-2xs">
              as of {formatDate(leetcode.verifiedAt)}
            </p>
          </div>

          <div className="mt-6">
            <DifficultyTiers
              tiers={[
                { label: 'hard', count: leetcode.data.hard, emphasis: true },
                { label: 'medium', count: leetcode.data.medium, emphasis: true },
                { label: 'easy', count: leetcode.data.easy },
              ]}
            />
          </div>

          <MetaList
            className="text-ink-muted mt-6 text-xs"
            items={[`${leetcode.data.total} problems solved in total`]}
          />
          <p className="text-ink-muted text-2xs mt-4">
            Fetched in CI and committed as a static snapshot, so this page never waits on
            LeetCode and never renders an empty figure.
          </p>
        </Section>
      )}

      <Section marker="Codeforces" divided>
        <h2 className="text-xl">
          <a href={profile.links.codeforces.url ?? undefined}>Codeforces</a>
        </h2>
        {/*
          Linked, never quantified. The handle is verified in CI so a dead link
          surfaces, but no figure from Codeforces is stored or rendered.
        */}
        <p className="measure mt-3 text-xs">
          Contest profile, for anyone who wants to look. Nothing from it is summarised
          here.
        </p>
      </Section>

      {github !== null && (
        <Section marker="GitHub" divided>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="text-xl">
              <a href={profile.links.github.url}>GitHub</a>
            </h2>
            <p className="text-ink-muted text-2xs">
              as of {formatDate(github.verifiedAt)}
            </p>
          </div>

          <div className="mt-6">
            <Measured className="block text-2xl">
              {String(github.data.publicRepos)}
            </Measured>
            <span className="text-2xs text-ink-muted mt-1 block">
              public repositories
            </span>
          </div>

          {github.data.topLanguages.length > 0 && (
            <div className="mt-6">
              <p className="text-ink-muted text-2xs">
                Most used languages, by repository
              </p>
              <StackList
                className="text-ink-muted mt-2 text-xs"
                items={github.data.topLanguages.map((language) => language.name)}
              />
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
