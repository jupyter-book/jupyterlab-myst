import { simpleMarkdownItPlugin } from '@agoose77/jupyterlab-markup';
import { JupyterFrontEndPlugin } from '@jupyterlab/application';
import { PACKAGE_NS } from './tokens';
import MarkdownIt from 'markdown-it';

function blocksPlugin(md: MarkdownIt, options: any) {
  // TODO
}

/**
 * Provides text-based diagrams in code blocks
 */
export const blocks: JupyterFrontEndPlugin<void> = simpleMarkdownItPlugin(
  PACKAGE_NS,
  {
    id: 'markdown-it-myst',
    title: 'MyST',
    description: 'Javascript markdown parser for MyST based on markdown-it',
    documentationUrls: {
      Plugin: 'https://github.com/executablebooks/markdown-it-myst'
    },
    examples: {
      'MyST ':
        '```{directive}\n' + ':option: value\n' + '\n' + 'content\n' + '```'
    },
    plugin: async () => {
      return [blocksPlugin];
    }
  }
);
