import React, { useRef, useEffect, useMemo } from 'react';
import { useCellMetadata } from './cellMetadataProvider';
import { SingletonLayout, Widget } from '@lumino/widgets';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { IExpressionResult, isOutput } from './userExpressions';

export interface IRenderedExpressionOptions {
  expression: string;
  trusted: boolean;
  rendermime: IRenderMimeRegistry;
  safe?: 'ensure' | 'prefer' | 'any';
}

export class RenderedExpressionError extends Widget {
  constructor() {
    super();
    this.addClass('im-RenderedExpressionError');
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

    this.addClass('im-RenderedExpression');

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

export function InlineRenderer({ value }: { value?: string }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const { metadata, trusted, rendermime } = useCellMetadata();

  // Create a single RenderedExpression when the rendermime is available
  const renderer = useMemo<RenderedExpression | undefined>(() => {
    if (!rendermime) return undefined;
    return new RenderedExpression({
      expression: value as string,
      trusted: trusted ?? false,
      rendermime,
      safe: 'any'
    });
  }, [rendermime]);

  // Find the expressionResult that is for this node
  const expressionResult = metadata?.find(p => p.expression === value);

  // Attach and render the widget when the expression result changes
  useEffect(() => {
    if (!ref.current || !renderer || !expressionResult) return;
    console.log('attaching', value);
    if (!renderer.isAttached) {
      Widget.attach(renderer, ref.current);
    }
    console.log('Render: ', expressionResult.result);
    renderer.renderExpression(expressionResult.result);
  }, [ref, renderer, expressionResult]);

  // Clean up the renderer when the component is removed from the dom
  useEffect(() => {
    if (!renderer) return;
    return () => renderer.dispose();
  }, [renderer]);

  // TODO: improve the renderer when no result is found in the metadata
  if (!expressionResult) return <code>{value}</code>;
  const mimeBundle = expressionResult.result.data as Record<string, string>;
  const text = mimeBundle?.['text/plain'];
  console.log('Rendering react', value, '=', text);
  return <div ref={ref} className="not-prose inline-block" />;
}
