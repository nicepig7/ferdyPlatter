import { defineConfig } from 'vite';
import vuePlugin from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vuePlugin({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('fd-'),
        },
      },
    }),
  ],
  build: {
    target: 'esnext',
  },
});
