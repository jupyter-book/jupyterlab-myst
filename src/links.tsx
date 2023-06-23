import React from 'react';
import type { Plugin } from 'unified';
import type { Root, Link } from 'myst-spec';
import { selectAll } from 'unist-util-select';
import { URLExt } from '@jupyterlab/coreutils';
import type { LinkProps } from '@myst-theme/providers';
import { IRenderMime } from '@jupyterlab/rendermime';

/**
 * Handle an anchor node.
 * NOTE: This is copied from @jupyterlab/rendermime renderers.ts
 * ideally this should be removed and exported from there?
 */
function handleAnchor(
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
    return Promise.resolve(undefined);
  }
  // Remove the hash until we can handle it.
  const hash = anchor.hash;
  if (hash) {
    // Handle internal link in the file.
    if (hash === href) {
      anchor.target = '_self';
      return Promise.resolve(undefined);
    }
    // For external links, remove the hash until we have hash handling.
    href = href.replace(hash, '');
  }
  // Get the appropriate file path.
  return resolver
    .resolveUrl(href)
    .then(urlPath => {
      // decode encoded url from url to api path
      const path = decodeURIComponent(urlPath);
      // Handle the click override.
      if (linkHandler) {
        linkHandler.handleLink(anchor, path, hash);
      }
      // Get the appropriate file download path.
      return resolver.getDownloadUrl(urlPath);
    })
    .then(url => {
      // Set the visible anchor.
      anchor.href = url + hash;
    })
    .catch(err => {
      // If there was an error getting the url,
      // just make it an empty link.
      anchor.href = '';
    });
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
  links.forEach(async link => {
    if (!link || !link.url) return;
    const resolver = opts.resolver;
    const isLocal = resolver?.isLocal
      ? resolver.isLocal(link.url)
      : URLExt.isLocal(link.url);
    if (isLocal) (link as any).internal = true;
  });
}

export const internalLinksPlugin: Plugin<[Options], Root, Root> =
  opts => tree => {
    internalLinksTransform(tree, opts);
  };
