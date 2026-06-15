import type { Root } from 'myst-spec';
import type { AnyWidget } from 'myst-spec-ext';
import { selectAll } from 'unist-util-select';
import { IRenderMime } from '@jupyterlab/rendermime';

type Options = {
  resolver: IRenderMime.IResolver | undefined;
};

export async function anywidgetUrlSourceTransform(
  tree: Root,
  opts: Options
): Promise<void> {
  const resolver = opts.resolver;
  if (!resolver) {
    return;
  }
  const widgets = selectAll('anywidget', tree) as AnyWidget[];
  await Promise.all(
    widgets.map(async widget => {
      if (!widget) {
        return;
      }
      console.log({ widget });

      await Promise.allSettled([
        (async () => {
          console.log({ widget });
          const path = await resolver.resolveUrl(widget.esm);
          if (!path) {
            return;
          }
          const url = await resolver.getDownloadUrl(path);
          if (!url) {
            return;
          }
          widget.esm = url;
        })(),
        (async () => {
          if (widget.css === undefined) {
            return;
          }
          const path = await resolver.resolveUrl(widget.css);
          if (!path) {
            return;
          }
          const url = await resolver.getDownloadUrl(path);
          if (!url) {
            return;
          }
          widget.css = url;
        })()
      ]);
    })
  );
}
