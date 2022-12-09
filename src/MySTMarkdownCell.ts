import { MarkdownCell } from '@jupyterlab/cells';
import { Widget } from '@lumino/widgets';
import { MyST } from 'mystjs';

export class MySTMarkdownCell extends MarkdownCell {
  renderInput(_: Widget): void {
    const myst = new MyST();

    const node = document.createElement('div');
    node.innerHTML = myst.render(this.model?.value.text ?? '');

    const widget = new Widget({ node });
    widget.addClass('myst');

    this.inputArea.renderInput(widget);
  }
}
