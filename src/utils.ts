import { StaticNotebook } from '@jupyterlab/notebook';
import { IMySTMarkdownCell } from './types';

export function getCellList(
  notebook: StaticNotebook
): IMySTMarkdownCell[] | undefined {
  // Need the full list of widgets, not just models
  const n = notebook?.children();
  if (!n) {
    return undefined;
  }
  const cells = [];
  let cell;
  do {
    cell = n.next() as IMySTMarkdownCell | undefined;
    if (cell) {
      cells.push(cell);
    }
  } while (cell);
  return cells;
}
