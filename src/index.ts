import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

/**
 * Initialization data for the jupyterlab-myst extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-myst:plugin',
  description: 'Use MyST in JupyterLab',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab-myst is activated!');

    requestAPI<any>('get-example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The jupyterlab_myst server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
