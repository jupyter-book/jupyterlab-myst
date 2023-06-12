import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
// import { mystIcon } from './icon';
import {
  IMySTExpressionsState,
  IMySTFragmentState,
  markdownParse,
  processArticleMDAST
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
import { ReactWidget } from '@jupyterlab/apputils';
import React from 'react';
import { selectAll } from 'unist-util-select';
import { UserExpressionsProvider } from './UserExpressionsProvider';
import {
  ITaskItemController,
  TaskItemControllerProvider
} from './TaskItemControllerProvider';

/**
 * The MIME type for Markdown.
 */
export const MIME_TYPE = 'text/markdown';

export interface IMySTFragmentContext extends ITaskItemController {
  requestUpdate(renderer: RenderedMySTMarkdown): Promise<IMySTFragmentState>;
  setTaskItem(line: number, checked: boolean): void;
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

  /**
   * The resolver object.
   */
  readonly resolver: IRenderMime.IResolver | null;

  /**
   * The link handler.
   */
  readonly linkHandler: IRenderMime.ILinkHandler | null;

  public fragmentContext: IMySTFragmentContext | undefined;
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
    console.debug('re-rendering VDOM', fragmentState, expressionState);
    if (!fragmentState) {
      return <div>Waiting for MyST AST (mdast)</div>;
    }
    const { references, frontmatter, mdast, showFrontMatter } = fragmentState;

    const expressions = expressionState?.expressions;
    const rendermime = expressionState?.rendermime;
    const trusted = expressionState?.trusted;
    const children = useParse(mdast as any, renderers);

    console.log('Rendering MyST with trust?:', trusted);

    return (
      <TaskItemControllerProvider controller={this.fragmentContext}>
        <ThemeProvider
          theme={Theme.light}
          Link={linkFactory(this.resolver, this.linkHandler)}
          renderers={renderers}
        >
          <UserExpressionsProvider
            expressions={expressions}
            rendermime={rendermime}
            trusted={trusted}
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
      </TaskItemControllerProvider>
    );
  }

  render() {
    console.debug('RenderedMySTMarkdown.render()');
    return this.renderMyST(this._fragmentState, this._expressionState);
  }

  /**
   * Update the MyST document state, triggering a re-render
   *
   * @param state - The MyST document state to use
   */
  onFragmentUpdated(state: IMySTFragmentState) {
    console.debug('document changed', state);
    this._fragmentState = state;
    this.update();
  }

  /**
   * Update the MyST expressions state, triggering a re-render
   *
   * @param state - The MyST expressions state to use
   */
  onExpressionsUpdated(state: IMySTExpressionsState) {
    console.debug('expressions changed', state);
    this._expressionState = state;
    this.update();
  }

  /**
   * Render a mime model.
   *
   * This is called both for notebook cells and for markdown documents.
   * A markdown cell in a notebook will have `fragmentContext` defined.
   *
   * @param model - The mime model to render.
   *
   * @returns A promise which resolves when rendering is complete.
   */
  async renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    this._rawMDAST = markdownParse(model.data[MIME_TYPE] as string);
    console.debug('Storing raw MDAST for cell', this._rawMDAST);

    let processedState: IMySTFragmentState;
    if (this.fragmentContext === undefined) {
      console.debug('Render ArticleMDAST');
      // We are in a markdown file, not a notebook cell.
      processedState = await processArticleMDAST(this._rawMDAST, this.resolver);
    } else {
      console.debug('Request document update!');
      processedState = await this.fragmentContext.requestUpdate(this);
    }
    this.onFragmentUpdated(processedState);

    console.debug('State changed', this);
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
