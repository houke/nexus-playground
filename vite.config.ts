import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  base: '/nexus-playground/',

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@experiments': resolve(__dirname, 'experiments'),
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        snake: resolve(__dirname, 'experiments/snake/index.html'),
        mamba: resolve(__dirname, 'experiments/mamba/index.html'),
        beast: resolve(__dirname, 'experiments/beast/index.html'),
        pinspiration: resolve(__dirname, 'experiments/pinspiration/index.html'),
        splashy: resolve(__dirname, 'experiments/splashy/index.html'),
      },
    },
  },

  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.svg', 'icons/*.png', 'sounds/*.mp3'],
      devOptions: {
        enabled: true, // Enable PWA in dev mode to serve manifest
      },
      manifest: {
        name: 'Nexus Playground',
        short_name: 'Nexus',
        description: 'AI-orchestrated experiments built by the Nexus agent squad',
        theme_color: '#22C55E',
        background_color: '#0A0A0F',
        display: 'standalone',
        orientation: 'any',
        start_url: '/nexus-playground/',
        scope: '/nexus-playground/',
        icons: [
          {
            src: 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3,wav,jpg,jpeg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB to allow large images
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],

  server: {
    port: 3000,
    open: true,
  },
})
