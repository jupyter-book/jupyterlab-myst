import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
// import { mystIcon } from './icon';
import {
  IMySTExpressionsState,
  IMySTFragmentState,
  markdownParse,
  processLocalMDAST
} from './myst';
import { linkFactory } from './links';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import {
  ReferencesProvider,
  TabStateProvider,
  Theme,
  ThemeProvider
} from '@myst-theme/providers';
import { useParse } from 'myst-to-react';
import { renderers } from './renderers';
import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { Signal } from '@lumino/signaling';
import React from 'react';
import { selectAll } from 'unist-util-select';
import { UserExpressionsProvider } from './UserExpressionsProvider';

/**
 * The MIME type for Markdown.
 */
export const MIME_TYPE = 'text/markdown';

export interface IMySTDocumentContext {
  requestUpdate(renderer: RenderedMySTMarkdown): void;
}

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
    this.resolver = options.resolver;
    this.linkHandler = options.linkHandler;
    this.node.dataset['mimeType'] = MIME_TYPE;
    this.addClass('jp-RenderedMySTMarkdown');
    this.addClass('myst');
  }

  get expressions(): string[] {
    const mdast = this._rawMDAST ?? {};
    const expressions = selectAll('inlineExpression', mdast);
    return expressions.map(node => (node as any).value);
  }
  //
  // renderExpressions(
  //   value: IUserExpressionMetadata[],
  //   rendermime: IRenderMimeRegistry
  // ) {
  //   this.expressionsState = {
  //     expressions: value,
  //     rendermime
  //   };
  //   this._stateChanged.emit();
  // }

  /**
   * The resolver object.
   */
  readonly resolver: IRenderMime.IResolver | null;

  /**
   * The link handler.
   */
  readonly linkHandler: IRenderMime.ILinkHandler | null;

  public documentContext: IMySTDocumentContext | undefined;
  private _fragmentStateChanged = new Signal<this, IMySTFragmentState>(this);
  private _expressionStateChanged = new Signal<this, IMySTExpressionsState>(
    this
  );
  private _fragmentState: IMySTFragmentState | undefined;
  private _expressionState: IMySTExpressionsState | undefined;
  private _rawMDAST: any | undefined;

  get rawMDAST(): any | undefined {
    return this._rawMDAST;
  }

  protected renderMyST(
    fragmentState: IMySTFragmentState | undefined,
    expressionState: IMySTExpressionsState | undefined
  ): React.JSX.Element {
    console.log('re-rendering VDOM', expressionState);
    if (!fragmentState) {
      return <div>Waiting for MyST AST (mdast)</div>;
    }
    const { references, frontmatter, mdast, showFrontMatter } = fragmentState;

    const expressions = expressionState?.expressions;
    const rendermime = expressionState?.rendermime;
    const children = useParse(mdast as any, renderers);

    return (
      <ThemeProvider
        theme={Theme.light}
        Link={linkFactory(this.resolver, this.linkHandler)}
        renderers={renderers}
      >
        <UserExpressionsProvider
          expressions={expressions}
          rendermime={rendermime}
        >
          <TabStateProvider>
            <ReferencesProvider
              references={references}
              frontmatter={frontmatter}
            >
              {showFrontMatter && (
                <FrontmatterBlock frontmatter={frontmatter} />
              )}
              {children}
            </ReferencesProvider>
          </TabStateProvider>
        </UserExpressionsProvider>
      </ThemeProvider>
    );
  }

  render() {
    return (
      <UseSignal signal={this._expressionStateChanged} initialSender={this}>
        {() => {
          return (
            <UseSignal signal={this._fragmentStateChanged} initialSender={this}>
              {() =>
                this.renderMyST(this._fragmentState, this._expressionState)
              }
            </UseSignal>
          );
        }}
      </UseSignal>
    );
  }

  /**
   * Update the MyST document state, triggering a re-render
   *
   * @param state - The MyST document state to use
   */
  onFragmentUpdated(state: IMySTFragmentState) {
    console.debug('document changed', state);
    this._fragmentState = state;
    this._fragmentStateChanged.emit(state);
  }

  /**
   * Update the MyST expressions state, triggering a re-render
   *
   * @param state - The MyST expressions state to use
   */
  onExpressionsUpdated(state: IMySTExpressionsState) {
    console.debug('expressions changed', state);
    this._expressionState = state;
    this._expressionStateChanged.emit(state);
  }

  /**
   * Render a mime model.
   *
   * @param model - The mime model to render.
   *
   * @returns A promise which resolves when rendering is complete.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    this._rawMDAST = markdownParse(model.data[MIME_TYPE] as string);
    console.debug('Storing raw MDAST for cell', this._rawMDAST);

    let processedState: IMySTFragmentState;
    if (this.documentContext === undefined) {
      processedState = processLocalMDAST(this._rawMDAST, this.resolver);
      console.log('Render local!');
      this.onFragmentUpdated(processedState);
    } else {
      console.log('Request document update!');
      this.documentContext.requestUpdate(this);
    }

    console.log('State changed', this);
    return this.renderPromise || Promise.resolve();
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
