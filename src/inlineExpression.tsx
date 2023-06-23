import React, { useEffect, useRef, useState } from 'react';
import { useUserExpressions } from './UserExpressionsProvider';
import { SingletonLayout, Widget } from '@lumino/widgets';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import {
  IExpressionError,
  IExpressionResult,
  isError,
  isOutput
} from './userExpressions';
import { IUserExpressionMetadata } from './metadata';

export interface IRenderedExpressionOptions {
  expression: string;
  trusted: boolean;
  rendermime: IRenderMimeRegistry;
  safe?: 'ensure' | 'prefer' | 'any';
}

export class RenderedExpressionError extends Widget {
  constructor() {
    super();
    this.addClass('myst-RenderedExpressionError');
  }
}

export class RenderedExpression extends Widget {
  readonly expression: string;
  readonly trusted: boolean;
  readonly rendermime: IRenderMimeRegistry;
  readonly safe?: 'ensure' | 'prefer' | 'any';

  constructor(options: IRenderedExpressionOptions) {
    super();

    this.trusted = options.trusted;
    this.expression = options.expression;
    this.rendermime = options.rendermime;
    this.safe = options.safe;

    this.addClass('myst-RenderedExpression');

    // We can only hold one renderer at a time
    const layout = (this.layout = new SingletonLayout());
    layout.widget = new RenderedExpressionError();
  }

  renderExpression(payload: IExpressionResult): Promise<void> {
    const layout = this.layout as SingletonLayout;

    if (!layout) {
      console.error('Our layout is already disposed!!');
      return Promise.resolve();
    }

    if (this.isDisposed) {
      console.error('Our layout is already disposed!!');
      return Promise.resolve();
    }

    let options: any;
    if (isOutput(payload)) {
      // Output results are simple to reinterpret
      options = {
        trusted: this.trusted,
        data: payload.data,
        metadata: payload.metadata
      };
    } else {
      // Errors need to be formatted as stderr objects
      // Note, this may no longer be necessary as errors are explicitly rendered
      options = {
        data: {
          'application/vnd.jupyter.stderr':
            payload.traceback.join('\n') ||
            `${payload.ename}: ${payload.evalue}`
        }
      };
    }

    // Invoke MIME renderer
    const model = this.rendermime.createModel(options);

    // Select preferred mimetype for bundle
    const mimeType = this.rendermime.preferredMimeType(model.data, this.safe);
    if (mimeType === undefined) {
      console.error("Couldn't find mimetype for ", model);

      // Create error
      layout.widget = new RenderedExpressionError();
      return Promise.resolve();
    }

    // Create renderer
    const renderer = this.rendermime.createRenderer(mimeType);
    layout.widget = renderer;
    console.assert(renderer.isAttached, 'renderer was not attached!', renderer);
    // Render model
    return renderer.renderModel(model);
  }
}

function PlainTextRenderer({ content }: { content: string }) {
  content = content.replace(/^(["'])(.*)\1$/, '$2');
  return <span>{content}</span>;
}

/**
 * The `ErrorRenderer` does a slightly better job of showing errors inline than Jupyter's widget view.
 */
function ErrorRenderer({ error }: { error: IExpressionError }) {
  return (
    <span
      className="text-black p-2"
      data-mime-type="application/vnd.jupyter.stderr"
      style={{
        backgroundColor: 'var(--jp-rendermime-error-background, #F9DEDE)',
        fontFamily: 'var(--jp-code-font-family, monospace)',
        fontSize: 'var(--jp-code-font-size)'
      }}
    >
      <span className="text-[#e75c58]">{error.ename}</span>: {error.evalue}
    </span>
  );
}

function MIMEBundleRenderer({
  rendermime,
  trusted,
  expressionMetadata
}: {
  rendermime: IRenderMimeRegistry;
  trusted: boolean;
  expressionMetadata: IUserExpressionMetadata;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [renderer, setRenderer] = useState<RenderedExpression | undefined>(
    undefined
  );

  // Create renderer
  useEffect(() => {
    console.debug(
      `Creating inline renderer for  \`${expressionMetadata.expression}\``
    );
    const thisRenderer = new RenderedExpression({
      expression: expressionMetadata.expression,
      trusted,
      rendermime,
      safe: 'any'
    });
    setRenderer(thisRenderer);

    return () => {
      if (thisRenderer.isAttached && !thisRenderer.node.isConnected) {
        console.error(
          `Could not dispose of renderer for \`${expressionMetadata.expression}\`: node is not connected`
        );
      } else {
        thisRenderer.dispose();
      }
    };
  }, [rendermime, expressionMetadata]);

  // Attach when ref changes
  useEffect(() => {
    const thisRenderer = renderer;
    if (!ref.current || !thisRenderer) {
      console.debug(
        `Cannot attach expression renderer for \`${expressionMetadata.expression}\``
      );
      return;
    }
    if (thisRenderer.isAttached) {
      console.error(
        `Expression renderer for \`${expressionMetadata.expression}\` is already attached to another node`
      );
    }
    Widget.attach(thisRenderer, ref.current);
    console.debug(
      `Attached expression renderer for \`${expressionMetadata.expression}\` to parent widget`
    );

    return () => {
      // Widget may also be detached through disposal above
      if (thisRenderer.isAttached && !thisRenderer.node.isConnected) {
        console.error(
          `Unable to detach expression renderer for \`${expressionMetadata.expression}\`: node is not connected`
        );
      } else if (thisRenderer.isAttached) {
        console.debug(
          `Detaching expression renderer for \`${expressionMetadata.expression}\``
        );
        Widget.detach(thisRenderer);
      }
    };
  }, [ref, renderer]);

  // Attach and render the widget when the expression result changes
  useEffect(() => {
    if (!renderer || !expressionMetadata) {
      console.debug(
        `Cannot render expression \`${expressionMetadata.expression}\``
      );
      return;
    }
    renderer.renderExpression(expressionMetadata.result);
  }, [renderer, expressionMetadata]);

  console.debug(
    `Rendering MIME bundle for expression: '${expressionMetadata.expression}'`
  );
  return <div ref={ref} className="not-prose inline-block" />;
}

export function InlineRenderer({ value }: { value?: string }): JSX.Element {
  const { expressions, rendermime, trusted } = useUserExpressions();

  if (!expressions || !rendermime) {
    return <code>{value}</code>;
  }

  // Find the expressionResult that is for this node
  const expressionMetadata = expressions?.find(p => p.expression === value);
  const mimeBundle = expressionMetadata?.result.data as
    | Record<string, string>
    | undefined;

  console.debug(
    `Rendering \`${value}\` inline ${trusted ? 'with' : 'without'} trust`
  );
  if (!expressionMetadata) {
    console.debug('No metadata for', value);
    return <code>{value}</code>;
  }

  console.debug(`Using MIME bundle for \`${value}\``, mimeBundle);

  // Explicitly render text/plain
  const preferred = rendermime.preferredMimeType(
    mimeBundle ?? {},
    trusted ? 'any' : 'ensure'
  );
  if (preferred === 'text/plain') {
    return <PlainTextRenderer content={mimeBundle?.['text/plain'] as string} />;
  }
  // Explicitly render errors
  if (isError(expressionMetadata.result)) {
    console.debug('Error for', value, expressionMetadata.result);
    return <ErrorRenderer error={expressionMetadata.result} />;
  }

  return (
    <MIMEBundleRenderer
      rendermime={rendermime}
      trusted={!!trusted}
      expressionMetadata={expressionMetadata}
    ></MIMEBundleRenderer>
  );
}
