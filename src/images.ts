import type { Image, Root } from 'myst-spec';
import { selectAll } from 'unist-util-select';
import { AttachmentsResolver } from '@jupyterlab/attachments';

type Options = {
  resolver: AttachmentsResolver;
};

export async function imageUrlSourceTransform(
  tree: Root,
  opts: Options
): Promise<void> {
  const images = selectAll('image', tree) as Image[];
  await Promise.all(
    images.map(async image => {
      if (!image || !image.url) return;
      const path = await opts.resolver.resolveUrl(image.url);
      if (!path) return;
      const url = await opts.resolver.getDownloadUrl(path);
      if (!url) return;
      image.url = url;
    })
  );
}
