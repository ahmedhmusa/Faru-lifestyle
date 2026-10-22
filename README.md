# Faru Finance — GitHub Pages PWA

An installable, mobile-first finance tracker for Personal, Faru Lifestyle and VeyruKeyolhu.
Includes Liquid Glass-inspired styling, Light/Dark/System appearance, accounts, transfers,
budgets, savings goals, dedicated Savings accounts, detailed Travel tracking, reports,
CSV exports and JSON backups.

## Deploy to GitHub Pages (no build step)

1. Extract this ZIP.
2. Create a GitHub repository, for example `faru-finance`.
3. Upload the CONTENTS of this extracted folder to the repository's `main` branch.
   `index.html` must be at the repository root, beside `app.js`, `sw.js`, and the other files.
   Do not upload only the ZIP or place the app inside an extra folder.
4. In the repository, open **Settings → Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Choose **main** and **/(root)**, then **Save**.
7. Wait for deployment to complete. Open the HTTPS address shown in Pages settings.
   For a project repository, this is normally `https://YOUR-USERNAME.github.io/faru-finance/`.

The package uses relative paths so it works both under a repository subfolder and at a domain root.
Keep the trailing slash in the website's address. No API keys, npm install, server, or database are needed.

GitHub's official guide:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Install on your phone

- iPhone/iPad: open the deployed HTTPS website in Safari, tap Share, then Add to Home Screen.
- Android: open in Chrome and use Install app / Add to Home screen.
- An Install control and platform instructions are included in the app.

## Offline use and updates

Open the deployed app online once and let its service worker finish caching all app files.
Then it can reopen and record transactions offline. If the browser clears site storage,
open it online again and restore your latest backup if necessary.

To test: open online, close the app, enable airplane mode and reopen it.
For updates, replace the edited files AND bump `VERSION` in `sw.js`.
A new release is cached in full; close every Faru tab/window and reopen to activate it.
The update notice does not force a reload or interrupt an open form.

## Move your existing records

1. In your original Faru Finance app, open More → Settings & backups.
2. Download the full JSON backup.
3. Open your new GitHub Pages app, then More → Settings & backups → Restore a backup.
4. Select the saved JSON file and confirm replacement of the new app's records.
5. Check account balances and trips. Export regular backups from your new installation.

The ZIP contains app code and optional demo data, not your personal transactions.
A different website address or browser has separate records. There is no automatic sync.
The package namespaces its records by site path, keeping separate GitHub project apps apart.

## Privacy and hosting

This standalone app has no login or server-side authentication. The previous hosted Site's
owner-only access does NOT transfer to GitHub Pages. Treat a normal GitHub Pages deployment
as a publicly reachable app interface. Your records stay in your browser's local storage;
they are not sent to GitHub or included in this repository. They are not encrypted by the app,
and anyone using the same browser profile can open them. Do not upload JSON backups or
personal financial exports to the repository. A private repository alone is not an app login.

## Savings and travel

Savings uses real accounts marked Savings. Deposit/withdraw transfers move money between
same-currency accounts and do not count as income or spending. Goals are separate progress trackers.
Travel lets you create trips with dates, destination, budget and space. Add expenses by category,
merchant, date and payment account. Each expense is recorded once in the main ledger.
Trips use MVR or USD; optional original currency/price fields preserve foreign receipts.
Prices entered in another currency are converted automatically (see below); you can still adjust
the amount to match what your bank actually charged.

## Automatic currency conversion

When adding a transaction or travel expense, open "In another currency? Convert automatically",
enter a currency code (e.g. THB, EUR, INR) and the original price. The amount in the account or trip
currency (MVR/USD) fills in instantly. Rates come from open.er-api.com (free, no API key), refresh
every 6 hours while online, and are cached on the device so conversion keeps working offline.
Before the first online load, a built-in approximate USD/MVR rate (15.42) is used. The original
currency and amount are saved with the transaction and included in CSV exports.

## Current limits

No cloud sync, bank connections, push reminders or native iOS widgets are included.
All accounting is manual and local. Use export/restore for migration and backup.

## Local development

Serve this folder with a static server, for example `python3 -m http.server 8080`, then open
`http://localhost:8080/`. Do not open index.html directly as a file; service workers need
HTTPS or localhost. Financial logic and package paths were checked before export.
Actual GitHub deployment and on-phone/offline browser testing have not been performed.
