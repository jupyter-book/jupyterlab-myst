import { IRoleData, Role } from 'markdown-it-docutils';
import { EXPR_CLASS } from './constants';
import type Token from 'markdown-it/lib/token';

export class EvalRole extends Role {
  run(data: IRoleData): Token[] {
    const inline = new this.state.Token('expr', 'input', 0);
    inline.attrSet('class', EXPR_CLASS);
    inline.attrSet('type', 'hidden');
    inline.attrSet('value', data.content);
    inline.content = data.content;
    return [inline];
  }
}
