import Image from 'next/image';

type Screenshot = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * A project screenshot, or a deliberate account of its absence.
 *
 * The empty state is not a blank box or a grey rectangle pretending to be an image.
 * It reserves the same footprint the real screenshot will occupy — so nothing
 * shifts when one lands — and says what it is waiting for. On a site whose whole
 * argument is that its claims are checkable, an unexplained gap is worse than a
 * sentence admitting the gap.
 */
export function ScreenshotSlot({
  screenshot,
  label,
  className = '',
}: {
  screenshot: Screenshot | null;
  /** Named so the note says which project's screenshot is missing. */
  label: string;
  className?: string;
}) {
  if (screenshot !== null) {
    return (
      <Image
        src={screenshot.src}
        alt={screenshot.alt}
        width={screenshot.width}
        height={screenshot.height}
        className={`rounded-image border-rule w-full border ${className}`.trim()}
        sizes="(min-width: 768px) 14rem, 100vw"
      />
    );
  }

  return (
    <div
      className={`border-rule-strong flex flex-col justify-end border border-dashed p-3 ${className}`.trim()}
      // Matches the aspect the real screenshots will use, so adding one does not
      // move the rest of the row.
      style={{ aspectRatio: '16 / 10' }}
    >
      <p className="text-ink-muted text-2xs">
        No screenshot of {label} yet. It will be a real capture of the running
        application, not a mockup.
      </p>
    </div>
  );
}
