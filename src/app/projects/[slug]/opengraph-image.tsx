import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
import { displayTitle, getAllProjects, getProject } from '@/lib/projects';
import { profile } from '@/content/profile';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  if (project === undefined) {
    return renderOgImage({
      eyebrow: profile.name,
      title: profile.role,
      meta: profile.location,
    });
  }

  /*
   * The card's footer states the strongest measured figure for the project, or the
   * stack when nothing is measured. It never invents a number, and it never shows
   * an empty slot.
   */
  const headline = project.metrics[0];
  const meta =
    headline === undefined
      ? project.stack.slice(0, 4).join('  ·  ')
      : `${headline.value} ${headline.label}  —  ${project.stack.slice(0, 3).join(', ')}`;

  return renderOgImage({
    eyebrow: `${profile.name} — case study`,
    title: displayTitle(project),
    meta,
  });
}
