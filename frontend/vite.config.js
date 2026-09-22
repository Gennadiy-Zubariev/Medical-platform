import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'wss://localhost',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/static': {
        target: 'https://localhost',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
