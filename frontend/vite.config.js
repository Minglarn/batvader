import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      useCredentials: true,
      manifest: {
        name: 'Båtväder',
        short_name: 'Båtväder',
        description: 'Väderprognoser och AI-rekommendationer för din båtresa',
        theme_color: '#050505',
        background_color: '#050505',
        display: 'standalone',
        icons: [
          {
            src: '/app-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/app-icon.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/app-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
