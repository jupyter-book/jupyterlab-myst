import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the jupyterlab-mystjs extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-mystjs:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab-mystjs is activated!');
  }
};

export default plugin;
