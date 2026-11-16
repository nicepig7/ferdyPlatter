import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3002,
    strictPort: true,
  },
  build: {
    target: 'esnext',
  },
});

