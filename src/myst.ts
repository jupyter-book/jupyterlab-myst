import { mystParse } from 'myst-parser';
import { copyNode, liftChildren, References } from 'myst-common';
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
import { PageFrontmatter, validatePageFrontmatter } from 'myst-frontmatter';
import { cardDirective } from 'myst-ext-card';
import { gridDirective } from 'myst-ext-grid';
import { tabDirectives } from 'myst-ext-tabs';
import { proofDirective } from 'myst-ext-proof';
import { exerciseDirectives } from 'myst-ext-exercise';
import { StaticNotebook } from '@jupyterlab/notebook';
import { getCellList } from './utils';
import { imageUrlSourceTransform } from './images';
import { internalLinksPlugin } from './links';
import { addCiteChildrenPlugin } from './citations';
import { evalRole } from './roles';
import { RenderedMySTMarkdown } from './mime';
import { IUserExpressionMetadata } from './metadata';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { AttachmentsResolver } from '@jupyterlab/attachments';
import { MarkdownCell } from '@jupyterlab/cells';

export interface IMySTDocumentState {
  references: References;
  frontmatter: PageFrontmatter;
  mdast: any;
}
export interface IMySTFragmentState extends IMySTDocumentState {
  showFrontMatter: boolean;
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
  // If in the notebook, lift children out of blocks for the next step
  // We are working here as one cell at a time
  liftChildren(mdast, 'block');
  return mdast as Root;
}

export function buildNotebookMDAST(notebook: StaticNotebook): any {
  const cells = getCellList(notebook)?.filter(
    // In the future, we may want to process the code cells as well, but not now
    cell =>
      cell.model.type === 'markdown' &&
      (cell.renderer as RenderedMySTMarkdown).rawMDAST !== undefined
  );
  console.debug('list of cells', getCellList(notebook), 'for', notebook);
  console.debug('list of useful cells', cells);
  if (!cells) {
    // This is expected on the first render, we do not want to throw later
    return undefined;
  }

  const blocks = cells.map(cell => {
    return {
      type: 'block',
      children: copyNode((cell.renderer as RenderedMySTMarkdown).rawMDAST)
        .children
    };
  });
  return { cells, mdast: { type: 'root', children: blocks } };
}

export function processNotebookMDAST(
  mdast: any,
  resolver: IRenderMime.IResolver | null
): IMySTDocumentState | undefined {
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
    console.warn(file.messages.map(m => m.message).join('\n'));
  }

  return { references, frontmatter, mdast };
}

export function processLocalMDAST(
  mdast: any,
  resolver: IRenderMime.IResolver | null
): IMySTFragmentState {
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
    footnotes: {},
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
    .use(enumerateTargetsPlugin, { state })
    .use(linksPlugin, { transformers: linkTransforms })
    .use(footnotesPlugin)
    .use(resolveReferencesPlugin, { state })
    .use(internalLinksPlugin, { resolver })
    .use(addCiteChildrenPlugin)
    .use(keysPlugin)
    .runSync(mdast as any, file);

  return {
    references,
    frontmatter,
    mdast,
    showFrontMatter: true
  };
}

export function renderNotebook(
  cells: MarkdownCell[],
  state: IMySTDocumentState,
  resolver: IRenderMime.IResolver | null
): Promise<void> {
  const { mdast } = state;
  // Render the full result in each cell using React
  // Any cell can have side-effects into other cells, so this is necessary

  const promises = cells.map(async (cell, index) => {
    try {
      const attachmentsResolver = new AttachmentsResolver({
        parent: resolver ?? undefined,
        model: cell.model.attachments
      });
      // Go through all links and replace the source if they are local
      await imageUrlSourceTransform(mdast.children[index] as any, {
        resolver: attachmentsResolver
      });
    } catch (error) {
      // pass
    }

    const cellPartialState: IMySTFragmentState = {
      ...state,
      mdast: mdast.children[index],
      showFrontMatter: index == 0
    };
    console.debug('notebook re-rendering', cell, 'with', cellPartialState);
    (cell.renderer as RenderedMySTMarkdown).onFragmentUpdated(cellPartialState);
  });

  return Promise.all(promises).then(() => undefined);
}
