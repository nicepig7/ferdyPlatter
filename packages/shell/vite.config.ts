import { defineConfig, Plugin } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { resolve } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';

const monorepoRoot = resolve(__dirname, '../..');
const appsRoot = resolve(monorepoRoot, 'packages/apps');

/**
 * packages/apps/* 하위의 모든 앱을 스캔하여
 * 프로덕션 빌드(rollupOptions.input) 시 멀티페이지 엔트리로 자동 등록합니다.
 */
function getAppsBuildInputs(): Record<string, string> {
  const inputs: Record<string, string> = {
    shell: resolve(__dirname, 'index.html'),
  };

  if (existsSync(appsRoot)) {
    for (const dir of readdirSync(appsRoot, { withFileTypes: true })) {
      if (dir.isDirectory()) {
        const htmlPath = resolve(appsRoot, dir.name, 'index.html');
        if (existsSync(htmlPath)) {
          inputs[`app-${dir.name}`] = htmlPath;
        }
      }
    }
  }
  return inputs;
}

/**
 * 단일 Vite 개발 서버(:3000)에서 `/apps/<app-name>/...` 요청을
 * `packages/apps/<app-name>/...` 실제 파일들로 매핑해주는 미들웨어 플러그인입니다.
 */
function monorepoAppsGatewayPlugin(): Plugin {
  return {
    name: 'ferdy-monorepo-apps-gateway',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        const [pathname] = req.url.split('?');

        // 1. /apps/<appName> 또는 /apps/<appName>/ 또는 /apps/<appName>/index.html 요청 처리
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

          const htmlPath = resolve(appsRoot, appName, 'index.html');
          if (existsSync(htmlPath)) {
            let html = readFileSync(htmlPath, 'utf-8');
            // 앱 내부의 `./src/...` 또는 `/src/...` 스크립트 경로를 Vite/@fs 절대 경로로 변환
            const appDirNormalized = resolve(appsRoot, appName).replace(/\\/g, '/');
            html = html.replace(
              /(src|href)=["'](\.\/|\/)?src\//g,
              `$1="/@fs/${appDirNormalized}/src/`
            );
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
  plugins: [monorepoAppsGatewayPlugin(), solidPlugin()],
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    fs: {
      // 모노레포 루트(packages/apps/* 포함) 파일 서빙 허용
      allow: [monorepoRoot],
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: getAppsBuildInputs(),
    },
  },
});
