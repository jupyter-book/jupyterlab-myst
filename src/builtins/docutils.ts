import { simpleMarkdownItPlugin } from '@agoose77/jupyterlab-markup';
import { JupyterFrontEndPlugin } from '@jupyterlab/application';

import { PACKAGE_NS } from '../tokens';


/**
 * Provides docutils roles and directives
 */
export const docutils: JupyterFrontEndPlugin<void> = simpleMarkdownItPlugin(
  PACKAGE_NS,
  {
    id: 'markdown-it-docutils',
    title: 'Docutils',
    description: 'Plugin for implementing docutils style roles (inline extension point) and directives (block extension point)',
    documentationUrls: {
      Plugin: 'https://github.com/executablebooks/markdown-it-docutils'
    },
    examples: {
      'Example ':
        '```{name} argument\n:option: value\n\ncontent\n```'
    },
    plugin: async () => {
        const docutilsPlugin = await import(
            /* webpackChunkName: "markdown-it-docutils" */ 'markdown-it-docutils'
        );
        return [docutilsPlugin.default];
    }
  }
);
