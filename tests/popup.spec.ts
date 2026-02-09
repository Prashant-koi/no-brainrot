import {test, expect, BrowserContext, Page} from '@playwright/test';
import { launchExtension } from './helpers/extension';

test.describe('Popup', () => {
  let context: BrowserContext | undefined;
  let gotoPopup: () => Promise<Page>;

  test.afterEach(async () => {
    await context?.close();
  });

  test('renders title and dashboard CTA', async () => {
    ({context, gotoPopup} = await launchExtension());
    const page = await gotoPopup();
    await expect(page.getByTestId('popup-title')).toHaveText(/No Brainrot/);
    await expect(page.getByTestId('popup-open-dashboard')).toBeVisible();
  });

  test('shows analytics only when data exists',  async () => {
    ({context, gotoPopup} = await launchExtension());
    const page = await gotoPopup();
    await page.evaluate(() => {
      localStorage.setItem('analytics', JSON.stringify({todayMinutes: 42}));
    });
    await page.reload();
    await expect(page.getByTestId('popup-analytics-today')).toContainText('42');
  });
  
})