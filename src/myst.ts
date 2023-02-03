import { MyST } from 'mystjs';
import {
  mathPlugin,
  footnotesPlugin,
  keysPlugin,
  basicTransformationsPlugin,
  enumerateTargetsPlugin,
  resolveReferencesPlugin,
  WikiTransformer,
  GithubTransformer,
  DOITransformer,
  RRIDTransformer,
  linksPlugin,
  ReferenceState,
  getFrontmatter
} from 'myst-transforms';
import { unified } from 'unified';
import { VFile } from 'vfile';
import { validatePageFrontmatter } from 'myst-frontmatter';
import { copyNode, GenericParent as Root } from 'myst-common';
import cardDirectives from 'myst-ext-card';
import gridDirectives from 'myst-ext-grid';
import tabsDirectives from 'myst-ext-tabs';
import { StaticNotebook } from '@jupyterlab/notebook';
import { getCellList } from './utils';
import { imageUrlSourceTransform } from './images';
import { internalLinksPlugin } from './links';

export function markdownParse(text: string): Root {
  const myst = new MyST({
    directives: {
      ...cardDirectives,
      ...gridDirectives,
      ...tabsDirectives
    }
  });
  // Parsing individually here requires that link and footnote references are contained to the cell
  // This is consistent with the current Jupyter markdown renderer
  const mdast = myst.parse(text) as Root;
  unified()
    .use(basicTransformationsPlugin)
    .runSync(mdast as any);
  return mdast;
}

export function parseContent(notebook: StaticNotebook): void {
  const cells = getCellList(notebook)?.filter(
    // In the future, we may want to process the code cells as well, but not now
    cell => cell.model.type === 'markdown'
  );
  if (!cells) return;

  const blocks = cells.map(cell => {
    const text = cell.model?.value.text ?? '';
    if (!cell.myst.pre) {
      // This will be cleared when the cell is executed, and parsed again here
      cell.myst.pre = markdownParse(text);
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
    // This is a bit weird, but if there is a YAML block in the first cell, this is where it will be.
    mdast.children[0]?.children[0] as any,
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
    .use(internalLinksPlugin, { notebook })
    .use(keysPlugin)
    .runSync(mdast as any, file);

  (notebook as any).myst = { references, frontmatter, mdast };

  if (file.messages.length > 0) {
    // TODO: better error messages in the future
    console.log(file.messages);
  }

  // Render the full result in each cell using React
  // Any cell can have side-effects into other cells, so this is necessary
  cells.forEach(async (cell, index) => {
    try {
      // Go through all links and replace the source if they are local
      await imageUrlSourceTransform(mdast.children[index] as any, { cell });
    } catch (error) {
      // pass
    }
    cell.myst.post = mdast.children[index];
    cell.mystRender();
  });
}
