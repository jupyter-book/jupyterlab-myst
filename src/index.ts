import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, ISessionContextDialogs } from '@jupyterlab/apputils';

import { IEditorServices } from '@jupyterlab/codeeditor';

import {
  INotebookTracker,
  INotebookWidgetFactory,
  NotebookWidgetFactory
} from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { MySTContentFactory } from './MySTContentFactory';
import { LabIcon } from '@jupyterlab/ui-components';

import mystIconSvg from '../style/mystlogo.svg';

const mystIcon = new LabIcon({
  name: 'myst-notebook-extension:mystIcon',
  svgstr: mystIconSvg
});

function loadKatex() {
  if (typeof document === 'undefined') {
    return;
  }
  const head = document.getElementsByTagName('HEAD')[0];
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = 'https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css';
  head.appendChild(link);
}

/**
 * Initialization data for the jupyterlab-mystjs extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-mystjs:plugin',
  autoStart: true,
  optional: [ITranslator, ICommandPalette],
  requires: [
    IEditorServices,
    IRenderMimeRegistry,
    ISessionContextDialogs,
    INotebookWidgetFactory,
    INotebookTracker
  ],
  activate: (
    app: JupyterFrontEnd,
    editorServices: IEditorServices,
    rendermime: IRenderMimeRegistry,
    sessionContextDialogs: ISessionContextDialogs,
    notebookFactory: NotebookWidgetFactory.IFactory,
    notebookTracker: INotebookTracker,
    translator: ITranslator | null,
    palette: ICommandPalette | null
  ) => {
    console.log('JupyterLab extension jupyterlab-mystjs is activated!');
    loadKatex();

    const contentFactory = new MySTContentFactory();

    const factory = new NotebookWidgetFactory({
      name: 'Jupyter MyST Notebook',
      // label: trans.__("Jupyter MyST Notebook"), // will be needed in JupyterLab 4
      fileTypes: ['notebook'],
      defaultFor: ['notebook'],
      modelName: notebookFactory.modelName ?? 'notebook',
      preferKernel: notebookFactory.preferKernel ?? true,
      canStartKernel: notebookFactory.canStartKernel ?? true,
      rendermime,
      contentFactory,
      editorConfig: notebookFactory.editorConfig,
      notebookConfig: notebookFactory.notebookConfig,
      mimeTypeService: editorServices.mimeTypeService,
      sessionDialogs: sessionContextDialogs,
      toolbarFactory: notebookFactory.toolbarFactory,
      translator: nullTranslator
    });

    let id = 0;

    factory.widgetCreated.connect((sender, widget) => {
      // If the notebook panel does not have an ID, assign it one.
      widget.id = widget.id || `myst-notebook-${++id}`;

      // Set up the title icon
      widget.title.icon = mystIcon ?? '';
      widget.toolbar.title.icon = mystIcon;
      widget.title.iconClass = '';
      widget.title.iconLabel = 'MyST Notebook';

      // Notify the widget tracker if restore data needs to update.
      widget.context.pathChanged.connect(() => {
        void (notebookTracker as any).save(widget);
      });
      // Add the notebook panel to the tracker.
      void (notebookTracker as any).add(widget);
    });

    app.docRegistry.addWidgetFactory(factory);
  }
};

export default plugin;
