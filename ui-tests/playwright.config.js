/**
 * Configuration for Playwright using default from @jupyterlab/galata
 */
const baseConfig = require('@jupyterlab/galata/lib/playwright-config');

module.exports = {
  ...baseConfig,
  use: {
    ...baseConfig.use,
    baseURL: process.env.TARGET_URL ?? 'http://127.0.0.1:9999'
  },
  webServer: {
    command: 'jlpm start',
    url: 'http://localhost:9999/lab',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI
  }
};
