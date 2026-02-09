import { test, expect, chromium, BrowserContext, Page } from '@playwright/test';
import path from 'path';

test.describe('Popup', () => {
  let context: BrowserContext;
  let page: Page;
  let extensionId: string;

  test.beforeAll(async () => {
    const pathToExtension = path.join(__dirname, '..', 'dist');

    context = await chromium.launchPersistentContext('', {
      headless: false,
      args:[
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });

    const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 20000 }));
    extensionId = new URL(sw.url()).hostname;

    page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('renders popup shell', async () => {
    await expect(page.getByText('No Brainrot')).toBeVisible();
    await expect(page.getByRole('button', { name: /Open Dashboard/i })).toBeVisible();
  });
});