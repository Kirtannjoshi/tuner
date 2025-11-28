import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    },
    proxy: {
      '/api/images': {
        target: 'https://static.mytuner.mobi',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/images/, '')
      },
      '/api/pinimg': {
        target: 'https://i.pinimg.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pinimg/, '')
      },
      '/api/seeklogo': {
        target: 'https://seeklogo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/seeklogo/, '')
      },
      '/api/jamendo': {
        target: 'https://api.jamendo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jamendo/, '')
      },
      '/api/imgur': {
        target: 'https://i.imgur.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/imgur/, '')
      },
      '/api/flaticon': {
        target: 'https://cdn-icons-png.flaticon.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/flaticon/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
})
