import type { Image, Root } from 'myst-spec';
import { selectAll } from 'unist-util-select';
import { IRenderMime } from '@jupyterlab/rendermime';

type Options = {
  resolver: IRenderMime.IResolver | undefined;
};

export async function imageUrlSourceTransform(
  tree: Root,
  opts: Options
): Promise<void> {
  const resolver = opts.resolver;
  if (!resolver) return;
  const images = selectAll('image', tree) as Image[];
  await Promise.all(
    images.map(async image => {
      if (!image || !image.url) return;
      const path = await resolver.resolveUrl(image.url);
      if (!path) return;
      const url = await resolver.getDownloadUrl(path);
      if (!url) return;
      image.url = url;
    })
  );
}
