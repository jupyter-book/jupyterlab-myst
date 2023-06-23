// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect, galata, test } from '@jupyterlab/galata';
import * as path from 'path';

const fileName = 'myst_tests.ipynb';

// test.use({ tmpPath: 'notebook-run-test' });

test.describe.serial('Notebook Run', () => {
  test.beforeEach(async ({ request, page, tmpPath }) => {
    const contents = galata.newContentsHelper(request, page);
    await contents.uploadFile(
      path.resolve(__dirname, `./notebooks/${fileName}`),
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
