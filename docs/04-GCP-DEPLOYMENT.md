# Google Cloud Platform (GCP) Deployment Guide

This guide provides instructions for deploying the LivePerson + Amazon Connect Widget to Google Cloud Platform using **Cloud Run** (recommended) or **App Engine**.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Option 1: Google Cloud Run (Recommended)](#option-1-google-cloud-run-recommended)
- [Option 2: Google App Engine](#option-2-google-app-engine)
- [Domain & SSL Configuration](#domain--ssl-configuration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

1. **Google Cloud Project**: Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. **Billing Enabled**: Ensure billing is enabled for your project.
3. **Google Cloud SDK**: Install and initialize the [gcloud CLI](https://cloud.google.com/sdk/docs/install).

```bash
gcloud init
gcloud auth login
gcloud config set project [YOUR_PROJECT_ID]
```

4. **APIs Enabled**: Enable necessary APIs:
   - Cloud Build API
   - Cloud Run API (if using Cloud Run)
   - App Engine Admin API (if using App Engine)

```bash
gcloud services enable cloudbuild.googleapis.com run.googleapis.com appengine.googleapis.com
```

---

## Option 1: Google Cloud Run (Recommended)

Cloud Run is a fully managed compute platform that automatically scales your stateless containers. It is ideal for Next.js applications.

### 1. Containerize the Application

Ensure you have the `Dockerfile` in the root of your project (as described in [AWS Deployment Guide](./02-AWS-DEPLOYMENT.md#step-1-create-dockerfile)).

### 2. Build and Submit Container to Container Registry

You can use Cloud Build to build your Docker image and push it to Google Container Registry (GCR) or Artifact Registry.

```bash
# Submit build to Cloud Build
gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/lp-connect-widget
```

### 3. Deploy to Cloud Run

Deploy the container image to Cloud Run. You can pass environment variables directly or use a `.env` file (though direct flags or Secret Manager is verified for production).

```bash
gcloud run deploy lp-connect-widget \
  --image gcr.io/[YOUR_PROJECT_ID]/lp-connect-widget \
  --platform managed \
  --region [YOUR_REGION] \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_CONNECT_INSTANCE_URL=https://[YOUR_INSTANCE].my.connect.aws/ccp-v2/ \
  --set-env-vars NEXT_PUBLIC_CONNECT_REGION=[YOUR_AWS_REGION]
```
*Replace `[YOUR_REGION]` with a GCP region like `us-central1`.*

### 4. Verify Deployment

After deployment, the command output will provide a Service URL (e.g., `https://lp-connect-widget-uc.a.run.app`).
1. Open the URL in your browser.
2. Verify the application loads.

---

## Option 2: Google App Engine

App Engine (Standard Environment) is a platform-as-a-service (PaaS) product that abstracts away infrastructure.

### 1. Configure `app.yaml`

Create an `app.yaml` file in the root directory. For Next.js, we typically use the Node.js runtime.

```yaml
runtime: nodejs20

instance_class: F1

automatic_scaling:
  target_cpu_utilization: 0.65
  min_instances: 1
  max_instances: 10

env_variables:
  NEXT_PUBLIC_CONNECT_INSTANCE_URL: "https://[YOUR_INSTANCE].my.connect.aws/ccp-v2/"
  NEXT_PUBLIC_CONNECT_REGION: "[YOUR_AWS_REGION]"
  NODE_ENV: "production"

handlers:
  - url: /.*
    script: auto
    secure: always
```

### 2. Update `package.json`

Ensure your `start` script is set to run the production server:

```json
"scripts": {
  "start": "next start",
  "build": "next build"
  // ...
}
```

### 3. Deploy

```bash
gcloud app deploy
```

### 4. Verify

```bash
gcloud app browse
```

---

## Domain & SSL Configuration

### Cloud Run (Custom Domain)

1. Go to **Cloud Run** in the Google Cloud Console.
2. Select your service (`lp-connect-widget`).
3. Click **Manage Custom Domains**.
4. Click **Add Mapping**.
5. Select a verified domain (you may need to verify ownership via Webmaster Central).
6. Update your DNS records as instructed (usually adding `A` and `AAAA` records).
7. Managed SSL certificates are automatically provisioned.

### App Engine (Custom Domain)

1. Go to **App Engine** > **Settings** > **Custom Domains**.
2. Click **Add a Verified Domain**.
3. Select your domain.
4. Update your DNS records with the provided data.
5. Managed SSL certificates are automatically provisioned.

---

## Troubleshooting

### Deployment Failures

- **Build Errors**: Check Cloud Build logs in the console. Ensure all dependencies are listed in `package.json`.
- **Permission Denied**: Ensure the service account used by Cloud Build/Run has necessary permissions.

### Application Issues

- **Environment Variables**: Verify that `NEXT_PUBLIC_` variables are correctly set in the deployment verification step. In Next.js, these are embedded at build time, so if you change them, **you must rebuild the container**.
    - *Note*: For Cloud Run, if you change env vars, you might need to rebuild the image if the vars were needed at build time. For runtime vars, redeploying the service is sufficient for server-side usage, but client-side `NEXT_PUBLIC_` vars strictly require a rebuild.

- **CORS/Connectivity**:
    - Ensure your Cloud Run/App Engine URL is added to **Amazon Connect Approved Origins**.
    - Ensure it is updated in the LivePerson Widget configuration.

---

**Last Updated**: 2026-02-11
