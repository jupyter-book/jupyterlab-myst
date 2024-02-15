import { MarkdownCell } from '@jupyterlab/cells';
import { IMySTModel } from './widget';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

export type IMySTMarkdownCell = MarkdownCell & {
  readonly fragmentMDAST: any | undefined;
  readonly attachmentsResolver: IRenderMime.IResolver;
  mystModel: IMySTModel;
  updateFragmentMDAST(): Promise<void>;
};
