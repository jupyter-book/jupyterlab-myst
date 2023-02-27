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
import { References } from 'myst-common';
import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { unified } from 'unified';
import { Signal } from '@lumino/signaling';
import React from 'react';

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
    this._state = null;
    this.resolver = options.resolver;
    this.linkHandler = options.linkHandler;
    this.node.dataset['mimeType'] = MIME_TYPE;
    this.addClass('myst-RenderedMySTMarkdown');
    console.log('Rendered markdown');
  }

  /**
   * The resolver object.
   */
  readonly resolver: IRenderMime.IResolver | null;

  private _state: MySTState | null;
  private _stateChanged = new Signal<this, void>(this);

  /**
   * The link handler.
   */
  readonly linkHandler: IRenderMime.ILinkHandler | null;

  render(): JSX.Element {
    return (
      <UseSignal signal={this._stateChanged} initialSender={this}>
        {(): JSX.Element => {
          if (this._state === null) {
            return <div>Missing</div>;
          }
          const { references, frontmatter, mdast } = this._state;
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
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    const x = String(model.data[MIME_TYPE]);
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

    const nextState: MySTState = {
      mdast,
      references,
      frontmatter
    };
    this._state = nextState;
    this._stateChanged.emit();
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
