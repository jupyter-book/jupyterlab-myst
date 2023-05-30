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
import { parseNotebook, renderNotebook } from './myst';
import { IMySTMarkdownCell } from './types';
import { linkFactory } from './links';
import { selectAll } from 'unist-util-select';

import { JupyterCellProvider } from './JupyterCellProvider';
import { ObservableValue } from '@jupyterlab/observables';
import { CellModel, MarkdownCellModel } from '@jupyterlab/cells';

const DEFAULT_MARKDOWN_TEXT = 'Write Markdown Here!';

export class MySTMarkdownCell
  extends MarkdownCell
  implements IMySTMarkdownCell
{
  private _widget: Widget;

  myst: {
    pre?: GenericParent;
    post?: GenericParent;
    node?: HTMLDivElement;
  } = {};

  constructor(options: MarkdownCell.IOptions) {
    super(options);

    this['_updateRenderedInput'] = this.updateRenderedInput;

    // Create the node if it does not exist
    const node = document.createElement('div');
    this.myst = { node };
    console.debug('Created node for MyST cell');

    const widget = new Widget({ node: this.myst.node });
    widget.addClass('myst');
    widget.addClass('jp-MarkdownOutput');
    this._widget = widget;
    console.debug('Created Widget for MyST cell');
    this['_renderer'] = this._widget; // TODO HACKY!
    this.addClass('jp-MySTMarkdownCell');

    // Listen for changes to the cell trust
    // TODO: Fix this ugly hack upstream!
    const concreteModel: MarkdownCellModel = this
      .model as unknown as MarkdownCellModel;
    concreteModel.onTrustedChanged = (
      trusted: CellModel,
      args: ObservableValue.IChangedArgs
    ) => {
      console.log('trust changed', this.model.trusted);
      this.updateRenderedInput()
        .then(() => console.log('update render succeess'))
        .catch(() => console.log('FFS'));
    };
  }

  /**
   * Update the rendered input.
   */
  protected updateRenderedInput(): Promise<void> {
    if (this.placeholder) {
      console.log('Not updating, placeholder!');
      return Promise.resolve();
    }

    const model = this.model;
    const text =
      (model && model.sharedModel.getSource()) || DEFAULT_MARKDOWN_TEXT;
    // Do not re-render if the text has not changed.
    if (text !== this['_prevText']) {
      this['_prevText'] = text;
      // const mimeModel = new MimeModel({ data: { 'text/markdown': text } });
      // return this._renderer.renderModel(mimeModel);

      const notebook = this.parent as StaticNotebook;
      this.myst.pre = undefined;
      const result = parseNotebook(notebook);
      if (result === undefined) {
        return Promise.reject('invalid parse result');
      } else {
        return renderNotebook(notebook, result.mdast);
      }
    }
    return Promise.resolve();
  }

  get expressions(): string[] {
    const { post: mdast } = this.myst ?? {};
    const expressions = selectAll('inlineExpression', mdast);
    return expressions.map(node => (node as any).value);
  }

  mystRender(): void {
    console.log('Rendering MyST cell into', this.node);
    const notebook = this.parent as StaticNotebook & {
      myst: { frontmatter: PageFrontmatter; references: References };
    };
    const isFirstCell = notebook.children().next().value === this;
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
