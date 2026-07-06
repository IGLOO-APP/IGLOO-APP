import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'mask-icon.svg',
        'pwa-192x192.png',
        'pwa-512x512.png',
      ],
      manifest: {
        name: 'Igloo Property Manager',
        short_name: 'Igloo',
        description: 'Gestão completa de propriedades e moradia conectada.',
        lang: 'pt-BR',
        theme_color: '#13c8ec',
        background_color: '#f0f4f8',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['business', 'productivity', 'lifestyle'],
        shortcuts: [
          {
            name: 'Propriedades',
            short_name: 'Propriedades',
            description: 'Ver e gerenciar suas propriedades',
            url: '/properties',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Mensagens',
            short_name: 'Mensagens',
            description: 'Ver mensagens de inquilinos',
            url: '/messages',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Financeiro',
            short_name: 'Financeiro',
            description: 'Fluxo de caixa e pagamentos',
            url: '/financials',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
        ],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'mask-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Dashboard do Igloo',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/render\/image\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  server: {
    port: 5176,
    strictPort: false,
    host: '127.0.0.1',
    open: true,
  },
});
