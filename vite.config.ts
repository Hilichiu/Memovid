import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/memovid/', // Updated to lowercase for GitHub Pages compatibility
  optimizeDeps: {
    exclude: ['lucide-react', '@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  server: {
    // Remove COEP headers for development - they can cause issues with FFmpeg.wasm workers
    // In production, you may need to configure these properly with your hosting provider
    fs: {
      allow: ['..']
    }
  },
  build: {
    rollupOptions: {
      external: [],
    },
    target: 'esnext',
  },
  worker: {
    format: 'es'
  }
});
