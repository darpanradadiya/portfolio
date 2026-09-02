import type { Metadata, Viewport } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { PersonSchema } from '@/components/PersonSchema';
import { profile } from '@/content/profile';
import { SITE, SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    'Data and analytics engineer in Boston building tested ML and data pipelines. Graduating December 2026 from Northeastern with an MPS in Analytics.',
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    siteName: SITE.name,
    url: SITE_URL,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          The grotesk carries the LCP text, so it is preloaded. The monospace face is
          not: it is 1.4 KB and only ever renders below the headline, so preloading it
          would compete with the element that actually determines LCP.
        */}
        <link
          rel="preload"
          href="/fonts/instrument-sans-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="page pt-10 md:pt-16">
          {children}
        </main>
        <SiteFooter />
        <PersonSchema />
      </body>
    </html>
  );
}
