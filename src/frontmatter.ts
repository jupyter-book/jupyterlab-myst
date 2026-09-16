import type { FrontmatterParts } from 'myst-common';
import type { SiteAction, SiteExport } from 'myst-config';
import type { PageFrontmatter } from 'myst-frontmatter';

export type Frontmatter = Omit<PageFrontmatter, 'parts' | 'downloads'> & {
  parts?: FrontmatterParts;
  downloads?: SiteAction[];
  exports?: SiteExport[];
};

/**
 * The frontmatter to show in the frontmatter block above the content.
 *
 * `getFrontmatter` copies the first heading it finds into `title`, at any depth
 * and anywhere in the document. It removes that heading from the content only
 * when it is a leading H1; otherwise it sets `content_includes_title`. Showing
 * `title` in that case renders the heading a second time, always as an H1
 * whatever its original level.
 */
export function getDisplayFrontmatter(
  frontmatter: Frontmatter | undefined
): Frontmatter | undefined {
  if (!frontmatter?.content_includes_title) {
    return frontmatter;
  }
  return { ...frontmatter, title: undefined };
}
