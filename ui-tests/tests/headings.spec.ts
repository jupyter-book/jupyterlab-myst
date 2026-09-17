// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect, galata, test } from '@jupyterlab/galata';
import type { Page } from '@playwright/test';
import * as path from 'path';

const MARKDOWN_PREVIEW = 'Markdown Preview';

async function upload(request: any, page: Page, tmpPath: string, name: string) {
  const contents = galata.newContentsHelper(request, page);
  await contents.uploadFile(
    path.resolve(__dirname, 'headings', name),
    `${tmpPath}/${name}`
  );
}

/**
 * Number of times the given text is rendered as a heading, counting the
 * frontmatter title block.
 */
async function headingCount(page: Page, text: string): Promise<number> {
  return page
    .locator('.myst')
    .locator('h1, h2, h3, h4, h5, h6')
    .filter({ hasText: text })
    .count();
}

test.describe('Headings', () => {
  test('shows a heading inside the first cell once', async ({
    request,
    page,
    tmpPath
  }) => {
    const name = 'heading-inside-first-cell.ipynb';
    await upload(request, page, tmpPath, name);
    await page.notebook.openByPath(`${tmpPath}/${name}`);
    await page.notebook.activate(name);
    await page.locator('.myst h2').first().waitFor();

    expect(await headingCount(page, 'Perturbation study')).toEqual(1);
    expect(await headingCount(page, 'Second section')).toEqual(1);
  });

  test('shows a heading inside a markdown file once', async ({
    request,
    page,
    tmpPath
  }) => {
    const name = 'heading-inside-file.md';
    await upload(request, page, tmpPath, name);
    await page.filebrowser.open(`${tmpPath}/${name}`, MARKDOWN_PREVIEW);
    await page.activity.getPanel(name);
    await page.locator('.myst h2').first().waitFor();

    expect(await headingCount(page, 'Perturbation study')).toEqual(1);
  });

  test('shows a leading H1 once, as the title', async ({
    request,
    page,
    tmpPath
  }) => {
    const name = 'leading-h1.ipynb';
    await upload(request, page, tmpPath, name);
    await page.notebook.openByPath(`${tmpPath}/${name}`);
    await page.notebook.activate(name);
    await page.locator('.myst h1').first().waitFor();

    expect(await headingCount(page, 'Notebook title')).toEqual(1);
    await expect(
      page.locator('#skip-to-frontmatter h1', { hasText: 'Notebook title' })
    ).toHaveCount(1);
  });

  test('shows an explicit title next to the first heading', async ({
    request,
    page,
    tmpPath
  }) => {
    const name = 'explicit-title.ipynb';
    await upload(request, page, tmpPath, name);
    await page.notebook.openByPath(`${tmpPath}/${name}`);
    await page.notebook.activate(name);
    await page.locator('.myst h1').first().waitFor();

    expect(await headingCount(page, 'Explicit title')).toEqual(1);
    expect(await headingCount(page, 'First section')).toEqual(1);
  });
});
