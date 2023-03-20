import { MarkdownCell } from '@jupyterlab/cells';
import { NotebookPanel, StaticNotebook } from '@jupyterlab/notebook';
import { MySTMarkdownCell } from './MySTMarkdownCell';
import { MySTOptionsProvider, MySTNotebookDefaults } from './myst';

export class MySTContentFactory extends NotebookPanel.ContentFactory {

  mystOptions: MySTOptionsProvider<StaticNotebook>;

  constructor(options = {},
              mystOptions = new MySTNotebookDefaults() as MySTOptionsProvider<StaticNotebook>) {
    super(options);
    this.mystOptions = mystOptions;
  }

  createMarkdownCell(
    options: MarkdownCell.IOptions,
    parent: StaticNotebook
  ): MarkdownCell {
    if (!options.contentFactory) {
      options.contentFactory = this;
    }
    return new MySTMarkdownCell(options, this.mystOptions).initializeState();
  }
}
