import React from 'react';
import type { Root, Link } from 'myst-spec';
import { selectAll } from 'unist-util-select';
import { URLExt } from '@jupyterlab/coreutils';
import type { LinkProps } from '@myst-theme/providers';
import { IRenderMime } from '@jupyterlab/rendermime';
import { updateLinkTextIfEmpty } from 'myst-transforms';

/**
 * Handle an anchor node.
 * Originally from @jupyterlab/rendermime renderers.ts
 */
async function handleAnchor(
  anchor: HTMLAnchorElement,
  resolver: IRenderMime.IResolver,
  linkHandler: IRenderMime.ILinkHandler | undefined
): Promise<void> {
  // Get the link path without the location prepended.
  // (e.g. "./foo.md#Header 1" vs "http://localhost:8888/foo.md#Header 1")
  let href = anchor.getAttribute('href') || '';
  const isLocal = resolver.isLocal
    ? resolver.isLocal(href)
    : URLExt.isLocal(href);
  // Bail if it is not a file-like url.
  if (!href || !isLocal) {
    return;
  }
  // Remove the hash until we can handle it.
  const hash = anchor.hash;
  if (hash) {
    // Handle internal link in the file.
    if (hash === href) {
      anchor.target = '_self';
      return;
    }
    // For external links, remove the hash until we have hash handling.
    href = href.replace(hash, '');
  }
  try {
    // Get the appropriate file path.
    const urlPath = await resolver.resolveUrl(href);
    // decode encoded url from url to api path
    const path = decodeURIComponent(urlPath);
    // Handle the click override.
    if (linkHandler) {
      linkHandler.handleLink(anchor, path, hash);
    }
    // Get the appropriate file download path.
    const url = await resolver.getDownloadUrl(urlPath);
    // Set the visible anchor.
    anchor.href = url + hash;
  } catch (error) {
    // If there was an error getting the url,
    // just make it an empty link.
    anchor.href = '';
  }
}

export const linkFactory =
  (
    resolver: IRenderMime.IResolver | undefined,
    linkHandler: IRenderMime.ILinkHandler | undefined
  ) =>
  (props: LinkProps): JSX.Element => {
    const ref = React.useRef<HTMLAnchorElement>(null);
    const { to: url } = props;
    React.useEffect(() => {
      if (!ref || !ref.current || !resolver) return;
      handleAnchor(ref.current, resolver, linkHandler);
    }, [ref, url]);
    return (
      <a href={url} ref={ref} className={props.className}>
        {props.children}
      </a>
    );
  };

type Options = {
  resolver: IRenderMime.IResolver | undefined;
};

/**
 * Use the resolver to mark links as internal so they can be handled differently in the UI
 */
export async function internalLinksTransform(
  tree: Root,
  opts: Options
): Promise<void> {
  const links = selectAll('link,linkBlock', tree) as Link[];
  await Promise.all(
    links.map(async link => {
      if (!link || !link.url) return;
      const resolver = opts.resolver;
      const href = link.url;
      updateLinkTextIfEmpty(link, href);
      const isLocal = resolver?.isLocal
        ? resolver.isLocal(href)
        : URLExt.isLocal(href);
      if (!isLocal) return;
      if (!resolver) return;
      if ((link as any).static) {
        // TODO: remove hash
        const urlPath = await resolver.resolveUrl(href);
        const url = await resolver.getDownloadUrl(urlPath);
        (link as any).urlSource = href;
        link.url = url;
      } else {
        (link as any).internal = true;
      }
    })
  );
}
