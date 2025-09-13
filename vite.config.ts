import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // build a service worker and update it automatically
      registerType: 'autoUpdate',
      // inject the small registration script automatically
      injectRegister: 'auto',
      // we already have /public/manifest.json, so don't override it here
      manifest: false,
      // cache your built assets + HTML/CSS/JSON/icons
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
      },
    }),
  ],
})
