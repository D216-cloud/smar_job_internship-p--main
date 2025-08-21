// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // Shortcut for src folder
    },
  },

  server: {
    port: 8080, // Local frontend runs on port 8080
    proxy: {
      // ✅ When running locally, any request to /api will be forwarded to backend
      '/api': {
        target: 'https://smar-job-internship-p-main-backendd.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: 'dist', // Final production build folder
  },
});
