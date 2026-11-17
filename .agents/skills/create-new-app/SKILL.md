---
name: create-new-app
description: >-
  Use this skill when the user asks to create, scaffold, or register a new isolated
  domain application under packages/domains/ in the Ferdy Platter (FerdyOS) monorepo.
---

# Create New Domain App in Ferdy Platter (`packages/domains/<app-name>`)

이 스킬은 `ferdy-platter` 모노레포의 **[D] Domains** 계층(`packages/domains/<app-name>`)에 새로운 격리형 Web OS 앱을 추가하고 Core(`@ferdy/core`)의 앱 메타데이터 레지스트리(`services/app/fdRegist.apps.*.meta.ts`)에 등록하는 표준 절차입니다.

---

## 1. 디렉토리 및 패키지 이름 규칙

- **디렉토리 경로**: `packages/domains/<app-name>` (예: `packages/domains/app-notes`)
- **패키지명 (`package.json`)**: `@ferdy/<app-name>` (예: `@ferdy/app-notes`)
- **앱 고유 ID (`appId`)**: `<app-name>` (예: `'app-notes'`)
- **서빙 URL**: `/apps/<app-name>/` (`packages/core/vite.config.ts`가 `packages/domains/*`를 자동으로 스캔하여 개발 서버 라우팅 및 프로덕션 빌드 엔트리에 등록함)

---

## 2. 필수 생성 파일 목록

새 앱 폴더(`packages/domains/<app-name>/`) 안에 다음 파일들을 생성합니다 (`packages/domains/app-sample/` 또는 `packages/domains/app-hello/` 참고):

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
   - `<div id="root"></div>`와 `<script type="module" src="./src/index.tsx"></script>` (또는 `./src/main.tsx`)를 포함합니다.
   - 기본 CSS Reset과 토큰은 `@ferdy/ui`에서 자동 주입되므로 별도의 인라인 리셋 `<style>`을 중복 작성할 필요가 없습니다.
   - **주의**: Core의 `monorepoDomainsGatewayPlugin`이 `./src/` 또는 `/src/` 경로를 자동 치환하므로 스크립트 경로는 반드시 `./src/...` 형태로 작성합니다.
5. **`src/index.tsx` (또는 `src/main.tsx`) 및 메인 화면 컴포넌트**:
   - 엔트리 파일에서 `import '@ferdy/ui/styles.css';`를 호출하여 전역 디자인 토큰과 리셋을 주입합니다.
   - `@ferdy/ui`의 컴포넌트(`fd.Button`, `fd.Badge`, `fd.Card`, `fd.Icon`) 및 CSS 변수(`var(--fd-*)`), 레이아웃 클래스(`.fd-app-shell`)를 사용하여 일관된 Look & Feel을 유지합니다.
   - 부모 Core와의 통신이 필요할 경우 `@ferdy/bridge`의 `ferdyBridge` (`ferdyBridge.openWindow`, `ferdyBridge.on`, `ferdyBridge.emit` 등)를 사용합니다.
6. **`README.md`**:
   - 해당 도메인 앱의 목적, 주요 기능, 디렉토리 구조, 사용하는 `@ferdy/bridge` 이벤트를 요약합니다.

---

## 3. Core 앱 매니페스트 및 바탕화면 바로가기 등록 (`.meta.ts` 규칙)

Core(`@ferdy/core`)의 `packages/core/src/services/app/`에서는 메타데이터 파일 규칙(`.meta.ts` 접미사 + **한 파일에 한 종류의 데이터만 관리**)에 따라 **'설치된 앱의 고유 메타정보'**와 **'바탕화면 바로가기 아이콘 목록'**을 별도 파일로 분리하여 관리합니다.

1. **공용 아이콘 상수 추가 (선택)**:
   - 필요한 경우 `packages/assets/src/index.ts`의 `FERDY_ASSETS.icons`에 SVG 경로(`/assets/icons/...svg`) 또는 Lucide 아이콘 이름을 등록합니다.
2. **앱 매니페스트 등록 (`packages/core/src/services/app/fdRegist.apps.manifest.meta.ts`)**:
   - `INITIAL_APP_MANIFESTS` 배열에 새 앱의 고유 메타정보(`appId`, `title`, `icon`, `tone`, `appUrl`, `defaultWindow` 등)를 추가합니다:
     ```ts
     {
       appId: 'app-notes',
       title: 'Notes',
       icon: 'notebook-pen',
       tone: 'primary',
       appUrl: '/apps/app-notes/',
       description: '마크다운 메모장 도메인 앱',
       defaultWindow: {
         width: 520,
         height: 400,
       },
     }
     ```
3. **바탕화면 바로가기 등록 (`packages/core/src/services/app/fdRegist.apps.shortcuts.meta.ts`, 선택/요청 시)**:
   - 바탕화면 아이콘 그리드에 바로가기를 배치하려면 `INITIAL_DESKTOP_SHORTCUTS` 배열에 `id`와 `appId`를 추가합니다.
   - 기본 메타정보는 `appId`를 통해 매니페스트에서 자동 상속되며, 특정 인스턴스 파라미터나 다른 제목/아이콘/위치를 원할 때만 `title`, `icon`, `queryParams` (`{ instance: 2 }`), `x`, `y`, `width`, `height`를 오버라이드합니다:
     ```ts
     {
       id: 'notes-app-1',
       appId: 'app-notes',
     }
     ```

---

## 4. 검증 및 문서 업데이트

1. 루트에서 `npm install` (새 워크스페이스 심볼릭 링크 연결) 후 `npm run typecheck`를 실행하여 타입 에러가 없는지 확인합니다.
2. `README.md`, `docs/features.md`, `docs/releases.md`에 새 앱 추가 내역을 반영합니다.
