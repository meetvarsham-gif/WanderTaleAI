import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { imageApiPlugin } from './vite-plugins/imageApiPlugin.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Loaded with an empty prefix so server-only secrets (e.g. OPENAI_API_KEY)
  // are read here without ever being exposed to client code — only variables
  // explicitly prefixed VITE_ are ever injected into the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), imageApiPlugin({ apiKey: env.OPENAI_API_KEY })],
  }
})
