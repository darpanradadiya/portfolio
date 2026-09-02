import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

/**
 * Open Graph cards are rendered by satori, which resolves neither CSS custom
 * properties nor light-dark(). The token values are therefore repeated here as
 * literals — the one place in the codebase where that is correct, since a shared
 * social image has no colour scheme to respond to. Light ground only.
 */
const OG_PAPER = '#FBFBF9';
const OG_INK = '#161A1D';
const OG_INK_MUTED = '#5B6570';
const OG_RULE_STRONG = '#848981';

function ogFont(): Buffer {
  return readFileSync(
    join(process.cwd(), 'src', 'assets', 'og', 'instrument-sans-og.ttf'),
  );
}

/**
 * A card built on the same idea as the site: a hairline, a claim, and the evidence
 * for it underneath.
 */
export function renderOgImage({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string;
  title: string;
  meta: string;
}): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: OG_PAPER,
        color: OG_INK,
        fontFamily: 'Instrument Sans',
        padding: '72px 80px',
      }}
    >
      <div style={{ display: 'flex', fontSize: 26, color: OG_INK_MUTED }}>{eyebrow}</div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            width: 88,
            height: 2,
            backgroundColor: OG_RULE_STRONG,
            marginBottom: 32,
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 62 ? 56 : 68,
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>
      </div>

      <div style={{ display: 'flex', fontSize: 26, color: OG_INK_MUTED }}>{meta}</div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [{ name: 'Instrument Sans', data: ogFont(), style: 'normal', weight: 500 }],
    },
  );
}
