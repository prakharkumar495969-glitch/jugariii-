// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 🎯 CRITICAL FIX: Base path ko Cloudflare pages ke liye './' par set karein
  base: './', 
});
