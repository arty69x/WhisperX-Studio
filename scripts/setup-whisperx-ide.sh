#!/usr/bin/env bash
set -euo pipefail

# Consolidated setup script from provided drafts.
# Notes:
# - Keeps one canonical version (duplicate blocks removed)
# - Uses strict TypeScript and Tailwind setup

PROJECT_NAME="whisperx-ide"

echo "Starting full setup for $PROJECT_NAME..."
rm -rf "$PROJECT_NAME"

npx create-next-app@latest "$PROJECT_NAME" --ts --eslint --app --use-npm --no-src-dir
cd "$PROJECT_NAME"

npm install \
  tailwindcss@latest postcss autoprefixer \
  @tailwindcss/forms @tailwindcss/aspect-ratio @tailwindcss/line-clamp \
  classnames @headlessui/react monaco-editor \
  @babel/parser @babel/traverse @babel/generator \
  xstate zustand zod fs-extra memfs diff fast-diff jscodeshift lowdb dexie \
  @ollama/client @google/generative-ai openai react-chartjs-2 chart.js

npx tailwindcss init -p

echo "Done: $PROJECT_NAME ready."
