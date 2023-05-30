import type { Image, Root } from 'myst-spec';
import { selectAll } from 'unist-util-select';
import { IRenderMime } from '@jupyterlab/rendermime';
import { MarkdownCell } from '@jupyterlab/cells';
import { AttachmentsResolver } from '@jupyterlab/attachments';

type Options = {
  resolver: IRenderMime.IResolver | null;
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
      const resolver = new AttachmentsResolver({
        parent: opts.resolver ?? undefined,
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
