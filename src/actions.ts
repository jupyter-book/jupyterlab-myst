import { ISessionContext } from '@jupyterlab/apputils';
import { Cell } from '@jupyterlab/cells';
import { KernelMessage } from '@jupyterlab/services';
import { JSONObject } from '@lumino/coreutils';
import { IExpressionResult } from './userExpressions';
import {
  IUserExpressionMetadata,
  getUserExpressions,
  setUserExpressions,
  deleteUserExpressions
} from './metadata';
import {
  INotebookTracker,
  Notebook,
  NotebookPanel
} from '@jupyterlab/notebook';
import { IMySTMarkdownCell } from './types';
import { selectAll } from 'unist-util-select';

function isMySTMarkdownCell(cell: Cell): cell is IMySTMarkdownCell {
  return cell.model.type === 'markdown';
}

/**
 * Load user expressions for given XMarkdown cell from kernel.
 * Store results in cell attachments.
 */
export async function executeUserExpressions(
  cell: IMySTMarkdownCell,
  sessionContext: ISessionContext
): Promise<IUserExpressionMetadata[]> {
  // Check we have a kernel
  const kernel = sessionContext.session?.kernel;
  if (!kernel) {
    throw new Error('Session has no kernel.');
  }

  const mdast = cell.mystModel?.mdast ?? {};
  const expressions = selectAll('inlineExpression', mdast).map(
    node => (node as any).value
  );
  // Build ordered map from string index to node
  const namedExpressions = new Map(
    expressions.map((expr, index) => [`${index}`, expr])
  );
  console.debug('Executing named expressions', namedExpressions);
  // No expressions!
  if (namedExpressions.size == 0) {
    return Promise.resolve([]);
  }

  // Extract expression values
  const userExpressions: JSONObject = {};
  namedExpressions.forEach((expr, key) => {
    userExpressions[key] = expr;
  });

  // Populate request data
  const content: KernelMessage.IExecuteRequestMsg['content'] = {
    code: '',
    user_expressions: userExpressions
  };

  return new Promise<IUserExpressionMetadata[]>((resolve, reject) => {
    // Perform request
    console.debug('Performing kernel request', content);
    const future = kernel.requestExecute(content, false);

    // Set response handler
    future.onReply = (msg: KernelMessage.IExecuteReplyMsg) => {
      console.debug('Handling kernel response', msg);
      // Only work with `ok` results
      const content = msg.content;
      if (content.status !== 'ok') {
        return reject('Kernel response was not OK');
      }

      // Store results as metadata
      const expressions: IUserExpressionMetadata[] = [];
      for (const key in content.user_expressions) {
        const expr = namedExpressions.get(key);

        if (expr === undefined) {
          return reject(
            "namedExpressions doesn't have key. This should never happen"
          );
        }
        const result = content.user_expressions[key] as IExpressionResult;

        const expressionMetadata: IUserExpressionMetadata = {
          expression: expr,
          result: result
        };
        expressions.push(expressionMetadata);
      }

      return resolve(expressions);
    };
  });
}

export async function notebookCellExecuted(
  notebook: Notebook,
  cell: Cell,
  tracker: INotebookTracker
): Promise<void> {
  console.debug('Executing cell, expressions', getUserExpressions(cell));
  // Find the Notebook panel
  const panel = tracker.find((w: NotebookPanel) => {
    return w.content === notebook;
  });
  // Retrieve the kernel context
  const ctx = panel?.sessionContext;
  if (ctx === undefined) {
    return;
  }
  // Load the user expressions for the given cell.
  if (!isMySTMarkdownCell(cell)) {
    return;
  }
  console.debug(`Markdown cell ${cell.model.id} was executed`);

  await cell.updateFragmentMDAST();

  // Trust cell!
  const expressions = await executeUserExpressions(cell, ctx);
  console.debug('Handling evaluated user expressions', expressions);
  if (expressions.length) {
    console.debug(
      'Setting metadata, before:',
      getUserExpressions(cell),
      'after:',
      expressions
    );
    setUserExpressions(cell, expressions);
  } else {
    deleteUserExpressions(cell);
  }
  cell.model.trusted = true;
}
