import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { resolve } from 'path';
import { createMonorepoDomainsGateway } from './plugins/monorepoDomainsGateway';

const monorepoRoot = resolve(__dirname, '../..');
const domainsGateway = createMonorepoDomainsGateway({
  coreRoot: __dirname,
  domainsRoot: resolve(monorepoRoot, 'packages/domains'),
  mountPrefix: '/domains/',
});

export default defineConfig({
  plugins: [domainsGateway.plugin, solidPlugin()],
  publicDir: resolve(monorepoRoot, 'packages/assets/public'),
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    fs: {
      // 모노레포 루트(packages/assets, packages/base/*, packages/domains/** 포함) 파일 서빙 허용
      allow: [monorepoRoot],
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: domainsGateway.getBuildInputs(),
    },
  },
});
