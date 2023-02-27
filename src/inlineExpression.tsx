import React, { useRef, useEffect, useMemo } from 'react';
import { useJupyterCell } from './JupyterCellProvider';
import { SingletonLayout, Widget } from '@lumino/widgets';
import { IRenderMimeRegistry, IRenderMime } from '@jupyterlab/rendermime';
import { IExpressionResult, isOutput } from './userExpressions';
import { getUserExpressions, IUserExpressionMetadata } from './metadata';
import { StaticNotebook } from '@jupyterlab/notebook';

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

function PlainTextRenderer({
  content,
  sanitizer
}: {
  content: string;
  sanitizer: IRenderMime.ISanitizer;
}) {
  content = content.replace(/^(["'])(.*)\1$/, '$2');
  content = sanitizer.sanitize(content);
  return <span>{content}</span>;
}

function MimeBundleRenderer({
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
    if (!rendermime) return undefined;
    return new RenderedExpression({
      expression: expressionMetadata.expression,
      trusted,
      rendermime,
      safe: 'any'
    });
  }, [rendermime]);

  // Attach and render the widget when the expression result changes
  useEffect(() => {
    if (!ref.current || !renderer || !expressionMetadata) return;
    if (!renderer.isAttached) Widget.attach(renderer, ref.current);
    renderer.renderExpression(expressionMetadata.result);
  }, [ref, renderer, expressionMetadata]);

  // Clean up the renderer when the component is removed from the dom
  useEffect(() => {
    if (!renderer) return;
    return () => renderer.dispose();
  }, [renderer]);

  const mimeBundle = expressionMetadata.result.data as Record<string, string>;
  const text = mimeBundle?.['text/plain'];
  console.debug(`Rendering react ${expressionMetadata.expression} = ${text}`);
  return <div ref={ref} className="not-prose inline-block" />;
}

function isPlainTextMimeBundle(mimeBundle: Record<string, string>): boolean {
  return (
    Object.keys(mimeBundle).length === 1 && mimeBundle['text/plain'] !== null
  );
}

export function InlineRenderer({ value }: { value?: string }): JSX.Element {
  const { cell } = useJupyterCell();
  // Load the information from the MystMarkdownCell
  const metadata = getUserExpressions(cell);
  const trusted = cell?.model.trusted ?? false;
  // We use the notebook rendermime directly
  const rendermime = (cell?.parent as StaticNotebook).rendermime;

  // Find the expressionResult that is for this node
  const expressionMetadata = metadata?.find(p => p.expression === value);
  const mimeBundle = expressionMetadata?.result.data as Record<string, string>;

  let element: JSX.Element;

  if (!mimeBundle || !expressionMetadata) {
    element = <code>{value}</code>;
  } else if (isPlainTextMimeBundle(mimeBundle)) {
    element = (
      <PlainTextRenderer
        content={mimeBundle['text/plain']}
        sanitizer={rendermime.sanitizer}
      ></PlainTextRenderer>
    );
  } else {
    element = (
      <MimeBundleRenderer
        rendermime={rendermime}
        trusted={trusted}
        expressionMetadata={expressionMetadata}
      ></MimeBundleRenderer>
    );
  }

  return element;
}
