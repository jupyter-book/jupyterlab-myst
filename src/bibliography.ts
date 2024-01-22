import { Token } from '@lumino/coreutils';
import { getCitations, CitationRenderer } from 'citation-js-utils';
import { Contents } from '@jupyterlab/services';
import { ISignal, Signal } from '@lumino/signaling';

export interface IBibliographyManager {
  getBibliography(): CitationRenderer | null;

  changed: ISignal<this, CitationRenderer | null>;
}

export const IBibliographyManager = new Token<IBibliographyManager>(
  'jupyterlab-myst:IBibliographyManager'
);

export class BibliographyManager implements IBibliographyManager {
  private _renderer: CitationRenderer | null;
  private _changed = new Signal<this, CitationRenderer | null>(this);

  get changed(): ISignal<this, CitationRenderer | null> {
    return this._changed;
  }

  getBibliography(): CitationRenderer | null {
    return this._renderer;
  }

  constructor(contents: Contents.IManager, bibFile: string) {
    this._renderer = null;

    contents
      .get(bibFile)
      .then(async model => {
        this._renderer = await getCitations(model.content);
        this._changed.emit(this._renderer);
      })
      .catch();

    // Handle changes
    contents.fileChanged.connect(async (_, change) => {
      // On create
      if (change.type === 'new') {
        const path = (change.newValue as Contents.IModel).path;
        // Add model to record registry
        if (path === bibFile) {
          const model = await contents.get(path);
          this._renderer = await getCitations(model.content);
          this._changed.emit(this._renderer);
        }
      }
      // On rename
      else if (change.type === 'rename') {
        // Remove by path
        const oldPath = (change.oldValue as Contents.IModel).path;
        // Add under new path!
        const newPath = (change.newValue as Contents.IModel).path;
        // Add model to record registry
        if (newPath === bibFile) {
          const model = await contents.get(newPath);
          this._renderer = await getCitations(model.content);
          this._changed.emit(this._renderer);
        } else if (oldPath === bibFile) {
          this._renderer = null;
          this._changed.emit(this._renderer);
        }
      }
      // On delete
      else if (change.type === 'delete') {
        const path = (change.oldValue as Contents.IModel).path;
        // Add model to record registry
        if (path === bibFile) {
          this._renderer = null;
          this._changed.emit(this._renderer);
        }
      }
      // On save
      else {
        const path = (change.newValue as Contents.IModel).path;
        // Add model to record registry
        // Add model to record registry
        if (path === bibFile) {
          const model = await contents.get(path);
          this._renderer = await getCitations(model.content);
          this._changed.emit(this._renderer);
        }
      }
    });
  }
}
