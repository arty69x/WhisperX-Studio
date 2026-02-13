import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      port: 3000,
      host: "0.0.0.0"
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    },
    define: {
      // Non-secret build-time flags only
      __APP_MODE__: JSON.stringify(mode),
      __HAS_VITE_GEMINI_KEY__: JSON.stringify(Boolean(env.VITE_GEMINI_API_KEY))
    }
  };
});
