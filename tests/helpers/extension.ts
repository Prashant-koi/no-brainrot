import { chromium, BrowserContext, Page } from "@playwright/test";
import { time } from "console";
import path from "path";
import { URL } from "url";

export async function launchExtension() {
    const pathToExtension = path.join(__dirname, '..', 'dist');
    const context = await chromium.launchPersistentContext('', {
        headless: false,
        args: [
            `disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
        ]
    });

    const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', {timeout: 20000}));
    const extensionId = new URL(sw.url()).hostname;

    const gotoPopup = async (): Promise<Page> => {
        const page = await context.newPage();
        await page.goto(`chrome-extension://${extensionId}/popup.html`);
        return page;
    };

    const gotoDashboard = async (): Promise<Page> => {
        const page = await context.newPage();
        await page.goto(`chrome-extension://${extensionId}/dashboard.html`);
        return page;
    };

    return {context, gotoPopup, gotoDashboard};


}