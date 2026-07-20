# App Update Portal

Next.js landing page for two apps:

- All Video Player & Saver
- QR Scanner Barcode Reader

The portal shows the latest app metadata and a download/update action for each app.

Quick start (locally):

```bash
cd c:\Users\SUN\Desktop\goalfinstech_apps
npm install
npm run dev
```

Open `http://localhost:3000`.

If you want to wire another repo to this portal, read [sync.md](sync.md).

Deploy to Vercel:

- Push this repo to GitHub.
- Import the repo into Vercel (https://vercel.com/import).
- Vercel will detect Next.js and deploy automatically.

How to integrate a real backend for automatic latest-version updates
-------------------------------------------------------------------

This scaffold uses mock API endpoints in `pages/api`.
To integrate real repositories and surface the latest version automatically, use one of these patterns:

1) GitHub webhook -> backend/storage
- Create a backend endpoint (e.g. `/api/webhook`) that receives GitHub `release` or `push` webhooks.
- When a release is published, extract `tag_name` and artifact URL, store in a DB or JSON file (e.g., S3, Firebase, Supabase).
- Make `/api/apps` read the stored metadata and return the current `version` and `downloadUrl`.

2) GitHub Actions -> backend API
- Add a GitHub Action that runs on `release` or on `workflow_dispatch`.
- The Action can upload artifacts to a storage bucket (S3, GCS) and then call your backend API to update metadata.
- Example snippet (in `.github/workflows/publish.yml`):

```yaml
on: release:
  types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Call backend to update metadata
        uses: fjog/curl-action@v1
        with:
          args: |
            -X POST "https://your-backend.example.com/api/metadata" \
            -H 'Content-Type: application/json' \
            -d '{"appId":"app1","version":"${{ github.event.release.tag_name }}","downloadUrl":"https://my-bucket/path/app1-${{ github.event.release.tag_name }}.zip"}'
```

3) Poll GitHub Releases (not recommended for scale)
- Your backend can periodically poll the GitHub Releases API for the latest release and update stored metadata.

Storage options:
- Small projects: store `apps.json` in a private S3/Blob/GCS bucket or a tiny hosted DB (Supabase, Firebase).
- Larger projects: use a database (Postgres, DynamoDB) and let the backend serve `/api/apps` from DB.

Notes on security and CI:
- Protect any webhook endpoints with a secret (GitHub webhook secret) and validate signatures.
- Keep artifact storage private and issue time-limited signed download URLs if artifacts are private.

What to change in this app:
- Replace `pages/api/apps.js` with an implementation that reads from your chosen storage.
- Replace `pages/api/update.js` with a controller that triggers a real update flow (e.g., calls your CI/CD to build artifacts or returns the latest stored release metadata).

If you want, I can:
- Add a skeleton `pages/api/webhook.js` that validates GitHub webhook signatures.
- Add a sample GitHub Action YAML that uploads an artifact and calls the backend.

Add your uploaded logos
----------------------

Place the two logo files you uploaded into the project's `public/` folder with these names:

- `public/dl.jpg` — downloader-based logo
- `public/qr.png` — QR-based logo

Once those files are present the UI will show them automatically.

