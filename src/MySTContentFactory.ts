import { MarkdownCell } from '@jupyterlab/cells';
import { NotebookPanel } from '@jupyterlab/notebook';
import { MySTMarkdownCell } from './MySTMarkdownCell';

export class MySTContentFactory extends NotebookPanel.ContentFactory {
  createMarkdownCell(options: MarkdownCell.IOptions): MySTMarkdownCell {
    if (!options.contentFactory) {
      options.contentFactory = this;
    }
    return new MySTMarkdownCell(options).initializeState();
  }
}
