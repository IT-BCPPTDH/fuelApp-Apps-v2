import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'; 
import { webUpdateNotice } from '@plugin-web-update-notify/vite'
import million from "million/compiler";

export default defineConfig({
  plugins: [
    million.vite({ auto: true }),
    react(),
    legacy(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, 
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [
          new RegExp('^/_'),
        ],
        clientsClaim: true,
        skipWaiting: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-maskable-192x192.png'],
      manifest: {
        name: 'Hanggar Sales App',
        short_name: 'Sales App',
        description: 'Aplikasi Sales Hanggar Nusantara',
        theme_color: '#ffffff',
        start_url: "/",
        display: "standalone",
        id: "/",
        icons: [
          {
            src: 'icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-maskable-144x144.png',
            sizes: "144x144",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: 'icon-maskable-192x192.png',
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: 'icon-maskable-512x512.png',
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      //injectRegister: 'auto'
    }),
    webUpdateNotice({
      logVersion: true,
      checkInterval: 0.5 * 60 * 1000,
    }),
  ]
})
