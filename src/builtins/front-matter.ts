import { simpleMarkdownItPlugin } from '@agoose77/jupyterlab-markup';
import { JupyterFrontEndPlugin } from '@jupyterlab/application';
import MarkdownIt from 'markdown-it';

import { PACKAGE_NS } from '../tokens';

/**
 * Provides front-matter support
 */
export const frontMatter: JupyterFrontEndPlugin<void> = simpleMarkdownItPlugin(
  PACKAGE_NS,
  {
    id: 'markdown-it-front-matter',
    title: 'Front Matter',
    description:
      'Plugin for processing front matter for markdown-it markdown parser',
    documentationUrls: {
      Plugin: 'https://github.com/ParkSB/markdown-it-front-matter'
    },
    examples: {
      'Example ': '---\nvalid-front-matter: true\n---'
    },
    plugin: async () => {
      const frontMatterPlugin = await import(
        /* webpackChunkName: "markdown-it-front-matter" */ 'markdown-it-front-matter'
      );

      function handleMarkup(markup: string) {
        // Do nothing for now
      }

      function plugin(md: MarkdownIt, options: any) {
        frontMatterPlugin.default(md, handleMarkup);
      }

      return [plugin];
    }
  }
);
