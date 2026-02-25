#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-ietech-487111}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-ietech-main-landing}"
REPO_NAME="${REPO_NAME:-web}"
MIN_INSTANCES="${MIN_INSTANCES:-1}"
MAX_INSTANCES="${MAX_INSTANCES:-10}"

TAG="$(date +%Y%m%d-%H%M%S)"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/ietech-landing:${TAG}"

echo "Using project: ${PROJECT_ID}, region: ${REGION}, service: ${SERVICE_NAME}"
gcloud config set project "${PROJECT_ID}" --quiet >/dev/null
gcloud config set run/region "${REGION}" --quiet >/dev/null

gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project "${PROJECT_ID}" --quiet

if ! gcloud artifacts repositories describe "${REPO_NAME}" --location="${REGION}" --project "${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud artifacts repositories create "${REPO_NAME}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="Web images" \
    --project "${PROJECT_ID}" \
    --quiet
fi

echo "Building image: ${IMAGE}"
gcloud builds submit --tag "${IMAGE}" --project "${PROJECT_ID}" --quiet

echo "Deploying Cloud Run service"
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --cpu 1 \
  --memory 512Mi \
  --min-instances "${MIN_INSTANCES}" \
  --max-instances "${MAX_INSTANCES}" \
  --concurrency 200 \
  --timeout 60 \
  --quiet

gcloud run services describe "${SERVICE_NAME}" --region "${REGION}" --project "${PROJECT_ID}" --format='value(status.url)'
