import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3004,
    strictPort: true,
  },
  build: {
    target: 'esnext',
  },
});
