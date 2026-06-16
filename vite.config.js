/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom = simulasi browser/DOM di Node, supaya bisa render komponen React
    environment: 'jsdom',
    // file yang dijalankan sekali sebelum semua test (mis. matcher tambahan)
    setupFiles: './src/test/setup.js',
    // pakai describe/it/expect tanpa import manual di tiap file
    globals: true,
  },
})
