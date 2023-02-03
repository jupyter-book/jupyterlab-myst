import React from 'react';
import { MarkdownCell } from '@jupyterlab/cells';
import { StaticNotebook } from '@jupyterlab/notebook';
import { Widget } from '@lumino/widgets';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
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

export class MySTMarkdownCell
  extends MarkdownCell
  implements IMySTMarkdownCell
{
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
    const notebook = this.parent as StaticNotebook;
    this.myst.pre = undefined;
    parseContent(notebook);
    const widget = new Widget({ node: this.myst.node });
    widget.addClass('myst');
    this.addClass('jp-MySTMarkdownCell');
    this.inputArea.renderInput(widget);
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

    const children = useParse(mdast as any);

    render(
      <ThemeProvider theme={Theme.light} Link={linkFactory(notebook)}>
        <TabStateProvider>
          <ReferencesProvider references={references} frontmatter={frontmatter}>
            {isFirstCell && <FrontmatterBlock frontmatter={frontmatter} />}
            {children}
          </ReferencesProvider>
        </TabStateProvider>
      </ThemeProvider>,
      this.myst.node
    );
  }
}
