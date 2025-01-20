# GCP Secrets Setup Guide

## Setting up Secrets for Client

### 1. Create Secrets in Secret Manager
```bash
# Create secrets for each environment variable
gcloud secrets create REACT_APP_API_URL --data-file=- <<< "https://momentum-server-302823411886.us-central1.run.app/api"
gcloud secrets create REACT_APP_FIREBASE_API_KEY --data-file=- <<< "your-firebase-api-key"
gcloud secrets create REACT_APP_FIREBASE_AUTH_DOMAIN --data-file=- <<< "your-firebase-auth-domain"
gcloud secrets create REACT_APP_FIREBASE_PROJECT_ID --data-file=- <<< "xxx"
gcloud secrets create REACT_APP_FIREBASE_STORAGE_BUCKET --data-file=- <<< "xxx"
gcloud secrets create REACT_APP_FIREBASE_MESSAGING_SENDER_ID --data-file=- <<< "xxx"
gcloud secrets create REACT_APP_FIREBASE_APP_ID --data-file=- <<< "xxx"
gcloud secrets create REACT_APP_FIREBASE_MEASUREMENT_ID --data-file=- <<< "xxx"
```

### 2. Grant Access to Service Accounts

```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe mymomentumapp --format='value(projectNumber)')

# Grant Secret Manager access to Cloud Run service account
gcloud projects add-iam-policy-binding mymomentumapp \
    --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Grant Secret Manager access to Cloud Build service account
gcloud projects add-iam-policy-binding mymomentumapp \
    --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### 3. Update Secret Values (when needed)
```bash
# Update an existing secret
gcloud secrets versions add REACT_APP_API_URL --data-file=- <<< "new-value"
```

### 4. View Secret Values (for verification)
```bash
# View the latest version of a secret
gcloud secrets versions access latest --secret="REACT_APP_API_URL"
```

## Setting up Secrets for Server

### 1. Create Secrets in Secret Manager
```bash

# Create secrets for Firebase service account
gcloud secrets create FIREBASE_TYPE --data-file=- <<< "service_account"
gcloud secrets create FIREBASE_PROJECT_ID --data-file=- <<< "your-project-id"
gcloud secrets create FIREBASE_PRIVATE_KEY_ID --data-file=- <<< "your-private-key-id"
gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=- <<< "your-private-key"
gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file=- <<< "your-firebase-client-email"
gcloud secrets create FIREBASE_CLIENT_ID --data-file=- <<< "your-client-id"
gcloud secrets create FIREBASE_AUTH_URI --data-file=- <<< "your-firebase-auth-uri"
gcloud secrets create FIREBASE_TOKEN_URI --data-file=- <<< "your-firebase-token-uri"
gcloud secrets create FIREBASE_AUTH_PROVIDER_X509_CERT_URL --data-file=- <<< "your-firebase-auth-provider-x509-cert-url"
gcloud secrets create FIREBASE_CLIENT_X509_CERT_URL --data-file=- <<< "your-firebase-client-x509-cert-url"
gcloud secrets create FIREBASE_UNIVERSE_DOMAIN --data-file=- <<< "your-firebase-universe-domain"
```

### 2. Grant Access to Service Accounts

```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe mymomentumapp --format='value(projectNumber)')

# Grant Secret Manager access to Cloud Run service account
gcloud projects add-iam-policy-binding mymomentumapp \
    --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Grant Secret Manager access to Cloud Build service account
gcloud projects add-iam-policy-binding mymomentumapp \
    --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### 3. Update Secret Values (when needed)
```bash
# Update an existing secret
gcloud secrets versions add SECRET_NAME --data-file=- <<< "new-value"

# Example: Update Firebase private key
gcloud secrets versions add FIREBASE_PRIVATE_KEY --data-file=- <<< "your-new-private-key"
```

### 4. View Secret Values (for verification)
```bash
# View the latest version of a secret
gcloud secrets versions access latest --secret="SECRET_NAME"

# Example: View Firebase project ID
gcloud secrets versions access latest --secret="FIREBASE_PROJECT_ID"
```