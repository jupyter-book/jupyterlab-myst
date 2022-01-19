import { simpleMarkdownItPlugin } from '@agoose77/jupyterlab-markup';
import { JupyterFrontEndPlugin } from '@jupyterlab/application';
import { PACKAGE_NS } from './tokens';
import MarkdownIt from 'markdown-it';
import { plugins, directives, roles } from 'markdown-it-myst';

function mystPlugin(md: MarkdownIt, options: any) {
  md.use(plugins.blocks);
  md.use(plugins.directives(directives));
  md.use(plugins.roles(roles));
}

/**
 * Provides text-based diagrams in code plugin
 */
export const plugin: JupyterFrontEndPlugin<void> = simpleMarkdownItPlugin(
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
      console.log("MyST loaded");
      return [mystPlugin];
    }
  }
);
