import React from 'react';
import { DEFAULT_RENDERERS } from 'myst-to-react';
import { MermaidNodeRenderer } from '@myst-theme/diagrams';
import { NodeRenderer } from '@myst-theme/providers';
import { InlineExpression, ListItem } from './components';
import { useSanitizer } from './providers';

export const renderers: Record<string, NodeRenderer> = {
  ...DEFAULT_RENDERERS,
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
  html: ({ node }, children) => {
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
