import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IEditorServices } from '@jupyterlab/codeeditor';

import { NotebookPanel } from '@jupyterlab/notebook';
import { MySTContentFactory } from './MySTContentFactory';

/**
 * The notebook cell factory provider.
 */
const plugin: JupyterFrontEndPlugin<NotebookPanel.IContentFactory> = {
  id: '@jupyterlab-mystjs:plugin',
  provides: NotebookPanel.IContentFactory,
  requires: [IEditorServices],
  autoStart: true,
  activate: (app: JupyterFrontEnd, editorServices: IEditorServices) => {
    const editorFactory = editorServices.factoryService.newInlineEditor;
    console.log('Activated MyST content factory');
    return new MySTContentFactory({ editorFactory });
  }
};

export default plugin;
