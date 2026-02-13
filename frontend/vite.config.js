import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'configure-response-headers',
      configureServer: server => {
        server.middlewares.use((req, res, next) => {
          if (req.url.startsWith('/display/')) {
            req.url = '/display.html'
          }
          next()
        })
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        display: resolve(__dirname, 'display.html'),
      },
    },
  },
})
