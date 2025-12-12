import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { ISignal, Signal } from '@lumino/signaling';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { ISanitizer, VDomModel, VDomRenderer } from '@jupyterlab/apputils';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { References } from 'myst-common';
import type { FrontmatterParts } from 'myst-common';
import type { SiteAction, SiteExport } from 'myst-config';
import { PageFrontmatter } from 'myst-frontmatter';
import { SourceFileKind } from 'myst-spec-ext';
import {
  ArticleProvider,
  TabStateProvider,
  Theme,
  ThemeProvider
} from '@myst-theme/providers';
import { MyST } from 'myst-to-react';
import React from 'react';
import {
  UserExpressionsProvider,
  ITaskItemChange,
  ITaskItemController,
  TaskItemControllerProvider,
  SanitizerProvider
} from './providers';
import { renderers } from './renderers';
import { IUserExpressionMetadata } from './userExpressions';
import { linkFactory } from './transforms';

/**
 * The MIME type for Markdown.
 */
export const MIME_TYPE = 'text/markdown';

function getJupyterTheme(): Theme {
  if (typeof document === 'undefined') {
    return Theme.light;
  }
  return document.body.dataset.jpThemeLight === 'false'
    ? Theme.dark
    : Theme.light;
}

type Frontmatter = Omit<PageFrontmatter, 'parts' | 'downloads'> & {
  parts?: FrontmatterParts;
  downloads?: SiteAction[];
  exports?: SiteExport[];
};

// export interface IMySTFragmentContext extends ITaskItemController {
//   requestUpdate(renderer: RenderedMySTMarkdown): Promise<IMySTDocumentState>;
//   setTaskItem(line: number, checked: boolean): void;
// }

export interface IMySTModel extends VDomRenderer.IModel {
  references?: References;
  mdast?: any;
  expressions?: IUserExpressionMetadata[];
  frontmatter?: Frontmatter;
  readonly stateChanged: ISignal<this, void>;
}

export class MySTModel extends VDomModel implements IMySTModel {
  private _references?: References;
  private _mdast?: any;
  private _expressions?: IUserExpressionMetadata[];
  private _frontmatter?: Frontmatter;

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

  get frontmatter(): Frontmatter | undefined {
    return this._frontmatter;
  }

  set frontmatter(value: Frontmatter | undefined) {
    this._frontmatter = value;
    this.stateChanged.emit();
  }
}

export interface IMySTOptions {
  model?: IMySTModel;
  resolver?: IRenderMime.IResolver;
  linkHandler?: IRenderMime.ILinkHandler;
  rendermime?: IRenderMimeRegistry;
  trusted?: boolean;
  sanitizer?: ISanitizer;
}

function setTheme() {}

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
    const { model, resolver, linkHandler, rendermime, trusted, sanitizer } =
      options;
    super(model);

    this._resolver = resolver;
    this._linkHandler = linkHandler;
    this._rendermime = rendermime;
    this._trusted = trusted;
    this._sanitizer = sanitizer;
    this._taskItemController = change => this._taskItemChanged.emit(change);
    this.addClass('myst');
  }

  private _trusted?: boolean = false;
  private readonly _resolver?: IRenderMime.IResolver;
  private readonly _linkHandler?: IRenderMime.ILinkHandler;
  private readonly _sanitizer?: IRenderMime.ISanitizer;
  private readonly _rendermime?: IRenderMimeRegistry;
  private readonly _taskItemChanged = new Signal<this, ITaskItemChange>(this);
  private readonly _taskItemController: ITaskItemController;

  get taskItemChanged(): ISignal<this, ITaskItemChange> {
    return this._taskItemChanged;
  }

  get trusted(): boolean | undefined {
    return this._trusted;
  }

  set trusted(value: boolean | undefined) {
    this._trusted = value;
    this.update();
  }

  protected render(): React.JSX.Element {
    console.debug(
      'Re-rendering VDOM for MySTWidget',
      this.model,
      this._trusted
    );
    if (!this.model) {
      return <span>MyST Renderer!</span>;
    }
    const { references, frontmatter, mdast, expressions } = this.model;

    return (
      <TaskItemControllerProvider controller={this._taskItemController}>
        <ThemeProvider
          theme={getJupyterTheme()}
          Link={linkFactory(this._resolver, this._linkHandler)}
          renderers={renderers}
          setTheme={setTheme}
        >
          <SanitizerProvider sanitizer={this._sanitizer}>
            <UserExpressionsProvider
              expressions={expressions}
              rendermime={this._rendermime}
              trusted={this._trusted}
            >
              <TabStateProvider>
                <ArticleProvider
                  kind={SourceFileKind.Article}
                  references={references}
                  frontmatter={frontmatter}
                >
                  {frontmatter && (
                    <FrontmatterBlock frontmatter={frontmatter} />
                  )}
                  <MyST ast={mdast}></MyST>
                </ArticleProvider>
              </TabStateProvider>
            </UserExpressionsProvider>
          </SanitizerProvider>
        </ThemeProvider>
      </TaskItemControllerProvider>
    );
  }
}
