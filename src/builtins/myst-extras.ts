import { simpleMarkdownItPlugin } from '@agoose77/jupyterlab-markup';
import { JupyterFrontEndPlugin } from '@jupyterlab/application';

import { PACKAGE_NS } from '../tokens';

/**
 * Provides extra MyST support
 */
export const mystExtras: JupyterFrontEndPlugin<void> = simpleMarkdownItPlugin(
  PACKAGE_NS,
  {
    id: 'markdown-it-myst-extras',
    title: 'MyST Extras',
    description: 'Additional markdown-it plugins required for the MyST specification',
    documentationUrls: {
      Plugin: 'https://github.com/executablebooks/markdown-it-myst-extras'
    },
    examples: {
      'Blockquotes': '% comment',
      'Block Breaks': '+++',
      'MyST Targets': '(name)='
    },
    plugin: async () => {
      const mystExtrasPlugin = await import(
        /* webpackChunkName: "markdown-it-myst-extras" */ 'markdown-it-myst-extras'
      );
      return [mystExtrasPlugin.mystBlockPlugin];
    }
  }
);
