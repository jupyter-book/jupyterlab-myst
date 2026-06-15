import { DEFAULT_RENDERERS } from 'myst-to-react';
import { MermaidNodeRenderer } from '@myst-theme/diagrams';
import { ANY_RENDERERS } from '@myst-theme/anywidget';
import { mergeRenderers } from '@myst-theme/providers';
import type { NodeRenderers } from '@myst-theme/providers';
import { InlineExpression, ListItem } from './components';
import { useSanitizer } from './providers';

const labRenderers: NodeRenderers = {
  mermaid: MermaidNodeRenderer,
  inlineExpression: ({ node }) => {
    return <InlineExpression value={node.value} />;
  },
  listItem: ({ node }) => {
    return (
      <ListItem
        checked={node.checked}
        line={node.position?.start.line}
        children={node.children}
      />
    );
  },
  html: ({ node }) => {
    const { sanitizer } = useSanitizer();
    if (sanitizer !== undefined) {
      return (
        <span
          className="jp-RenderedHTMLCommon not-prose"
          dangerouslySetInnerHTML={{ __html: sanitizer.sanitize(node.value) }}
        ></span>
      );
    } else {
      return <pre>{node.value}</pre>;
    }
  }
};

export const renderers = mergeRenderers([
  DEFAULT_RENDERERS,
  ANY_RENDERERS,
  labRenderers
]);
