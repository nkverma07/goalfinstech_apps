# Sync Guide — Update Portal (goalfinstech_apps)

This Next.js app is the **update portal** (deployed at `https://goalfinstech.app`).
It lists the apps and serves the latest version + download link for each.
It builds nothing and calls no external API — it just reads `data/apps.json`.

This repo can be **private** — Vercel still serves the site publicly.

Repos involved:
- `app1` = All Video Player & Saver → source in `<owner>/all_in_one_downloader` (private)
- `app2` = QR Scanner Barcode Reader → source in `<owner>/<qr-repo>` (private)
- `<owner>/app1-releases`, `<owner>/app2-releases` (**public**) → host the APKs
  the portal links to. One public releases repo per app.

Releases are **manual**: you build each APK locally and upload it to that app's
public releases repo, then bump the version here. No CI, no secrets.

---

## How the data works

The single source of truth is **`data/apps.json`**. Each entry:

```json
{
  "id": "app1",
  "name": "All Video Player & Saver",
  "icon": "/dl.jpg",
  "webUrl": "https://goalfinstech.app",
  "version": "1.0.2+5",
  "downloadUrl": "https://github.com/<owner>/app1-releases/releases/latest/download/app1.apk"
}
```

- `downloadUrl` uses GitHub's `releases/latest/download/<asset>` shortcut, so it
  **always points at the newest release** and never needs changing — as long as
  each new release is "latest" and the asset is named `app1.apk`.
- So per release you normally edit only **`version`** (for display).

Served by:
- [`pages/api/apps.js`](pages/api/apps.js) → the whole list for the homepage.
- [`pages/api/update.js`](pages/api/update.js) → latest version + downloadUrl for
  one app (the "Download / Update" button). Both read the file fresh
  (`Cache-Control: no-store`), so a redeploy reflects changes immediately.

---

## Step-by-step: after you upload a new APK

1. You built the APK locally and published it to `<owner>/appN-releases`
   (see that app's repo `sync.md`).
2. In this repo, edit `data/apps.json` → set that app's `version`
   (e.g. `1.0.2+5`).
3. Commit and push to `main`. Vercel auto-redeploys; the listing updates.

That's it — the download link already serves the new APK via the `latest`
shortcut, so you don't touch `downloadUrl` unless you change hosts.

---

## One-time setup

1. **Deploy to Vercel**: import this repo at vercel.com. Every push to `main`
   auto-redeploys. No env vars needed. Point the `goalfinstech.app` domain at it.
2. **Seed `data/apps.json`**: set each app's `id`, `name`, `icon`, `webUrl`,
   and its `downloadUrl` (the `appN-releases` latest-download URL).

---

## Adding a NEW app to the listing

1. Add a new object to `data/apps.json` with a fresh `id` (e.g. `app3`), its
   stable fields, a `version`, and its `downloadUrl`
   (`<owner>/app3-releases/releases/latest/download/app3.apk`).
2. Add an icon under `public/` and reference it in `icon`.
3. Commit and push.

---

## Files to keep in sync

- `data/apps.json` — source of truth (you edit `version` per release).
- `pages/api/apps.js` — serves the list.
- `pages/api/update.js` — serves latest version + downloadUrl for one app.
- `public/dl.jpg`, `public/qr.png` — app icons.

## If an app is removed from an app store

The portal still serves updates for sideloaded installs:
- **Android:** users install the APK from the link after allowing unknown sources.
- **iPhone:** self-hosted updates are restricted; needs App Store or enterprise
  distribution.
