# Contributing

Thanks for helping improve No Brainrot. This project is a TypeScript browser extension that blocks short-form content, tracks time spent on social sites, and exposes popup and dashboard UI for users.

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Build the extension into `dist/`:

   ```sh
   npm run build
   ```

3. For local development, run the watcher:

   ```sh
   npm run watch
   ```

4. Load the extension manually in a Chromium-based browser:

   - Open the browser extensions page.
   - Enable developer mode.
   - Choose "Load unpacked".
   - Select the generated `dist/` directory.

Use `npm run build:prod` when you need a production-mode build.

## Testing

Run the Playwright extension tests with:

```sh
npx playwright test --project=brave-no-brainrot
```

The Brave project in `playwright.config.ts` expects Brave at `/usr/bin/brave` and loads the built extension from `dist/`. Run `npm run build` before Playwright tests so the latest source is copied and bundled.

Some blocker behavior depends on third-party pages, extension redirects, or browser-extension APIs. Add Playwright tests when possible, especially for popup, dashboard, settings, and stable extension-page flows. If a redirect or third-party page behavior cannot be covered reliably, document the manual test steps in the PR instead.

## Application Layout

- `public/` contains the extension manifest, icons, screenshots, and other static assets copied into `dist/`.
- `src/background/` contains the Manifest V3 service worker and background services.
- `src/background/services/TimeTracker.ts` handles time tracking behavior.
- `src/content/` contains the content script loaded onto supported social media sites.
- `src/content/blockers/` contains site-specific short-form content blockers for YouTube, Instagram, Facebook, and TikTok.
- `src/popup/` contains the extension popup HTML and TypeScript entry point.
- `src/dashboard/` contains the dashboard HTML, styles, entry point, tabs, chart helpers, history helpers, settings helpers, and time utilities.
- `src/types/` contains shared TypeScript types.
- `tests/` contains Playwright tests.
- `tests/helpers/extension.ts` contains helpers for launching the built extension and opening popup/dashboard pages.
- `webpack.config.js` defines the extension bundle entry points and copies static HTML/assets into `dist/`.
- `playwright.config.ts` defines browser test projects, including the extension-loaded Brave project.

## Making Code Changes

- Keep PRs small and focused. Prefer one feature, bug fix, or refactor per PR.
- Avoid unrelated cleanup in the same PR. It makes behavior changes harder to review.
- Manually test every code change before opening a PR.
- Add or update Playwright tests when possible. If tests are not practical, explain why and include manual verification steps.
- Run `npm run build` before submitting.
- For UI changes, test the popup and dashboard directly through the loaded extension, not only by inspecting source files.
- For blocker changes, test the relevant supported site and make sure non-short-form features still work where applicable.
- For time-tracking changes, test storage, tracked-domain settings, and dashboard display behavior.
- Keep TypeScript types current when changing shared data shapes or Chrome storage values.
- Do not commit generated reports such as `playwright-report/` or `test-results/`.

## Pull Request Checklist

Before opening a PR, verify:

- The change is narrowly scoped.
- `npm run build` passes.
- Relevant Playwright tests were added or updated where possible.
- Existing relevant Playwright tests pass.
- Manual testing was completed.
- The PR description explains what changed, why it changed, and how it was tested.
- Any skipped automated coverage is explained, especially for redirects or third-party-page behavior.

## Reporting Issues

When reporting a bug, include:

- The browser and operating system.
- The affected site or extension page.
- Steps to reproduce.
- Expected behavior.
- Actual behavior.
- Screenshots or screen recordings when UI behavior is involved.

For blocker bugs, include the exact page URL pattern when possible. For dashboard or popup bugs, include any relevant settings or stored data conditions.
