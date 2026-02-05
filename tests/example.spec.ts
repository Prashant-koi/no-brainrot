import { test, expect, chromium, BrowserContext, Page } from '@playwright/test';
import path from 'path';

test.describe('Extension Tests', () => {
  let context: BrowserContext | undefined;
  let page: Page | undefined;

  test.beforeAll(async () => {
    //we will point to the built extension for the test
    //need to run 'npm run build' or 'npm run watch' first
    const pathToExtension = path.join(__dirname, '..','dist');

    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });

    // Wait for the extension service worker and derive the ID
    const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    const extensionId = new URL(sw.url()).hostname;

    page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/dashboard.html`);
  });

  test.afterAll(async () => {
    if (context) await context.close();
  });

  //more tests below

  test('renders dashboard shell', async () => {
    if (!page) throw new Error('page not initialized');
    await expect(page.getByText('No Brainrot')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible();
  });

});
