import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { ISignal } from '@lumino/signaling';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { References } from 'myst-common';
import { PageFrontmatter } from 'myst-frontmatter';
import {
  ReferencesProvider,
  TabStateProvider,
  Theme,
  ThemeProvider
} from '@myst-theme/providers';
import { useParse } from 'myst-to-react';
import React from 'react';
import { UserExpressionsProvider } from './UserExpressionsProvider';
import {
  ITaskItemController,
  TaskItemControllerProvider
} from './TaskItemControllerProvider';
import { renderers } from './renderers';
import { IUserExpressionMetadata } from './metadata';
import { linkFactory } from './links';

/**
 * The MIME type for Markdown.
 */
export const MIME_TYPE = 'text/markdown';

// export interface IMySTFragmentContext extends ITaskItemController {
//   requestUpdate(renderer: RenderedMySTMarkdown): Promise<IMySTDocumentState>;
//   setTaskItem(line: number, checked: boolean): void;
// }

export interface IMySTModel extends VDomRenderer.IModel {
  references?: References;
  mdast?: any;
  expressions?: IUserExpressionMetadata[];
  frontmatter?: PageFrontmatter;
  readonly stateChanged: ISignal<this, void>;
}

export class MySTModel extends VDomModel implements IMySTModel {
  private _references?: References;
  private _mdast?: any;
  private _expressions?: IUserExpressionMetadata[];
  private _frontmatter?: PageFrontmatter;

  get references(): References | undefined {
    return this._references;
  }

  set references(value: References | undefined) {
    this._references = value;
    this.stateChanged.emit();
  }

  get mdast(): any | undefined {
    return this._mdast;
  }

  set mdast(value: any | undefined) {
    this._mdast = value;
    this.stateChanged.emit();
  }

  get expressions(): IUserExpressionMetadata[] | undefined {
    return this._expressions;
  }

  set expressions(value: IUserExpressionMetadata[] | undefined) {
    this._expressions = value;
    this.stateChanged.emit();
  }

  get frontmatter(): PageFrontmatter | undefined {
    return this._frontmatter;
  }

  set frontmatter(value: PageFrontmatter | undefined) {
    this._frontmatter = value;
    this.stateChanged.emit();
  }
}

export interface IMySTOptions {
  model?: IMySTModel;
  taskItemController?: ITaskItemController;
  resolver?: IRenderMime.IResolver;
  linkHandler?: IRenderMime.ILinkHandler;
  rendermime?: IRenderMimeRegistry;
  trusted?: boolean;
}

/**
 * A mime renderer for displaying Markdown with embedded latex.
 */
export class MySTWidget extends VDomRenderer<IMySTModel> {
  /**
   * Construct a new MyST markdown widget.
   *
   * @param options - The options for initializing the widget.
   */
  constructor(options: IMySTOptions) {
    const {
      model,
      taskItemController,
      resolver,
      linkHandler,
      rendermime,
      trusted
    } = options;
    super(model);

    this._taskItemController = taskItemController;
    this._resolver = resolver;
    this._linkHandler = linkHandler;
    this._rendermime = rendermime;
    this._trusted = trusted;
    this.addClass('myst');
  }

  private readonly _taskItemController?: ITaskItemController;
  private readonly _resolver?: IRenderMime.IResolver;
  private readonly _linkHandler?: IRenderMime.ILinkHandler;
  private readonly _rendermime?: IRenderMimeRegistry;
  private _trusted?: boolean = false;

  get trusted(): boolean | undefined {
    return this._trusted;
  }

  set trusted(value: boolean | undefined) {
    this._trusted = value;
    this.update();
  }

  protected render(): React.JSX.Element {
    console.debug('re-rendering VDOM', this.model);
    if (!this.model) {
      return <span>MyST Renderer!</span>;
    }
    const { references, frontmatter, mdast, expressions } = this.model;

    const children = useParse(mdast || null, renderers);

    console.log('Rendering MyST with trust?:', this._trusted);

    return (
      <TaskItemControllerProvider controller={this._taskItemController}>
        <ThemeProvider
          theme={Theme.light}
          Link={linkFactory(this._resolver, this._linkHandler)}
          renderers={renderers}
        >
          <UserExpressionsProvider
            expressions={expressions}
            rendermime={this._rendermime}
            trusted={this._trusted}
          >
            <TabStateProvider>
              <ReferencesProvider
                references={references}
                frontmatter={frontmatter}
              >
                {frontmatter && <FrontmatterBlock frontmatter={frontmatter} />}
                {children}
              </ReferencesProvider>
            </TabStateProvider>
          </UserExpressionsProvider>
        </ThemeProvider>
      </TaskItemControllerProvider>
    );
  }
}
