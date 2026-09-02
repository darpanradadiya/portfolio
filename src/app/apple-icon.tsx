import { ImageResponse } from 'next/og';

/**
 * The same mark as icon.svg, rasterised at the size iOS expects. Light ground only:
 * a home-screen icon has no colour scheme to respond to.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';
export const alt = 'Darpan Radadiya';

export default function AppleIcon() {
  const bars = [
    { left: 34, top: 107, height: 39 },
    { left: 79, top: 73, height: 73 },
    { left: 124, top: 34, height: 112 },
  ];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        backgroundColor: '#161A1D',
      }}
    >
      {bars.map((bar) => (
        <div
          key={bar.left}
          style={{
            position: 'absolute',
            left: bar.left,
            top: bar.top,
            width: 22,
            height: bar.height,
            backgroundColor: '#FBFBF9',
          }}
        />
      ))}
    </div>,
    size,
  );
}
