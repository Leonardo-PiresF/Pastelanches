import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Caminhos relativos: o mesmo build serve na raiz (Vercel) e numa subpasta (GitHub Pages).
  base: './',
  plugins: [react()]
})
