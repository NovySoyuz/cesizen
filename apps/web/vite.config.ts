import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // ─── Dev server ──────────────────────────────────────────────────
  server: {
    // Écoute sur toutes les interfaces réseau (partage sur réseau école)
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Proxy /api vers le backend Spring Boot en mode dev
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-dsfr': ['@codegouvfr/react-dsfr'],
          'vendor-charts': ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
