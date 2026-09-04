import { displayTitle, getAllProjects } from '@/lib/projects';
import { currentEducation, profile } from '@/content/profile';
import { absoluteUrl } from '@/lib/site';

/**
 * llms.txt — a plain-text summary for language models, at the site root.
 *
 * Generated from the same typed content as the pages rather than kept as a static
 * file in public/, so it cannot drift out of sync with the case studies it points
 * at. Adding a project updates this automatically.
 */
export const dynamic = 'force-static';

export function GET(): Response {
  const education = currentEducation();
  const projects = getAllProjects();

  const lines = [
    `# ${profile.name}`,
    '',
    `> ${profile.role}. Based in ${profile.location}. ${profile.availability} from ${education.institution} (${education.credentialShort}, ${education.result}).`,
    '',
    'Darpan builds data and ML systems that are tested end to end rather than',
    'demonstrated in notebooks. The flagship project is a 273-module, 65K-line',
    'Python pipeline with 185 pytest functions across 21 test files behind a',
    'pre-commit gate. He has also solved 950+ data-structures and algorithms',
    'problems across GeeksforGeeks and LeetCode.',
    '',
    '## Case studies',
    '',
    ...projects.map((project) => {
      const summary = project.summary ?? `${project.stack.slice(0, 4).join(', ')}.`;
      return `- [${displayTitle(project)}](${absoluteUrl(`/projects/${project.slug}`)}): ${summary}`;
    }),
    '',
    '## Pages',
    '',
    `- [Home](${absoluteUrl('/')}): positioning, selected figures, featured work.`,
    `- [Work](${absoluteUrl('/projects')}): all projects, filterable by domain.`,
    `- [About](${absoluteUrl('/about')}): education, experience, and skills.`,
    `- [Résumé](${absoluteUrl('/resume')}): full résumé, with a PDF download.`,
    '',
    '## Experience',
    '',
    ...profile.experience.map(
      (entry) =>
        `- ${entry.role}, ${entry.organisation} (${entry.start} – ${entry.end}, ${entry.location}).`,
    ),
    '',
    '## Contact',
    '',
    `- Email: ${profile.contact.email}`,
    ...Object.values(profile.links)
      .filter((link) => link.url !== null)
      .map((link) => `- ${link.label}: ${link.url}`),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
