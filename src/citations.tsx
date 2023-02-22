import type { Plugin } from 'unified';
import type { Root } from 'myst-spec';
import type { GenericNode } from 'myst-common';
import { selectAll } from 'unist-util-select';

/**
 * Add fake children to the citations
 */
export async function addCiteChildrenTransform(tree: Root): Promise<void> {
  const links = selectAll('cite', tree) as GenericNode[];
  links.forEach(async cite => {
    if (cite.children && cite.children.length > 0) return;
    cite.error = true;
    cite.children = [{ type: 'text', value: cite.label }];
  });
}

export const addCiteChildrenPlugin: Plugin<[], Root, Root> = () => tree => {
  addCiteChildrenTransform(tree);
};
