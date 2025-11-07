import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Detect GitHub Codespaces backend domain dynamically
const CODESPACE_NAME = process.env.CODESPACE_NAME
const PORT = 8000
const BACKEND_URL = CODESPACE_NAME
  ? `https://${CODESPACE_NAME}-${PORT}.app.github.dev`
  : 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => console.log('Proxy error:', err.message))
          proxy.on('proxyReq', (proxyReq, req) =>
            console.log('Proxying:', req.method, req.url)
          )
        },
      },
      '/health': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env.VITE_API_BASE_URL': JSON.stringify(BACKEND_URL),
  },
})
