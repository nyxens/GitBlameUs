import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@ui': path.resolve(import.meta.dirname, './src/components/ui'),
      '@layout': path.resolve(import.meta.dirname, './src/components/layout'),
      '@modals': path.resolve(import.meta.dirname, './src/components/modals'),
      '@pages': path.resolve(import.meta.dirname, './src/pages'),
      '@services': path.resolve(import.meta.dirname, './src/services'),
      '@appTypes': path.resolve(import.meta.dirname, './src/types'),
      '@hooks': path.resolve(import.meta.dirname, './src/hooks'),
      '@utils': path.resolve(import.meta.dirname, './src/utils'),
      '@backend': path.resolve(import.meta.dirname, './backend'),
    },
  },
  build: {
    cssMinify: false,
  },
})
