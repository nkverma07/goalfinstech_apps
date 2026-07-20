# Sync Guide — Update Portal (goalfinstech_apps)

This Next.js app is the **update portal** (deployed at `https://goalfinstech.app`).
It lists the apps and serves the latest version + download link for each. It does
**not** build anything — each app repo's CI pushes its new version here.

This repo can be **private** — Vercel still serves the site publicly.

Repos involved:
- `app1` = All Video Player & Saver → `<owner>/all_in_one_downloader` (private)
- `app2` = QR Scanner Barcode Reader → `<owner>/<qr-repo>` (private)
- `<owner>/app-releases` (**public**) → hosts the APK files that this portal
  links to. Download links point here, not at the private app repos.

---

## How versioning works here

The single source of truth is **`data/apps.json`**. Each entry:

```json
{
  "id": "app1",
  "name": "All Video Player & Saver",
  "icon": "/dl.jpg",
  "webUrl": "https://example.com/app1",
  "repoUrl": "https://github.com/<owner>/all_in_one_downloader",
  "version": "1.0.1+37",
  "downloadUrl": "https://github.com/<owner>/app-releases/releases/download/app1-latest/app1.apk"
}
```

- **You** set the stable fields once: `id`, `name`, `icon`, `webUrl`, `repoUrl`.
- **CI in the app repo** overwrites only `version` and `downloadUrl` on every
  release — nothing else changes.

The frontend reads this file through two API routes:

- [`pages/api/apps.js`](pages/api/apps.js) → returns the whole list for the homepage.
- [`pages/api/update.js`](pages/api/update.js) → returns latest `version` +
  `downloadUrl` for one app (used by the "Download / Update" button).

Both read `data/apps.json` fresh on each request with `Cache-Control: no-store`,
so a redeploy immediately reflects the new version.

---

## What happens on every app update

```
app repo push → CI builds APK → CI publishes APK to public app-releases repo
              → CI commits new version + downloadUrl into THIS repo's
                data/apps.json → Vercel auto-redeploys
              → homepage shows the new version and links to the new APK
```

You normally **do nothing** in this repo when a new app version ships — CI does.

---

## One-time setup (do this once)

1. **Deploy to Vercel**: import this repo at vercel.com. Every push to `main`
   (including CI's metadata commits) auto-redeploys. No env vars required.
2. **Seed `data/apps.json`**: set the correct `id`, `name`, `icon`, `webUrl`,
   `repoUrl` for each app. Leave `version`/`downloadUrl` — CI fills them.
3. **Give each app repo write access**: create a PAT with **contents: write** on
   this repo (and on the public `app-releases` repo) and add it as the
   `PUBLISH_TOKEN` secret in each app repo. That token lets CI upload the APK to
   `app-releases` and commit the metadata here.

---

## Step-by-step: when you change the portal itself

1. Edit pages/styles/`data/apps.json` (e.g. add a new app, change an icon).
2. Commit and push to `main`.
3. Vercel redeploys automatically.

## Step-by-step: adding a NEW app to the listing

1. Add a new object to `data/apps.json` with a fresh `id` (e.g. `app3`) and its
   stable fields; set `version` to `0.0.0` as a placeholder.
2. In that app's repo, set `APP_ID: app3` in the workflow and add the
   `PORTAL_REPO_TOKEN` secret.
3. Push the app repo — CI fills in the real `version`/`downloadUrl`.

---

## Files to keep in sync

- `data/apps.json` — source of truth (CI writes `version` + `downloadUrl`).
- `pages/api/apps.js` — serves the list.
- `pages/api/update.js` — serves latest version + downloadUrl for one app.
- `public/dl.jpg`, `public/qr.png` — app icons.

## If an app is removed from the store

The portal can still serve updates if the device installs outside the store:
- **Android:** users install the APK from here after allowing unknown sources.
- **iPhone:** self-hosted updates are restricted; needs App Store or enterprise
  distribution.
