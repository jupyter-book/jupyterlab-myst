// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect, galata, test } from '@jupyterlab/galata';
import * as path from 'path';
import { globSync } from 'glob';

// test.use({ tmpPath: 'notebook-run-test' });

const files = globSync('notebooks/*.ipynb', { cwd: __dirname });

for (const file of files) {
  test.describe.serial(`Notebook Run: ${file}`, () => {
    const fileName = path.basename(file);
    test.beforeEach(async ({ request, page, tmpPath }) => {
      const contents = galata.newContentsHelper(request, page);
      await contents.uploadFile(
        path.resolve(__dirname, file),
        `${tmpPath}/${fileName}`
      );
    });

    test('Run Notebook and capture cell outputs', async ({ page, tmpPath }) => {
      await page.notebook.openByPath(`${tmpPath}/${fileName}`);
      await page.notebook.activate(fileName);

      await page.notebook.run();

      const nbPanel = await page.notebook.getNotebookInPanel();

      expect(await nbPanel!.screenshot()).toMatchSnapshot();
    });
  });
}
