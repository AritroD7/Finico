// FILE: client/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5001', changeOrigin: true, secure: false },
      '/forecast': {
        target: 'http://localhost:5001', changeOrigin: true, secure: false,
        rewrite: (p) => p.replace(/^\/forecast/, '/api/forecast'),
      },
      '/risk': {
        target: 'http://localhost:5001', changeOrigin: true, secure: false,
        rewrite: (p) =>
          p.replace(/^\/risk\/monte-carlo\b/, '/api/forecast/montecarlo').replace(/^\/risk\//, '/api/risk/'),
      },
    },
  },
})
