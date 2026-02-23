# Security Key Rotation and History Cleanup

This checklist is for the exposed key incident discovered on **February 23, 2026**.

## 1) Revoke the exposed key immediately

```bash
gcloud iam service-accounts keys list \
  --iam-account=pavel-systems-google-sheet@n8n-pavel-systems.iam.gserviceaccount.com
```

Delete the exposed key ID:

```bash
gcloud iam service-accounts keys delete KEY_ID_FROM_LIST \
  --iam-account=pavel-systems-google-sheet@n8n-pavel-systems.iam.gserviceaccount.com \
  --quiet
```

## 2) Create a replacement key and store it securely

```bash
gcloud iam service-accounts keys create /tmp/pavel-systems-sa-NEW.json \
  --iam-account=pavel-systems-google-sheet@n8n-pavel-systems.iam.gserviceaccount.com
```

Move it to your secret manager or deployment secret store, then remove local temp copy:

```bash
rm -f /tmp/pavel-systems-sa-NEW.json
```

## 3) Update runtime secrets (Render / n8n / any CI)

- Replace the old credential in every environment that used `n8n-pavel-systems-2122ec93e008.json`.
- Restart/redeploy services after updating secrets.
- Confirm form webhook health after deploy:

```bash
curl -i -X OPTIONS https://n8n-service-uwaf.onrender.com/webhook/lead-form
```

## 4) Remove leaked file from git history

Install `git-filter-repo` if needed:

```bash
brew install git-filter-repo
```

Rewrite history to remove the file from all commits:

```bash
git filter-repo --force --path n8n-pavel-systems-2122ec93e008.json --invert-paths
```

Force-push cleaned history:

```bash
git push --force --all
git push --force --tags
```

## 5) Verify cleanup

Check no private key material remains in current tree:

```bash
rg -n "BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY" -S --hidden --glob '!.git/*'
```

Check history no longer contains the filename:

```bash
git log --all -- n8n-pavel-systems-2122ec93e008.json
```

## 6) Post-incident hardening

- Keep `n8n-*.json` ignored (already added to `.gitignore`).
- Use secret manager references instead of credential files in repo.
- Add secret scanning to CI before deploy.
