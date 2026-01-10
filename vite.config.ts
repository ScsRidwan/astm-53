
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Changed from './' to '/' for root-level deployments like Vercel
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
