import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    tailwindcss(),

  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.taskglass.work', // backend server port i added this so we can make api requests to the backend
        changeOrigin: true,
      },
    },
  },
  base: '/'
})
