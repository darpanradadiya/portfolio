import { Limitation } from '@/components/Limitation';

/**
 * Slot for the clinic ERP entity-relationship diagram.
 *
 * The schema has not been supplied yet, so this renders an honest placeholder
 * rather than an empty frame or an invented set of tables. Ten tables in third
 * normal form is the centrepiece of that case study; drawing a guess at them would
 * be worse than drawing nothing.
 *
 * When the schema arrives this becomes a Diagram like CarbonRecordPipeline, with
 * the table list as the HTML legend.
 */
export function ErdDiagram() {
  return (
    <figure className="my-8">
      <div className="border-rule-strong border border-dashed p-5">
        <p className="text-xs">
          Entity-relationship diagram — ten tables, third normal form.
        </p>
        <Limitation className="mt-2">
          Not drawn yet. The schema is coming from Darpan; it will be rendered with the
          same diagram component as the pipeline above rather than pasted in as an image,
          so it stays themeable and readable at 320px.
        </Limitation>
      </div>
    </figure>
  );
}
