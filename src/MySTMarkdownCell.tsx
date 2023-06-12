import { CellModel, MarkdownCell, MarkdownCellModel } from '@jupyterlab/cells';
import { IMySTMarkdownCell } from './types';
import { IMapChange } from '@jupyter/ydoc';
import { metadataSection } from './metadata';
import { RenderedMySTMarkdown } from './mime';
import {
  buildNotebookMDAST,
  processNotebookMDAST,
  renderNotebook
} from './myst';
import { StaticNotebook } from '@jupyterlab/notebook';

export class MySTMarkdownCell
  extends MarkdownCell
  implements IMySTMarkdownCell
{
  private _notebookRendermime;

  constructor(options: MarkdownCell.IOptions) {
    super(options);

    this._notebookRendermime = options.rendermime;

    // Listen for changes to the cell trust
    // TODO: Fix this ugly hack upstream!
    (this.model as unknown as MarkdownCellModel).onTrustedChanged = () =>
      this.onTrustedChanged();

    this.mystRenderer.fragmentContext = {
      requestUpdate: _ => this.onRendererRequestUpdate(),
      getSource: () => this.model.sharedModel.getSource(),
      setSource: (source: string) => this.model.sharedModel.setSource(source)
    };

    // We need to write the initial metadata values from the cell
    this.restoreExpressionsFromMetadata();
  }

  get mystRenderer(): RenderedMySTMarkdown {
    return this.renderer as RenderedMySTMarkdown;
  }

  protected restoreExpressionsFromMetadata() {
    const expressions = this.model.getMetadata(metadataSection);
    if (expressions !== undefined) {
      const state = {
        expressions: expressions,
        rendermime: this._notebookRendermime,
        trusted: this.model.trusted
      };
      console.debug('restoring expressions from metadata', state);
      this.mystRenderer.onExpressionsUpdated(state);
    }
  }

  protected onTrustedChanged() {
    console.debug('trust changed', this.model.trusted);
    this.restoreExpressionsFromMetadata();
  }

  protected onRendererRequestUpdate() {
    console.debug('On request update', this.parent, this);
    // Build the whole-document AST
    const notebook = this.parent as StaticNotebook;
    const { cells, mdast } = buildNotebookMDAST(notebook);
    // Transform AST
    const state = processNotebookMDAST(mdast, notebook.rendermime.resolver);
    if (state === undefined) {
      return console.error('could not update cell, no state from parse');
    }
    // Update all cells with rendered result
    const result = renderNotebook(cells, state, notebook.rendermime.resolver);
    result.then(() => {
      console.debug('successfully rendered notebook');
    });
    result.catch(err => {
      console.error('failed to render notebook', err);
    });
  }

  /**
   * Handle changes in the metadata.
   */
  protected onMetadataChanged(model: CellModel, args: IMapChange): void {
    switch (args.key) {
      case metadataSection:
        console.debug('metadata changed', args);
        this.mystRenderer.onExpressionsUpdated({
          expressions: args.newValue,
          rendermime: this._notebookRendermime,
          trusted: model.trusted
        });
        break;
      default:
        super.onMetadataChanged(model, args);
    }
  }
}
