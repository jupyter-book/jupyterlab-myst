import { simpleMarkdownItPlugin } from '@agoose77/jupyterlab-markup';
import { JupyterFrontEndPlugin } from '@jupyterlab/application';
import MarkdownIt from 'markdown-it';

import { PACKAGE_NS } from '../tokens';

/**
 * Provides extra MyST support
 */
export const mystExtras: JupyterFrontEndPlugin<void> = simpleMarkdownItPlugin(
  PACKAGE_NS,
  {
    id: 'markdown-it-myst-extras',
    title: 'MyST Extras',
    description:
      'Additional markdown-it plugins required for the MyST specification',
    documentationUrls: {
      Plugin: 'https://github.com/executablebooks/markdown-it-myst-extras'
    },
    examples: {
      Blockquotes: '% comment',
      'Block Breaks': '+++',
      'MyST Targets': '(name)=',
      'Colon Fence': ':::name\ncontained text\n :::'
    },
    plugin: async () => {
      const mystExtrasPlugins = await import(
        /* webpackChunkName: "markdown-it-myst-extras" */ 'markdown-it-myst-extras'
      );
      function plugin(md: MarkdownIt, options: any) {
        mystExtrasPlugins.mystBlockPlugin(md);
        mystExtrasPlugins.colonFencePlugin(md);
      }
      return [plugin];
    }
  }
);
