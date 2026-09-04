import type { Metadata } from 'next';
import { Section } from '@/components/Section';
import { CopyEmail } from '@/components/CopyEmail';
import { ContactForm } from '@/components/ContactForm';
import { profile } from '@/content/profile';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Write to Darpan Radadiya about analytics engineering, data engineering and applied ML roles from December 2026. Email, or send a message from the browser.',
  alternates: { canonical: absoluteUrl('/contact') },
};

/**
 * The contact form's own page.
 *
 * It used to sit at the bottom of the home page, where it was the single tallest
 * block on the site and every visitor scrolled past it whether or not they had
 * anything to say. The home page keeps the address, which is what someone who has
 * decided actually needs.
 *
 * The address is offered first and the form second, in that order deliberately:
 * the form depends on a mail provider and the address does not.
 */
export default function ContactPage() {
  return (
    <Section marker="Contact">
      <h1 className="text-3xl">Get in touch</h1>
      <p className="measure mt-4 text-lg">{profile.openTo}</p>

      <div className="mt-6 text-base">
        <CopyEmail email={profile.contact.email} />
      </div>

      <div className="border-rule mt-10 border-t pt-10">
        <h2 className="text-xl">Send a message</h2>
        <p className="measure text-ink-muted mt-3 text-xs">
          Goes straight to the address above. Every outcome is reported back to you,
          including the ones where nothing was sent.
        </p>
        <div className="mt-8">
          <ContactForm email={profile.contact.email} />
        </div>
      </div>
    </Section>
  );
}
