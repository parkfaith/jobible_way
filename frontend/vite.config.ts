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
      includeAssets: ['favicon.svg', 'icons/icon-192.svg', 'icons/icon-512.svg'],
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
            src: '/icons/icon-192.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-512.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-192.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
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
