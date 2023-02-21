import React from 'react';
import { MarkdownCell } from '@jupyterlab/cells';
import { StaticNotebook } from '@jupyterlab/notebook';
import { Widget } from '@lumino/widgets';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { renderers } from './renderers';
import { PageFrontmatter } from 'myst-frontmatter';
import { References, GenericParent } from 'myst-common';
import {
  Theme,
  ThemeProvider,
  ReferencesProvider,
  TabStateProvider
} from '@myst-theme/providers';
import { render } from 'react-dom';
import { useParse } from 'myst-to-react';
import { parseContent } from './myst';
import { IMySTMarkdownCell } from './types';
import { linkFactory } from './links';
import { selectAll } from 'unist-util-select';

import { PromiseDelegate } from '@lumino/coreutils';
import { JupyterCellProvider } from './JupyterCellProvider';

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

  renderInput(_: Widget): void {
    if (!this.myst || !this.myst.node) {
      // Create the node if it does not exist
      const node = document.createElement('div');
      this.myst = { node };
    }

    this._doneRendering = new PromiseDelegate<void>();
    const notebook = this.parent as StaticNotebook;
    this.myst.pre = undefined;
    const parseComplete = parseContent(notebook);
    const widget = new Widget({ node: this.myst.node });
    widget.addClass('myst');
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
        Link={linkFactory(notebook)}
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
