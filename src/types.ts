import { MarkdownCell } from '@jupyterlab/cells';
import { GenericParent } from 'myst-common';

export type IMySTMarkdownCell = MarkdownCell & {
  myst: { pre?: GenericParent; post?: GenericParent; node?: HTMLDivElement };
  mystRender: () => void;
};
