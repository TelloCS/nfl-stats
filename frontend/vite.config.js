import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { 
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
    strictPort: true,
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      '/auth': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
      '/nfl': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/static': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
