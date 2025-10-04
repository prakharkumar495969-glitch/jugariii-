// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Yeh line zaroori hai. Isse Cloudflare Pages sahi se build hota hai.
  base: './', 
});
