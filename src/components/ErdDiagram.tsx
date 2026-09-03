import {
  Diagram,
  EntityBox,
  RelationshipArc,
  erdHeight,
  type StageTone,
} from '@/components/Diagram';
import { CLINIC_RELATIONSHIPS, CLINIC_TABLES } from '@/content/clinic-schema';

/**
 * The clinic ERP entity-relationship diagram, drawn from src/content/clinic-schema.ts.
 *
 * Rendered rather than pasted in as an image, for three reasons that an image cannot
 * satisfy: it follows the theme, it is legible at 320px, and it is generated from the
 * same transcription of schema.sql that the legend prints — so the drawing and the
 * text cannot disagree with each other.
 *
 * Table order is chosen to keep the relationship arcs short: parents before the
 * children that reference them, so nine foreign keys can be drawn in one gutter
 * without crossing a box.
 */

const ORDER = [
  'PATIENT',
  'PORTAL_ACCOUNT',
  'PROVIDER',
  'LOCATION',
  'APPOINTMENT',
  'ENCOUNTER',
  'DIAGNOSIS',
  'ENCOUNTER_DIAGNOSIS',
  'INVOICE',
  'PAYMENT',
] as const;

/** Which part of the clinic a table belongs to. Colour is reinforcement only. */
const TONE: Record<string, StageTone> = {
  PATIENT: 'ingestion',
  PORTAL_ACCOUNT: 'ingestion',
  PROVIDER: 'orchestration',
  LOCATION: 'orchestration',
  APPOINTMENT: 'orchestration',
  ENCOUNTER: 'inference',
  DIAGNOSIS: 'inference',
  ENCOUNTER_DIAGNOSIS: 'inference',
  INVOICE: 'review',
  PAYMENT: 'review',
};

const GROUP_LABEL: Record<StageTone, string> = {
  ingestion: 'People',
  orchestration: 'Scheduling',
  inference: 'Clinical',
  review: 'Billing',
};

export function ErdDiagram() {
  const indexOf = (name: string) => ORDER.indexOf(name as (typeof ORDER)[number]);
  const tables = ORDER.map((name) => {
    const table = CLINIC_TABLES.find((t) => t.name === name);
    if (table === undefined) throw new Error(`clinic-schema.ts has no table ${name}`);
    return table;
  });

  return (
    <Diagram
      id="clinic-erd"
      height={erdHeight(tables.length)}
      title="The clinic ERP schema: ten tables and nine foreign keys"
      description={
        'An entity-relationship diagram. Ten tables in third normal form. People: ' +
        'patient and portal account. Scheduling: provider, location and appointment. ' +
        'Clinical: encounter, diagnosis, and the bridge table joining them. Billing: ' +
        'invoice and payment. Three relationships are one-to-one and enforced by a ' +
        'unique constraint: a patient has at most one portal account, an appointment ' +
        'at most one encounter, and an encounter at most one invoice. The remaining ' +
        'six are many-to-one. Every relationship is listed in full beneath the drawing.'
      }
      legend={
        <div className="flex flex-col gap-4">
          <ul className="text-ink-muted text-2xs m-0 flex list-none flex-col gap-1.5 p-0">
            {CLINIC_RELATIONSHIPS.map((rel) => (
              <li key={`${rel.from}.${rel.column}`}>
                <span className="text-ink">
                  {rel.from} → {rel.to}
                </span>{' '}
                on {rel.column}: {rel.cardinality}, {rel.enforcedBy}
              </li>
            ))}
          </ul>
          <p className="text-ink-muted border-rule text-2xs m-0 border-t pt-3">
            Solid arcs are one-to-one, dashed are many-to-one; the list above is the
            authoritative version, since a line style is no more readable than a colour to
            someone who cannot tell them apart. Transcribed from{' '}
            <code>server/schema.sql</code>, which opens with{' '}
            <code>PRAGMA foreign_keys = ON</code>. Without that line the constraints would
            be documentation.
          </p>
        </div>
      }
    >
      {/* Arcs first, so a box always sits above the lines that reach it. */}
      {CLINIC_RELATIONSHIPS.map((rel) => (
        <RelationshipArc
          key={`${rel.from}.${rel.column}`}
          childIndex={indexOf(rel.from)}
          parentIndex={indexOf(rel.to)}
          oneToOne={rel.cardinality === 'one-to-one'}
          tone={TONE[rel.from] ?? 'ingestion'}
        />
      ))}
      {tables.map((table, index) => (
        <EntityBox
          key={table.name}
          index={index}
          name={table.name}
          tone={TONE[table.name] ?? 'ingestion'}
        />
      ))}
    </Diagram>
  );
}

/** Group names, exported so a caller can label the colour grouping if it wants to. */
export const ERD_GROUPS = GROUP_LABEL;
