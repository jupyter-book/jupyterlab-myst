import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
// import { mystIcon } from './icon';
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
import { PageFrontmatter, validatePageFrontmatter } from 'myst-frontmatter';
import { internalLinksPlugin, linkFactory } from './links';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import {
  ReferencesProvider,
  TabStateProvider,
  Theme,
  ThemeProvider
} from '@myst-theme/providers';
import { useParse } from 'myst-to-react';
import { renderers } from './renderers';
import { addCiteChildrenPlugin } from './citations';
import { References } from 'myst-common';
import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { unified } from 'unified';
import { Signal } from '@lumino/signaling';
import React from 'react';
import { imageUrlSourceTransform } from './images';

/**
 * The MIME type for Markdown.
 */
export const MIME_TYPE = 'text/markdown';

type MySTState = {
  references: References;
  frontmatter: PageFrontmatter;
  mdast: any;
};

/**
 * A mime renderer for displaying Markdown with embedded latex.
 */
export class RenderedMySTMarkdown
  extends ReactWidget
  implements IRenderMime.IRenderer
{
  /**
   * Construct a new rendered markdown widget.
   *
   * @param options - The options for initializing the widget.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this.state = null;
    this.resolver = options.resolver;
    this.linkHandler = options.linkHandler;
    this.node.dataset['mimeType'] = MIME_TYPE;
    this.addClass('jp-RenderedMySTMarkdown');
    this.addClass('myst');
    console.log('Rendered markdown');
  }

  /**
   * The resolver object.
   */
  readonly resolver: IRenderMime.IResolver | null;

  /**
   * The link handler.
   */
  readonly linkHandler: IRenderMime.ILinkHandler | null;

  private state: MySTState | null;
  private stateChanged = new Signal<this, MySTState>(this);

  render(): JSX.Element {
    return (
      <UseSignal signal={this.stateChanged} initialSender={this}>
        {(): JSX.Element => {
          if (this.state === null) {
            return <div>Waiting for MyST AST (mdast)</div>;
          }
          const { references, frontmatter, mdast } = this.state;
          const children = useParse(mdast as any, renderers);

          return (
            <ThemeProvider
              theme={Theme.light}
              Link={linkFactory(this.resolver, this.linkHandler)}
              renderers={renderers}
            >
              <TabStateProvider>
                <ReferencesProvider
                  references={references}
                  frontmatter={frontmatter}
                >
                  <FrontmatterBlock frontmatter={frontmatter} />
                  {children}
                </ReferencesProvider>
              </TabStateProvider>
            </ThemeProvider>
          );
        }}
      </UseSignal>
    );
  }

  /**
   * Render a mime model.
   *
   * @param model - The mime model to render.
   *
   * @returns A promise which resolves when rendering is complete.
   */
  async renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    const markdownText = model.data[MIME_TYPE] as string;
    const mdast = markdownParse(markdownText, false);
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
    const resolver = this.resolver;
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

    // Go through all links and replace the source if they are local
    await imageUrlSourceTransform(mdast as any, {
      resolver: this.resolver
    });

    this.state = {
      mdast,
      references,
      frontmatter
    };
    this.stateChanged.emit(this.state);
    return Promise.resolve(void 0);
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
