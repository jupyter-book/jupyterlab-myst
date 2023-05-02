import { mystParse } from 'myst-parser';
import { liftChildren } from 'myst-common';
import {
  basicTransformationsPlugin,
  DOITransformer,
  enumerateTargetsPlugin,
  footnotesPlugin,
  getFrontmatter,
  GithubTransformer,
  htmlPlugin,
  keysPlugin,
  linksPlugin,
  mathPlugin,
  ReferenceState,
  resolveReferencesPlugin,
  RRIDTransformer,
  WikiTransformer
} from 'myst-transforms';
import type { Root } from 'mdast';
import { unified } from 'unified';
import { VFile } from 'vfile';
import { validatePageFrontmatter } from 'myst-frontmatter';
import { copyNode, GenericParent } from 'myst-common';
import { cardDirective } from 'myst-ext-card';
import { gridDirective } from 'myst-ext-grid';
import { tabDirectives } from 'myst-ext-tabs';
import { StaticNotebook } from '@jupyterlab/notebook';
import { getCellList } from './utils';
import { imageUrlSourceTransform } from './images';
import { internalLinksPlugin } from './links';
import { addCiteChildrenPlugin } from './citations';
import { evalRole } from './roles';

export function markdownParse(text: string): Root {
  const mdast = mystParse(text, {
    directives: [cardDirective, gridDirective, ...tabDirectives],
    roles: [evalRole]
  });
  // Parsing individually here requires that link and footnote references are contained to the cell
  // This is consistent with the current Jupyter markdown renderer
  unified()
    .use(basicTransformationsPlugin)
    .use(htmlPlugin, {
      htmlHandlers: {
        comment(h: any, node: any) {
          const result = h(node, 'comment');
          (result as any).value = node.value;
          return result;
        }
      }
    })
    .runSync(mdast as any);
  // Lift children out of blocks for the next step
  // We are working here as one cell at a time
  liftChildren(mdast, 'block');
  return mdast as Root;
}

export function renderNotebook(notebook: StaticNotebook): Promise<void> {
  const cells = getCellList(notebook)?.filter(
    // In the future, we may want to process the code cells as well, but not now
    cell => cell.model.type === 'markdown'
  );
  if (!cells) {
    // This is expected on the first render, we do not want to throw later
    return Promise.resolve(undefined);
  }

  const blocks = cells.map(cell => {
    const text = cell.model?.value.text ?? '';
    if (!cell.myst.pre) {
      // This will be cleared when the cell is executed, and parsed again here
      cell.myst.pre = markdownParse(text) as GenericParent;
    }
    return { type: 'block', children: copyNode(cell.myst.pre).children };
  });
  const mdast = { type: 'root', children: blocks };

  const linkTransforms = [
    new WikiTransformer(),
    new GithubTransformer(),
    new DOITransformer(),
    new RRIDTransformer()
  ];
  const file = new VFile();
  const references = {
    cite: { order: [], data: {} },
    footnotes: {},
    article: mdast as any
  };
  const { frontmatter: frontmatterRaw } = getFrontmatter(
    // This is the first cell, which might have a YAML block or header.
    mdast.children[0] as any,
    {
      removeYaml: true,
      removeHeading: true
    }
  );

  const frontmatter = validatePageFrontmatter(frontmatterRaw, {
    property: 'frontmatter',
    messages: {}
  });

  const state = new ReferenceState({
    numbering: frontmatter.numbering,
    file
  });

  unified()
    .use(mathPlugin, { macros: frontmatter?.math ?? {} }) // This must happen before enumeration, as it can add labels
    .use(enumerateTargetsPlugin, { state })
    .use(linksPlugin, { transformers: linkTransforms })
    .use(footnotesPlugin, { references })
    .use(resolveReferencesPlugin, { state })
    .use(internalLinksPlugin, { resolver: notebook.rendermime.resolver })
    .use(addCiteChildrenPlugin)
    .use(keysPlugin)
    .runSync(mdast as any, file);

  (notebook as any).myst = { references, frontmatter, mdast };

  if (file.messages.length > 0) {
    // TODO: better error messages in the future
    console.warn(file.messages.map(m => m.message).join('\n'));
  }

  // Render the full result in each cell using React
  // Any cell can have side-effects into other cells, so this is necessary

  const promises = cells.map(async (cell, index) => {
    try {
      // Go through all links and replace the source if they are local
      await imageUrlSourceTransform(mdast.children[index] as any, {
        resolver: notebook.rendermime.resolver,
        cell
      });
    } catch (error) {
      // pass
    }
    cell.myst.post = mdast.children[index];
    cell.mystRender();
  });

  return Promise.all(promises).then(() => undefined);
}
