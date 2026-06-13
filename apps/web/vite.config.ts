import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Docta web — PWA installable, prete pour le hors-ligne (offline-first).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Docta — SIH',
        short_name: 'Docta',
        description: "SIH open source pour l'hopital africain moderne",
        lang: 'fr',
        theme_color: '#018000',
        background_color: '#F5F7F1',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: Number(process.env.PORT) || 5173,
    proxy: {
      // Cible de l'API en dev. Surcharge possible : API_PROXY_TARGET=http://localhost:3001
      '/api': process.env.API_PROXY_TARGET || 'http://localhost:3000',
    },
  },
});
