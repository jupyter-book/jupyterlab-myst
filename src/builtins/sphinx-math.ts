import { simpleMarkdownItPlugin } from '@agoose77/jupyterlab-markup';
import { JupyterFrontEndPlugin } from '@jupyterlab/application';
import MarkdownIt from 'markdown-it';

import { PACKAGE_NS } from '../tokens';

function splitPart(text: string): string {
  if (text.includes('\\\\')) {
    return `\\begin{split}${text}\\end{split}`;
  } else {
    return text;
  }
}

export function wrapDisplayMath(text: string): string {
  const parts = text.split('\n\n');
  const split_parts = parts.map(splitPart);

  // Allow multiline equations using split
  if (parts.length === 1) {
    return `\\begin{equation}\\begin{split}${parts[0]}\\end{split}\\end{equation}\n`;
  }
  // Allow aligned equations with aligned
  else if (parts.length > 1) {
    let result = ' \\begin{align}\\begin{aligned}';
    result += split_parts.join('\\\\\n');
    result += ' \\end{aligned}\\end{align}';
    return result;
  } else {
    return split_parts.join('////');
  }
}

/**
 * Provides Sphinx math-environment support
 */
export const sphinxMath: JupyterFrontEndPlugin<void> = simpleMarkdownItPlugin(
  PACKAGE_NS,
  {
    id: 'sphinx-display-math',
    title: 'Sphinx Display Math',
    description:
      'Plugin for transforming display math using the Sphinx displaymath rules',
    documentationUrls: {},
    examples: {
      'Multi-line Equation ': '$$\nx = y \\\\ + mx + c\n$$\n',
      'Multiple Equations ': '$$x = y\n\ny + z = 2$$\n'
    },
    plugin: async () => {
      return [
        (md: MarkdownIt) => {
          md.core.ruler.push('sphinx-displaymath', state => {
            state.tokens.forEach(token => {
              if (token.type === 'math_block') {
                token.content = wrapDisplayMath(token.content);
              } else if (token.type === 'inline') {
                token.children.forEach(token => {
                  if (token.type === 'math_inline_double') {
                    token.content = wrapDisplayMath(token.content);
                  }
                });
              }
            });
          });
        }
      ];
    }
  }
);
