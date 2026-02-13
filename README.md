<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# WhisperX Studio

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   `npm install`
2. Configure environment in `.env.local`:

```bash
# GitHub automation
GH_TOKEN=xxxxx
GH_REPO=owner/repo

# LLM providers (choose one as LLM_PROVIDER)
LLM_PROVIDER=gemini
GEMINI_API_KEY=xxxxx
OPENAI_API_KEY=xxxxx
OLLAMA_HOST=http://127.0.0.1:11434

# Optional preflight test endpoint before PR
PREFLIGHT_ENDPOINT=https://your-runner.example.com/preflight
```

3. Run app:
   `npm run dev`

## Production Agent Flow

Frontend calls `/api/agent` and the serverless agent performs:

1. Read repo metadata and default branch from GitHub
2. Create branch from default branch
3. Generate patch JSON with LLM
4. Validate + path guard (`../`, absolute path, `.git/`, size limits)
5. Upsert files (include `sha` for updates)
6. Open pull request using `head: owner:branch` and `base: default_branch`

All writes happen through GitHub API and are reviewable via PR.
