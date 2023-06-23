import { Cell } from '@jupyterlab/cells';
import { PartialJSONObject } from '@lumino/coreutils';
import type { IMySTMarkdownCell } from './types';
import { IExpressionResult } from './userExpressions';

export const metadataSection = 'user_expressions';

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
  if (!cell) return;
  if (!cell.model.setMetadata) {
    // this is JupyterLab 3.6
    (cell.model.metadata as any).set(metadataSection, expressions);
  } else {
    cell.model.setMetadata(metadataSection, expressions);
  }
}

export function deleteUserExpressions(cell: IMySTMarkdownCell | Cell) {
  if (!cell) return;
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
