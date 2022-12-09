import { MarkdownCell } from '@jupyterlab/cells';
import { NotebookPanel, StaticNotebook } from '@jupyterlab/notebook';
import { MySTMarkdownCell } from './MySTMarkdownCell';

export class MySTContentFactory extends NotebookPanel.ContentFactory {
  createMarkdownCell(
    options: MarkdownCell.IOptions,
    parent: StaticNotebook
  ): MarkdownCell {
    if (!options.contentFactory) {
      options.contentFactory = this;
    }
    return new MySTMarkdownCell(options).initializeState();
  }
}
