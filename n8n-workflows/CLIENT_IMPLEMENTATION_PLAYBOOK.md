# Client Implementation Playbook

## Purpose
Use this guide when you deploy the lead automation system for a client who should own their own stack, credentials, and billing.

## Best-Practice Principle
Build in client-owned accounts from day 1.

- Client owns: n8n workspace, email account, Google Cloud project, Google Sheet, alert channels.
- You own: implementation logic, QA, documentation, and handover.

## Delivery Model (Recommended)

1. Discovery and scope
- Confirm form fields, response style, lead definitions, and spam policy.
- Define what qualifies as `hot`, `warm`, `cold`, and `spam`.

2. Client account setup
- n8n workspace created under client email.
- Google Sheets credential created in client n8n.
- AI provider key created by client (OpenRouter/OpenAI/Ollama endpoint).
- Optional Slack/Telegram webhook owned by client.

3. Build and deploy
- Start with Stage 1 (capture + emails).
- Add Stage 2 (Sheets logging).
- Add Stage 3 (AI scoring + fallback rules).
- Add Stage 4 (personalized reply + security guardrails + routing).

4. QA and hardening
- Test with real, spammy, and malformed payloads.
- Verify blocked leads do not trigger client reply.
- Verify valid leads still send owner/client email and log to sheets.

5. Handover
- Share docs, env template, and rollback workflow JSON.
- Walk client through credentials, deploy, and verification scripts.
- Confirm success checklist and support window.

## Minimal Client Input Checklist

- n8n base URL and API key
- Gmail/SMTP credential connected in n8n
- Google Sheet document ID and sheet tab name
- Google Sheets credential ID in n8n
- AI key + model + endpoint
- Optional hot-alert webhook URL

## Environment Variable Pattern

Use `n8n-workflows/.env` (never commit secrets):

```dotenv
N8N_API_KEY=
N8N_BASE_URL=
GSHEET_DOCUMENT_ID=
GSHEET_SHEET_NAME=Leads
GSHEET_CREDENTIAL_ID=
GSHEET_CREDENTIAL_NAME=Google Sheets account
OPENAI_API_KEY=
OPENROUTER_API_KEY=
OPENAI_MODEL=
OPENAI_API_URL=
LLM_AUTH_MODE=bearer
BOOKING_URL=
CASE_STUDY_URL=
COLD_GUIDE_URL=
HOT_ALERT_WEBHOOK_URL=
```

## Security Rules

- Never ask clients to send secrets in chat.
- Keep `.env` in `.gitignore`.
- Use least privilege for credentials.
- Rotate API keys during handover if temporary sharing happened.
- Keep `continueOnFail` only where non-critical failures should not block lead flow.
- Keep security gate before AI scoring and before client reply.

## Go-Live Checklist

- Stage 4 deployed and active
- Webhook endpoint mapped to production form
- Sheets rows append correctly
- Hot/warm/cold routing verified
- Spam payloads blocked from client reply
- Alerts work for hot leads (if enabled)
- Verification script returns healthy latest execution

## Support and Maintenance

- Weekly: review score quality and spam false positives.
- Monthly: rotate keys, review node errors, and optimize prompts/rules.
- After major model/provider changes: rerun full QA set before production.
