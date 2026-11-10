import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',       // Exposes it to your local network (192.168.1.7)
           // Forces frontend to run on port 3000
    allowedHosts: true  // Prevents Vite from auto-switching if 3000 is busy
  }
})