import { simpleMarkdownItPlugin } from '@agoose77/jupyterlab-markup';
import { JupyterFrontEndPlugin } from '@jupyterlab/application';
import type MarkdownIt from 'markdown-it';
import katex from 'katex';

import { PACKAGE_NS } from '../tokens';
import { EvalRole } from './roles';
import { EvalDirectiveAny, EvalFigureDirective } from './directives';

import {
  directivesDefault,
  rolesDefault,
  IOptions
} from 'markdown-it-docutils';

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
      function wrapper(md: MarkdownIt, options: IOptions) {
        const roles = {
          ...(options?.roles ?? rolesDefault),
          eval: EvalRole
        };
        const directives = {
          ...(options?.directives ?? directivesDefault),
          'eval:figure': EvalFigureDirective,
          eval: EvalDirectiveAny
        };

        docutilsPlugin.default(md, {
          ...options,
          roles: roles,
          directives: directives
        });

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
      }

      return [wrapper];
    }
  }
);
