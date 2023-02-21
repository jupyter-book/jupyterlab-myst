import type { MySTMarkdownCell } from './MySTMarkdownCell';
import { PartialJSONObject } from '@lumino/coreutils';
import { IExpressionResult } from './userExpressions';

export const metadataSection = 'user_expressions';

export function getUserExpressions(
  cell?: MySTMarkdownCell
): IUserExpressionMetadata[] | undefined {
  const metadata = cell?.model.metadata.get(metadataSection) as
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
