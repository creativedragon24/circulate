import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// base: './' → all asset URLs are relative, so the build works at any subpath
// (GitHub Pages project sites live at /username/limber/, user sites at /).
// Hash routing (#/app) means no server-side route config is needed.
export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    port: 5173,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.png'],
      manifest: {
        name: 'Limber — Stretch. Smile. Repeat.',
        short_name: 'Limber',
        description: 'The free, friendly stretching app. Five minutes a day — free, offline, gentle.',
        theme_color: '#23263f',
        background_color: '#faf7f0',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        categories: ['health', 'fitness', 'lifestyle'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,woff}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^icons\//],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|woff2?)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'limber-assets', expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 3600 } },
          },
        ],
      },
    }),
  ],
});
