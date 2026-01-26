import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    preact()
  ],
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
})
