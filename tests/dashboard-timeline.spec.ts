import {test, expect, BrowserContext, Page} from '@playwright/test';
import { launchExtension } from './helpers/extension';

test.describe('Timeline Tests', () => {
    let context: BrowserContext | undefined;

    test.afterEach(async () => {
        await context?.close();
    });

    test('renders timeline entries from storage', async () => {
        const {context: ctx, gotoDashboard} = await launchExtension();
        context = context;
        const page = await gotoDashboard();

        await page.evaluate(() => {
            localStorage.setItem('timeline', JSON.stringify([
                {site: 'example.com', minutes: 5, ts: Date.now()},
            ]))
        });

        await page.reload();
        await expect(page.getByTestId('timeline-list')).toContainText('example.com');
        await expect(page.getByTestId('timeline-list')).toContainText('5');
    })
})