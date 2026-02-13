<div align="center">
<img width="1200" height="475" alt="WhisperX Studio banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# WhisperX Studio

WhisperX Studio is a Vite + React workspace for prompt-driven app generation and agent workflows, with a secure server-side proxy for LLM providers.

AI Studio project link: https://ai.studio/apps/drive/1nATQDiLlnVK_dTh1dS0KHGzU28x3-fRg

## Quick start

### Prerequisites
- Node.js 20+
- npm

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key_optional
OLLAMA_BASE_URL=http://localhost:11434
```

> `OPENAI_API_KEY` is only required if you use the OpenAI provider.

### 3) Run locally

```bash
npm run dev
```

The app will be available at the local Vite URL shown in your terminal.

## Available scripts

- `npm run dev` — Start local development server.
- `npm run build` — Build production bundle.
- `npm run preview` — Preview the production build locally.
- `npm run test` — Run Node-based test suite (`tests/**/*.test.ts`).
- `npm run export` — Alias of `build`.

## Security model (important)

- API keys are never read from the browser UI.
- LLM provider credentials are resolved only on the server through `/api/agent`.
- Gemini live audio uses short-lived server-created session IDs instead of exposing provider keys client-side.

## Backend route overview

Primary API route: `api/agent.ts`

Supported provider actions:

- `provider: "gemini", action: "chat"`
- `provider: "gemini", action: "live-session"`
- `provider: "gemini", action: "live-turn"`
- `provider: "openai", action: "chat"`
- `provider: "ollama", action: "chat"`

## Testing

Run all tests:

```bash
npm run test
```

If you add new agent guard or API behavior, add or update tests under `tests/` to keep request-validation rules covered.
