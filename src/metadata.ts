import { PartialJSONObject } from '@lumino/coreutils';
import type { IMySTMarkdownCell } from './types';
import { IExpressionResult } from './userExpressions';

export const metadataSection = 'user_expressions';

export function getUserExpressions(
  cell?: IMySTMarkdownCell
): IUserExpressionMetadata[] | undefined {
  const metadata = cell?.model.getMetadata(metadataSection) as
    | IUserExpressionMetadata[]
    | undefined;
  return metadata;
}

export interface IUserExpressionMetadata extends PartialJSONObject {
  expression: string;
  result: IExpressionResult;
}

export interface IUserExpressionsMetadata extends PartialJSONObject {
  [metadataSection]: IUserExpressionMetadata[];
}
