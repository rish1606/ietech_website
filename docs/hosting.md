# ietech.ai Hosting (GCP)

## Current stack
- Build: Vite + **static prerender** (`npm run build:static` → per-route HTML in `dist/`)
- Runtime: Cloud Run service `ietech-main-landing` in `us-central1` (nginx serving static files)
- Edge: Global External HTTPS Load Balancer + Cloud CDN, with Cloudflare proxy in front
- Static IP: `34.8.68.79`

## Build
- `npm run build` — SPA only (no prerender).
- `npm run build:static` — SPA **+ prerender** every route to static HTML and generate
  `dist/sitemap.xml`. This is what the Docker image runs. It needs **Chromium** (the
  Dockerfile installs it) and network access to the Firestore REST API (to list blog /
  case-study slugs). If Chromium can't launch, the build degrades to plain SPA shells
  and still ships — watch the build log for a `[prerender] ⚠️` warning.

## Deploy updates
```bash
./scripts/deploy_gcp.sh          # builds the Docker image (runs build:static) and deploys Cloud Run
```

## Deploy checklist (do these once, and rules again whenever they change)
1. **Firestore security rules** — NOT deployed by the script above. Deploy separately:
   ```bash
   firebase deploy --only firestore:rules --project ietech-ai
   ```
2. **Firebase App Check** — enable in the Firebase console to stop the public contact-form
   `create` rule being abused by scripts outside the site.
3. **Search Console** — after deploy, submit `https://ietech.ai/sitemap.xml` and validate a
   blog/case-study URL in the Rich Results Test.
4. **New content** — publishing a post in the CMS requires a rebuild/redeploy for it to be
   prerendered and added to the sitemap (SSG is build-time). Re-run `./scripts/deploy_gcp.sh`.

## Cloudflare DNS required
Set these in Cloudflare DNS for zone `ietech.ai`:
- `A` record: `@` -> `34.8.68.79`
- `CNAME` record: `www` -> `ietech.ai`

Use **DNS only** (grey cloud) until Google managed cert is ACTIVE.
After cert turns ACTIVE, you can enable proxy if desired.

## Check certificate status
```bash
gcloud compute ssl-certificates describe ietech-main-cert \
  --global --project ietech-487111 \
  --format='yaml(managed.status,managed.domainStatus)'
```

## Check service
```bash
gcloud run services describe ietech-main-landing \
  --region us-central1 --project ietech-487111 \
  --format='value(status.url)'
```
