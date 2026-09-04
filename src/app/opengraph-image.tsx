import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
import { currentEducation, profile } from '@/content/profile';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
/*
 * The card draws the headline, not profile.role. It drew the role until the
 * tagline was cut from the hero, which left every shared link promising a
 * sentence that is nowhere on the site. profile.role stays in the data: it is
 * still the JSON-LD jobTitle, the default document title, and the llms.txt
 * summary line, none of which a reader sees as a claim on the page.
 */
export const alt = `${profile.name}: ${profile.headline}`;

export default function OpengraphImage() {
  const education = currentEducation();
  return renderOgImage({
    eyebrow: profile.name,
    title: profile.headline,
    meta: `${profile.location}. ${education.credentialShort}, ${education.institution}. ${profile.availability}`,
  });
}
