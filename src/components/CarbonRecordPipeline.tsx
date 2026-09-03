import {
  Checkpoint,
  Diagram,
  ReviewGate,
  Stage,
  diagramHeight,
  type StageTone,
} from '@/components/Diagram';

/**
 * The Carbon Record pipeline: five stages in sequence, checkpointed between each.
 *
 * The legend below the drawing is the primary text, not a caption. Colour cannot
 * carry stage identity — see the note in Diagram.tsx — and SVG text does not scale
 * well across the range this site supports, so the words live in HTML.
 */

const STAGES: { label: string; tone: StageTone; detail: string }[] = [
  {
    label: 'Transcription',
    tone: 'ingestion',
    detail: 'Whisper turns the audio track into timed text.',
  },
  {
    label: 'Shot segmentation',
    tone: 'ingestion',
    detail: 'PySceneDetect splits the film at shot boundaries.',
  },
  {
    label: 'Face embedding',
    tone: 'inference',
    detail: 'InsightFace ArcFace embeddings, served through ONNX Runtime.',
  },
  {
    label: 'Identity clustering',
    tone: 'inference',
    detail:
      'HDBSCAN groups embeddings into cast identities. It infers how many there are and marks outliers as noise, rather than forcing every extra into a lead.',
  },
  {
    label: 'Labelling and scoring',
    tone: 'orchestration',
    detail:
      'Multi-model LLM calls label each cluster and score scenes, with bounded retries.',
  },
];

export function CarbonRecordPipeline() {
  const height = diagramHeight(STAGES.length);

  return (
    <Diagram
      id="carbon-record-pipeline"
      height={height}
      title="The Carbon Record pipeline, five stages in sequence"
      description={
        'A vertical pipeline. Transcription and shot segmentation ingest the film; ' +
        'face embedding and identity clustering resolve who appears in it; labelling ' +
        'and scoring produce the output. A checkpoint is written between every stage, ' +
        'so an interrupted job resumes at the last completed stage rather than ' +
        'restarting. Between identity clustering and labelling there is a review ' +
        'gate: clusters the model is not confident about are held aside for a person ' +
        'to name before anything downstream runs.'
      }
      legend={
        <ol className="text-ink-muted text-2xs m-0 flex list-none flex-col gap-3 p-0">
          {STAGES.map((stage, index) => (
            <li key={stage.label} className="flex gap-3">
              <span className="text-ink w-4 shrink-0 tabular-nums">{index + 1}</span>
              <span>
                <span className="text-ink">{stage.label}.</span> {stage.detail}
                {index === 3 && (
                  <>
                    {' '}
                    Low-confidence clusters are held at the review gate for a person to
                    name — the only manual step, and manual on purpose.
                  </>
                )}
              </span>
            </li>
          ))}
          <li className="border-rule flex gap-3 border-t pt-3">
            <span className="w-4 shrink-0" aria-hidden="true">
              ▪
            </span>
            <span>
              Squares on the connectors are checkpoints. Each stage writes a marker when
              it completes, so a job that dies at hour three resumes at hour three.
            </span>
          </li>
        </ol>
      }
    >
      {STAGES.map((stage, index) => (
        <Stage key={stage.label} index={index} label={stage.label} tone={stage.tone} />
      ))}
      <Checkpoint afterIndex={0} />
      <Checkpoint afterIndex={1} />
      <Checkpoint afterIndex={2} />
      {/* Between clustering and labelling the flow narrows through a review gate. */}
      <ReviewGate afterIndex={3} />
    </Diagram>
  );
}
