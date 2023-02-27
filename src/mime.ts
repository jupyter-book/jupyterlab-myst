import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
// import { mystIcon } from './icon';
import { RenderedCommon } from '@jupyterlab/rendermime';
import { Message } from '@lumino/messaging';
import { markdownParse } from './myst';
import {
  DOITransformer,
  enumerateTargetsPlugin,
  footnotesPlugin,
  getFrontmatter,
  GithubTransformer,
  keysPlugin,
  linksPlugin,
  mathPlugin,
  ReferenceState,
  resolveReferencesPlugin,
  RRIDTransformer,
  WikiTransformer
} from 'myst-transforms';
import { VFile } from 'vfile';
import { validatePageFrontmatter } from 'myst-frontmatter';
import { unified } from 'unified';
import { internalLinksPlugin } from './links';

/**
 * The MIME type for Markdown.
 */
export const MIME_TYPE = 'text/markdown';

/**
 * A mime renderer for displaying Markdown with embedded latex.
 */
export class RenderedMySTMarkdown extends RenderedCommon {
  /**
   * Construct a new rendered markdown widget.
   *
   * @param options - The options for initializing the widget.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super(options);
    this.addClass('myst-RenderedMySTMarkdown');
    console.log('Rendered markdown');
  }

  /**
   * Render a mime model.
   *
   * @param model - The mime model to render.
   *
   * @returns A promise which resolves when rendering is complete.
   */
  render(model: IRenderMime.IMimeModel): Promise<void> {
    const x = String(model.data[this.mimeType]);
    const mdast = markdownParse(x);
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
      mdast,
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
    const resolver = this.resolver;
    unified()
      .use(mathPlugin, { macros: frontmatter?.math ?? {} }) // This must happen before enumeration, as it can add labels
      .use(enumerateTargetsPlugin, { state })
      .use(linksPlugin, { transformers: linkTransforms })
      .use(footnotesPlugin, { references })
      .use(resolveReferencesPlugin, { state })
      .use(internalLinksPlugin, { resolver })
      .use(keysPlugin)
      .runSync(mdast as any, file);

    return Promise.resolve(void 0);
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  onAfterAttach(msg: Message): void {
    if (this.latexTypesetter) {
      this.latexTypesetter.typeset(this.node);
    }
  }
}

/**
 * A mime renderer factory for Markdown.
 */
export const mystMarkdownRendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: ['text/markdown'],
  defaultRank: 50,
  createRenderer: options => new RenderedMySTMarkdown(options)
};
