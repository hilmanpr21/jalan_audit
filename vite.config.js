import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({ fastRefresh: true })], // Ensure HMR is on
  server: {
    watch: {
      usePolling: true, // Needed for WSL/Docker
    },
  },
});