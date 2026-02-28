import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'jobible Way',
        short_name: 'jobible Way',
        description: '제자의 길을 걷는 여정 — 제자훈련 32주 기록 앱',
        lang: 'ko',
        theme_color: '#0B1026',
        background_color: '#0B1026',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/home',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/gh\/orioncactus\/pretendard/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pretendard-font',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/api\/curriculum/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'curriculum-api',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
})
