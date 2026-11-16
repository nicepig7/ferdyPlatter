import { defineConfig, Plugin } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { resolve } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';

const coreRoot = __dirname.replace(/\\/g, '/');
const monorepoRoot = resolve(__dirname, '../..');
const domainsRoot = resolve(monorepoRoot, 'packages/domains');
const assetsPublicRoot = resolve(monorepoRoot, 'packages/assets/public');

/**
 * 도메인 앱의 index.html 내부 `./src/...` 또는 `/src/...` 참조를
 * 실제 packages/domains/<appName>/src/... 절대 경로로 변환합니다.
 */
function rewriteDomainHtml(appName: string, isDevServer: boolean): string | null {
  const htmlPath = resolve(domainsRoot, appName, 'index.html');
  if (!existsSync(htmlPath)) return null;

  let html = readFileSync(htmlPath, 'utf-8');
  const appDirNormalized = resolve(domainsRoot, appName).replace(/\\/g, '/');
  const prefix = isDevServer ? `/@fs/${appDirNormalized}/src/` : `${appDirNormalized}/src/`;

  html = html.replace(/(src|href)=["'](\.\/|\/)?src\//g, `$1="${prefix}`);
  return html;
}

/**
 * packages/domains/* 하위의 모든 도메인 앱을 스캔하여
 * 프로덕션 빌드(rollupOptions.input) 시 `dist/apps/<app-name>/index.html`로 출력되도록 등록합니다.
 */
function getDomainsBuildInputs(): Record<string, string> {
  const inputs: Record<string, string> = {
    core: resolve(__dirname, 'index.html'),
  };

  if (existsSync(domainsRoot)) {
    for (const dir of readdirSync(domainsRoot, { withFileTypes: true })) {
      if (dir.isDirectory()) {
        const htmlPath = resolve(domainsRoot, dir.name, 'index.html');
        if (existsSync(htmlPath)) {
          inputs[`app-${dir.name}`] = `${coreRoot}/apps/${dir.name}/index.html`;
        }
      }
    }
  }
  return inputs;
}

/**
 * 단일 Vite 서버(:3000) 및 프로덕션 빌드에서 `/apps/<app-name>/...` 경로를
 * `packages/domains/<app-name>/...` 실제 파일들로 매핑해주는 게이트웨이 플러그인입니다.
 */
function monorepoDomainsGatewayPlugin(): Plugin {
  const virtualAppHtmlPrefix = `${coreRoot}/apps/`;

  return {
    name: 'ferdy-monorepo-domains-gateway',
    enforce: 'pre',
    resolveId(id) {
      const normalized = id.replace(/\\/g, '/');
      if (normalized.startsWith(virtualAppHtmlPrefix) && normalized.endsWith('/index.html')) {
        return normalized;
      }
      return null;
    },
    load(id) {
      const normalized = id.replace(/\\/g, '/');
      if (normalized.startsWith(virtualAppHtmlPrefix) && normalized.endsWith('/index.html')) {
        const rest = normalized.slice(virtualAppHtmlPrefix.length);
        const appName = rest.split('/')[0];
        return rewriteDomainHtml(appName, false);
      }
      return null;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        const [pathname] = req.url.split('?');

        // /apps/<appName> 또는 /apps/<appName>/ 또는 /apps/<appName>/index.html 요청 처리
        const htmlMatch = pathname.match(/^\/apps\/([^/]+)(\/|\/index\.html)?$/);
        if (htmlMatch) {
          const appName = htmlMatch[1];
          // 끝에 슬래시가 없으면 상대 경로 리소스 해석을 위해 리다이렉트
          if (!pathname.endsWith('/') && !pathname.endsWith('.html')) {
            const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
            res.writeHead(302, { Location: `/apps/${appName}/${query}` });
            res.end();
            return;
          }

          const html = rewriteDomainHtml(appName, true);
          if (html !== null) {
            const transformed = await server.transformIndexHtml(req.url, html);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(transformed);
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [monorepoDomainsGatewayPlugin(), solidPlugin()],
  publicDir: assetsPublicRoot,
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    fs: {
      // 모노레포 루트(packages/assets, packages/base/*, packages/domains/* 포함) 파일 서빙 허용
      allow: [monorepoRoot],
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: getDomainsBuildInputs(),
    },
  },
});
