---
name: create-new-app
description: >-
  Use this skill when the user asks to create, scaffold, or register a new isolated
  domain application under packages/domains/ in the Ferdy Platter (FerdyOS) monorepo.
---

# Create New Domain App in Ferdy Platter (`packages/domains/<app-name>`)

이 스킬은 `ferdy-platter` 모노레포의 **[D] Domains** 계층(`packages/domains/<app-name>`)에 새로운 격리형 Web OS 앱을 추가하고 Core(`@ferdy/core`)에 연결하는 표준 절차입니다.

---

## 1. 디렉토리 및 패키지 이름 규칙

- **디렉토리 경로**: `packages/domains/<app-name>` (예: `packages/domains/app-notes`)
- **패키지명 (`package.json`)**: `@ferdy/<app-name>` (예: `@ferdy/app-notes`)
- **서빙 URL**: `/apps/<app-name>/` (`packages/core/vite.config.ts`가 `packages/domains/*`를 자동으로 스캔하여 개발 서버 라우팅 및 프로덕션 빌드 엔트리에 등록함)

---

## 2. 필수 생성 파일 목록

새 앱 폴더(`packages/domains/<app-name>/`) 안에 다음 파일들을 생성합니다 (`packages/domains/app-sample/` 참고):

1. **`package.json`**:
   - `name`: `"@ferdy/<app-name>"`
   - `dependencies`: `"@ferdy/bridge": "*"`, `"@ferdy/ui": "*"`, `"solid-js": "^1.9.3"`
   - `devDependencies`: `"vite": "^6.0.1"`, `"vite-plugin-solid": "^2.11.0"`
   - `scripts`: `dev`, `build`, `preview`, `typecheck` (`tsc --noEmit`)
2. **`tsconfig.json`**:
   - `packages/domains/app-sample/tsconfig.json`과 동일한 설정(`"extends": "../../../tsconfig.base.json"`)을 사용합니다.
3. **`vite.config.ts`**:
   - 단독 실행 및 빌드를 위한 기본 `vite-plugin-solid` 설정을 포함합니다.
4. **`index.html`**:
   - `<div id="root"></div>`와 `<script type="module" src="./src/index.tsx"></script>`를 포함합니다.
   - 기본 CSS Reset과 토큰은 `@ferdy/ui`에서 자동 주입되므로 별도의 인라인 리셋 `<style>`을 중복 작성할 필요가 없습니다.
   - **주의**: Core의 `monorepoDomainsGatewayPlugin`이 `./src/` 또는 `/src/` 경로를 자동 치환하므로 스크립트 경로는 반드시 `./src/index.tsx` 형태로 작성합니다.
5. **`src/index.tsx` 및 `src/App.tsx`**:
   - `@ferdy/ui`의 컴포넌트(`Button`, `Badge`, `Card`) 및 CSS 변수(`var(--ferdy-*)`)를 사용하여 단일한 Look & Feel을 유지합니다.
   - 부모 Core와의 통신이 필요할 경우 `@ferdy/bridge`의 `ferdyBridge` (`ferdyBridge.openWindow`, `ferdyBridge.on`, `ferdyBridge.emit` 등)를 사용합니다.
6. **`README.md`**:
   - 해당 도메인 앱의 목적, 주요 기능, 사용하는 `@ferdy/bridge` 이벤트를 요약합니다.

---

## 3. Core 데스크탑 바로가기 등록 (선택/요청 시)

사용자가 바탕화면 아이콘이나 런처에서 바로 실행하기를 원한다면:
- `packages/core/src/components/Desktop.tsx`의 `SHORTCUTS` 배열에 새 앱 항목(`id`, `title`, `icon`, `appUrl: '/apps/<app-name>/'`)을 추가합니다. (아이콘 상수는 `packages/assets/src/index.ts`의 `FERDY_ASSETS.icons`에 등록 가능)

---

## 4. 검증 및 문서 업데이트

1. 루트에서 `npm install` (새 워크스페이스 심볼릭 링크 연결) 후 `npm run typecheck`를 실행하여 타입 에러가 없는지 확인합니다.
2. `docs/features.md` 및 `docs/releases.md`에 새 앱 추가 내역을 반영합니다.
