import type { Root } from 'mdast';
import type { MarkdownCell } from '@jupyterlab/cells';
import { AttachmentsResolver } from '@jupyterlab/attachments';
import type { Image } from 'myst-spec';
import { selectAll } from 'unist-util-select';
import { StaticNotebook } from '@jupyterlab/notebook';

type Options = {
  cell: MarkdownCell;
};

export async function imageUrlSourceTransform(
  tree: Root,
  opts: Options
): Promise<void> {
  const images = selectAll('image', tree) as Image[];
  await Promise.all(
    images.map(async image => {
      if (!image || !image.url) return;
      const parent = (opts.cell.parent as StaticNotebook).rendermime?.resolver;
      const resolver = new AttachmentsResolver({
        parent: parent ?? undefined,
        model: opts.cell.model.attachments
      });
      const path = await resolver.resolveUrl(image.url);
      if (!path) return;
      const url = await resolver.getDownloadUrl(path);
      if (!url) return;
      image.url = url;
    })
  );
}
