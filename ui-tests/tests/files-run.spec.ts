// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect, galata, test } from '@jupyterlab/galata';
import * as path from 'path';
import { globSync } from 'glob';

const FACTORY = 'Markdown Preview';
// test.use({ tmpPath: 'notebook-run-test' });

const files = globSync('files/*.md', { cwd: __dirname });

for (const file of files) {
  const fileName = path.basename(file);
  test.describe.serial(`File Run: ${file}`, () => {
    test.beforeEach(async ({ request, page, tmpPath }) => {
      const contents = galata.newContentsHelper(request, page);
      await contents.uploadFile(
        path.resolve(__dirname, file),
        `${tmpPath}/${fileName}`
      );
    });

    test('View Markdown file and render result', async ({ page, tmpPath }) => {
      const filePath = `${tmpPath}/${fileName}`;
      await page.filebrowser.open(filePath, FACTORY);

      const name = path.basename(filePath);
      await page.activity.getTab(name);

      const panel = await page.activity.getPanel(name);

      expect(await panel!.screenshot()).toMatchSnapshot();
    });
  });
}
