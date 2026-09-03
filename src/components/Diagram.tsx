import type { ReactNode } from 'react';

/**
 * Inline-SVG diagram primitives.
 *
 * This is the only component permitted to touch the `--data-*` scale, and it does
 * not expose those class names — callers pass a semantic `tone` and the mapping
 * happens here. A diagram cannot therefore reach a colour it has no business using,
 * and no other component can reach one at all.
 *
 * Accessibility: the frame is `role="img"` with a `<title>` and `<desc>`, and every
 * diagram is accompanied by a real HTML list of its stages. That list is not a
 * fallback — it is the primary text, because colour cannot carry stage identity
 * (under deuteranopia `--data-1` and `--data-2` collapse to 1.01:1) and SVG text
 * does not scale gracefully between 320px and a full measure.
 *
 * Layout is vertical at every width. Five stages laid out horizontally would give
 * each about 64px at 320px, which is unreadable; vertical costs nothing and is how
 * pipeline runners draw a DAG anyway.
 */

export type StageTone = 'ingestion' | 'inference' | 'orchestration' | 'review';

const TONE_FILL: Record<StageTone, string> = {
  ingestion: 'data-fill-1',
  inference: 'data-fill-2',
  orchestration: 'data-fill-3',
  review: 'data-fill-4',
};

const TONE_STROKE: Record<StageTone, string> = {
  ingestion: 'data-stroke-1',
  inference: 'data-stroke-2',
  orchestration: 'data-stroke-3',
  review: 'data-stroke-4',
};

/** Geometry shared by the frame and its children, so callers do no arithmetic. */
/**
 * Geometry shared by the frame and its children, so callers do no arithmetic.
 *
 * `width` is also the CSS max-width (see globals.css), so the drawing never scales
 * above 1:1. At 320px the available column is 280px, which puts the floor at 0.82 —
 * a 14px label renders at 11.5px. Widening the viewBox would lower that floor.
 */
export const DIAGRAM = {
  width: 340,
  boxX: 16,
  boxWidth: 270,
  boxHeight: 46,
  gap: 40,
  accentWidth: 4,
} as const;

export const stageTop = (index: number): number =>
  12 + index * (DIAGRAM.boxHeight + DIAGRAM.gap);

export const diagramHeight = (stageCount: number): number =>
  stageTop(stageCount - 1) + DIAGRAM.boxHeight + 12;

type DiagramProps = {
  /** Stable id prefix. Required rather than generated: this renders on the server. */
  id: string;
  title: string;
  description: string;
  height: number;
  children: ReactNode;
  /** The stage list. Real text, and the primary route to this content. */
  legend: ReactNode;
};

export function Diagram({
  id,
  title,
  description,
  height,
  children,
  legend,
}: DiagramProps) {
  return (
    <figure className="diagram my-8">
      <svg
        role="img"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
        viewBox={`0 0 ${DIAGRAM.width} ${height}`}
        className="border-rule border"
      >
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>{description}</desc>
        {children}
      </svg>
      <figcaption className="mt-4">{legend}</figcaption>
    </figure>
  );
}

/** A pipeline stage: a hairline box with a coloured edge and a short label. */
export function Stage({
  index,
  label,
  tone,
}: {
  index: number;
  label: string;
  tone: StageTone;
}) {
  const y = stageTop(index);
  return (
    <g>
      <rect
        x={DIAGRAM.boxX}
        y={y}
        width={DIAGRAM.boxWidth}
        height={DIAGRAM.boxHeight}
        className="diagram-box"
      />
      <rect
        x={DIAGRAM.boxX}
        y={y}
        width={DIAGRAM.accentWidth}
        height={DIAGRAM.boxHeight}
        className={TONE_FILL[tone]}
      />
      <text
        x={DIAGRAM.boxX + 18}
        y={y + DIAGRAM.boxHeight / 2 + 5}
        className="diagram-label"
      >
        {label}
      </text>
      <text
        x={DIAGRAM.boxX + DIAGRAM.boxWidth - 12}
        y={y + DIAGRAM.boxHeight / 2 + 5}
        className="diagram-ordinal"
        textAnchor="end"
      >
        {index + 1}
      </text>
    </g>
  );
}

/**
 * The connector between two stages, carrying a checkpoint marker.
 *
 * The marker is a square on the line rather than a label: it means "state is
 * written here, so a job that dies resumes here", which the legend says in words.
 */
export function Checkpoint({ afterIndex }: { afterIndex: number }) {
  const centre = DIAGRAM.boxX + DIAGRAM.boxWidth / 2;
  const from = stageTop(afterIndex) + DIAGRAM.boxHeight;
  const to = stageTop(afterIndex + 1);
  const mid = (from + to) / 2;

  return (
    <g>
      <line x1={centre} y1={from} x2={centre} y2={to} className="diagram-flow" />
      <rect
        x={centre - 4}
        y={mid - 4}
        width={8}
        height={8}
        className="diagram-checkpoint"
      />
    </g>
  );
}

/**
 * A gate, drawn as a gate.
 *
 * Two bars leaving a narrow opening, with the flow line passing through it and a
 * branch leading aside. Deliberately not another box: a review step is a
 * constriction in the pipeline, not a stage of it, and it should look like one.
 */
export function ReviewGate({
  afterIndex,
  tone = 'review',
}: {
  afterIndex: number;
  tone?: StageTone;
}) {
  const centre = DIAGRAM.boxX + DIAGRAM.boxWidth / 2;
  const from = stageTop(afterIndex) + DIAGRAM.boxHeight;
  const to = stageTop(afterIndex + 1);
  const mid = (from + to) / 2;
  const stroke = TONE_STROKE[tone];

  return (
    <g>
      <line x1={centre} y1={from} x2={centre} y2={to} className="diagram-flow" />

      {/* Two bars on posts, leaving a narrow opening: a gate, not a strikethrough. */}
      <line
        x1={centre - 46}
        y1={mid}
        x2={centre - 11}
        y2={mid}
        className={`diagram-gate ${stroke}`}
      />
      <line
        x1={centre + 11}
        y1={mid}
        x2={centre + 46}
        y2={mid}
        className={`diagram-gate ${stroke}`}
      />
      <line
        x1={centre - 46}
        y1={mid - 6}
        x2={centre - 46}
        y2={mid + 6}
        className={`diagram-gate-post ${stroke}`}
      />
      <line
        x1={centre + 46}
        y1={mid - 6}
        x2={centre + 46}
        y2={mid + 6}
        className={`diagram-gate-post ${stroke}`}
      />

      {/* A chevron below the opening: what passes through, passes downward. */}
      <path
        d={`M ${centre - 7} ${mid + 7} L ${centre} ${mid + 14} L ${centre + 7} ${mid + 7}`}
        className={`diagram-gate-chevron ${stroke}`}
        fill="none"
      />

      {/* The branch aside, for what does not pass. Horizontal, clear of the boxes. */}
      <line
        x1={centre + 46}
        y1={mid}
        x2={centre + 74}
        y2={mid}
        className={`diagram-branch ${stroke}`}
      />
      <text x={centre + 78} y={mid + 3.5} className="diagram-gate-label">
        held
      </text>
    </g>
  );
}
