/**
 * The clinic ERP schema, transcribed from server/schema.sql in
 * github.com/darpanradadiya/healthcare-clinic-erp.
 *
 * This is data, not a drawing. It exists so the ERD can be rendered with the same
 * Diagram component as the pipeline rather than pasted in as an image, and so the
 * table list beside the drawing is real text. Nothing renders it yet.
 *
 * Transcribed on 2026-09-03. If the schema changes, this is a second copy that can
 * drift — check it against schema.sql before trusting it.
 */

export type Cardinality = 'one-to-one' | 'many-to-one';

export type Column = {
  readonly name: string;
  readonly type: 'INTEGER' | 'TEXT' | 'REAL';
  /** Primary key, unique, not-null and CHECK constraints, as declared. */
  readonly notes?: string;
};

export type Relationship = {
  readonly from: string;
  readonly column: string;
  readonly to: string;
  readonly cardinality: Cardinality;
  /** Why this cardinality is what it is, where the schema makes it explicit. */
  readonly enforcedBy: string;
};

export type Table = {
  readonly name: string;
  readonly purpose: string;
  readonly columns: readonly Column[];
};

/** Foreign keys are enforced: schema.sql opens with `PRAGMA foreign_keys = ON`. */
export const FOREIGN_KEYS_ENFORCED = true;

export const CLINIC_TABLES: readonly Table[] = [
  {
    name: 'PATIENT',
    purpose: 'The registry. 5,000 generated rows.',
    columns: [
      { name: 'PATIENT_ID', type: 'INTEGER', notes: 'PK' },
      { name: 'MRN', type: 'TEXT', notes: 'NOT NULL UNIQUE — medical record number' },
      { name: 'FIRST_NAME', type: 'TEXT', notes: 'NOT NULL' },
      { name: 'LAST_NAME', type: 'TEXT', notes: 'NOT NULL' },
      { name: 'DATE_OF_BIRTH', type: 'TEXT', notes: 'NOT NULL' },
      { name: 'SEX', type: 'TEXT', notes: "CHECK IN ('M','F','O')" },
      { name: 'PHONE', type: 'TEXT' },
      { name: 'EMAIL', type: 'TEXT' },
      { name: 'ADDRESS_LINE', type: 'TEXT' },
      { name: 'CITY', type: 'TEXT' },
      { name: 'STATE', type: 'TEXT' },
      { name: 'ZIP', type: 'TEXT' },
    ],
  },
  {
    name: 'PORTAL_ACCOUNT',
    purpose: 'Patient login. Exists for roughly 60% of patients.',
    columns: [
      { name: 'ACCOUNT_ID', type: 'INTEGER', notes: 'PK' },
      { name: 'FK_PATIENT_ID', type: 'INTEGER', notes: 'NOT NULL UNIQUE -> PATIENT' },
      { name: 'USERNAME', type: 'TEXT', notes: 'NOT NULL UNIQUE' },
      { name: 'PASSWORD_HASH', type: 'TEXT', notes: 'NOT NULL' },
      { name: 'LAST_LOGIN', type: 'TEXT' },
      { name: 'IS_ACTIVE', type: 'INTEGER', notes: 'NOT NULL DEFAULT 1, CHECK IN (0,1)' },
    ],
  },
  {
    name: 'PROVIDER',
    purpose: 'Clinicians. Productivity reporting keys off this.',
    columns: [
      { name: 'PROVIDER_ID', type: 'INTEGER', notes: 'PK' },
      {
        name: 'NPI',
        type: 'TEXT',
        notes: 'NOT NULL UNIQUE — national provider identifier',
      },
      { name: 'FIRST_NAME', type: 'TEXT', notes: 'NOT NULL' },
      { name: 'LAST_NAME', type: 'TEXT', notes: 'NOT NULL' },
      { name: 'SPECIALTY', type: 'TEXT', notes: 'NOT NULL' },
      { name: 'PHONE', type: 'TEXT' },
      { name: 'EMAIL', type: 'TEXT' },
    ],
  },
  {
    name: 'LOCATION',
    purpose: 'Clinic sites an appointment can be booked at.',
    columns: [
      { name: 'LOCATION_ID', type: 'INTEGER', notes: 'PK' },
      { name: 'LOCATION_NAME', type: 'TEXT', notes: 'NOT NULL' },
      { name: 'ADDRESS_LINE', type: 'TEXT' },
      { name: 'CITY', type: 'TEXT' },
      { name: 'STATE', type: 'TEXT' },
      { name: 'ZIP', type: 'TEXT' },
      { name: 'PHONE', type: 'TEXT' },
    ],
  },
  {
    name: 'APPOINTMENT',
    purpose: 'The scheduling core. 12,000 generated rows. The only three-way join.',
    columns: [
      { name: 'APPOINTMENT_ID', type: 'INTEGER', notes: 'PK' },
      { name: 'FK_PATIENT_ID', type: 'INTEGER', notes: 'NOT NULL -> PATIENT' },
      { name: 'FK_PROVIDER_ID', type: 'INTEGER', notes: 'NOT NULL -> PROVIDER' },
      { name: 'FK_LOCATION_ID', type: 'INTEGER', notes: 'NOT NULL -> LOCATION' },
      { name: 'SCHEDULED_START', type: 'TEXT', notes: 'NOT NULL' },
      { name: 'SCHEDULED_END', type: 'TEXT', notes: 'NOT NULL' },
      {
        name: 'STATUS',
        type: 'TEXT',
        notes:
          "NOT NULL DEFAULT 'Scheduled', CHECK IN ('Scheduled','Checked In','Completed','Cancelled','No-Show')",
      },
      { name: 'REASON', type: 'TEXT' },
    ],
  },
  {
    name: 'ENCOUNTER',
    purpose: 'The clinical record of an appointment that happened.',
    columns: [
      { name: 'ENCOUNTER_ID', type: 'INTEGER', notes: 'PK' },
      {
        name: 'FK_APPOINTMENT_ID',
        type: 'INTEGER',
        notes: 'NOT NULL UNIQUE -> APPOINTMENT',
      },
      { name: 'ENCOUNTER_DATE', type: 'TEXT', notes: 'NOT NULL' },
      { name: 'CHIEF_COMPLAINT', type: 'TEXT' },
      { name: 'VISIT_NOTE', type: 'TEXT' },
      {
        name: 'STATUS',
        type: 'TEXT',
        notes: "NOT NULL DEFAULT 'Open', CHECK IN ('Open','Signed')",
      },
      { name: 'SIGNED_AT', type: 'TEXT' },
    ],
  },
  {
    name: 'DIAGNOSIS',
    purpose: 'The ICD-10 reference list. Shared, not per-encounter.',
    columns: [
      { name: 'DIAGNOSIS_ID', type: 'INTEGER', notes: 'PK' },
      { name: 'ICD10_CODE', type: 'TEXT', notes: 'NOT NULL UNIQUE' },
      { name: 'DESCRIPTION', type: 'TEXT', notes: 'NOT NULL' },
      { name: 'CATEGORY', type: 'TEXT' },
    ],
  },
  {
    name: 'ENCOUNTER_DIAGNOSIS',
    purpose: 'Bridge table. A diagnosis can be attached to an encounter once.',
    columns: [
      { name: 'ENCOUNTER_DIAGNOSIS_ID', type: 'INTEGER', notes: 'PK' },
      { name: 'FK_ENCOUNTER_ID', type: 'INTEGER', notes: 'NOT NULL -> ENCOUNTER' },
      { name: 'FK_DIAGNOSIS_ID', type: 'INTEGER', notes: 'NOT NULL -> DIAGNOSIS' },
      {
        name: 'IS_PRIMARY',
        type: 'INTEGER',
        notes: 'NOT NULL DEFAULT 0, CHECK IN (0,1)',
      },
      { name: 'NOTED_DATE', type: 'TEXT' },
      { name: '—', type: 'TEXT', notes: 'UNIQUE (FK_ENCOUNTER_ID, FK_DIAGNOSIS_ID)' },
    ],
  },
  {
    name: 'INVOICE',
    purpose: 'One bill per encounter. Carries the running paid total.',
    columns: [
      { name: 'INVOICE_ID', type: 'INTEGER', notes: 'PK' },
      { name: 'FK_ENCOUNTER_ID', type: 'INTEGER', notes: 'NOT NULL UNIQUE -> ENCOUNTER' },
      { name: 'INVOICE_DATE', type: 'TEXT', notes: 'NOT NULL' },
      { name: 'TOTAL_AMOUNT', type: 'REAL', notes: 'NOT NULL, CHECK >= 0' },
      { name: 'AMOUNT_PAID', type: 'REAL', notes: 'NOT NULL DEFAULT 0, CHECK >= 0' },
      {
        name: 'STATUS',
        type: 'TEXT',
        notes: "NOT NULL DEFAULT 'Open', CHECK IN ('Open','Partial','Paid')",
      },
    ],
  },
  {
    name: 'PAYMENT',
    purpose: 'Many payments against one invoice. Drives the AR figures.',
    columns: [
      { name: 'PAYMENT_ID', type: 'INTEGER', notes: 'PK' },
      { name: 'FK_INVOICE_ID', type: 'INTEGER', notes: 'NOT NULL -> INVOICE' },
      { name: 'PAYMENT_DATE', type: 'TEXT', notes: 'NOT NULL' },
      { name: 'AMOUNT', type: 'REAL', notes: 'NOT NULL, CHECK > 0 — strictly positive' },
      {
        name: 'METHOD',
        type: 'TEXT',
        notes: "NOT NULL, CHECK IN ('Card','Cash','Check','Insurance')",
      },
    ],
  },
];

export const CLINIC_RELATIONSHIPS: readonly Relationship[] = [
  {
    from: 'PORTAL_ACCOUNT',
    column: 'FK_PATIENT_ID',
    to: 'PATIENT',
    cardinality: 'one-to-one',
    enforcedBy: 'NOT NULL UNIQUE — a patient cannot have two accounts',
  },
  {
    from: 'APPOINTMENT',
    column: 'FK_PATIENT_ID',
    to: 'PATIENT',
    cardinality: 'many-to-one',
    enforcedBy: 'NOT NULL',
  },
  {
    from: 'APPOINTMENT',
    column: 'FK_PROVIDER_ID',
    to: 'PROVIDER',
    cardinality: 'many-to-one',
    enforcedBy: 'NOT NULL',
  },
  {
    from: 'APPOINTMENT',
    column: 'FK_LOCATION_ID',
    to: 'LOCATION',
    cardinality: 'many-to-one',
    enforcedBy: 'NOT NULL',
  },
  {
    from: 'ENCOUNTER',
    column: 'FK_APPOINTMENT_ID',
    to: 'APPOINTMENT',
    cardinality: 'one-to-one',
    enforcedBy: 'NOT NULL UNIQUE — an appointment yields at most one encounter',
  },
  {
    from: 'ENCOUNTER_DIAGNOSIS',
    column: 'FK_ENCOUNTER_ID',
    to: 'ENCOUNTER',
    cardinality: 'many-to-one',
    enforcedBy: 'NOT NULL, with UNIQUE on the pair',
  },
  {
    from: 'ENCOUNTER_DIAGNOSIS',
    column: 'FK_DIAGNOSIS_ID',
    to: 'DIAGNOSIS',
    cardinality: 'many-to-one',
    enforcedBy: 'NOT NULL, with UNIQUE on the pair',
  },
  {
    from: 'INVOICE',
    column: 'FK_ENCOUNTER_ID',
    to: 'ENCOUNTER',
    cardinality: 'one-to-one',
    enforcedBy: 'NOT NULL UNIQUE — one bill per encounter',
  },
  {
    from: 'PAYMENT',
    column: 'FK_INVOICE_ID',
    to: 'INVOICE',
    cardinality: 'many-to-one',
    enforcedBy: 'NOT NULL — an invoice can be paid in instalments',
  },
];
