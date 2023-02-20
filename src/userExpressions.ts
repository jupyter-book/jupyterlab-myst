import { PartialJSONObject } from '@lumino/coreutils';

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
