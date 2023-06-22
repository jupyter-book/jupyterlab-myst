import React from 'react';
import { DEFAULT_RENDERERS } from 'myst-to-react';
import { MermaidNodeRenderer } from '@myst-theme/diagrams';
import { NodeRenderer } from '@myst-theme/providers';
import { InlineRenderer } from './inlineExpression';
import { listItem } from './taskItem';

export const renderers: Record<string, NodeRenderer> = {
  ...DEFAULT_RENDERERS,
  mermaid: MermaidNodeRenderer,
  inlineExpression: node => {
    return <InlineRenderer value={node.value} />;
  },
  listItem
};
