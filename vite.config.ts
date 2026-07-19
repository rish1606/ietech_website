import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ['.trycloudflare.com', '.loca.lt'],
  },
  build: {
    // Split heavy, independently-cacheable vendors out of the main chunk so
    // the initial document parses less JS and repeat visits reuse cached vendor
    // files across deploys.
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          motion: ['framer-motion', 'motion'],
          markdown: ['react-markdown', 'remark-gfm'],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
