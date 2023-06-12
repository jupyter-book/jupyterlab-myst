import {
  CellModel,
  MarkdownCell,
  ICellModel,
  MarkdownCellModel
} from '@jupyterlab/cells';
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
import { ActivityMonitor } from '@jupyterlab/coreutils';

export class MySTMarkdownCell
  extends MarkdownCell
  implements IMySTMarkdownCell
{
  private _notebookRendermime;
  private _activityMonitor: ActivityMonitor<ICellModel, void>;
  private _metadataJustChanged = false;

  constructor(options: MarkdownCell.IOptions) {
    super(options);

    this._notebookRendermime = options.rendermime;

    // Listen for changes to the cell trust
    // TODO: Fix this ugly hack upstream!
    (this.model as MarkdownCellModel).onTrustedChanged = () =>
      this.onTrustedChanged();

    this.mystRenderer.fragmentContext = {
      requestUpdate: _ => this.onRendererRequestUpdate(),
      setTaskItem: (line: number, checked: boolean) =>
        this.rendererSetTaskItem(line, checked)
    };

    // We need to write the initial metadata values from the cell
    this.restoreExpressionsFromMetadata();

    // HACK: activity monitor also triggers for metadata changes
    // So, let's re-order the signal registration so that metadata changes can
    // veto the delayed render
    (this as any)._monitor.dispose();
    this._activityMonitor = new ActivityMonitor({
      signal: this.model.contentChanged,
      timeout: (this as any)._monitor.timeout
    });
    // Throttle the rendering rate of the widget.
    this.ready
      .then(() => {
        if (this.isDisposed) {
          // Bail early
          return;
        }
        console.debug('ready and connected activityStopped signal');
        this._activityMonitor.activityStopped.connect(() => {
          if (this.rendered && !this._metadataJustChanged) {
            console.debug('Updating after activity monitor expired');
            this.update();
          }
          this._metadataJustChanged = false;
        }, this);
      })
      .catch(reason => {
        console.error('Failed to be ready', reason);
      });
  }

  private rendererSetTaskItem(line: number, checked: boolean) {
    const text = this.model.sharedModel.getSource();
    // This is a pretty cautious replacement for the identified line
    const lines = text.split('\n');
    lines[line] = lines[line].replace(
      /^(\s*(?:-|\*)\s*)(\[[\s|x]\])/,
      checked ? '$1[x]' : '$1[ ]'
    );
    // Update the Jupyter cell markdown value
    this.model.sharedModel.setSource(lines.join('\n'));
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
      throw Error('could not update cell, no state from parse');
    }

    // Update all cells with rendered result
    const [thisPromise, _] = renderNotebook(
      cells,
      state,
      notebook.rendermime.resolver,
      this
    );
    // Appease type checker
    if (thisPromise === undefined) {
      throw Error('this should not happen!');
    }
    return thisPromise;
  }

  /**
   * Handle changes in the metadata.
   */
  protected onMetadataChanged(model: CellModel, args: IMapChange): void {
    switch (args.key) {
      case metadataSection:
        console.debug('metadata changed', args);
        this._metadataJustChanged = true;
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
