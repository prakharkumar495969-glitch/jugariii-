// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 🎯 CRITICAL FIX: Jab index.html mein /src/main.jsx ho, toh yahaan / lagana zaroori hai.
  base: '/', 
});
