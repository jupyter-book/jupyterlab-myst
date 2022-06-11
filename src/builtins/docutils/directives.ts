import {
  directiveOptions,
  IDirectiveData,
  directivesDefault,
  Directive
} from 'markdown-it-docutils';
import { EXPR_CLASS } from './constants';
import type Token from 'markdown-it/lib/token';

const Figure = directivesDefault['figure'];
const { uri } = directiveOptions;

export class EvalDirectiveAny extends Directive {
  public required_arguments = 1;
  public optional_arguments = 0;
  public final_argument_whitespace = false;
  public has_content = false;
  public rawOptions = true;

  run(data: IDirectiveData<keyof EvalDirectiveAny['option_spec']>): Token[] {
    // TODO store options and the fact that this is a code cell rather than a fence?
    const token = this.createToken('expr', 'input', 0, {
      content: data.body,
      map: data.bodyMap
    });
    const expr = uri(data.args[0] || '');
    token.attrSet('type', 'hidden');
    token.attrSet('class', EXPR_CLASS);
    token.attrSet('value', expr);
    return [token];
  }
}

/** Directive for parsing code outputs from notebooks, wrapped in a figure.
 *
 * Adapted from: docutils/docutils/parsers/rst/directives/images.py
 */
export class EvalFigureDirective extends Figure {
  create_image(
    data: IDirectiveData<keyof EvalFigureDirective['option_spec']>
  ): Token {
    // get URI
    const expr = uri(data.args[0] || '');
    const token = this.createToken('expr', 'input', 0, {
      map: data.map,
      block: true
    });
    token.attrSet('type', 'hidden');
    token.attrSet('class', EXPR_CLASS);
    token.attrSet('value', expr);
    token.attrSet('alt', data.options.alt || '');
    // TODO markdown-it default renderer requires the alt as children tokens
    const altTokens: Token[] = [];
    if (data.options.alt) {
      this.state.md.inline.parse(
        data.options.alt,
        this.state.md,
        this.state.env,
        altTokens
      );
    }
    token.children = altTokens;
    if (data.options.height) {
      token.attrSet('height', data.options.height);
    }
    if (data.options.width) {
      token.attrSet('width', data.options.width);
    }
    if (data.options.align) {
      token.attrJoin('class', `align-${data.options.align}`);
    }
    if (data.options.class) {
      token.attrJoin('class', data.options.class.join(' '));
    }

    return token;
  }
}
