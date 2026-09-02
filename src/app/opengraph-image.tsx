import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
import { currentEducation, profile } from '@/content/profile';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `${profile.name} — ${profile.role}`;

export default function OpengraphImage() {
  const education = currentEducation();
  return renderOgImage({
    eyebrow: profile.name,
    title: profile.role,
    meta: `${profile.location} — ${education.credentialShort}, ${education.institution} — ${profile.availability}`,
  });
}
