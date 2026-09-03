import type { MDXComponents } from 'mdx/types';
import { CarbonRecordPipeline } from '@/components/CarbonRecordPipeline';
import { ErdDiagram } from '@/components/ErdDiagram';

/**
 * Element mapping for case-study MDX.
 *
 * Case studies are prose, so the styling here is typographic only: the measure is
 * set by the container, and headings use the same scale as the rest of the site.
 *
 * Diagrams are exposed as components rather than images so they stay themeable,
 * readable at 320px, and describable to a screen reader.
 */
export const mdxComponents: MDXComponents = {
  h2: (props) => <h2 className="mt-12 text-xl first:mt-0" {...props} />,
  h3: (props) => <h3 className="mt-8 text-lg" {...props} />,
  p: (props) => <p className="mt-4" {...props} />,
  ul: (props) => <ul className="mt-4 flex list-disc flex-col gap-2 pl-5" {...props} />,
  ol: (props) => <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5" {...props} />,
  li: (props) => <li {...props} />,
  hr: () => <hr className="border-rule mt-10 border-0 border-t" />,
  CarbonRecordPipeline,
  ErdDiagram,
  blockquote: (props) => (
    <blockquote
      className="border-rule-strong text-ink-muted mt-6 border-l-2 pl-4"
      {...props}
    />
  ),
};
