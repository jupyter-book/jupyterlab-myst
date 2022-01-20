import { simpleMarkdownItPlugin } from '@agoose77/jupyterlab-markup';
import { JupyterFrontEndPlugin } from '@jupyterlab/application';

import { PACKAGE_NS } from '../tokens';

/**
 * Provides amsmath support
 */
export const amsmath: JupyterFrontEndPlugin<void> = simpleMarkdownItPlugin(
  PACKAGE_NS,
  {
    id: 'markdown-it-amsmath',
    title: 'amsmath',
    description: 'Plugin for amsmath LaTeX environments',
    documentationUrls: {
      Plugin: 'https://github.com/executablebooks/markdown-it-amsmath'
    },
    examples: {
      'Example ': '\\begin{equation}\na = 1\n\\end{equation}'
    },
    plugin: async () => {
      const amsmathPlugin = await import(
        /* webpackChunkName: "markdown-it-amsmath" */ 'markdown-it-amsmath'
      );
      return [amsmathPlugin.default];
    }
  }
);
