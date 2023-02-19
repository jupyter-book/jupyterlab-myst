import { DEFAULT_RENDERERS } from 'myst-to-react';
import { MermaidNodeRenderer } from '@myst-theme/diagrams';

export const renderers = {
  ...DEFAULT_RENDERERS,
  mermaid: MermaidNodeRenderer
};
