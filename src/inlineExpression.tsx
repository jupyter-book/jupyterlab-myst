import React, { useRef, useEffect, useMemo } from 'react';
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
  // Create a single RenderedExpression when the rendermime is available
  const renderer = useMemo<RenderedExpression | undefined>(() => {
    return new RenderedExpression({
      expression: expressionMetadata.expression,
      trusted,
      rendermime,
      safe: 'any'
    });
  }, [rendermime]);

  // Attach and render the widget when the expression result changes
  useEffect(() => {
    if (!ref.current || !renderer || !expressionMetadata) {
      console.debug('Exit MIMEBundleRenderer renderer: missing state');
      return;
    }
    if (!renderer.isAttached) {
      Widget.attach(renderer, ref.current);
      console.debug(
        `Attached expression renderer for \`${expressionMetadata.expression}\` to parent widget`,
        renderer,
        ref.current
      );
    }
    renderer.renderExpression(expressionMetadata.result);
  }, [ref, renderer, expressionMetadata]);

  // Clean up the renderer when the component is removed from the dom
  useEffect(() => {
    if (!ref.current || !renderer || !expressionMetadata) {
      console.debug(
        `Cannot dispose of expression renderer for \`${expressionMetadata.expression}\`: missing state`
      );
      return;
    }
    return () => {
      console.log(
        `Disposing of expression renderer for \`${expressionMetadata.expression}\``,
        renderer,
        ref.current
      );
      renderer.dispose();
    };
  }, [renderer]);
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
  console.log('Rendering inline:', expressions);

  // Find the expressionResult that is for this node
  const expressionMetadata = expressions?.find(p => p.expression === value);
  const mimeBundle = expressionMetadata?.result.data as
    | Record<string, string>
    | undefined;

  if (!expressionMetadata) {
    console.log('No metadata for', value);
    return <code>{value}</code>;
  }

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
    console.log('Error for', value, expressionMetadata.result);
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
