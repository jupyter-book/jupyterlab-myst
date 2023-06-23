import { mystParse } from 'myst-parser';
import { copyNode, References } from 'myst-common';
import {
  abbreviationPlugin,
  basicTransformationsPlugin,
  DOITransformer,
  enumerateTargetsPlugin,
  footnotesPlugin,
  getFrontmatter,
  GithubTransformer,
  glossaryPlugin,
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
import { PageFrontmatter, validatePageFrontmatter } from 'myst-frontmatter';
import { cardDirective } from 'myst-ext-card';
import { gridDirective } from 'myst-ext-grid';
import { tabDirectives } from 'myst-ext-tabs';
import { proofDirective } from 'myst-ext-proof';
import { exerciseDirectives } from 'myst-ext-exercise';
import { StaticNotebook } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { imageUrlSourceTransform } from './images';
import { internalLinksPlugin } from './links';
import { addCiteChildrenPlugin } from './citations';
import { evalRole } from './roles';
import { IUserExpressionMetadata } from './metadata';
import { IMySTMarkdownCell } from './types';
import { Cell, ICellModel } from '@jupyterlab/cells';
import { MySTModel } from './widget';

export interface IMySTDocumentState {
  references: References;
  frontmatter: PageFrontmatter;
  mdast: any;
}
export interface IMySTExpressionsState {
  expressions: IUserExpressionMetadata[];
  rendermime: IRenderMimeRegistry;
  trusted: boolean;
}

export function markdownParse(text: string): Root {
  const mdast = mystParse(text, {
    directives: [
      cardDirective,
      gridDirective,
      proofDirective,
      ...tabDirectives,
      ...exerciseDirectives
    ],
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
  return mdast as Root;
}

/**
 * Called when processing a full markdown article.
 */
export async function processArticleMDAST(
  mdast: any,
  resolver: IRenderMime.IResolver | undefined
): Promise<IMySTDocumentState> {
  mdast = copyNode(mdast);
  const linkTransforms = [
    new WikiTransformer(),
    new GithubTransformer(),
    new DOITransformer(),
    new RRIDTransformer()
  ];
  const file = new VFile();
  const references = {
    cite: { order: [], data: {} },
    article: mdast as any
  };

  const { frontmatter: frontmatterRaw } = getFrontmatter(mdast, {
    removeYaml: true,
    removeHeading: true
  });
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
    .use(glossaryPlugin, { state }) // This should be before the enumerate plugins
    .use(abbreviationPlugin, { abbreviations: frontmatter.abbreviations })
    .use(enumerateTargetsPlugin, { state })
    .use(linksPlugin, { transformers: linkTransforms })
    .use(footnotesPlugin)
    .use(resolveReferencesPlugin, { state })
    .use(internalLinksPlugin, { resolver })
    .use(addCiteChildrenPlugin)
    .use(keysPlugin)
    .runSync(mdast as any, file);

  // Go through all links and replace the source if they are local
  await imageUrlSourceTransform(mdast, { resolver });

  return {
    references,
    frontmatter,
    mdast
  };
}

function isMySTMarkdownCell(cell: Cell<ICellModel>): cell is IMySTMarkdownCell {
  return cell.model.type === 'markdown';
}

export function buildNotebookMDAST(mystCells: IMySTMarkdownCell[]): any {
  const blocks = mystCells.map(cell => copyNode(cell.fragmentMDAST));
  return { type: 'root', children: blocks };
}

export function processNotebookMDAST(
  mdast: any,
  resolver: IRenderMime.IResolver | undefined
): IMySTDocumentState {
  const linkTransforms = [
    new WikiTransformer(),
    new GithubTransformer(),
    new DOITransformer(),
    new RRIDTransformer()
  ];
  const file = new VFile();
  const references = {
    cite: { order: [], data: {} },
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
    .use(glossaryPlugin, { state }) // This should be before the enumerate plugins
    .use(abbreviationPlugin, { abbreviations: frontmatter.abbreviations })
    .use(enumerateTargetsPlugin, { state })
    .use(linksPlugin, { transformers: linkTransforms })
    .use(footnotesPlugin)
    .use(resolveReferencesPlugin, { state })
    .use(internalLinksPlugin, { resolver: resolver })
    .use(addCiteChildrenPlugin)
    .use(keysPlugin)
    .runSync(mdast as any, file);

  if (file.messages.length > 0) {
    // TODO: better error messages in the future
    console.error(file.messages.map(m => m.message).join('\n'));
  }

  return { references, frontmatter, mdast };
}

export async function processCellMDAST(
  resolver: IRenderMime.IResolver,
  mdast: any
) {
  mdast = copyNode(mdast);
  try {
    // Go through all links and replace the source if they are local
    await imageUrlSourceTransform(mdast as any, {
      resolver: resolver
    });
  } catch (error) {
    // pass
  }

  return mdast;
}

export function renderNotebook(notebook: StaticNotebook) {
  const mystCells = notebook.widgets.filter(isMySTMarkdownCell).filter(
    // In the future, we may want to process the code cells as well, but not now
    cell => cell.fragmentMDAST !== undefined
  );
  const mdast = buildNotebookMDAST(mystCells);
  const {
    references,
    frontmatter,
    mdast: processedMDAST
  } = processNotebookMDAST(mdast, notebook.rendermime.resolver ?? undefined);

  mystCells.forEach((cell, index) => {
    if (cell.rendered) {
      const nextModel = new MySTModel();
      nextModel.references = references;
      nextModel.frontmatter = index === 0 ? frontmatter : undefined;
      nextModel.mdast = processedMDAST.children[index];
      nextModel.expressions = cell.mystModel.expressions;
      cell.mystModel = nextModel;
    }
  });
}
