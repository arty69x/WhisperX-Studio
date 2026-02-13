<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1nATQDiLlnVK_dTh1dS0KHGzU28x3-fRg

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create `.env.local` for **server-side only** secrets:

   ```bash
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key_optional
   OLLAMA_BASE_URL=http://localhost:11434
   ```

3. Run the app:
   `npm run dev`

## Security model (important)

- All LLM provider keys are stored and used **only on the server** (`/api/agent`).
- Client code now calls `fetch('/api/agent', ...)` and never reads `process.env.API_KEY` or `VITE_*_API_KEY`.
- Live audio sessions use a server-created ephemeral session id instead of exposing provider API keys in the browser.
