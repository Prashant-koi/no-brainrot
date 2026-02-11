import {test, expect, BrowserContext, Page} from '@playwright/test';
import { launchExtension } from './helpers/extension';
import { getDiffieHellman } from 'crypto';

test.describe('Dashboard', () => {
    let context: BrowserContext | undefined;

    test.afterAll(async () => {
        await context?.close();
    });

    test('renders and defaults to Home tab', async () => {
        const {context: ctx, gotoDashboard: goto} = await launchExtension();
        context = ctx;
        const page = await goto();

        await expect(page.getByTestId('dashboard-title')).toBeVisible();
        await expect(page.getByTestId('tab-home')).toHaveAttribute('aria-selected','true');
        await expect(page.getByTestId('home-analytics')).toBeVisible();
    })

    test('Blocker settings toggle works', async () => {
        const {context: ctx, gotoDashboard: goto} = await launchExtension();
        context = ctx;
        const page = await goto();

        await page.getByTestId('tab-blocker').click();
        const toggle = page.getByTestId('blocker-toggle');
        const initial = await toggle.getAttribute('aria-checked');
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-checked', initial === 'true'? 'false':'true');
    });

    test ('Tracker settings add site function and toggle function', async () => {
        const {context: ctx, gotoDashboard: goto} = await launchExtension();
        context = ctx;
        const page = await goto();

        await page.getByTestId('tab-tracker').click();
        await page.getByTestId('tracker-add-input').fill('example.com');
        await page.getByTestId('tracker-add-submit').click();
        await expect(page.getByTestId('tracker-list')).toContainText('example.com');
        const toggle = page.getByTestId('tracker-toggle');
        const initial = await toggle.getAttribute('aria-checked');
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-checked', initial === 'true'? 'false':'true');
        
    })
})