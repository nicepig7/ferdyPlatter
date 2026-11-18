import type { Plugin } from 'vite';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

export interface MonorepoDomainsGatewayOptions {
  /** `@ferdy/core` 패키지 루트 디렉터리 절대 경로 */
  coreRoot: string;
  /** 도메인 앱들이 위치하는 루트 디렉터리 절대 경로 (`packages/domains`) */
  domainsRoot: string;
  /**
   * 브라우저 및 빌드 출력에서 도메인 앱이 마운트되는 URL 접두어
   * @default '/domains/'
   */
  mountPrefix?: string;
}

export interface MonorepoDomainsGateway {
  plugin: Plugin;
  getBuildInputs: () => Record<string, string>;
  discoverDomainApps: () => string[];
}

const SKIP_SCAN_DIRS = new Set(['node_modules', 'dist', '.git', 'src']);

function normalizePosix(p: string): string {
  return p.replace(/\\/g, '/');
}

function normalizeMountPrefix(prefix: string): string {
  const withLeading = prefix.startsWith('/') ? prefix : `/${prefix}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

/**
 * 단일 Vite 서버(:3000) 및 프로덕션 빌드에서 `<mountPrefix><app-rel-path>/` 경로를
 * `packages/domains/<app-rel-path>/` 실제 파일들로 매핑해주는 게이트웨이 플러그인을 생성합니다.
 *
 * - 임의 깊이의 중첩 폴더(`packages/domains/widgets/clock/index.html` 등)를 재귀 스캔하여 자동 등록합니다.
 * - 향후 앱별 프레임워크(SolidJS / React / Vue 등)를 분리할 때도 이 게이트웨이의 앱 목록을 기준으로 스코핑할 수 있습니다.
 */
export function createMonorepoDomainsGateway(
  options: MonorepoDomainsGatewayOptions
): MonorepoDomainsGateway {
  const coreRoot = normalizePosix(options.coreRoot);
  const domainsRoot = normalizePosix(options.domainsRoot);
  const mountPrefix = normalizeMountPrefix(options.mountPrefix ?? '/domains/');
  const virtualAppHtmlPrefix = `${coreRoot}${mountPrefix}`;

  /**
   * `domainsRoot` 하위를 재귀 탐색하여 `index.html`을 포함한 모든 도메인 앱의
   * 상대 POSIX 경로 목록(예: `['app-calendar', 'widgets/clock']`)을 반환합니다.
   */
  function discoverDomainApps(): string[] {
    const apps: string[] = [];
    if (!existsSync(domainsRoot)) return apps;

    const walk = (currentDir: string, relPrefix: string) => {
      for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
        if (!entry.isDirectory() || SKIP_SCAN_DIRS.has(entry.name)) continue;

        const nextDir = resolve(currentDir, entry.name);
        const nextRel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;

        if (existsSync(resolve(nextDir, 'index.html'))) {
          apps.push(nextRel);
          // 앱 루트를 찾았으면 하위 디렉터리(components 등)로 더 내려가지 않습니다.
          continue;
        }

        walk(nextDir, nextRel);
      }
    };

    walk(domainsRoot, '');
    return apps.sort();
  }

  /**
   * 도메인 앱의 `index.html` 내부 `./src/...` 또는 `/src/...` 참조를
   * 실제 `packages/domains/<appRelPath>/src/...` 절대 경로로 변환합니다.
   */
  function rewriteDomainHtml(appRelPath: string, isDevServer: boolean): string | null {
    const appDir = resolve(domainsRoot, appRelPath);
    const htmlPath = resolve(appDir, 'index.html');
    if (!existsSync(htmlPath)) return null;

    const html = readFileSync(htmlPath, 'utf-8');
    const appDirNormalized = normalizePosix(appDir);
    const prefix = isDevServer ? `/@fs/${appDirNormalized}/src/` : `${appDirNormalized}/src/`;

    return html.replace(/(src|href)=["'](\.\/|\/)?src\//g, `$1="${prefix}`);
  }

  /**
   * `packages/domains/**` 하위의 모든 도메인 앱을 스캔하여
   * 프로덕션 빌드(`rollupOptions.input`) 시 `dist<mountPrefix><app-rel-path>/index.html`로 출력되도록 등록합니다.
   */
  function getBuildInputs(): Record<string, string> {
    const inputs: Record<string, string> = {
      core: resolve(coreRoot, 'index.html'),
    };

    for (const appRelPath of discoverDomainApps()) {
      const inputKey = `domain-${appRelPath.replace(/\//g, '-')}`;
      inputs[inputKey] = `${virtualAppHtmlPrefix}${appRelPath}/index.html`;
    }

    return inputs;
  }

  const plugin: Plugin = {
    name: 'ferdy-monorepo-domains-gateway',
    enforce: 'pre',
    resolveId(id) {
      const normalized = normalizePosix(id);
      if (normalized.startsWith(virtualAppHtmlPrefix) && normalized.endsWith('/index.html')) {
        return normalized;
      }
      return null;
    },
    load(id) {
      const normalized = normalizePosix(id);
      if (normalized.startsWith(virtualAppHtmlPrefix) && normalized.endsWith('/index.html')) {
        const rest = normalized.slice(virtualAppHtmlPrefix.length);
        const appRelPath = rest.slice(0, -'/index.html'.length);
        return rewriteDomainHtml(appRelPath, false);
      }
      return null;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        const [pathname, rawQuery] = req.url.split('?');
        if (!pathname.startsWith(mountPrefix)) return next();

        const rest = pathname.slice(mountPrefix.length);
        if (!rest) return next();

        // /domains/<relPath>, /domains/<relPath>/, /domains/<relPath>/index.html 지원
        const isIndexHtml = rest.endsWith('/index.html');
        const hasTrailingSlash = rest.endsWith('/');
        const appRelPath = isIndexHtml
          ? rest.slice(0, -'/index.html'.length)
          : hasTrailingSlash
            ? rest.slice(0, -1)
            : rest;

        if (!appRelPath || appRelPath.includes('..')) return next();

        // 끝에 슬래시가 없으면 상대 경로 리소스 해석을 위해 리다이렉트 (단, 해당 폴더에 index.html이 존재할 때만)
        if (!hasTrailingSlash && !isIndexHtml) {
          if (existsSync(resolve(domainsRoot, appRelPath, 'index.html'))) {
            const query = rawQuery ? `?${rawQuery}` : '';
            res.writeHead(302, { Location: `${mountPrefix}${appRelPath}/${query}` });
            res.end();
            return;
          }
          return next();
        }

        const html = rewriteDomainHtml(appRelPath, true);
        if (html !== null) {
          const transformed = await server.transformIndexHtml(req.url, html);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(transformed);
          return;
        }

        next();
      });
    },
  };

  return {
    plugin,
    getBuildInputs,
    discoverDomainApps,
  };
}
