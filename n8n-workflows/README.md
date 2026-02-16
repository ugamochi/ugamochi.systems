# n8n Workflow Ops

## Files

- `stage-1-basic.json`: Stage 1 lead form workflow JSON.
- `deploy-stage-1.sh`: API-based deploy script (update/create + activate).
- `test-webhook.sh`: Webhook smoke test payload sender.

## Deploy to Render n8n (API)

The deploy script auto-loads these files if present:

- `.env`
- `.env.local`
- `n8n-workflows/.env`
- `n8n-workflows/.env.local`

You can start from:

```bash
cp n8n-workflows/.env.example n8n-workflows/.env
```

1. Create an API key in n8n: `Settings -> API -> Create API Key`.
2. Export the key:
   ```bash
   export N8N_API_KEY='your-key'
   ```
3. Optional if URL changes:
   ```bash
   export N8N_BASE_URL='https://n8n-service-uwaf.onrender.com'
   ```
4. Run deploy:
   ```bash
   bash n8n-workflows/deploy-stage-1.sh
   ```
5. Optional if your dotenv is elsewhere:
   ```bash
   N8N_ENV_FILE='/absolute/path/to/.env' bash n8n-workflows/deploy-stage-1.sh
   ```

The script will:

- find the workflow by name from `stage-1-basic.json`
- update it (or create if missing)
- use API-compatible workflow settings payload (`executionOrder` only)
- fetch its latest `versionId`
- activate that version so `/webhook/lead-form` runs the new changes

## Smoke test webhook

```bash
TEST_EMAIL='ugamochi.pavel@gmail.com' bash n8n-workflows/test-webhook.sh
```

Expected HTTP response:

```json
{"success": true, "message": "Thanks! We'll be in touch soon."}
```

Then verify in n8n executions:

- webhook output shape (`$json.body` vs `$json`)
- owner email fields are resolved (no literal `{{ ... }}`)
- lead confirmation email is delivered and personalized
