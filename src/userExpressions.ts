import { PartialJSONObject } from '@lumino/coreutils';
import { Cell } from '@jupyterlab/cells';
import type { IMySTMarkdownCell } from './types';

export const metadataSection = 'user_expressions';

/**
 * Interfaces for `IExecuteReplyMsg.user_expressisons`
 */

export interface IBaseExpressionResult extends PartialJSONObject {
  status: string;
}

export interface IExpressionOutput extends IBaseExpressionResult {
  status: 'ok';
  data: PartialJSONObject;
  metadata: PartialJSONObject;
}

export interface IExpressionError extends IBaseExpressionResult {
  status: 'error';
  traceback: string[];
  ename: string;
  evalue: string;
}

export type IExpressionResult = IExpressionError | IExpressionOutput;

export function isOutput(
  output: IExpressionResult
): output is IExpressionOutput {
  return output.status === 'ok';
}

export function isError(output: IExpressionResult): output is IExpressionError {
  return output.status === 'error';
}

export interface IUserExpressionMetadata extends PartialJSONObject {
  expression: string;
  result: IExpressionResult;
}

export interface IUserExpressionsMetadata extends PartialJSONObject {
  [metadataSection]: IUserExpressionMetadata[];
}

export function getUserExpressions(
  cell: IMySTMarkdownCell | Cell
): IUserExpressionMetadata[] | undefined {
  if (!cell.model.getMetadata) {
    // this is JupyterLab 3.6
    return (cell.model.metadata as any)?.get(metadataSection) as
      | IUserExpressionMetadata[]
      | undefined;
  }
  return cell.model.getMetadata(metadataSection) as
    | IUserExpressionMetadata[]
    | undefined;
}

export function setUserExpressions(
  cell: IMySTMarkdownCell | Cell,
  expressions: IUserExpressionMetadata[]
) {
  if (!cell) {
    return;
  }
  if (!cell.model.setMetadata) {
    // this is JupyterLab 3.6
    (cell.model.metadata as any).set(metadataSection, expressions);
  } else {
    cell.model.setMetadata(metadataSection, expressions);
  }
}

export function deleteUserExpressions(cell: IMySTMarkdownCell | Cell) {
  if (!cell) {
    return;
  }
  if (!cell.model.setMetadata) {
    // this is JupyterLab 3.6
    (cell.model.metadata as any).delete(metadataSection);
  } else {
    cell.model.deleteMetadata(metadataSection);
  }
}

export interface IUserExpressionMetadata extends PartialJSONObject {
  expression: string;
  result: IExpressionResult;
}

export interface IUserExpressionsMetadata extends PartialJSONObject {
  [metadataSection]: IUserExpressionMetadata[];
}
