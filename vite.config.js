import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/super-self-kid-mini/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: '超级自律小超人',
        short_name: '小超人',
        description: '亲子任务积分系统',
        theme_color: '#ff6b35',
        background_color: '#fff8e7',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/super-self-kid-mini/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'external-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 }
            }
          }
        ]
      }
    })
  ]
})
