// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Yeh do lines zaroori hain
  base: '/', // Base path ko reset karein
  root: '.', // Root directory ko current folder par set karein
});
