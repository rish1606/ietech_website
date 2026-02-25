# ietech.ai Hosting (GCP)

## Current stack
- Build: Vite static output (`dist/`)
- Runtime: Cloud Run service `ietech-main-landing` in `us-central1`
- Edge: Global External HTTPS Load Balancer + Cloud CDN
- Static IP: `34.8.68.79`

## Deploy updates
```bash
./scripts/deploy_gcp.sh
```

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
