import React from 'react';
import { MarkdownCell } from '@jupyterlab/cells';
import { StaticNotebook } from '@jupyterlab/notebook';
import { Widget } from '@lumino/widgets';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { renderers } from './renderers';
import { PageFrontmatter } from 'myst-frontmatter';
import { GenericParent, References } from 'myst-common';
import {
  ReferencesProvider,
  TabStateProvider,
  Theme,
  ThemeProvider
} from '@myst-theme/providers';
import { render } from 'react-dom';
import { useParse } from 'myst-to-react';
import { renderNotebook } from './myst';
import { IMySTMarkdownCell } from './types';
import { linkFactory } from './links';
import { selectAll } from 'unist-util-select';

import { PromiseDelegate } from '@lumino/coreutils';
import { JupyterCellProvider } from './JupyterCellProvider';

import { ObservableValue } from '@jupyterlab/observables';

export class MySTMarkdownCell
  extends MarkdownCell
  implements IMySTMarkdownCell
{
  private _doneRendering = new PromiseDelegate<void>();

  myst: {
    pre?: GenericParent;
    post?: GenericParent;
    node?: HTMLDivElement;
  } = {};

  constructor(options: MarkdownCell.IOptions) {
    super(options);

    // Listen for changes to the cell trust
    const trusted = this.model.modelDB.get('trusted') as ObservableValue;
    trusted.changed.connect(this.mystRender, this);
  }

  renderInput(_: Widget): void {
    if (!this.myst || !this.myst.node) {
      // Create the node if it does not exist
      const node = document.createElement('div');
      this.myst = { node };
    }

    this._doneRendering = new PromiseDelegate<void>();
    const notebook = this.parent as StaticNotebook;
    this.myst.pre = undefined;
    const parseComplete = renderNotebook(notebook);
    const widget = new Widget({ node: this.myst.node });
    widget.addClass('myst');
    widget.addClass('jp-MarkdownOutput');
    this.addClass('jp-MySTMarkdownCell');
    this.inputArea.renderInput(widget);
    if (parseComplete) {
      parseComplete.then(() => this._doneRendering.resolve());
    } else {
      // Something went wrong, reject the rendering promise
      this._doneRendering.reject('Unknown error with parsing MyST Markdown.');
    }
  }

  /**
   * Whether the Markdown renderer has finished rendering.
   */
  get doneRendering(): Promise<void> {
    return this._doneRendering.promise;
  }

  get expressions(): string[] {
    const { post: mdast } = this.myst ?? {};
    const expressions = selectAll('inlineExpression', mdast);
    return expressions.map(node => (node as any).value);
  }

  mystRender(): void {
    const notebook = this.parent as StaticNotebook & {
      myst: { frontmatter: PageFrontmatter; references: References };
    };
    const isFirstCell = notebook.children().next() === this;
    const { post: mdast } = this.myst ?? {};
    if (!this.myst?.node || !notebook?.myst || !mdast) {
      console.log('MyST: Did not render?', this);
      return;
    }
    const { references, frontmatter } = notebook.myst;

    const children = useParse(mdast as any, renderers);
    render(
      <ThemeProvider
        theme={Theme.light}
        Link={linkFactory(
          notebook.rendermime.resolver,
          notebook.rendermime.linkHandler
        )}
        renderers={renderers}
      >
        <JupyterCellProvider cell={this}>
          <TabStateProvider>
            <ReferencesProvider
              references={references}
              frontmatter={frontmatter}
            >
              {isFirstCell && <FrontmatterBlock frontmatter={frontmatter} />}
              {children}
            </ReferencesProvider>
          </TabStateProvider>
        </JupyterCellProvider>
      </ThemeProvider>,
      this.myst.node
    );
  }
}
