import { simpleMarkdownItPlugin } from '@agoose77/jupyterlab-markup';
import { JupyterFrontEndPlugin } from '@jupyterlab/application';
import type MarkdownIt from 'markdown-it';
import katex from 'katex';

import { PACKAGE_NS } from '../../tokens';
import { EvalRole } from './roles';
import { EvalDirectiveAny, EvalFigureDirective } from './directives';

import {
  directivesDefault,
  rolesDefault,
  IOptions
} from 'markdown-it-docutils';

function splitPart(text: string): string {
  if (text.includes('\\\\')) {
    return `\\begin{split}${text}\\end{split}`;
  } else {
    return text;
  }
}

function wrapDisplayMath(text: string): string {
  const parts = text.split('\n\n');
  const split_parts = parts.map(splitPart);

  if (parts.length === 1) {
    return `\\begin{equation}\\begin{split}${parts[0]}\\end{split}\\end{equation}\n`;
  } else if (parts.length > 1) {
    let result = ' \\begin{align}\\begin{aligned}';
    result += split_parts.join('\\\\');
    result += ' \\begin{aligned}\\end{align}';
    return result;
  } else {
    return split_parts.join('////');
  }
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

      function wrappedDocutilsPlugin(md: MarkdownIt, options: IOptions) {
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

        // Add renderers to MarkdownIt
        md.renderer.rules['math_block'] = (tokens, idx) => {
          const token = tokens[idx];
          const content = wrapDisplayMath(token.content.trim());
          const rendered = katex.renderToString(content, {
            displayMode: true,
            throwOnError: false,
            output: 'htmlAndMathml'
          });
          return `<div class="${token.attrGet('class')}">${rendered}</div>`;
        };

        md.renderer.rules['math_inline'] = (tokens, idx) => {
          const token = tokens[idx];
          const content = token.content.trim();
          const rendered = katex.renderToString(content, {
            displayMode: false,
            throwOnError: false,
            output: 'htmlAndMathml'
          });
          return `<span class="${token.attrGet('class')}">${rendered}</span>`;
        };
      }

      return [wrappedDocutilsPlugin];
    }
  }
);
