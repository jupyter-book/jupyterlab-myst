import {
  simpleMarkdownItPlugin,
  IMarkdownIt
} from '@agoose77/jupyterlab-markup';
import { JupyterFrontEndPlugin } from '@jupyterlab/application';
import type MarkdownIt from 'markdown-it';
import katex from 'katex';

import { PACKAGE_NS } from '../tokens';

// FIXME HACK: we should really do proper math rendering
function wrapDocutilsPlugin(docutilsPlugin: IMarkdownIt.IPlugin) {
  return function (md: MarkdownIt, options: any) {
    docutilsPlugin(md, options);

    // Add renderer to MarkdownIt
    md.renderer.rules['math_block'] = (tokens, idx) => {
      const content = tokens[idx].content.trim();
      const rendered = katex.renderToString(content, {
        displayMode: true,
        throwOnError: false,
        output: 'htmlAndMathml'
      });
      return `<div class="math">${rendered}</div>`;
    };
  };
}

/**
 * Provides docutils roles and directives
 */
export const docutils: JupyterFrontEndPlugin<void> = simpleMarkdownItPlugin(
  PACKAGE_NS,
  {
    id: 'markdown-it-docutils',
    title: 'Docutils',
    description:
      'Plugin for implementing docutils style roles (inline extension point) and directives (block extension point)',
    documentationUrls: {
      Plugin: 'https://github.com/executablebooks/markdown-it-docutils'
    },
    examples: {
      'Example ': '```{name} argument\n:option: value\n\ncontent\n```'
    },
    plugin: async () => {
      const docutilsPlugin = await import(
        /* webpackChunkName: "markdown-it-docutils" */ 'markdown-it-docutils'
      );
      return [wrapDocutilsPlugin(docutilsPlugin.default)];
    }
  }
);
